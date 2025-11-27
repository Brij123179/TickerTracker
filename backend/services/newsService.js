const axios = require('axios');

// Cache for news data
const cache = {
  cryptoNews: { data: null, timestamp: null },
  generalNews: { data: null, timestamp: null },
  ttl: 15 * 60 * 1000 // 15 minutes cache
};

/**
 * Check if cached data is still valid
 */
const isCacheValid = (cacheKey) => {
  const cacheData = cache[cacheKey];
  return cacheData.data && cacheData.timestamp && 
         (Date.now() - cacheData.timestamp < cache.ttl);
};

/**
 * Fetch crypto news from Sandmark (https://www.sandmark.com)
 * Note: Since this is a real website, we'll create a mock implementation
 * In production, you'd need to check their robots.txt and terms of service
 */
const getCryptoNews = async () => {
  if (isCacheValid('cryptoNews')) {
    console.log('📰 Returning cached crypto news');
    return cache.cryptoNews.data;
  }

  try {
    console.log('🌐 Fetching crypto news from Sandmark...');
    
    // For demo purposes, we'll return mock crypto news
    // In production, you'd implement proper web scraping or use their API
    const mockCryptoNews = [
      {
        id: 'crypto_1',
        title: 'Bitcoin Reaches New All-Time High Amid Institutional Adoption',
        summary: 'Bitcoin surged to unprecedented levels as major institutions continue to embrace cryptocurrency investments, signaling mainstream acceptance.',
        source: 'Sandmark Crypto',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        sentiment: 'positive',
        ticker: 'BTC',
        url: 'https://www.sandmark.com/crypto-news/bitcoin-ath',
        image: 'https://via.placeholder.com/300x200?text=Bitcoin+News'
      },
      {
        id: 'crypto_2',
        title: 'Ethereum 2.0 Upgrade Shows Promising Results',
        summary: 'The latest Ethereum network upgrade demonstrates improved scalability and reduced gas fees, boosting investor confidence.',
        source: 'Sandmark Crypto',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        sentiment: 'positive',
        ticker: 'ETH',
        url: 'https://www.sandmark.com/crypto-news/ethereum-upgrade',
        image: 'https://via.placeholder.com/300x200?text=Ethereum+News'
      },
      {
        id: 'crypto_3',
        title: 'Regulatory Clarity Brings Stability to Crypto Markets',
        summary: 'New regulatory guidelines provide much-needed clarity for cryptocurrency trading and institutional investments.',
        source: 'Sandmark Crypto',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        sentiment: 'positive',
        ticker: 'BTC,ETH',
        url: 'https://www.sandmark.com/crypto-news/regulatory-clarity',
        image: 'https://via.placeholder.com/300x200?text=Crypto+Regulation'
      },
      {
        id: 'crypto_4',
        title: 'DeFi Protocols See Record TVL Growth',
        summary: 'Decentralized Finance protocols continue to attract billions in total value locked, indicating strong ecosystem growth.',
        source: 'Sandmark Crypto',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
        sentiment: 'positive',
        ticker: 'ETH,BNB',
        url: 'https://www.sandmark.com/crypto-news/defi-growth',
        image: 'https://via.placeholder.com/300x200?text=DeFi+News'
      },
      {
        id: 'crypto_5',
        title: 'NFT Market Shows Signs of Recovery',
        summary: 'Non-fungible token markets are experiencing renewed interest with innovative utility-focused projects gaining traction.',
        source: 'Sandmark Crypto',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        sentiment: 'neutral',
        ticker: 'ETH',
        url: 'https://www.sandmark.com/crypto-news/nft-recovery',
        image: 'https://via.placeholder.com/300x200?text=NFT+Market'
      }
    ];

    cache.cryptoNews = { data: mockCryptoNews, timestamp: Date.now() };
    console.log(`✅ Successfully fetched ${mockCryptoNews.length} crypto news articles`);
    return mockCryptoNews;

  } catch (error) {
    console.error('❌ Error fetching crypto news:', error.message);
    return [];
  }
};

/**
 * Fetch general financial news from MoneyControl
 * Note: Mock implementation for demo purposes
 */
