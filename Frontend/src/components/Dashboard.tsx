import React, { useState } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useData } from "../contexts/DataContext";
import { MarketHeatmap } from "./MarketHeatmap";
import { TopMovers } from "./TopMovers";
import { NewsPanel } from "./NewsPanel";
import { MarketOverview } from "./MarketOverview";
import { RealTimeStatus } from "./RealTimeStatus";
import { SentimentPanel } from "./SentimentPanel";

// Helper function to format currency based on currency type
const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  if (currency === 'USD') {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else if (currency === 'INR') {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `${amount.toFixed(2)}`;
};

// Helper function to format market cap based on currency
const formatMarketCap = (marketCap: number, currency: string = 'USD'): string => {
  if (currency === 'USD') {
    if (marketCap >= 1000) {
      return `$${(marketCap / 1000).toFixed(1)}B`;
    }
    return `$${marketCap.toFixed(1)}M`;
  } else if (currency === 'INR') {
    return `₹${marketCap.toFixed(1)}Cr`;
  }
  return `${marketCap.toFixed(1)}M`;
};

interface DashboardProps {
  onTickerSelect: (ticker: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onTickerSelect }) => {
  const { stocks, selectedMarket } = useData();
  const [sortBy, setSortBy] = useState<
    "marketCap" | "change" | "volume" | "impactScore"
  >("marketCap");
  const [filterSentiment, setFilterSentiment] = useState<
    "all" | "positive" | "negative" | "neutral"
  >("all");

  console.log('Dashboard Debug:', {
    selectedMarket,
    totalStocks: stocks.length,
    stockExchanges: stocks.map(s => s.exchange),
    stockSymbols: stocks.map(s => s.symbol)
  });

  const marketStocks = stocks.filter((stock) => {
    if (selectedMarket === "US") return stock.exchange === "NASDAQ";
    if (selectedMarket === "Indian") return stock.exchange === "NSE";
    if (selectedMarket === "Crypto") return stock.exchange === "Crypto";
    return false;
  });

  console.log('Filtered Market Stocks:', {
    selectedMarket,
    marketStocksCount: marketStocks.length,
    marketStockSymbols: marketStocks.map(s => s.symbol)
  });

  const filteredStocks = marketStocks.filter(
    (stock) => filterSentiment === "all" || stock.sentiment === filterSentiment,
  );

  const sortedStocks = [...filteredStocks]
    .sort((a, b) => {
      switch (sortBy) {
        case "change":
          return b.changePercent - a.changePercent;
        case "volume":
          return b.volume - a.volume;
        case "impactScore":
          return b.impactScore - a.impactScore;
        default:
          return b.marketCap - a.marketCap;
      }
    })
    .slice(0, 50);

  const topGainers = marketStocks
    .filter((stock) => stock.changePercent > 0)
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, 5);

  const topLosers = marketStocks
    .filter((stock) => stock.changePercent < 0)
    .sort((a, b) => a.changePercent - b.changePercent)
    .slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-hidden">
      {/* Market Overview */}
      <MarketOverview stocks={marketStocks} selectedMarket={selectedMarket} />

      {/* Real-time Status */}
      <div className="mb-6">
        <RealTimeStatus />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Top 50 {selectedMarket} Market Companies
          </h2>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="marketCap">Sort by Market Cap</option>
            <option value="change">Sort by Change</option>
            <option value="volume">Sort by Volume</option>
            <option value="impactScore">Sort by Impact Score</option>
          </select>

          <select
            value={filterSentiment}
            onChange={(e) =>
              setFilterSentiment(e.target.value as typeof filterSentiment)
            }
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Sentiment</option>
            <option value="positive">Positive</option>
            <option value="negative">Negative</option>
            <option value="neutral">Neutral</option>
            {selectedMarket === "Crypto" && (
              <>
                <option value="very positive">Very Positive</option>
                <option value="very negative">Very Negative</option>
              </>
            )}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="xl:col-span-3 space-y-6 min-w-0">
          {/* Market Heatmap */}
          <MarketHeatmap
            stocks={sortedStocks.slice(0, 20)}
            onTickerSelect={onTickerSelect}
          />

          {/* Top Companies Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Top Companies
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                      <th className="pb-3">Symbol</th>
                      <th className="pb-3">Name</th>
                      <th className="pb-3">Price</th>
                      <th className="pb-3">Change</th>
                      <th className="pb-3">Volume</th>
                      <th className="pb-3">Market Cap</th>
                      {selectedMarket !== "Crypto" && <th className="pb-3">P/E</th>}
                      <th className="pb-3">Sentiment</th>
                      <th className="pb-3">Impact Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedStocks.map((stock) => (
                      <tr
                        key={stock.symbol}
                        onClick={() => onTickerSelect(stock.symbol)}
                        className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                      >
                        <td className="py-4 font-medium text-gray-900 dark:text-white">
                          {stock.symbol}
                        </td>
                        <td className="py-4 text-gray-600 dark:text-gray-300">
                          {stock.name}
                        </td>
                        <td className="py-4 font-medium text-gray-900 dark:text-white">
                          {formatCurrency(stock.price, stock.currency)}
                        </td>
                        <td className="py-4">
                          <div
                            className={`flex items-center space-x-1 ${
                              stock.change >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {stock.change >= 0 ? (
                              <ArrowUpRight className="w-4 h-4" />
                            ) : (
                              <ArrowDownRight className="w-4 h-4" />
                            )}
                            <span>
                              {stock.change >= 0 ? "+" : ""}
                              {stock.changePercent.toFixed(2)}%
                            </span>
                          </div>
                        </td>
                        <td className="py-4 text-gray-600 dark:text-gray-300">
                          {(stock.volume / 1000000).toFixed(1)}M
                        </td>
                        <td className="py-4 text-gray-600 dark:text-gray-300">
                          {formatMarketCap(stock.marketCap, stock.currency)}
                        </td>
                        {selectedMarket !== "Crypto" && (
                          <td className="py-4 text-gray-600 dark:text-gray-300">
                            {stock.pe.toFixed(1)}
                          </td>
                        )}
                        <td className="py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              stock.sentiment === "positive" || stock.sentiment === "very positive"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : stock.sentiment === "negative" || stock.sentiment === "very negative"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                            }`}
                          >
                            {stock.sentiment || 'neutral'}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                stock.impactScore >= 70
                                  ? "bg-red-500"
                                  : stock.impactScore >= 40
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                              }`}
                              style={{ width: `${stock.impactScore}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {stock.impactScore.toFixed(0)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6 min-w-0">
          {/* Sentiment Analysis */}
          <SentimentPanel />

          {/* Top Movers */}
          <TopMovers
            topGainers={topGainers}
            topLosers={topLosers}
            onTickerSelect={onTickerSelect}
          />

          {/* News Panel */}
          <NewsPanel stocks={marketStocks} selectedMarket={selectedMarket} onTickerSelect={onTickerSelect} />
        </div>
      </div>
    </div>
  );
};
