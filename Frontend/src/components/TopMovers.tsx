import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { StockData } from '../contexts/DataContext';

interface TopMoversProps {
  topGainers: StockData[];
  topLosers: StockData[];
  onTickerSelect: (ticker: string) => void;
}

export const TopMovers: React.FC<TopMoversProps> = ({ topGainers, topLosers, onTickerSelect }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Movers</h3>
      
      {/* Top Gainers */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-green-600 mb-3 flex items-center">
          <ArrowUpRight className="w-4 h-4 mr-1" />
          Top Gainers
        </h4>
        <div className="space-y-2">
          {topGainers.map((stock) => (
            <div
              key={stock.symbol}
              onClick={() => onTickerSelect(stock.symbol)}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
            >
              <div>
                <div className="font-medium text-gray-900 dark:text-white text-sm">{stock.symbol}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">₹{stock.price.toFixed(2)}</div>
              </div>
              <div className="text-green-600 font-medium text-sm">
                +{stock.changePercent.toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Losers */}
      <div>
        <h4 className="text-sm font-medium text-red-600 mb-3 flex items-center">
          <ArrowDownRight className="w-4 h-4 mr-1" />
          Top Losers
        </h4>
        <div className="space-y-2">
          {topLosers.map((stock) => (
            <div
              key={stock.symbol}
              onClick={() => onTickerSelect(stock.symbol)}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
            >
              <div>
                <div className="font-medium text-gray-900 dark:text-white text-sm">{stock.symbol}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">₹{stock.price.toFixed(2)}</div>
              </div>
              <div className="text-red-600 font-medium text-sm">
                {stock.changePercent.toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};