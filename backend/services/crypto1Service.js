const axios = require("axios");
const sentimentService = require('./sentimentService');
// Removed INR conversion imports - displaying in USD now
// const { convertUsdToInr, convertMarketCapToINRCrores } = require('./currencyService');

// CRYPTO1 Flask app configuration
const CRYPTO1_BASE_URL = "http://127.0.0.1:5000"; // Default Flask port
const CRYPTO1_API_ENDPOINT = `${CRYPTO1_BASE_URL}/api/data`;

// Hardcoded map for crypto symbol to CoinGecko ID mapping
const SYMBOL_TO_ID_MAP = {
  BTC: "bitcoin",
  ETH: "ethereum",
  BNB: "binancecoin",
  SOL: "solana",
  XRP: "ripple",
  DOGE: "dogecoin",
  ADA: "cardano",
  SHIB: "shiba-inu",
  DOT: "polkadot",
  MATIC: "matic-network",
  LTC: "litecoin",
  TRX: "tron",
  AVAX: "avalanche-2",
  UNI: "uniswap",
  LINK: "chainlink"
};

// Cache for better performance
const cache = {
  data: null,
  timestamp: null,
  ttl: 15000 // 15 seconds cache for real-time data
};

const isCacheValid = () => {
  return cache.data && cache.timestamp && (Date.now() - cache.timestamp < cache.ttl);
};

/**
 * Fetch real-time cryptocurrency data from CRYPTO1 Flask app
 * @returns {Promise<Array>} Array of cryptocurrency data in TickerTracker format
 */
const getCryptoData = async () => {
  // Return cached data if still valid
  if (isCacheValid()) {
    console.log('📦 Returning cached crypto data from CRYPTO1 service');
    return cache.data;
  }

  try {
    console.log('🌐 Fetching real-time crypto data from CRYPTO1 Flask app...');
    
    // Fetch data from CRYPTO1 Flask app
    const response = await axios.get(CRYPTO1_API_ENDPOINT, {
      timeout: 10000, // 10 second timeout
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TickerTracker-Backend/1.0.0'
      }
    });

    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Invalid response format from CRYPTO1 service');
    }

    // Transform CRYPTO1 data to TickerTracker format with enhanced sentiment analysis
    const transformedData = await Promise.all(response.data.map(async (coin, index) => {
      const symbol = coin.symbol ? coin.symbol.toUpperCase() : 'UNKNOWN';
      
      // Get comprehensive sentiment analysis
      const marketData = {
        changePercent: coin.price_change_percentage_24h || 0,
        volume: coin.total_volume || 0,
        marketCap: coin.market_cap || 0,
        price: coin.current_price || 0
      };
      
      // Get sentiment analysis (with timeout to prevent blocking)
      let sentimentData;
      try {
        sentimentData = await Promise.race([
          sentimentService.getCryptoSentiment(symbol, marketData),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Sentiment timeout')), 2000))
        ]);
      } catch (error) {
        console.log(`⚠️ Sentiment analysis timeout/error for ${symbol}, using fallback`);
        sentimentData = {
          sentiment: determineSentiment(coin.price_change_percentage_24h || 0),
          impactScore: calculateImpactScore(coin, index),
          overallScore: 0,
          confidence: 0
        };
      }

      return {
        symbol,
        name: coin.name || 'Unknown Coin',
        exchange: "Crypto",
        price: coin.current_price || 0, // Display in USD
        change: coin.price_change_24h || 0, // Display in USD
        changePercent: coin.price_change_percentage_24h || 0,
        volume: coin.total_volume || 0, // Display in USD
        marketCap: (coin.market_cap || 0) / 1000000, // Convert to millions for readability
        pe: 0, // Not applicable for crypto
        previousClose: (coin.current_price || 0) - (coin.price_change_24h || 0), // Display in USD
        dividendYield: 0, // Not applicable for crypto
        sentiment: sentimentData.sentiment || determineSentiment(coin.price_change_percentage_24h || 0),
        impactScore: sentimentData.impactScore || calculateImpactScore(coin, index),
        sentimentScore: sentimentData.overallScore || 0,
        sentimentConfidence: sentimentData.confidence || 0,
        sentimentBreakdown: sentimentData.breakdown || {},
        news: [], // CRYPTO1 doesn't provide news data
        historicalData: [], // Will be populated separately if needed
        currency: 'USD', // Changed from INR to USD
        // Additional crypto-specific data
        image: coin.image || '',
        rank: coin.market_cap_rank || index + 1,
        circulatingSupply: coin.circulating_supply || 0,
        totalSupply: coin.total_supply || 0,
        maxSupply: coin.max_supply || null,
        // Enhanced metrics based on your reference
        liquidityScore: calculateLiquidityScore(coin),
        volatilityIndex: calculateVolatilityIndex(coin),
        marketDominance: calculateMarketDominance(coin, response.data),
        fearGreedIndex: calculateFearGreedIndex(sentimentData, coin)
      };
    }));

    // Update cache
    cache.data = transformedData;
    cache.timestamp = Date.now();

    console.log(`✅ Successfully transformed ${transformedData.length} cryptocurrencies from CRYPTO1`);
    return transformedData;

  } catch (error) {
    console.error('❌ Error fetching crypto data from CRYPTO1:', error.message);
    
    // Return cached data if available during error
    if (cache.data) {
      console.log('⚠️ Returning stale cached data due to CRYPTO1 API error');
      return cache.data;
    }

    // If CRYPTO1 service is unavailable, fallback to CoinGecko service
    console.log('⚠️ CRYPTO1 service unavailable, falling back to CoinGecko service...');
    
    try {
      const coinGecko = require('./coinGeckoService');
      const fallbackData = await coinGecko.getCryptoData();
      
      if (fallbackData && fallbackData.length > 0) {
        console.log(`✅ Successfully retrieved ${fallbackData.length} cryptocurrencies from CoinGecko fallback`);
        
        // Update cache with fallback data
        cache.data = fallbackData;
        cache.timestamp = Date.now();
        
        return fallbackData;
      }
    } catch (fallbackError) {
      console.error('❌ CoinGecko fallback also failed:', fallbackError.message);
    }
    
    // If both services fail, return mock data to prevent complete failure
    console.log('⚠️ Both CRYPTO1 and CoinGecko failed, returning mock data...');
    return getMockCryptoData();
  }
};

