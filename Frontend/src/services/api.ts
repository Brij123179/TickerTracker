const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5004/api';

export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  pe: number;
  dividendYield: number;
  previousClose: number;
  exchange: string;
  sentiment: 'positive' | 'negative' | 'neutral' | 'very positive' | 'very negative';
  impactScore: number;
  news: NewsItem[];
  historicalData: PricePoint[];
  currency?: string; // Added currency field for USD/INR display
  // Enhanced sentiment analysis properties
  sentimentScore?: number; // Overall sentiment score (-1 to 1)
  sentimentConfidence?: number; // Confidence level (0-100)
  sentimentBreakdown?: {
    social?: number;
    news?: number;
    technical?: number;
    volume?: number;
  };
  // Additional crypto metrics
  fearGreedIndex?: number; // Fear & Greed Index (0-100)
  volatilityIndex?: number; // Volatility measure (0-100)
  liquidityScore?: number; // Liquidity score (0-100)
  marketDominance?: number; // Market dominance percentage
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  timestamp: Date;
  sentiment: 'positive' | 'negative' | 'neutral';
  summary: string;
  ticker: string;
  url?: string;
  image?: string;
}

export interface PricePoint {
  date: Date;
  close: number;
}

export interface Alert {
  id: string;
  ticker: string;
  condition: string;
  targetPrice?: number;
  sentimentTrigger?: 'positive' | 'negative';
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  memberSince: string;
  membership: string;
  subscription: {
    plan: string;
    nextBillingDate: string;
  };
}

export interface ChatResponse {
  response: string;
}

// Generic API request handler
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

// Stocks API
export const stocksApi = {
  getMarketData: (market: string): Promise<StockData[]> => {
    return apiRequest<StockData[]>(`/stocks/${market}`);
  },

  getTickerDetails: (symbol: string): Promise<StockData> => {
    return apiRequest<StockData>(`/ticker/${symbol}`);
  },
};

// Chat API
export const chatApi = {
  sendMessage: (message: string, market = 'US'): Promise<ChatResponse> => {
    return apiRequest<ChatResponse>('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, market }),
    });
  },
};

// User API
export const userApi = {
  getProfile: (): Promise<UserProfile> => {
    return apiRequest<UserProfile>('/user/profile');
  },

  updateProfile: (profileData: Partial<UserProfile>): Promise<UserProfile> => {
    return apiRequest<UserProfile>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  getSettings: (): Promise<any> => {
    return apiRequest<any>('/user/settings');
  },

  updateSettings: (settings: any): Promise<any> => {
    return apiRequest<any>('/user/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },
};

// Watchlist API
export const watchlistApi = {
  getWatchlist: (): Promise<string[]> => {
    return apiRequest<string[]>('/watchlist');
  },

  addToWatchlist: (symbol: string): Promise<string[]> => {
    return apiRequest<string[]>('/watchlist', {
      method: 'POST',
      body: JSON.stringify({ symbol }),
    });
  },

  removeFromWatchlist: (symbol: string): Promise<string[]> => {
    return apiRequest<string[]>(`/watchlist/${symbol}`, {
      method: 'DELETE',
    });
  },
};

// Alerts API
export const alertsApi = {
  getAlerts: (): Promise<Alert[]> => {
    return apiRequest<Alert[]>('/alerts');
  },

  createAlert: (alertData: Omit<Alert, 'id' | 'createdAt'>): Promise<Alert> => {
    return apiRequest<Alert>('/alerts', {
      method: 'POST',
      body: JSON.stringify(alertData),
    });
  },

  deleteAlert: (id: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(`/alerts/${id}`, {
      method: 'DELETE',
    });
  },
};

// News API
export const newsApi = {
  getMarketNews: (market: string): Promise<NewsItem[]> => {
    return apiRequest<NewsItem[]>(`/news/${market}`);
  },

  getCryptoNews: (): Promise<NewsItem[]> => {
    return apiRequest<NewsItem[]>('/news/crypto/all');
  },

  getGeneralNews: (): Promise<NewsItem[]> => {
    return apiRequest<NewsItem[]>('/news/general/all');
  },

  getRecentNews: (): Promise<NewsItem[]> => {
    return apiRequest<NewsItem[]>('/news/recent/all');
  },

  getTickerNews: (symbol: string): Promise<NewsItem[]> => {
    return apiRequest<NewsItem[]>(`/news/ticker/${symbol}`);
  },
};

// Combined API export
export const api = {
  stocks: stocksApi,
  chat: chatApi,
  user: userApi,
  watchlist: watchlistApi,
  alerts: alertsApi,
  news: newsApi,
};

export default api;
