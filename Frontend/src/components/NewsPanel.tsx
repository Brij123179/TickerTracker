import React, { useState, useEffect } from 'react';
import { Clock, FileText, Activity } from 'lucide-react';
import { StockData } from '../contexts/DataContext';
import { newsApi, NewsItem } from '../services/api';

interface NewsPanelProps {
  stocks: StockData[];
  selectedMarket: string;
  onTickerSelect: (ticker: string) => void;
}

export const NewsPanel: React.FC<NewsPanelProps> = ({ stocks, selectedMarket, onTickerSelect }) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [newsSource, setNewsSource] = useState<'recent' | 'market' | 'crypto' | 'general'>('recent');

  // Fetch news based on selected market and source
  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        let newsData: NewsItem[] = [];
        
        if (newsSource === 'recent') {
          newsData = await newsApi.getRecentNews();
        } else if (newsSource === 'market') {
          newsData = await newsApi.getMarketNews(selectedMarket);
        } else if (newsSource === 'crypto') {
          newsData = await newsApi.getCryptoNews();
        } else if (newsSource === 'general') {
          newsData = await newsApi.getGeneralNews();
        }
        
        setNews(newsData);
      } catch (error) {
        console.error('Error fetching news:', error);
        // Fallback to stock news if API fails
        const stockNews = stocks
          .flatMap(stock => 
            stock.news.map(news => ({
              ...news,
              ticker: stock.symbol
            }))
          )
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 10);
        setNews(stockNews);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [selectedMarket, newsSource, stocks]);

  const formatTimeAgo = (date: Date | string) => {
    const newsDate = new Date(date);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - newsDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const getSourceIcon = (source: string) => {
    if (source.includes('Sandmark')) {
      return <Activity className="w-4 h-4 text-orange-600" />;
    } else if (source.includes('MoneyControl')) {
      return <FileText className="w-4 h-4 text-blue-600" />;
    } else {
      return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-0">Latest News</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setNewsSource('recent')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
              newsSource === 'recent' 
                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            Recent
          </button>
          <button
            onClick={() => setNewsSource('market')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
              newsSource === 'market' 
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            Market
          </button>
          <button
            onClick={() => setNewsSource('crypto')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
              newsSource === 'crypto' 
                ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            Crypto
          </button>
          <button
            onClick={() => setNewsSource('general')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
              newsSource === 'general' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            General
          </button>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin pr-2">
            {news.slice(0, 8).map((newsItem) => (
              <div key={newsItem.id} className="border-b border-gray-100 dark:border-gray-700 pb-4 last:border-b-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    {newsItem.ticker && (
                      <button
                        onClick={() => onTickerSelect(newsItem.ticker)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors shrink-0"
                      >
                        {newsItem.ticker}
                      </button>
                    )}
                    <div className="flex items-center gap-1 min-w-0">
                      {getSourceIcon(newsItem.source)}
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {newsItem.source}
                      </span>
                      {newsSource === 'recent' && (newsItem as any).category && (
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ml-1 ${
                          (newsItem as any).category === 'crypto' 
                            ? 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300'
                            : 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                        }`}>
                          {(newsItem as any).category}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium shrink-0 ${
                    newsItem.sentiment === 'positive' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : newsItem.sentiment === 'negative'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}>
                    {newsItem.sentiment}
                  </span>
                </div>
                
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 leading-relaxed">
                  <span className="line-clamp-2 break-words">
                    {newsItem.title}
                  </span>
                </h4>
                
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                  <span className="line-clamp-2 break-words">
                    {newsItem.summary}
                  </span>
                </p>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="w-3 h-3 mr-1 shrink-0" />
                    <span className="whitespace-nowrap">{formatTimeAgo(newsItem.timestamp)}</span>
                  </div>
                  {newsItem.url && (
                    <a
                      href={newsItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-700 transition-colors whitespace-nowrap self-start sm:self-auto"
                    >
                      Read more →
                    </a>
                  )}
                </div>
              </div>
            ))}
            {news.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No news available at the moment.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};