/**
 * Get detailed cryptocurrency information for a specific symbol
 * @param {string} symbol - Cryptocurrency symbol (e.g., 'BTC', 'ETH')
 * @returns {Promise<Object|null>} Detailed crypto data or null if not found
 */
const getCryptoDetails = async (symbol) => {
  try {
    // First, get the current market data to find the coin
    const marketData = await getCryptoData();
    const coin = marketData.find(c => c.symbol.toUpperCase() === symbol.toUpperCase());
    
    if (!coin) {
      console.log(`Crypto symbol ${symbol} not found in CRYPTO1 data`);
      return null;
    }

    // For detailed view, we could potentially make additional calls to CoinGecko
    // or enhance the CRYPTO1 service. For now, return enhanced market data.
    const detailedData = {
      ...coin,
      // Generate some sample historical data for charts
      historicalData: generateSampleHistoricalData(coin.price, 90),
      // Additional details could be fetched from CoinGecko if needed
      description: `${coin.name} is a cryptocurrency with symbol ${coin.symbol}.`,
      website: '',
      explorer: '',
      whitepaper: ''
    };

    console.log(`📊 Retrieved detailed data for ${symbol} from CRYPTO1`);
    return detailedData;

  } catch (error) {
    console.error(`Error fetching crypto details for ${symbol}:`, error.message);
    return null;
  }
};

/**
 * Determine sentiment based on price change percentage
 * @param {number} changePercent - 24h price change percentage
 * @returns {string} Sentiment: 'very positive', 'positive', 'neutral', 'negative', or 'very negative'
 */
const determineSentiment = (changePercent) => {
  if (changePercent >= 10) return 'very positive';
  if (changePercent >= 5) return 'positive';
  if (changePercent >= 2) return 'positive';
  if (changePercent <= -10) return 'very negative';
  if (changePercent <= -5) return 'negative';
  if (changePercent <= -2) return 'negative';
  return 'neutral';
};

