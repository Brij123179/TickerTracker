import React, { useState } from 'react';
import { StockData } from '../contexts/DataContext';

interface MarketHeatmapProps {
  stocks: StockData[];
  onTickerSelect: (ticker: string) => void;
}

export const MarketHeatmap: React.FC<MarketHeatmapProps> = ({ stocks, onTickerSelect }) => {
  const [sortBy, setSortBy] = useState<'marketCap' | 'change' | 'volume'>('marketCap');
  const [hoveredStock, setHoveredStock] = useState<string | null>(null);

  // Sort stocks based on selected criteria
  const sortedStocks = [...stocks].sort((a, b) => {
    switch (sortBy) {
      case 'change':
        return Math.abs(b.changePercent) - Math.abs(a.changePercent);
      case 'volume':
        return b.volume - a.volume;
      default:
        return b.marketCap - a.marketCap;
    }
  });

  // Get color based on change percentage (CoinMarketCap style)
  const getBackgroundColor = (changePercent: number) => {
    const absChange = Math.abs(changePercent);
    
    if (changePercent > 0) {
      // Green shades for gains
      if (absChange >= 10) return '#16a34a'; // Strong green
      if (absChange >= 5) return '#22c55e';   // Medium green
      if (absChange >= 2) return '#4ade80';   // Light green
      if (absChange >= 0.5) return '#86efac'; // Very light green
      return '#dcfce7'; // Barely green
    } else if (changePercent < 0) {
      // Red shades for losses
      if (absChange >= 10) return '#dc2626'; // Strong red
      if (absChange >= 5) return '#ef4444';  // Medium red
      if (absChange >= 2) return '#f87171';  // Light red
      if (absChange >= 0.5) return '#fca5a5'; // Very light red
      return '#fee2e2'; // Barely red
    } else {
      return '#f3f4f6'; // Neutral gray
    }
  };

  const getTextColor = (changePercent: number) => {
    const absChange = Math.abs(changePercent);
    if (absChange >= 5) {
      return 'text-white';
    } else if (absChange >= 2) {
      return changePercent > 0 ? 'text-green-900' : 'text-red-900';
    }
    return 'text-gray-700';
  };

  // Calculate box size based on market cap (CoinMarketCap style)
  const getBoxSize = (stock: StockData, index: number) => {
    const maxMarketCap = Math.max(...stocks.map(s => s.marketCap));
    const minMarketCap = Math.min(...stocks.map(s => s.marketCap));
    const ratio = (stock.marketCap - minMarketCap) / (maxMarketCap - minMarketCap);
    
    // Create different sizes based on ranking and market cap
    if (index < 5) return 'col-span-2 row-span-2'; // Top 5 get large boxes
    if (index < 10) return 'col-span-2'; // Next 5 get wide boxes
    if (ratio > 0.7) return 'col-span-2'; // High market cap gets wide boxes
    return ''; // Default single box
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1000000) return `$${(marketCap / 1000000).toFixed(1)}T`;
    if (marketCap >= 1000) return `$${(marketCap / 1000).toFixed(1)}B`;
    return `$${marketCap.toFixed(1)}M`;
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${(price / 1000).toFixed(1)}K`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    if (price >= 0.01) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(6)}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header with controls */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Crypto Market Heatmap
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('marketCap')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                sortBy === 'marketCap'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              Market Cap
            </button>
            <button
              onClick={() => setSortBy('change')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                sortBy === 'change'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              Change
            </button>
            <button
              onClick={() => setSortBy('volume')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                sortBy === 'volume'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              Volume
            </button>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="p-4">
        <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-12 gap-2 auto-rows-fr">
          {sortedStocks.slice(0, 50).map((stock, index) => (
            <div
              key={stock.symbol}
              onClick={() => onTickerSelect(stock.symbol)}
              onMouseEnter={() => setHoveredStock(stock.symbol)}
              onMouseLeave={() => setHoveredStock(null)}
              className={`
                relative p-2 rounded-lg cursor-pointer transition-all duration-200 
                hover:scale-105 hover:shadow-lg border border-gray-200 dark:border-gray-600
                flex flex-col justify-center items-center text-center min-h-[80px]
                ${getBoxSize(stock, index)}
                ${hoveredStock === stock.symbol ? 'ring-2 ring-blue-500 z-10' : ''}
              `}
              style={{
                backgroundColor: getBackgroundColor(stock.changePercent)
              }}
            >
              {/* Symbol */}
              <div className={`text-xs font-bold ${getTextColor(stock.changePercent)} leading-tight`}>
                {stock.symbol}
              </div>
              
              {/* Price for larger boxes */}
              {index < 10 && (
                <div className={`text-xs ${getTextColor(stock.changePercent)} mt-1 opacity-90`}>
                  {formatPrice(stock.price)}
                </div>
              )}
              
              {/* Change percentage */}
              <div className={`text-xs font-medium ${getTextColor(stock.changePercent)} mt-1`}>
                {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(1)}%
              </div>
              
              {/* Market cap for larger boxes */}
              {index < 5 && (
                <div className={`text-xs ${getTextColor(stock.changePercent)} opacity-75 mt-1`}>
                  {formatMarketCap(stock.marketCap)}
                </div>
              )}

              {/* Tooltip on hover */}
              {hoveredStock === stock.symbol && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg z-20 whitespace-nowrap">
                  <div className="font-semibold">{stock.name}</div>
                  <div>Price: {formatPrice(stock.price)}</div>
                  <div>Change: {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%</div>
                  <div>Market Cap: {formatMarketCap(stock.marketCap)}</div>
                  <div>Volume: ${(stock.volume / 1000000000).toFixed(1)}B</div>
                  {/* Tooltip arrow */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between mt-6 text-xs text-gray-600 dark:text-gray-400">
          <span className="flex items-center">
            <span className="w-3 h-3 bg-red-600 rounded mr-2"></span>
            Strong Decline (-10%+)
          </span>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-red-600 rounded"></div>
            <div className="w-4 h-4 bg-red-400 rounded"></div>
            <div className="w-4 h-4 bg-red-200 rounded"></div>
            <div className="w-4 h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
            <div className="w-4 h-4 bg-green-200 rounded"></div>
            <div className="w-4 h-4 bg-green-400 rounded"></div>
            <div className="w-4 h-4 bg-green-600 rounded"></div>
          </div>
          <span className="flex items-center">
            <span className="w-3 h-3 bg-green-600 rounded mr-2"></span>
            Strong Gain (+10%+)
          </span>
        </div>

        {/* Info text */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
          Box size represents market capitalization • Color intensity shows 24h price change
        </div>
      </div>
    </div>
  );
};