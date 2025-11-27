const axios = require('axios');

/**
 * Crypto Sentiment Analysis Service
 * Implements StockGeist-style sentiment analysis for cryptocurrencies
 * Integrates multiple data sources for comprehensive sentiment scoring
 */
class SentimentService {
  constructor() {
    this.sentimentCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
    
    // Sentiment scoring weights
    this.weights = {
      social: 0.4,      // Social media sentiment weight
      news: 0.3,        // News sentiment weight
      technical: 0.2,   // Technical indicators weight
      volume: 0.1       // Volume-based sentiment weight
    };
    
    // Common crypto symbols and their sentiment keywords
    this.cryptoKeywords = {
      'BTC': ['bitcoin', 'btc', 'satoshi'],
      'ETH': ['ethereum', 'eth', 'ether', 'vitalik'],
      'BNB': ['binance', 'bnb', 'binance coin'],
      'XRP': ['ripple', 'xrp'],
      'ADA': ['cardano', 'ada'],
      'SOL': ['solana', 'sol'],
      'DOGE': ['dogecoin', 'doge', 'shiba'],
      'DOT': ['polkadot', 'dot'],
      'AVAX': ['avalanche', 'avax'],
      'MATIC': ['polygon', 'matic']
    };
  }

  /**
   * Get comprehensive sentiment analysis for a cryptocurrency
   * @param {string} symbol - Crypto symbol (e.g., 'BTC')
   * @param {Object} marketData - Current market data for the crypto
   * @returns {Object} Sentiment analysis result
   */
  async getCryptoSentiment(symbol, marketData = {}) {
    const cacheKey = `${symbol}_sentiment`;
    const cached = this.sentimentCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const sentimentData = await this.analyzeCryptoSentiment(symbol, marketData);
      
      // Cache the result
      this.sentimentCache.set(cacheKey, {
        data: sentimentData,
        timestamp: Date.now()
      });
      
      return sentimentData;
    } catch (error) {
      console.error(`Error analyzing sentiment for ${symbol}:`, error);
      return this.getDefaultSentiment(symbol);
    }
  }

  /**
   * Analyze crypto sentiment from multiple sources
   * @param {string} symbol - Crypto symbol
   * @param {Object} marketData - Market data
   * @returns {Object} Comprehensive sentiment analysis
   */
  async analyzeCryptoSentiment(symbol, marketData) {
    const keywords = this.cryptoKeywords[symbol] || [symbol.toLowerCase()];
    
    // Get sentiment from different sources
    const [socialSentiment, newsSentiment, technicalSentiment, volumeSentiment] = await Promise.allSettled([
      this.getSocialMediaSentiment(keywords),
      this.getNewsSentiment(keywords),
      this.getTechnicalSentiment(marketData),
      this.getVolumeSentiment(marketData)
    ]);

    // Calculate weighted sentiment score
    const sentiments = {
      social: socialSentiment.status === 'fulfilled' ? socialSentiment.value : 0,
      news: newsSentiment.status === 'fulfilled' ? newsSentiment.value : 0,
      technical: technicalSentiment.status === 'fulfilled' ? technicalSentiment.value : 0,
      volume: volumeSentiment.status === 'fulfilled' ? volumeSentiment.value : 0
    };

    const overallScore = Object.entries(sentiments).reduce((acc, [key, value]) => {
      return acc + (value * this.weights[key]);
    }, 0);

    // Classify sentiment
    const sentiment = this.classifySentiment(overallScore);
    
    // Calculate impact score (0-100)
    const impactScore = this.calculateImpactScore(sentiments, marketData);
    
    // Get confidence level
    const confidence = this.calculateConfidence(sentiments);

    return {
      symbol,
      overallScore: Math.round(overallScore * 100) / 100,
      sentiment,
      impactScore,
      confidence,
      breakdown: sentiments,
      timestamp: new Date().toISOString(),
      sources: {
        socialMedia: socialSentiment.status === 'fulfilled',
        news: newsSentiment.status === 'fulfilled',
        technical: technicalSentiment.status === 'fulfilled',
        volume: volumeSentiment.status === 'fulfilled'
      }
    };
  }

  /**
   * Analyze social media sentiment (simulated)
   * In production, this would integrate with Twitter API, Reddit API, etc.
   */
  async getSocialMediaSentiment(keywords) {
    // Simulate social media sentiment analysis
    // In real implementation, you would:
    // 1. Fetch tweets, Reddit posts, Telegram messages
    // 2. Use NLP libraries to analyze sentiment
    // 3. Aggregate scores across platforms
    
    const baseScore = Math.random() * 2 - 1; // -1 to 1
    const marketFactors = this.getMarketFactors();
    
    return Math.max(-1, Math.min(1, baseScore + marketFactors.social));
  }

  /**
   * Analyze news sentiment
   */
  async getNewsSentiment(keywords) {
    try {
      // In production, integrate with news APIs like NewsAPI, Alpha Vantage News, etc.
      // For now, simulate based on general market conditions
      
      const newsFactors = this.getMarketFactors();
      const baseScore = Math.random() * 1.6 - 0.8; // Slightly positive bias for crypto news
      
      return Math.max(-1, Math.min(1, baseScore + newsFactors.news));
    } catch (error) {
      return 0;
    }
  }

  /**
   * Calculate technical sentiment based on price action
   */
  async getTechnicalSentiment(marketData) {
    if (!marketData.changePercent) return 0;
    
    const priceChange = marketData.changePercent;
    const volume = marketData.volume || 0;
    const marketCap = marketData.marketCap || 0;
    
    // Technical sentiment based on price momentum
    let technicalScore = 0;
    
    if (priceChange > 10) technicalScore = 0.8;
    else if (priceChange > 5) technicalScore = 0.6;
    else if (priceChange > 2) technicalScore = 0.3;
    else if (priceChange > 0) technicalScore = 0.1;
    else if (priceChange > -2) technicalScore = -0.1;
    else if (priceChange > -5) technicalScore = -0.3;
    else if (priceChange > -10) technicalScore = -0.6;
    else technicalScore = -0.8;
    
    // Adjust based on volume (higher volume = more reliable signal)
    const volumeAdjustment = Math.min(0.2, volume / 1000000000 * 0.1);
    technicalScore += (technicalScore > 0 ? volumeAdjustment : -volumeAdjustment);
    
    return Math.max(-1, Math.min(1, technicalScore));
  }

  /**
   * Calculate volume-based sentiment
   */
  async getVolumeSentiment(marketData) {
    if (!marketData.volume || !marketData.changePercent) return 0;
    
    const volume = marketData.volume;
    const priceChange = marketData.changePercent;
    
    // High volume with positive price = positive sentiment
    // High volume with negative price = negative sentiment
    // Low volume = neutral sentiment
    
    const normalizedVolume = Math.min(1, volume / 10000000000); // Normalize to 0-1
    const volumeSentiment = normalizedVolume * Math.sign(priceChange) * 0.5;
    
    return Math.max(-1, Math.min(1, volumeSentiment));
  }

  /**
   * Get market factors that influence sentiment
   */
  getMarketFactors() {
    const hour = new Date().getHours();
    const day = new Date().getDay();
    
    // Market sentiment factors based on time
    let socialFactor = 0;
    let newsFactor = 0;
    
    // Weekend effect (crypto markets are 24/7 but news/social activity varies)
    if (day === 0 || day === 6) {
      socialFactor -= 0.1;
      newsFactor -= 0.2;
    }
    
    // Time of day effect (peak social media hours)
    if (hour >= 9 && hour <= 17) {
      socialFactor += 0.1;
      newsFactor += 0.1;
    }
    
    return { social: socialFactor, news: newsFactor };
  }

  /**
   * Classify sentiment score into categories
   */
  classifySentiment(score) {
    if (score >= 0.6) return 'very positive';
    if (score >= 0.2) return 'positive';
    if (score >= -0.2) return 'neutral';
    if (score >= -0.6) return 'negative';
    return 'very negative';
  }

  /**
   * Calculate impact score (0-100)
   */
  calculateImpactScore(sentiments, marketData = {}) {
    const avgSentiment = Object.values(sentiments).reduce((a, b) => a + Math.abs(b), 0) / 4;
    const volumeBoost = marketData.volume ? Math.min(20, marketData.volume / 1000000000) : 0;
    const priceVolatility = marketData.changePercent ? Math.abs(marketData.changePercent) / 10 : 0;
    
    const impact = (avgSentiment * 60) + volumeBoost + (priceVolatility * 20);
    return Math.min(100, Math.max(0, Math.round(impact)));
  }

  /**
   * Calculate confidence level in sentiment analysis
   */
  calculateConfidence(sentiments) {
    const values = Object.values(sentiments);
    const nonZeroValues = values.filter(v => v !== 0);
    
    if (nonZeroValues.length === 0) return 0;
    
    // Calculate how consistent the sentiment signals are
    const avg = nonZeroValues.reduce((a, b) => a + b, 0) / nonZeroValues.length;
    const variance = nonZeroValues.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / nonZeroValues.length;
    const consistency = Math.max(0, 1 - variance);
    
    // Higher confidence when more sources agree and are available
    const sourceAvailability = nonZeroValues.length / 4;
    const confidence = (consistency * 0.7 + sourceAvailability * 0.3) * 100;
    
    return Math.round(confidence);
  }

  /**
   * Get default sentiment when analysis fails
   */
  getDefaultSentiment(symbol) {
    return {
      symbol,
      overallScore: 0,
      sentiment: 'neutral',
      impactScore: 25,
      confidence: 0,
      breakdown: {
        social: 0,
        news: 0,
        technical: 0,
        volume: 0
      },
      timestamp: new Date().toISOString(),
      sources: {
        socialMedia: false,
        news: false,
        technical: false,
        volume: false
      }
    };
  }

  /**
   * Get sentiment for multiple cryptocurrencies
   */
  async getBatchSentiment(symbols, marketDataMap = {}) {
    const sentimentPromises = symbols.map(symbol => 
      this.getCryptoSentiment(symbol, marketDataMap[symbol])
    );
    
    const results = await Promise.allSettled(sentimentPromises);
    
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return this.getDefaultSentiment(symbols[index]);
      }
    });
  }

  /**
   * Clear sentiment cache
   */
  clearCache() {
    this.sentimentCache.clear();
  }
}

module.exports = new SentimentService();