/**
 * Calculate impact score based on market cap rank and volume
 * @param {Object} coin - Coin data from CRYPTO1
 * @param {number} index - Position in the list
 * @returns {number} Impact score from 0-100
 */
const calculateImpactScore = (coin, index) => {
  // Higher impact for top ranked coins with high volume
  const rankScore = Math.max(0, 100 - (index * 2)); // Top coins get higher scores
  const volumeScore = coin.total_volume ? Math.min(50, coin.total_volume / 1000000000) : 0;
  const changeScore = Math.abs(coin.price_change_percentage_24h || 0) * 2;
  
  return Math.min(100, Math.round(rankScore + volumeScore + changeScore));
};

/**
 * Calculate liquidity score based on volume and market cap
 * @param {Object} coin - Coin data
 * @returns {number} Liquidity score from 0-100
 */
const calculateLiquidityScore = (coin) => {
  const volume = coin.total_volume || 0;
  const marketCap = coin.market_cap || 1;
  
  // Volume to market cap ratio indicates liquidity
  const volumeToMcapRatio = volume / marketCap;
  const liquidityScore = Math.min(100, volumeToMcapRatio * 1000);
  
  return Math.round(liquidityScore);
};

/**
 * Calculate volatility index based on price change
 * @param {Object} coin - Coin data
 * @returns {number} Volatility index from 0-100
 */
const calculateVolatilityIndex = (coin) => {
  const changePercent = Math.abs(coin.price_change_percentage_24h || 0);
  
  // Normalize volatility to 0-100 scale
  const volatilityIndex = Math.min(100, changePercent * 5);
  
  return Math.round(volatilityIndex);
};

/**
 * Calculate market dominance percentage
 * @param {Object} coin - Current coin data
 * @param {Array} allCoins - All coins data for total market cap calculation
 * @returns {number} Market dominance percentage
 */
const calculateMarketDominance = (coin, allCoins) => {
  const coinMarketCap = coin.market_cap || 0;
  const totalMarketCap = allCoins.reduce((sum, c) => sum + (c.market_cap || 0), 0);
  
  if (totalMarketCap === 0) return 0;
  
  const dominance = (coinMarketCap / totalMarketCap) * 100;
  return Math.round(dominance * 100) / 100; // Round to 2 decimal places
};

/**
 * Calculate Fear & Greed Index based on sentiment and market data
 * @param {Object} sentimentData - Sentiment analysis data
 * @param {Object} coin - Coin market data
 * @returns {number} Fear & Greed Index from 0-100 (0 = Extreme Fear, 100 = Extreme Greed)
 */
const calculateFearGreedIndex = (sentimentData, coin) => {
  // Base score from sentiment
  let score = 50; // Neutral starting point
  
  // Sentiment component (40% weight)
  if (sentimentData && sentimentData.overallScore !== undefined) {
    score += sentimentData.overallScore * 20; // Convert -1 to 1 range to -20 to 20
  }
  
  // Price momentum component (30% weight)
  const priceChange = coin.price_change_percentage_24h || 0;
  score += Math.min(15, Math.max(-15, priceChange * 1.5));
  
  // Volume component (20% weight)
  const volume = coin.total_volume || 0;
  const volumeScore = Math.min(10, volume / 1000000000); // Normalize large volumes
  score += volumeScore;
  
  // Market cap rank component (10% weight)
  const rank = coin.market_cap_rank || 50;
  const rankScore = Math.max(0, (51 - rank) / 5); // Top 50 coins get bonus points
  score += rankScore;
  
  // Ensure score is between 0 and 100
  return Math.min(100, Math.max(0, Math.round(score)));
};

/**
 * Generate sample historical data for price charts
 * @param {number} currentPrice - Current price in USD
 * @param {number} days - Number of days of historical data
 * @returns {Array} Array of price points with date and close price
 */
const generateSampleHistoricalData = (currentPrice, days = 90) => {
  const historicalData = [];
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
    // Generate realistic price fluctuation
    const randomMultiplier = 0.8 + (Math.random() * 0.4); // ±20% variation
    const price = currentPrice * randomMultiplier * (0.9 + (Math.random() * 0.2));
    
    historicalData.push({
      date: date,
      close: Math.max(0.01, price) // Ensure positive price
    });
  }
  
  return historicalData;
};

