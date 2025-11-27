const axios = require('axios');
// Removed INR conversion imports - displaying in USD now
// const { convertUsdToInr, convertMarketCapToINRCrores } = require('./currencyService');

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

// Simple in-memory cache
const cache = {};
const CACHE_TTL = {
  LIST: 10 * 60 * 1000, // 10 minutes
  DETAIL: 5 * 60 * 1000, // 5 minutes
  CHART: 60 * 60 * 1000, // 1 hour
  NEWS: 15 * 60 * 1000, // 15 minutes
};

const isCacheValid = (key, ttl) => {
  return cache[key] && (Date.now() - cache[key].timestamp < ttl);
};

const getUSStocks = async () => {
  if (isCacheValid('us_stocks', CACHE_TTL.LIST)) {
    return cache['us_stocks'].data;
  }
  
  try {
    console.log('Fetching US stocks from Alpha Vantage API...');
    const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'BRK-B', 'JPM', 'JNJ'];
    
    // Check if API key is available
    if (!API_KEY || API_KEY === 'your_api_key_here') {
      console.log('Alpha Vantage API key not configured, using mock data for US stocks');
      return getMockUSStocks();
    }
    
    const stockPromises = symbols.map(symbol => getTickerDetails(symbol, true));
    const stocks = (await Promise.all(stockPromises)).filter(Boolean);
    
    if (stocks.length === 0) {
      console.log('No US stocks returned from API, using mock data');
      return getMockUSStocks();
    }
    
    cache['us_stocks'] = { data: stocks, timestamp: Date.now() };
    return stocks;
  } catch (error) {
    console.error('Error fetching US stocks:', error.message);
    console.log('Falling back to mock US stocks data');
    return getMockUSStocks();
  }
};

const getMockUSStocks = () => {
  return [
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      exchange: 'NASDAQ',
      price: 175.43, // Display in USD
      change: 2.12, // Display in USD
      changePercent: 1.22,
      volume: 52486900,
      marketCap: 2800000, // Market cap in millions
      pe: 29.15,
      previousClose: 173.31, // Display in USD
      dividendYield: 0.52,
      sentiment: 'positive',
      impactScore: 75,
      historicalData: [],
      news: [],
      currency: 'USD' // Changed from INR to USD
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      exchange: 'NASDAQ',
      price: 342.56, // Display in USD
      change: -1.85, // Display in USD
      changePercent: -0.54,
      volume: 23845600,
      marketCap: 2550000, // Market cap in millions
      pe: 32.41,
      previousClose: 344.41, // Display in USD
      dividendYield: 0.89,
      sentiment: 'neutral',
      impactScore: 68,
      historicalData: [],
      news: [],
      currency: 'USD' // Changed from INR to USD
    },
    {
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      exchange: 'NASDAQ',
      price: 138.21, // Display in USD
      change: 1.67, // Display in USD
      changePercent: 1.22,
      volume: 28765400,
      marketCap: 1750000, // Market cap in millions
      pe: 25.33,
      previousClose: 136.54, // Display in USD
      dividendYield: 0.00,
      sentiment: 'positive',
      impactScore: 82,
      historicalData: [],
      news: [],
      currency: 'USD' // Changed from INR to USD
    },
    {
      symbol: 'AMZN',
      name: 'Amazon.com Inc.',
      exchange: 'NASDAQ',
      price: 144.32, // Display in USD
      change: 3.21, // Display in USD
      changePercent: 2.28,
      volume: 45123800,
      marketCap: 1500000, // Market cap in millions
      pe: 42.18,
      previousClose: 141.11, // Display in USD
      dividendYield: 0.00,
      sentiment: 'positive',
      impactScore: 89,
      historicalData: [],
      news: [],
      currency: 'USD' // Changed from INR to USD
    },
    {
      symbol: 'NVDA',
      name: 'NVIDIA Corporation',
      exchange: 'NASDAQ',
      price: 432.18, // Display in USD
      change: 8.45, // Display in USD
      changePercent: 1.99,
      volume: 67234500,
      marketCap: 1070000, // Market cap in millions
      pe: 65.22,
      previousClose: 423.73, // Display in USD
      dividendYield: 0.03,
      sentiment: 'positive',
      impactScore: 95,
      historicalData: [],
      news: [],
      currency: 'USD' // Changed from INR to USD
    }
  ];
};

