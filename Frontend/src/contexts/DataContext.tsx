import React, { createContext, useContext, useState, useEffect } from "react";
import { api, StockData, NewsItem, PricePoint, Alert } from "../services/api";

// Re-export types for components that still import them from here
export type { StockData, NewsItem, PricePoint, Alert };

interface DataContextType {
  stocks: StockData[];
  watchlist: string[];
  alerts: Alert[];
  selectedMarket: string;
  setSelectedMarket: (market: string) => void;
  addToWatchlist: (symbol: string) => Promise<void>;
  removeFromWatchlist: (symbol: string) => Promise<void>;
  isInWatchlist: (symbol: string) => boolean;
  createAlert: (alert: Omit<Alert, "id" | "createdAt">) => Promise<void>;
  deleteAlert: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  isRealTimeEnabled: boolean;
  setRealTimeEnabled: (enabled: boolean) => void;
  lastUpdated: Date | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedMarket, setSelectedMarket] = useState("US");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRealTimeEnabled, setRealTimeEnabled] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Refresh stocks when market changes
  useEffect(() => {
    loadStocks();
  }, [selectedMarket]);

  // Real-time data polling
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isRealTimeEnabled) {
      // Poll for updates every 10 seconds for all markets
      const interval = 10000;
      
      intervalId = setInterval(() => {
        loadStocks(true); // Silent refresh
      }, interval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRealTimeEnabled, selectedMarket]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load all data in parallel
      const [stocksData, watchlistData, alertsData] = await Promise.allSettled([
        api.stocks.getMarketData(selectedMarket),
        api.watchlist.getWatchlist(),
        api.alerts.getAlerts(),
      ]);

      if (stocksData.status === "fulfilled") {
        setStocks(stocksData.value);
      }

      if (watchlistData.status === "fulfilled") {
        setWatchlist(watchlistData.value);
      }

      if (alertsData.status === "fulfilled") {
        // Convert date strings to Date objects for alerts
        const processedAlerts = alertsData.value.map((alert) => ({
          ...alert,
          createdAt: alert.createdAt,
          expiresAt: alert.expiresAt,
        }));
        setAlerts(processedAlerts);
      }
    } catch (err) {
      setError("Failed to load initial data");
      console.error("Error loading initial data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStocks = async (silent: boolean = false) => {
    try {
      if (!silent) {
        setIsLoading(true);
      }
      setError(null);
      console.log(`Loading ${selectedMarket} market data...`);
      const stocksData = await api.stocks.getMarketData(selectedMarket);
      console.log(`Received ${stocksData.length} stocks for ${selectedMarket} market:`, stocksData);
      setStocks(stocksData);
      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage = `Failed to load ${selectedMarket} market data: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setError(errorMessage);
      console.error("Error loading stocks:", err);
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  };

  const refreshData = async () => {
    await loadInitialData();
  };

  const addToWatchlist = async (symbol: string) => {
    try {
      const updatedWatchlist = await api.watchlist.addToWatchlist(symbol);
      setWatchlist(updatedWatchlist);
    } catch (err) {
      setError("Failed to add to watchlist");
      console.error("Error adding to watchlist:", err);
    }
  };

  const removeFromWatchlist = async (symbol: string) => {
    try {
      const updatedWatchlist = await api.watchlist.removeFromWatchlist(symbol);
      setWatchlist(updatedWatchlist);
    } catch (err) {
      setError("Failed to remove from watchlist");
      console.error("Error removing from watchlist:", err);
    }
  };

  const isInWatchlist = (symbol: string) => watchlist.includes(symbol);

  const createAlert = async (alertData: Omit<Alert, "id" | "createdAt">) => {
    try {
      const newAlert = await api.alerts.createAlert(alertData);
      setAlerts([...alerts, newAlert]);
    } catch (err) {
      setError("Failed to create alert");
      console.error("Error creating alert:", err);
    }
  };

  const deleteAlert = async (id: string) => {
    try {
      await api.alerts.deleteAlert(id);
      setAlerts(alerts.filter((alert) => alert.id !== id));
    } catch (err) {
      setError("Failed to delete alert");
      console.error("Error deleting alert:", err);
    }
  };

  return (
    <DataContext.Provider
      value={{
        stocks,
        watchlist,
        alerts,
        selectedMarket,
        setSelectedMarket,
        addToWatchlist,
        removeFromWatchlist,
        isInWatchlist,
        createAlert,
        deleteAlert,
        refreshData,
        isLoading,
        error,
        isRealTimeEnabled,
        setRealTimeEnabled,
        lastUpdated,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within DataProvider");
  }
  return context;
};