/**
 * Generate mock cryptocurrency data for testing/fallback
 * @returns {Array} Array of mock cryptocurrency data
 */
const getMockCryptoData = () => {
  const mockCryptos = [
    { symbol: 'BTC', name: 'Bitcoin', current_price: 43250.00, price_change_24h: 1250.50, price_change_percentage_24h: 12.5, total_volume: 15420000000, market_cap: 848500000000, market_cap_rank: 1 },
    { symbol: 'ETH', name: 'Ethereum', current_price: 2680.75, price_change_24h: -45.20, price_change_percentage_24h: -1.66, total_volume: 8450000000, market_cap: 322400000000, market_cap_rank: 2 },
    { symbol: 'BNB', name: 'BNB', current_price: 315.40, price_change_24h: 8.90, price_change_percentage_24h: 7.3, total_volume: 1200000000, market_cap: 47310000000, market_cap_rank: 4 },
    { symbol: 'SOL', name: 'Solana', current_price: 98.25, price_change_24h: -12.45, price_change_percentage_24h: -11.2, total_volume: 1850000000, market_cap: 44120000000, market_cap_rank: 5 },
    { symbol: 'XRP', name: 'XRP', current_price: 0.52, price_change_24h: 0.015, price_change_percentage_24h: 2.97, total_volume: 1100000000, market_cap: 28440000000, market_cap_rank: 6 },
    { symbol: 'ADA', name: 'Cardano', current_price: 0.485, price_change_24h: -0.012, price_change_percentage_24h: -2.41, total_volume: 285000000, market_cap: 17120000000, market_cap_rank: 8 },
    { symbol: 'DOGE', name: 'Dogecoin', current_price: 0.078, price_change_24h: 0.002, price_change_percentage_24h: 15.8, total_volume: 490000000, market_cap: 11180000000, market_cap_rank: 10 },
    { symbol: 'DOT', name: 'Polkadot', current_price: 6.25, price_change_24h: -0.68, price_change_percentage_24h: -9.8, total_volume: 145000000, market_cap: 8430000000, market_cap_rank: 12 },
    { symbol: 'MATIC', name: 'Polygon', current_price: 0.82, price_change_24h: 0.025, price_change_percentage_24h: 3.14, total_volume: 320000000, market_cap: 7650000000, market_cap_rank: 13 },
    { symbol: 'LTC', name: 'Litecoin', current_price: 73.50, price_change_24h: -1.25, price_change_percentage_24h: -1.67, total_volume: 285000000, market_cap: 5420000000, market_cap_rank: 14 }
  ];

  return mockCryptos.map((coin, index) => ({
    symbol: coin.symbol,
    name: coin.name,
    exchange: "Crypto",
    price: coin.current_price,
    change: coin.price_change_24h,
    changePercent: coin.price_change_percentage_24h,
    volume: coin.total_volume,
    marketCap: coin.market_cap / 1000000, // Convert to millions
    pe: 0,
    previousClose: coin.current_price - coin.price_change_24h,
    dividendYield: 0,
    sentiment: determineSentiment(coin.price_change_percentage_24h),
    impactScore: calculateImpactScore(coin, index),
    news: [],
    historicalData: [],
    currency: 'USD',
    image: '',
    rank: coin.market_cap_rank || index + 1,
    circulatingSupply: 0,
    totalSupply: 0,
    maxSupply: null
  }));
};

/**
 * Check if CRYPTO1 service is available
 * @returns {Promise<boolean>} True if service is responding
 */
const checkCrypto1Health = async () => {
  try {
    const response = await axios.get(CRYPTO1_BASE_URL, { timeout: 5000 });
    return response.status === 200;
  } catch (error) {
    console.error('CRYPTO1 health check failed:', error.message);
    return false;
  }
};

module.exports = { 
  getCryptoData, 
  getCryptoDetails,
  checkCrypto1Health,
  CRYPTO1_BASE_URL,
  CRYPTO1_API_ENDPOINT
};