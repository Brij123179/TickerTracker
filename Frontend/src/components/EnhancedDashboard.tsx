import React, { useState, useEffect } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  TrendingDown,
  Activity,
  Eye,
  Star,
  Filter,
  Download,
  RefreshCw,
  BarChart2,
  PieChart,
  LineChart,
  Maximize2,
} from "lucide-react";
import { useData } from "../contexts/DataContext";

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
      return `$${(marketCap / 1000).toFixed(2)}B`;
    }
    return `$${marketCap.toFixed(2)}M`;
  } else if (currency === 'INR') {
    return `₹${marketCap.toFixed(2)}Cr`;
  }
  return `${marketCap.toFixed(2)}M`;
};

interface EnhancedDashboardProps {
  onTickerSelect: (ticker: string) => void;
}

export const EnhancedDashboard: React.FC<EnhancedDashboardProps> = ({ onTickerSelect }) => {
  const { stocks, selectedMarket } = useData();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState<"marketCap" | "change" | "volume" | "impactScore">("marketCap");
  const [filterSentiment, setFilterSentiment] = useState<"all" | "positive" | "negative" | "neutral">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());

  const marketStocks = stocks.filter((stock) => {
    if (selectedMarket === "US") return stock.exchange === "NASDAQ";
    if (selectedMarket === "Indian") return stock.exchange === "NSE";
    if (selectedMarket === "Crypto") return stock.exchange === "Crypto";
    return false;
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

  // Calculate market statistics
  const marketStats = {
    totalVolume: marketStocks.reduce((sum, s) => sum + s.volume, 0),
    avgChange: marketStocks.reduce((sum, s) => sum + s.changePercent, 0) / marketStocks.length,
    gainers: marketStocks.filter(s => s.changePercent > 0).length,
    losers: marketStocks.filter(s => s.changePercent < 0).length,
    totalMarketCap: marketStocks.reduce((sum, s) => sum + s.marketCap, 0),
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const toggleWatchlist = (symbol: string) => {
    setWatchlist(prev => {
      const newSet = new Set(prev);
      if (newSet.has(symbol)) {
        newSet.delete(symbol);
      } else {
        newSet.add(symbol);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-[1920px] mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        {/* Market Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 card-hover border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Market Cap</span>
              <PieChart className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
              {selectedMarket === 'Indian' ? '₹' : '$'}{(marketStats.totalMarketCap / 1000).toFixed(1)}B
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 card-hover border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Avg Change</span>
              <Activity className="w-4 h-4 text-purple-500" />
            </div>
            <p className={`text-lg sm:text-xl font-bold ${marketStats.avgChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {marketStats.avgChange >= 0 ? '+' : ''}{marketStats.avgChange.toFixed(2)}%
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 card-hover border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Gainers</span>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-lg sm:text-xl font-bold text-green-600">{marketStats.gainers}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 card-hover border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Losers</span>
              <TrendingDown className="w-4 h-4 text-red-500" />
            </div>
            <p className="text-lg sm:text-xl font-bold text-red-600">{marketStats.losers}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 card-hover border border-gray-100 dark:border-gray-700 col-span-2 sm:col-span-3 lg:col-span-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Volume</span>
              <BarChart2 className="w-4 h-4 text-indigo-500" />
            </div>
            <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
              {(marketStats.totalVolume / 1000000000).toFixed(2)}B
            </p>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 sm:p-4 mb-6 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                {selectedMarket} Market
              </h2>
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full">
                Live
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  <LineChart className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  <PieChart className="w-4 h-4" />
                </button>
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="marketCap">Market Cap</option>
                <option value="change">Price Change</option>
                <option value="volume">Volume</option>
                <option value="impactScore">Impact Score</option>
              </select>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                  showFilters
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                <Filter className="w-4 h-4" />
              </button>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>

              {/* Download Button */}
              <button
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Sentiment:</span>
                {['all', 'positive', 'neutral', 'negative'].map(sentiment => (
                  <button
                    key={sentiment}
                    onClick={() => setFilterSentiment(sentiment as typeof filterSentiment)}
                    className={`px-3 py-1 text-xs sm:text-sm rounded-full transition-colors ${
                      filterSentiment === sentiment
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stock Display */}
        {viewMode === 'list' ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3" />
                        <span className="hidden sm:inline">Symbol</span>
                      </div>
                    </th>
                    <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                      Name
                    </th>
                    <th className="px-3 sm:px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-3 sm:px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Change
                    </th>
                    <th className="px-3 sm:px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                      Volume
                    </th>
                    <th className="px-3 sm:px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden xl:table-cell">
                      Market Cap
                    </th>
                    <th className="px-3 sm:px-4 lg:px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                      Sentiment
                    </th>
                    <th className="px-3 sm:px-4 lg:px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {sortedStocks.map((stock) => (
                    <tr
                      key={stock.symbol}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                      onClick={() => onTickerSelect(stock.symbol)}
                    >
                      <td className="px-3 sm:px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWatchlist(stock.symbol);
                            }}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`w-4 h-4 ${
                                watchlist.has(stock.symbol)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300 dark:text-gray-600'
                              }`}
                            />
                          </button>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {stock.symbol}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                        <div className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-xs">
                          {stock.name}
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(stock.price, stock.currency)}
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-4 whitespace-nowrap text-right">
                        <div
                          className={`flex items-center justify-end space-x-1 text-sm font-medium ${
                            stock.change >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {stock.change >= 0 ? (
                            <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3 sm:w-4 sm:h-4" />
                          )}
                          <span>
                            {stock.change >= 0 ? "+" : ""}
                            {stock.changePercent.toFixed(2)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-4 whitespace-nowrap text-right hidden lg:table-cell">
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {(stock.volume / 1000000).toFixed(1)}M
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-4 whitespace-nowrap text-right hidden xl:table-cell">
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {formatMarketCap(stock.marketCap, stock.currency)}
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-4 whitespace-nowrap text-center hidden sm:table-cell">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
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
                      <td className="px-3 sm:px-4 lg:px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onTickerSelect(stock.symbol);
                          }}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-xs sm:text-sm"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="responsive-grid">
            {sortedStocks.map((stock) => (
              <div
                key={stock.symbol}
                onClick={() => onTickerSelect(stock.symbol)}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 card-hover cursor-pointer border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWatchlist(stock.symbol);
                      }}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          watchlist.has(stock.symbol)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    </button>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {stock.symbol}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                        {stock.name}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      stock.sentiment === "positive" || stock.sentiment === "very positive"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : stock.sentiment === "negative" || stock.sentiment === "very negative"
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                    }`}
                  >
                    {stock.sentiment || 'neutral'}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(stock.price, stock.currency)}
                    </span>
                    <div
                      className={`flex items-center space-x-1 text-sm font-medium ${
                        stock.change >= 0 ? "text-green-600" : "text-red-600"
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
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Volume</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {(stock.volume / 1000000).toFixed(1)}M
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Market Cap</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatMarketCap(stock.marketCap, stock.currency)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