const getGeneralNews = async () => {
  if (isCacheValid('generalNews')) {
    console.log('📰 Returning cached general news');
    return cache.generalNews.data;
  }

  try {
    console.log('🌐 Fetching general news from MoneyControl...');
    
    // Mock general financial news
    const mockGeneralNews = [
      {
        id: 'general_1',
        title: 'Indian Stock Markets Hit Record Highs on Strong Economic Data',
        summary: 'Sensex and Nifty reach new peaks as GDP growth figures exceed expectations, boosting investor sentiment across sectors.',
        source: 'MoneyControl',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        sentiment: 'positive',
        ticker: 'RELIANCE,TCS,INFY',
        url: 'https://www.moneycontrol.com/news/business/markets/sensex-nifty-record-high',
        image: 'https://via.placeholder.com/300x200?text=Indian+Markets'
      },
      {
        id: 'general_2',
        title: 'RBI Maintains Repo Rate, Focuses on Inflation Control',
        summary: 'Reserve Bank of India keeps key policy rates unchanged while emphasizing continued vigilance on inflation trends.',
        source: 'MoneyControl',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        sentiment: 'neutral',
        ticker: 'HDFCBANK,ICICIBANK',
        url: 'https://www.moneycontrol.com/news/business/economy/rbi-repo-rate-decision',
        image: 'https://via.placeholder.com/300x200?text=RBI+Policy'
      },
      {
        id: 'general_3',
        title: 'Tech Stocks Rally on Strong Q3 Earnings',
        summary: 'Information Technology sector leads gains as major companies report robust quarterly results and positive guidance.',
        source: 'MoneyControl',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        sentiment: 'positive',
        ticker: 'TCS,INFY,WIPRO',
        url: 'https://www.moneycontrol.com/news/business/earnings/tech-stocks-q3-earnings',
        image: 'https://via.placeholder.com/300x200?text=Tech+Earnings'
      },
      {
        id: 'general_4',
        title: 'Foreign Investment Flows Boost Market Sentiment',
        summary: 'Increased FII inflows signal growing confidence in Indian markets amid global economic uncertainties.',
        source: 'MoneyControl',
        timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000), // 7 hours ago
        sentiment: 'positive',
        ticker: 'NIFTY',
        url: 'https://www.moneycontrol.com/news/business/markets/foreign-investment-flows',
        image: 'https://via.placeholder.com/300x200?text=FII+Investment'
      },
      {
        id: 'general_5',
        title: 'Banking Sector Shows Resilience in Credit Growth',
        summary: 'Major banks report healthy credit growth and improved asset quality, indicating sector strength.',
        source: 'MoneyControl',
        timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000), // 10 hours ago
        sentiment: 'positive',
        ticker: 'HDFCBANK,ICICIBANK,KOTAKBANK',
        url: 'https://www.moneycontrol.com/news/business/banking/banking-credit-growth',
        image: 'https://via.placeholder.com/300x200?text=Banking+Sector'
      }
    ];

    cache.generalNews = { data: mockGeneralNews, timestamp: Date.now() };
    console.log(`✅ Successfully fetched ${mockGeneralNews.length} general news articles`);
    return mockGeneralNews;

  } catch (error) {
    console.error('❌ Error fetching general news:', error.message);
    return [];
  }
};

/**
 * Get combined news feed based on market type
 */
const getMarketNews = async (market = 'US') => {
  try {
    if (market.toLowerCase() === 'crypto') {
      return await getCryptoNews();
    } else if (market.toLowerCase() === 'indian') {
      return await getGeneralNews();
    } else {
      // For US market, combine both sources or use a different source
      const [cryptoNews, generalNews] = await Promise.all([
        getCryptoNews(),
        getGeneralNews()
      ]);
      return [...cryptoNews.slice(0, 3), ...generalNews.slice(0, 3)];
    }
  } catch (error) {
    console.error('❌ Error fetching market news:', error.message);
    return [];
  }
};

/**
 * Get news for a specific ticker/symbol
 */
const getTickerNews = async (symbol) => {
  try {
    const allNews = await Promise.all([
      getCryptoNews(),
      getGeneralNews()
    ]);
    
    const combinedNews = [...allNews[0], ...allNews[1]];
    
    // Filter news that mentions the specific ticker
    const tickerNews = combinedNews.filter(news => 
      news.ticker.toUpperCase().includes(symbol.toUpperCase()) ||
      news.title.toUpperCase().includes(symbol.toUpperCase()) ||
      news.summary.toUpperCase().includes(symbol.toUpperCase())
    );

    return tickerNews.slice(0, 5); // Return top 5 relevant news items
  } catch (error) {
    console.error(`❌ Error fetching news for ${symbol}:`, error.message);
    return [];
  }
};

/**
 * Clear news cache (useful for testing)
 */
const clearCache = () => {
  cache.cryptoNews = { data: null, timestamp: null };
  cache.generalNews = { data: null, timestamp: null };
  console.log('🗑️ News cache cleared');
};

module.exports = {
  getCryptoNews,
  getGeneralNews,
  getMarketNews,
  getTickerNews,
  clearCache
};