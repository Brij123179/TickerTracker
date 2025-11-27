import React from 'react';
import { TrendingUp, TrendingDown, Activity, BarChart3 } from 'lucide-react';
import { StockData } from '../contexts/DataContext';

interface MarketOverviewProps {
  stocks: StockData[];
  selectedMarket: string;
}

export const MarketOverview: React.FC<MarketOverviewProps> = ({ stocks, selectedMarket }) => {
  const totalMarketCap = stocks.reduce((sum, stock) => sum + stock.marketCap, 0);
  const totalVolume = stocks.reduce((sum, stock) => sum + stock.volume, 0);
  const gainers = stocks.filter(stock => stock.changePercent > 0).length;
  const losers = stocks.filter(stock => stock.changePercent < 0).length;
  const avgChange = stocks.length > 0 ? stocks.reduce((sum, stock) => sum + stock.changePercent, 0) / stocks.length : 0;

  // Helper function to format market cap properly
  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1000000) { // If market cap is in millions and exceeds 1T
      return `$${(marketCap / 1000000).toFixed(2)}T`;
    } else if (marketCap >= 1000) { // If market cap is in millions and exceeds 1B
      return `$${(marketCap / 1000).toFixed(1)}B`;
    } else {
      return `$${marketCap.toFixed(1)}M`;
    }
  };

  // Helper function to format volume properly
  const formatVolume = (volume: number) => {
    if (volume >= 1000000000000) { // Trillions
      return `$${(volume / 1000000000000).toFixed(1)}T`;
    } else if (volume >= 1000000000) { // Billions
      return `$${(volume / 1000000000).toFixed(1)}B`;
    } else if (volume >= 1000000) { // Millions
      return `$${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) { // Thousands
      return `$${(volume / 1000).toFixed(1)}K`;
    } else {
      return `$${volume.toLocaleString()}`;
    }
  };

  const stats = [
    {
      name: 'Market Cap',
      value: formatMarketCap(totalMarketCap),
      icon: BarChart3,
      color: 'text-blue-600',
      change: avgChange >= 0 ? `+${avgChange.toFixed(1)}%` : `${avgChange.toFixed(1)}%`,
      changeColor: avgChange >= 0 ? 'text-green-600' : 'text-red-600'
    },
    {
      name: '24h Trading Volume',
      value: formatVolume(totalVolume),
      icon: Activity,
      color: 'text-purple-600',
      change: '', // Volume doesn't have a change percentage
      changeColor: ''
    },
    {
      name: 'Gainers',
      value: gainers.toString(),
      icon: TrendingUp,
      color: 'text-green-600',
      change: `${((gainers / stocks.length) * 100).toFixed(0)}%`,
      changeColor: 'text-green-600'
    },
    {
      name: 'Losers',
      value: losers.toString(),
      icon: TrendingDown,
      color: 'text-red-600',
      change: `${((losers / stocks.length) * 100).toFixed(0)}%`,
      changeColor: 'text-red-600'
    }
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {selectedMarket} Market Overview
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">
            Average Change: 
            <span className={`ml-2 font-semibold ${avgChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {avgChange >= 0 ? '+' : ''}{avgChange.toFixed(2)}%
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                {stat.change && (
                  <p className={`text-sm font-medium mt-1 ${stat.changeColor}`}>
                    {stat.change}
                  </p>
                )}
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};