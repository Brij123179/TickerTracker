import React, { useState, useMemo, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

// Helper function to format currency based on currency type
const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  if (currency === 'USD') {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else if (currency === 'INR') {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `${amount.toFixed(2)}`;
};

interface PricePoint {
  date: Date;
  close: number;
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
}

interface PriceChartProps {
  data: PricePoint[];
  symbol: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  selectedPeriod: "1D" | "3D" | "1W" | "1Y";
  onPeriodChange: (period: "1D" | "3D" | "1W" | "1Y") => void;
  currency?: string; // Added currency prop
}

export const PriceChart: React.FC<PriceChartProps> = ({
  data,
  symbol,
  currentPrice,
  change,
  changePercent,
  selectedPeriod,
  onPeriodChange,
  currency = 'USD', // Default to USD
}) => {
  const [chartType, setChartType] = useState<"line" | "area">("area");

  // Helper function to format dates
  const formatDate = useCallback((date: Date, period: string) => {
    try {
      switch (period) {
        case "1D":
          return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
        case "3D":
        case "1W":
          return date.toLocaleDateString([], {
            month: "short",
            day: "numeric",
          });
        case "1Y":
          return date.toLocaleDateString([], {
            month: "short",
            year: "2-digit",
          });
        default:
          return date.toLocaleDateString();
      }
    } catch (error) {
      console.error("Error formatting date:", error);
      return date.toString();
    }
  }, []);

  // Process data for chart
  const chartData = useMemo(() => {
    try {
      if (!data || data.length === 0) {
        // Generate sample data for demo when no real data is available
        const now = new Date();
        const sampleData = [];
        const periods = {
          "1D": { hours: 24, interval: 1 },
          "3D": { hours: 72, interval: 3 },
          "1W": { hours: 168, interval: 6 },
          "1Y": { hours: 8760, interval: 168 },
        };

        const { hours, interval } = periods[selectedPeriod] || periods["1D"];
        const basePrice = Math.max(1, currentPrice - change);

        for (let i = hours; i >= 0; i -= interval) {
          const date = new Date(now.getTime() - i * 60 * 60 * 1000);
          const randomChange = (Math.random() - 0.5) * basePrice * 0.05;
          const price = basePrice + randomChange + change * (1 - i / hours);

          sampleData.push({
            date: date.toISOString(),
            time: date.getTime(),
            close: Math.max(0.01, price),
            formattedDate: formatDate(date, selectedPeriod),
          });
        }

        return sampleData;
      }

      return data.map((point) => ({
        date:
          point.date instanceof Date
            ? point.date.toISOString()
            : new Date(point.date).toISOString(),
        time:
          point.date instanceof Date
            ? point.date.getTime()
            : new Date(point.date).getTime(),
        close: Number(point.close) || 0,
        open: Number(point.open) || undefined,
        high: Number(point.high) || undefined,
        low: Number(point.low) || undefined,
        volume: Number(point.volume) || undefined,
        formattedDate: formatDate(
          point.date instanceof Date ? point.date : new Date(point.date),
          selectedPeriod,
        ),
      }));
    } catch (error) {
      console.error("Error processing chart data:", error);
      return [];
    }
  }, [data, selectedPeriod, currentPrice, change, formatDate]);

  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      value: number;
      payload: {
        time: number;
        volume?: number;
      };
    }>;
    label?: string;
  }

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
            {new Date(data.time).toLocaleDateString([], {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: selectedPeriod === "1D" ? "2-digit" : undefined,
              minute: selectedPeriod === "1D" ? "2-digit" : undefined,
            })}
          </p>
          <p className="font-semibold text-gray-900 dark:text-white">
            ${payload[0].value.toFixed(2)}
          </p>
          {data.volume && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Volume: {(data.volume / 1000000).toFixed(1)}M
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const prices = chartData.map((d) => d.close).filter((price) => price > 0);
  const minPrice = prices.length > 0 ? Math.min(...prices) : currentPrice;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : currentPrice;
  const priceRange = Math.max(maxPrice - minPrice, 1);
  const padding = priceRange * 0.1;

  const isPositive = change >= 0;
  const chartColor = isPositive ? "#10B981" : "#EF4444";
  const gradientId = `gradient-${symbol}-${Math.random().toString(36).substr(2, 9)}`;

  // Error boundary fallback
  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Price Chart
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {symbol} price movement
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {["1D", "3D", "1W", "1Y"].map((period) => (
              <button
                key={period}
                onClick={() => onPeriodChange(period as typeof selectedPeriod)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedPeriod === period
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Loading chart data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Price Chart
            </h3>
            <div className="flex items-center space-x-4 mt-1">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(Number(currentPrice || 0), currency)}
              </span>
              <div
                className={`flex items-center space-x-1 ${isPositive ? "text-green-600" : "text-red-600"}`}
              >
                {isPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="font-medium">
                  {isPositive ? "+" : ""}${Number(change || 0).toFixed(2)} (
                  {Number(changePercent || 0).toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-4">
            {/* Chart Type Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setChartType("line")}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  chartType === "line"
                    ? "bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                Line
              </button>
              <button
                onClick={() => setChartType("area")}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  chartType === "area"
                    ? "bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                Area
              </button>
            </div>

            {/* Period Selector */}
            <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {["1D", "3D", "1W", "1Y"].map((period) => (
                <button
                  key={period}
                  onClick={() =>
                    onPeriodChange(period as typeof selectedPeriod)
                  }
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    selectedPeriod === period
                      ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "area" ? (
              <AreaChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={chartColor}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={chartColor}
                      stopOpacity={0.0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="opacity-30"
                  stroke="currentColor"
                />
                <XAxis
                  dataKey="formattedDate"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "currentColor" }}
                  className="text-gray-600 dark:text-gray-400"
                />
                <YAxis
                  domain={[minPrice - padding, maxPrice + padding]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "currentColor" }}
                  tickFormatter={(value) => `$${value.toFixed(2)}`}
                  className="text-gray-600 dark:text-gray-400"
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="close"
                  stroke={chartColor}
                  strokeWidth={2}
                  fill={`url(#${gradientId})`}
                  dot={false}
                  activeDot={{ r: 4, fill: chartColor }}
                />
              </AreaChart>
            ) : (
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="opacity-30"
                  stroke="currentColor"
                />
                <XAxis
                  dataKey="formattedDate"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "currentColor" }}
                  className="text-gray-600 dark:text-gray-400"
                />
                <YAxis
                  domain={[minPrice - padding, maxPrice + padding]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "currentColor" }}
                  tickFormatter={(value) => `$${value.toFixed(2)}`}
                  className="text-gray-600 dark:text-gray-400"
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="close"
                  stroke={chartColor}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: chartColor }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Chart Statistics */}
        <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">High</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(maxPrice, currency)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Low</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(minPrice, currency)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Range</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(priceRange, currency)}
            </p>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error rendering PriceChart:", error);
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <Activity className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Chart Error
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Unable to load chart data. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }
};
