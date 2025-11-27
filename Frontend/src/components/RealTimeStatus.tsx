import React from 'react';
import { Clock, Activity, Pause, RefreshCw } from 'lucide-react';
import { useData } from '../contexts/DataContext';

export const RealTimeStatus: React.FC = () => {
  const { 
    isRealTimeEnabled, 
    setRealTimeEnabled, 
    lastUpdated, 
    refreshData, 
    isLoading
  } = useData();

  const formatLastUpdated = (date: Date | null) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}m ago`;
    } else {
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    }
  };

  const getUpdateInterval = () => {
    return '10s';
  };

  return (
    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
      {/* Real-time toggle */}
      <button
        onClick={() => setRealTimeEnabled(!isRealTimeEnabled)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
          isRealTimeEnabled
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
        }`}
        title={`Toggle real-time updates (${getUpdateInterval()} interval)`}
      >
        {isRealTimeEnabled ? (
          <Activity className="w-4 h-4" />
        ) : (
          <Pause className="w-4 h-4" />
        )}
        <span>{isRealTimeEnabled ? 'Live' : 'Manual'}</span>
      </button>

      {/* Last updated */}
      <div className="flex items-center space-x-2">
        <Clock className="w-4 h-4" />
        <span>Updated: {formatLastUpdated(lastUpdated)}</span>
      </div>

      {/* Manual refresh */}
      <button
        onClick={refreshData}
        disabled={isLoading}
        className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Refresh data now"
      >
        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        <span>Refresh</span>
      </button>

      {/* Update interval indicator */}
      {isRealTimeEnabled && (
        <div className="flex items-center space-x-2 px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-lg">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
          <span>Auto-refresh: {getUpdateInterval()}</span>
        </div>
      )}
    </div>
  );
};