const getHistoricalData = async (symbol) => {
    const cacheKey = `chart_${symbol}`;
    if (isCacheValid(cacheKey, CACHE_TTL.CHART)) return cache[cacheKey].data;
  
    const res = await axios.get(BASE_URL, { params: { function: 'TIME_SERIES_DAILY', symbol, apikey: API_KEY, outputsize: 'compact' } });
    const timeSeries = res.data['Time Series (Daily)'];
    if (!timeSeries) throw new Error(`No time series data for ${symbol}`);

    const chartData = Object.entries(timeSeries).map(([date, values]) => ({
        date: new Date(date),
        close: parseFloat(values['4. close']) // Display in USD
    })).reverse();

    cache[cacheKey] = { data: chartData, timestamp: Date.now() };
    return chartData;
};

const getNews = async (symbol) => {
    const cacheKey = `news_${symbol}`;
    if (isCacheValid(cacheKey, CACHE_TTL.NEWS)) return cache[cacheKey].data;

    const res = await axios.get(BASE_URL, { params: { function: 'NEWS_SENTIMENT', tickers: symbol, apikey: API_KEY, limit: 10 } });
    if (!res.data.feed) return [];

    const newsData = res.data.feed.map(item => {
        const overallSentiment = item.overall_sentiment_score;
        let sentiment = 'neutral';
        if (overallSentiment > 0.15) sentiment = 'positive';
        if (overallSentiment < -0.15) sentiment = 'negative';

        return {
            id: item.url, title: item.title, summary: item.summary, source: item.source,
            timestamp: new Date(item.time_published.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/, '$1-$2-$3T$4:$5:$6Z')),
            sentiment, ticker: symbol
        };
    });
    cache[cacheKey] = { data: newsData, timestamp: Date.now() };
    return newsData;
};

const getTickerDetails = async (symbol, isLight = false) => {
    const cacheKey = `detail_${symbol}`;
    if (!isLight && isCacheValid(cacheKey, CACHE_TTL.DETAIL)) {
        return cache[cacheKey].data;
    }

    try {
        // Check if API key is available
        if (!API_KEY || API_KEY === 'your_api_key_here') {
            console.log(`Alpha Vantage API key not configured for ${symbol}, skipping`);
            return null;
        }

        console.log(`Fetching ticker details for ${symbol}...`);
        const quotePromise = axios.get(BASE_URL, { params: { function: 'GLOBAL_QUOTE', symbol, apikey: API_KEY } });
        const overviewPromise = axios.get(BASE_URL, { params: { function: 'OVERVIEW', symbol, apikey: API_KEY } });
        const promises = [quotePromise, overviewPromise];

        if (!isLight) {
            promises.push(getHistoricalData(symbol));
            promises.push(getNews(symbol));
        }

        const [quoteRes, overviewRes, historicalData, news] = await Promise.all(promises);

        const quote = quoteRes.data['Global Quote'];
        const overview = overviewRes.data;

        if (!quote || Object.keys(quote).length === 0 || !overview || !overview.Symbol) {
            console.log(`No valid data returned for ${symbol}`);
            return null;
        }
        
        const sentimentScore = news ? (news.reduce((acc, n) => acc + (n.sentiment === 'positive' ? 1 : n.sentiment === 'negative' ? -1 : 0), 0) / news.length || 0) : 0;
        let sentiment = 'neutral';
        if (sentimentScore > 0.2) sentiment = 'positive';
        if (sentimentScore < -0.2) sentiment = 'negative';

        // Use USD prices directly
        const usdPrice = parseFloat(quote['05. price']);
        const usdChange = parseFloat(quote['09. change']);
        const usdPreviousClose = parseFloat(quote['08. previous close']);
        const usdMarketCap = parseInt(overview.MarketCapitalization);

        const details = {
            symbol: overview.Symbol,
            name: overview.Name,
            exchange: overview.Exchange,
            price: usdPrice, // Display in USD
            change: usdChange, // Display in USD
            changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
            volume: parseInt(quote['06. volume']),
            marketCap: usdMarketCap / 1000000, // Market cap in millions
            pe: parseFloat(overview.PERatio),
            previousClose: usdPreviousClose, // Display in USD
            dividendYield: parseFloat(overview.DividendYield) * 100,
            sentiment,
            impactScore: Math.floor(Math.abs(sentimentScore * 50) + Math.abs(parseFloat(quote['10. change percent'])) * 10),
            historicalData: historicalData || [],
            news: news || [],
            currency: 'USD', // Changed from INR to USD
        };

        if (!isLight) {
            cache[cacheKey] = { data: details, timestamp: Date.now() };
        }
        console.log(`Successfully fetched details for ${symbol}`);
        return details;
    } catch (error) {
        console.error(`Error fetching details for ${symbol}:`, error.message);
        return null;
    }
};

module.exports = { getUSStocks, getTickerDetails };