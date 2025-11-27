import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Activity, 
  Users,
  Crosshair,
  Zap,
  AlertCircle
} from 'lucide-react';
import { useData } from '../contexts/DataContext';

interface SentimentPanelProps {
  selectedTicker?: string;
}

export const SentimentPanel: React.FC<SentimentPanelProps> = ({ selectedTicker }) => {
  const { stocks } = useData();
  const [sentimentData, setSentimentData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedTicker) {
      fetchSentimentData(selectedTicker);
    } else {
      // Show overall market sentiment
      calculateMarketSentiment();
    }
  }, [selectedTicker, stocks]);

  const fetchSentimentData = async (ticker: string) => {
    setLoading(true);
    try {
      // Find the stock data for the selected ticker
      const stockData = stocks.find(s => s.symbol === ticker);
      if (stockData) {
        setSentimentData({
          symbol: stockData.symbol,
          name: stockData.name,
          sentiment: stockData.sentiment,
          sentimentScore: stockData.sentimentScore || 0,
          sentimentConfidence: stockData.sentimentConfidence || 0,
          sentimentBreakdown: stockData.sentimentBreakdown || {},
          impactScore: stockData.impactScore || 0,
          fearGreedIndex: stockData.fearGreedIndex || 50,
          volatilityIndex: stockData.volatilityIndex || 0,
          liquidityScore: stockData.liquidityScore || 0
        });
      }
    } catch (error) {
      console.error('Error fetching sentiment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMarketSentiment = () => {
    if (stocks.length === 0) return;

    const cryptoStocks = stocks.filter(s => s.exchange === 'Crypto');
    if (cryptoStocks.length === 0) return;

    // Calculate overall market metrics
    const avgSentimentScore = cryptoStocks.reduce((sum, stock) => 
      sum + (stock.sentimentScore || 0), 0) / cryptoStocks.length;
    
    const avgImpactScore = cryptoStocks.reduce((sum, stock) => 
      sum + (stock.impactScore || 0), 0) / cryptoStocks.length;
    
    const avgFearGreed = cryptoStocks.reduce((sum, stock) => 
      sum + (stock.fearGreedIndex || 50), 0) / cryptoStocks.length;

    const positiveCount = cryptoStocks.filter(s => s.changePercent > 0).length;
    const negativeCount = cryptoStocks.filter(s => s.changePercent < 0).length;
    const neutralCount = cryptoStocks.length - positiveCount - negativeCount;

    setSentimentData({
      symbol: 'MARKET',
      name: 'Crypto Market',
      sentiment: avgSentimentScore > 0.2 ? 'positive' : avgSentimentScore < -0.2 ? 'negative' : 'neutral',
      sentimentScore: avgSentimentScore,
      sentimentConfidence: 85,
      impactScore: avgImpactScore,
      fearGreedIndex: avgFearGreed,
      marketBreakdown: {
        positive: positiveCount,
        negative: negativeCount,
        neutral: neutralCount,
        total: cryptoStocks.length
      }
    });
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'very positive':
      case 'positive':
        return 'text-green-600 dark:text-green-400';
      case 'very negative':
      case 'negative':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'very positive':
      case 'positive':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'very negative':
      case 'negative':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      default:
        return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const getFearGreedLabel = (index: number) => {
    if (index >= 75) return { label: 'Extreme Greed', color: 'text-green-600' };
    if (index >= 55) return { label: 'Greed', color: 'text-green-500' };
    if (index >= 45) return { label: 'Neutral', color: 'text-gray-600' };
    if (index >= 25) return { label: 'Fear', color: 'text-orange-500' };
    return { label: 'Extreme Fear', color: 'text-red-600' };
  };

  const getScoreColor = (score: number, max: number = 1) => {
    const normalized = Math.abs(score) / max;
    if (score > 0) {
      return normalized > 0.6 ? 'text-green-600' : normalized > 0.2 ? 'text-green-500' : 'text-gray-600';
    } else {
      return normalized > 0.6 ? 'text-red-600' : normalized > 0.2 ? 'text-red-500' : 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!sentimentData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Select a cryptocurrency to view sentiment analysis</p>
        </div>
      </div>
    );
  }

  const fearGreedData = getFearGreedLabel(sentimentData.fearGreedIndex);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Sentiment Analysis
          </h3>
        </div>
        {sentimentData.symbol !== 'MARKET' && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {sentimentData.name} ({sentimentData.symbol})
          </p>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Overall Sentiment */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getSentimentIcon(sentimentData.sentiment)}
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Overall Sentiment</p>
              <p className={`font-semibold capitalize ${getSentimentColor(sentimentData.sentiment)}`}>
                {sentimentData.sentiment}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">Score</p>
            <p className={`font-bold text-lg ${getScoreColor(sentimentData.sentimentScore)}`}>
              {sentimentData.sentimentScore > 0 ? '+' : ''}{sentimentData.sentimentScore.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Sentiment Breakdown */}
        {sentimentData.sentimentBreakdown && Object.keys(sentimentData.sentimentBreakdown).length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Sentiment Sources</h4>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(sentimentData.sentimentBreakdown).map(([source, score]: [string, any]) => (
                <div key={source} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">{source}</p>
                  <p className={`font-semibold ${getScoreColor(score)}`}>
                    {score > 0 ? '+' : ''}{score.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Market Breakdown for overall market */}
        {sentimentData.marketBreakdown && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Market Distribution</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                <TrendingUp className="w-4 h-4 text-green-600 mx-auto mb-1" />
                <p className="text-xs text-gray-600 dark:text-gray-400">Positive</p>
                <p className="font-semibold text-green-600">{sentimentData.marketBreakdown.positive}</p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
                <TrendingDown className="w-4 h-4 text-red-600 mx-auto mb-1" />
                <p className="text-xs text-gray-600 dark:text-gray-400">Negative</p>
                <p className="font-semibold text-red-600">{sentimentData.marketBreakdown.negative}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                <Activity className="w-4 h-4 text-gray-600 mx-auto mb-1" />
                <p className="text-xs text-gray-600 dark:text-gray-400">Neutral</p>
                <p className="font-semibold text-gray-600">{sentimentData.marketBreakdown.neutral}</p>
              </div>
            </div>
          </div>
        )}

        {/* Fear & Greed Index */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Fear & Greed Index</h4>
            <span className={`text-sm font-semibold ${fearGreedData.color}`}>
              {fearGreedData.label}
            </span>
          </div>
          <div className="relative">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-3 rounded-full relative"
                style={{ width: '100%' }}
              >
                <div 
                  className="absolute top-0 w-1 h-3 bg-white border border-gray-400 rounded-full transform -translate-x-1/2"
                  style={{ left: `${sentimentData.fearGreedIndex}%` }}
                ></div>
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
              <span>Fear</span>
              <span className="font-semibold">{Math.round(sentimentData.fearGreedIndex)}</span>
              <span>Greed</span>
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">Impact Score</p>
            </div>
            <p className="text-2xl font-bold text-blue-600">{Math.round(sentimentData.impactScore)}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Market influence potential</p>
          </div>

          {sentimentData.sentimentConfidence && (
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="w-4 h-4 text-purple-600" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">Confidence</p>
              </div>
              <p className="text-2xl font-bold text-purple-600">{sentimentData.sentimentConfidence}%</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Analysis reliability</p>
            </div>
          )}
        </div>

        {/* Additional Crypto Metrics */}
        {sentimentData.volatilityIndex !== undefined && sentimentData.liquidityScore !== undefined && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="w-4 h-4 text-orange-600" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">Volatility</p>
              </div>
              <p className="text-2xl font-bold text-orange-600">{Math.round(sentimentData.volatilityIndex)}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Price movement intensity</p>
            </div>

            <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Activity className="w-4 h-4 text-teal-600" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">Liquidity</p>
              </div>
              <p className="text-2xl font-bold text-teal-600">{Math.round(sentimentData.liquidityScore)}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Trading ease indicator</p>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <Activity className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              Sentiment analysis is for informational purposes only. Not financial advice. 
              Market sentiment can change rapidly and should be combined with other analysis methods.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};