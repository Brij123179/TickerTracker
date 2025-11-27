const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001';

// Cache configuration
const cache = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const isCacheValid = (key, ttl) => {
  return cache[key] && (Date.now() - cache[key].timestamp < ttl);
};

/**
 * Fetch Indian market data from Flask API service
 */
const getIndianStocks = async () => {
  if (isCacheValid('indian_stocks', CACHE_TTL)) {
    console.log('📦 Returning cached Indian stocks data');
    return cache['indian_stocks'].data;
  }

  try {
    console.log('🌐 Fetching Indian market data from Flask API...');
    const response = await axios.get(`${API_BASE_URL}/get_market_data`, {
      timeout: 10000
    });

    if (response.data && response.data.stocks) {
      const stocks = response.data.stocks.map(stock => ({
        symbol: stock.symbol || stock.ticker || 'N/A',
        name: stock.name || stock.longName || stock.symbol || 'Unknown',
        price: parseFloat(stock.currentPrice || stock.price || 0),
        change: parseFloat(stock.change || 0),
        changePercent: parseFloat(stock.changePercent || stock.percentChange || 0),
        volume: parseInt(stock.volume || 0),
        marketCap: parseFloat(stock.marketCap || 0) / 10000000, // Convert to Crores
        pe: parseFloat(stock.pe || stock.peRatio || 15),
        high: parseFloat(stock.dayHigh || stock.high || 0),
        low: parseFloat(stock.dayLow || stock.low || 0),
        open: parseFloat(stock.open || 0),
        previousClose: parseFloat(stock.previousClose || 0),
        exchange: 'NSE',
        currency: 'INR',
        sector: stock.sector || 'Technology',
        industry: stock.industry || 'Software',
        sentiment: determineSentiment(parseFloat(stock.changePercent || 0)),
        impactScore: calculateImpactScore(stock)
      }));

      console.log(`✅ Successfully fetched ${stocks.length} Indian stocks from Flask API`);
      cache['indian_stocks'] = { data: stocks, timestamp: Date.now() };
      return stocks;
    }

    throw new Error('Invalid response format from Flask API');
  } catch (error) {
    console.error('❌ Error fetching Indian stocks from Flask API:', error.message);
    console.log('⚠️ Flask API service may not be running. Start it with: python API/app.py');
    return null; // Return null to allow fallback to mock data
  }
};

/**
 * Fetch US market data from Flask API service
 */
const getUSStocksFromAPI = async () => {
  if (isCacheValid('us_stocks_api', CACHE_TTL)) {
    console.log('📦 Returning cached US stocks data from API');
    return cache['us_stocks_api'].data;
  }

  try {
    console.log('🌐 Fetching US market data from Flask API...');
    const response = await axios.get(`${API_BASE_URL}/get_us_market_data`, {
      timeout: 10000
    });

    if (response.data && response.data.stocks) {
      const stocks = response.data.stocks.map(stock => ({
        symbol: stock.symbol || stock.ticker || 'N/A',
        name: stock.name || stock.longName || stock.symbol || 'Unknown',
        price: parseFloat(stock.currentPrice || stock.price || 0),
        change: parseFloat(stock.change || 0),
        changePercent: parseFloat(stock.changePercent || stock.percentChange || 0),
        volume: parseInt(stock.volume || 0),
        marketCap: parseFloat(stock.marketCap || 0) / 1000000, // Convert to Millions
        pe: parseFloat(stock.pe || stock.peRatio || 20),
        high: parseFloat(stock.dayHigh || stock.high || 0),
        low: parseFloat(stock.dayLow || stock.low || 0),
        open: parseFloat(stock.open || 0),
        previousClose: parseFloat(stock.previousClose || 0),
        exchange: 'NASDAQ',
        currency: 'USD',
        sector: stock.sector || 'Technology',
        industry: stock.industry || 'Software',
        sentiment: determineSentiment(parseFloat(stock.changePercent || 0)),
        impactScore: calculateImpactScore(stock)
      }));

      console.log(`✅ Successfully fetched ${stocks.length} US stocks from Flask API`);
      cache['us_stocks_api'] = { data: stocks, timestamp: Date.now() };
      return stocks;
    }

    throw new Error('Invalid response format from Flask API');
  } catch (error) {
    console.error('❌ Error fetching US stocks from Flask API:', error.message);
    return null; // Return null to allow fallback
  }
};

/**
 * Get stock details by symbol
 */
const getStockDetails = async (symbol) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/get_stock_details/${symbol}`, {
      timeout: 5000
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching details for ${symbol}:`, error.message);
    return null;
  }
};

/**
 * Check if Flask API service is available
 */
const checkHealth = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/`, {
      timeout: 2000
    });
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

// Helper functions
function determineSentiment(changePercent) {
  if (changePercent > 3) return 'very positive';
  if (changePercent > 0) return 'positive';
  if (changePercent < -3) return 'very negative';
  if (changePercent < 0) return 'negative';
  return 'neutral';
}

function calculateImpactScore(stock) {
  const changePercent = Math.abs(parseFloat(stock.changePercent || 0));
  const volume = parseInt(stock.volume || 0);
  const marketCap = parseFloat(stock.marketCap || 0);
  
  // Calculate impact score based on price change, volume, and market cap
  let score = changePercent * 10; // Base on price change
  
  // Add volume component (normalized)
  if (volume > 10000000) score += 20;
  else if (volume > 5000000) score += 10;
  else if (volume > 1000000) score += 5;
  
  // Add market cap component
  if (marketCap > 100000) score += 15;
  else if (marketCap > 50000) score += 10;
  else if (marketCap > 10000) score += 5;
  
  return Math.min(Math.round(score), 100); // Cap at 100
}

module.exports = {
  getIndianStocks,
  getUSStocksFromAPI,
  getStockDetails,
  checkHealth
};
