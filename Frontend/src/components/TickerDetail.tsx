import React, { useState, useMemo, useEffect } from "react";
import {
  ArrowLeft,
  Star,
  StarOff,
  Bell,
  TrendingUp,
  TrendingDown,
  Activity,
} from "lucide-react";
import { useData } from "../contexts/DataContext";
import { PriceChart } from "./PriceChart";
import { CreateAlert } from "./CreateAlert";
import { api, type StockData } from "../services/api";

interface TickerDetailProps {
  ticker: string | null;
  onBack: () => void;
}

export const TickerDetail: React.FC<TickerDetailProps> = ({
  ticker,
  onBack,
}) => {
  const { stocks, isInWatchlist, addToWatchlist, removeFromWatchlist } =
    useData();
  const [selectedPeriod, setSelectedPeriod] = useState<
    "1D" | "3D" | "1W" | "1Y"
  >("1D");
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [tickerData, setTickerData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stock = stocks.find((s) => s.symbol === ticker) || tickerData;

  // Fetch ticker details if not in stocks list
  useEffect(() => {
    const fetchTickerDetails = async () => {
      if (!ticker || stocks.find((s) => s.symbol === ticker)) {
        return; // Already have data or no ticker
      }

      setLoading(true);
      setError(null);
      try {
        const data = await api.stocks.getTickerDetails(ticker);
        setTickerData(data);
      } catch (err) {
        setError("Failed to load ticker details");
        console.error("Error fetching ticker details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickerDetails();
  }, [ticker, stocks]);

  const chartData = useMemo(() => {
    if (!stock) return [];

    const now = new Date();
    let daysBack: number;

    switch (selectedPeriod) {
      case "3D":
        daysBack = 3;
        break;
      case "1W":
        daysBack = 7;
        break;
      case "1Y":
        daysBack = 365;
        break;
      default:
        daysBack = 1;
    }

    const cutoffDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
    return stock.historicalData.filter((point) => point.date >= cutoffDate);
  }, [stock, selectedPeriod]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading ticker details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !stock) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {error || "Ticker not found"}
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {error
              ? "Please try again later."
              : `Unable to find data for ${ticker}`}
          </p>
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isWatchlisted = isInWatchlist(stock.symbol);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {stock.symbol}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {stock.name}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCreateAlert(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span>Create Alert</span>
          </button>
          <button
            onClick={() =>
              isWatchlisted
                ? removeFromWatchlist(stock.symbol)
                : addToWatchlist(stock.symbol)
            }
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isWatchlisted
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {isWatchlisted ? (
              <StarOff className="w-4 h-4" />
            ) : (
              <Star className="w-4 h-4" />
            )}
            <span>
              {isWatchlisted ? "Remove from Watchlist" : "Add to Watchlist"}
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="xl:col-span-3 space-y-6">
          {/* Price and Chart */}
          <PriceChart
            data={chartData}
            symbol={stock.symbol}
            currentPrice={stock.price}
            change={stock.change}
            changePercent={stock.changePercent}
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
          />

          {/* News and Analysis */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent News
            </h3>
            <div className="space-y-4">
              {stock.news.slice(0, 5).map((news) => (
                <div
                  key={news.id}
                  className="border-b border-gray-100 dark:border-gray-700 pb-4 last:border-b-0"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                      {news.title}
                    </h4>
                    <span
                      className={`ml-3 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        news.sentiment === "positive"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : news.sentiment === "negative"
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      }`}
                    >
                      {news.sentiment}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {news.summary}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{news.source}</span>
                    <span>{news.timestamp.toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Key Metrics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Previous Close
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  ${stock.previousClose.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Market Cap
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  ${(stock.marketCap / 1000000000).toFixed(1)}B
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Avg Volume
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {(stock.volume / 1000000).toFixed(1)}M
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  P/E Ratio
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {stock.pe.toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Dividend Yield
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {stock.dividendYield.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Primary Exchange
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {stock.exchange}
                </span>
              </div>
            </div>
          </div>

          {/* Sentiment Analysis */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Sentiment Analysis
            </h3>
            <div className="text-center mb-4">
              <div
                className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold ${
                  stock.sentiment === "positive"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : stock.sentiment === "negative"
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                }`}
              >
                <Activity className="w-5 h-5 mr-2" />
                {stock.sentiment.charAt(0).toUpperCase() +
                  stock.sentiment.slice(1)}
              </div>
            </div>
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Impact Score</span>
                <span>{stock.impactScore.toFixed(0)}/100</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    stock.impactScore >= 70
                      ? "bg-red-500"
                      : stock.impactScore >= 40
                        ? "bg-yellow-500"
                        : "bg-green-500"
                  }`}
                  style={{ width: `${stock.impactScore}%` }}
                />
              </div>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Based on news sentiment, social media analysis, and market data
              from trusted sources.
            </div>
          </div>
        </div>
      </div>

      {/* Create Alert Modal */}
      {showCreateAlert && (
        <CreateAlert
          ticker={stock.symbol}
          currentPrice={stock.price}
          onClose={() => setShowCreateAlert(false)}
        />
      )}
    </div>
  );
};
