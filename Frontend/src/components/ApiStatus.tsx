import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react';

interface ApiEndpoint {
  name: string;
  endpoint: string;
  status: 'checking' | 'success' | 'error' | 'warning';
  response?: any;
  error?: string;
  responseTime?: number;
}

interface ApiStatusProps {
  onClose: () => void;
}

export const ApiStatus: React.FC<ApiStatusProps> = ({ onClose }) => {
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([
    { name: 'Server Health', endpoint: '/', status: 'checking' },
    { name: 'US Stocks', endpoint: '/stocks/US', status: 'checking' },
    { name: 'Indian Stocks', endpoint: '/stocks/Indian', status: 'checking' },
    { name: 'Crypto Data', endpoint: '/stocks/Crypto', status: 'checking' },
    { name: 'User Profile', endpoint: '/user/profile', status: 'checking' },
    { name: 'Watchlist', endpoint: '/watchlist', status: 'checking' },
    { name: 'Alerts', endpoint: '/alerts', status: 'checking' },
  ]);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5004/api';

  useEffect(() => {
    checkAllEndpoints();
  }, []);

  const checkEndpoint = async (endpoint: ApiEndpoint): Promise<ApiEndpoint> => {
    const startTime = Date.now();
    try {
      const url = endpoint.endpoint === '/'
        ? API_BASE.replace('/api', '')
        : `${API_BASE}${endpoint.endpoint}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      const responseTime = Date.now() - startTime;
      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        return {
          ...endpoint,
          status: 'success',
          response: data,
          responseTime,
        };
      } else {
        return {
          ...endpoint,
          status: 'error',
          error: `HTTP ${response.status}: ${response.statusText}`,
          responseTime,
        };
      }
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      return {
        ...endpoint,
        status: 'error',
        error: error.name === 'TimeoutError' ? 'Request timeout (10s)' : error.message,
        responseTime,
      };
    }
  };

  const checkAllEndpoints = async () => {
    const promises = endpoints.map(endpoint => checkEndpoint(endpoint));
    const results = await Promise.all(promises);
    setEndpoints(results);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'checking':
        return <Loader className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <div className="w-5 h-5 bg-gray-300 rounded-full" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const successCount = endpoints.filter(e => e.status === 'success').length;
  const totalCount = endpoints.length;
  const overallHealth = successCount === totalCount ? 'Healthy' :
                       successCount > totalCount / 2 ? 'Partial' : 'Unhealthy';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              API Health Check
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Status: <span className={getStatusColor(overallHealth.toLowerCase())}>
                {overallHealth} ({successCount}/{totalCount} endpoints)
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <XCircle className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Configuration
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p><strong>API Base URL:</strong> {API_BASE}</p>
                <p><strong>Environment:</strong> {import.meta.env.MODE}</p>
              </div>
            </div>

            <div className="space-y-3">
              {endpoints.map((endpoint, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(endpoint.status)}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {endpoint.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {endpoint.endpoint === '/' ? 'Root endpoint' : `${API_BASE}${endpoint.endpoint}`}
                        </p>
                      </div>
                    </div>
                    {endpoint.responseTime && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {endpoint.responseTime}ms
                      </span>
                    )}
                  </div>

                  {endpoint.error && (
                    <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                      <p className="text-sm text-red-600 dark:text-red-400">
                        <strong>Error:</strong> {endpoint.error}
                      </p>
                    </div>
                  )}

                  {endpoint.response && endpoint.status === 'success' && (
                    <div className="mt-2">
                      <details className="text-sm">
                        <summary className="text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200">
                          Response preview
                        </summary>
                        <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded overflow-auto max-h-32">
                          <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {JSON.stringify(endpoint.response, null, 2)}
                          </pre>
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
          <button
            onClick={checkAllEndpoints}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh All
          </button>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Last checked: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};
