import React from 'react';
import { ArrowLeft, Star, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useData } from '../contexts/DataContext';

interface WatchlistProps {
  onTickerSelect: (ticker: string) => void;
  onBack: () => void;
}

export const Watchlist: React.FC<WatchlistProps> = ({ onTickerSelect, onBack }) => {
  const { stocks, watchlist, removeFromWatchlist } = useData();

  const watchedStocks = stocks.filter(stock => watchlist.includes(stock.symbol));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Watchlist
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Track your favorite stocks and cryptocurrencies
          </p>
        </div>
      </div>

      {watchedStocks.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Your watchlist is empty
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Add stocks to your watchlist to track their performance and get quick access to their details.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
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
                    <th className="pb-3">Sentiment</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {watchedStocks.map((stock) => (
                    <tr
                      key={stock.symbol}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="py-4">
                        <button
                          onClick={() => onTickerSelect(stock.symbol)}
                          className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          {stock.symbol}
                        </button>
                      </td>
                      <td className="py-4 text-gray-600 dark:text-gray-300">
                        {stock.name}
                      </td>
                      <td className="py-4 font-medium text-gray-900 dark:text-white">
                        ₹{stock.price.toFixed(2)}
                      </td>
                      <td className="py-4">
                        <div className={`flex items-center space-x-1 ${
                          stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stock.change >= 0 ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4" />
                          )}
                          <span>
                            {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                          </span>
                        </div>
                      </td>
                      <td className="py-4 text-gray-600 dark:text-gray-300">
                        {(stock.volume / 1000000).toFixed(1)}M
                      </td>
                      <td className="py-4 text-gray-600 dark:text-gray-300">
                        ${(stock.marketCap / 1000000000).toFixed(1)}B
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          stock.sentiment === 'positive' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : stock.sentiment === 'negative'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}>
                          {stock.sentiment}
                        </span>
                      </td>
                      <td className="py-4">
                        <button
                          onClick={() => removeFromWatchlist(stock.symbol)}
                          className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};