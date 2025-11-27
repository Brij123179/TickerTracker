const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

// Import services
const alphaVantage = require("../services/alphaVantageService");
const coinGecko = require("../services/coinGeckoService");
const crypto1 = require("../services/crypto1Service");
const apiService = require("../services/apiService");
const mockData = require("../services/mockDataService");
const userService = require("../services/userService");
const newsService = require("../services/newsService");
const sentimentService = require("../services/sentimentService");
const { generateChatResponse } = require("../services/chatService");

// DB Paths for file-based storage
const ALERTS_DB_PATH = path.join(__dirname, "../data/alerts.json");
const WATCHLIST_DB_PATH = path.join(__dirname, "../data/watchlist.json");
const USERS_DB_PATH = path.join(__dirname, "../data/users.json");

// Helper functions for reading/writing JSON files
const readFile = (filePath) => {
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath));
};
const writeFile = (filePath, data) =>
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

// --- Main Data Endpoints ---

router.get("/stocks/:market", async (req, res) => {
  const { market } = req.params;
  try {
    let stocks = [];

    if (market.toLowerCase() === "us") {
      console.log('📊 Fetching US market data from all sources...');
      
      // Try Flask API first
      try {
        const apiStocks = await apiService.getUSStocksFromAPI();
        if (apiStocks && apiStocks.length > 0) {
          stocks = apiStocks;
          console.log(`✅ Loaded ${stocks.length} US stocks from Flask API`);
        } else {
          throw new Error('Flask API returned no data');
        }
      } catch (apiError) {
        console.log('⚠️ Flask API unavailable, trying Alpha Vantage...');
        
        // Try Alpha Vantage as fallback
        try {
          stocks = await alphaVantage.getUSStocks();
          console.log(`✅ Loaded ${stocks.length} US stocks from Alpha Vantage`);
        } catch (avError) {
          console.warn('⚠️ Alpha Vantage also unavailable, using mock US data');
          stocks = mockData.getUSStocks();
          console.log(`✅ Loaded ${stocks.length} US stocks from mock data`);
        }
      }
    } else if (market.toLowerCase() === "indian") {
      console.log('📊 Fetching Indian market data from all sources...');
      
      // Try Flask API first
      try {
        const apiStocks = await apiService.getIndianStocks();
        if (apiStocks && apiStocks.length > 0) {
          stocks = apiStocks;
          console.log(`✅ Loaded ${stocks.length} Indian stocks from Flask API`);
        } else {
          throw new Error('Flask API returned no data');
        }
      } catch (error) {
        console.log('⚠️ Flask API unavailable, using mock Indian data');
        stocks = mockData.getIndianStocks();
        console.log(`✅ Loaded ${stocks.length} Indian stocks from mock data`);
      }
    } else if (market.toLowerCase() === "crypto") {
      console.log('📊 Fetching crypto data from all sources...');
      stocks = await crypto1.getCryptoData();
      console.log(`✅ Loaded ${stocks.length} cryptocurrencies`);
    } else {
      return res
        .status(400)
        .json({ message: "Invalid market. Use US, Indian, or Crypto" });
    }

    res.json(stocks);
  } catch (error) {
    console.error(`Error fetching ${market} stocks:`, error.message);
    res.status(500).json({ message: "Failed to fetch market data" });
  }
});
router.post("/chat", async (req, res) => {
  const { message, market = "US" } = req.body;

  if (!message || typeof message !== "string") {
    return res
      .status(400)
      .json({ message: "Message is required and must be a string" });
  }

  try {
    const response = await generateChatResponse(message, market);
    res.json({ response });
  } catch (error) {
    console.error("Error generating chat response:", error.message);
    res.status(500).json({ message: "Failed to generate chat response" });
  }
});

// GET Ticker Detail
router.get("/ticker/:symbol", async (req, res) => {
  const { symbol } = req.params;
  try {
    // Attempt to fetch from each service until a result is found
    let details =
      (await alphaVantage.getTickerDetails(symbol)) ||
      (await crypto1.getCryptoDetails(symbol)) ||
      (await coinGecko.getCryptoDetails(symbol)) ||
      mockData.getTickerDetails(symbol);

    if (details) {
      // Enhance with news data
      try {
        const tickerNews = await newsService.getTickerNews(symbol);
        details.news = tickerNews;
      } catch (newsError) {
        console.error(`Error fetching news for ${symbol}:`, newsError.message);
        details.news = details.news || [];
      }
      
      res.json(details);
    } else {
      res.status(404).json({ message: "Ticker not found" });
    }
  } catch (error) {
    console.error(`Error fetching details for ${symbol}:`, error.message);
    res.status(500).json({ message: "Failed to fetch ticker details" });
  }
});

// --- Sentiment Analysis Endpoints ---

// Get sentiment analysis for a specific crypto symbol
router.get("/sentiment/:symbol", async (req, res) => {
  const { symbol } = req.params;
  try {
    // Get market data for the symbol first
    const cryptoData = await crypto1.getCryptoData();
    const marketData = cryptoData.find(coin => coin.symbol.toUpperCase() === symbol.toUpperCase());
    
    if (!marketData) {
      return res.status(404).json({ message: `Cryptocurrency ${symbol} not found` });
    }

    const sentimentData = await sentimentService.getCryptoSentiment(symbol, {
      changePercent: marketData.changePercent,
      volume: marketData.volume,
      marketCap: marketData.marketCap * 1000000, // Convert back to full value
      price: marketData.price
    });

    res.json(sentimentData);
  } catch (error) {
    console.error(`Error fetching sentiment for ${symbol}:`, error.message);
    res.status(500).json({ message: "Failed to fetch sentiment analysis" });
  }
});

// Get batch sentiment analysis for multiple symbols
router.post("/sentiment/batch", async (req, res) => {
  const { symbols } = req.body;
  
  if (!symbols || !Array.isArray(symbols)) {
    return res.status(400).json({ message: "Symbols array is required" });
  }

  try {
    // Get market data for all symbols
    const cryptoData = await crypto1.getCryptoData();
    const marketDataMap = {};
    
    symbols.forEach(symbol => {
      const marketData = cryptoData.find(coin => coin.symbol.toUpperCase() === symbol.toUpperCase());
      if (marketData) {
        marketDataMap[symbol] = {
          changePercent: marketData.changePercent,
          volume: marketData.volume,
          marketCap: marketData.marketCap * 1000000,
          price: marketData.price
        };
      }
    });

    const sentimentResults = await sentimentService.getBatchSentiment(symbols, marketDataMap);
    res.json(sentimentResults);
  } catch (error) {
    console.error("Error fetching batch sentiment analysis:", error.message);
    res.status(500).json({ message: "Failed to fetch sentiment analysis" });
  }
});

// Get overall market sentiment
router.get("/sentiment/market/crypto", async (req, res) => {
  try {
    const cryptoData = await crypto1.getCryptoData();
    const topCryptos = cryptoData.slice(0, 20); // Analyze top 20 cryptos
    
    const symbols = topCryptos.map(coin => coin.symbol);
    const marketDataMap = {};
    
    topCryptos.forEach(coin => {
      marketDataMap[coin.symbol] = {
        changePercent: coin.changePercent,
        volume: coin.volume,
        marketCap: coin.marketCap * 1000000,
        price: coin.price
      };
    });

    const sentimentResults = await sentimentService.getBatchSentiment(symbols, marketDataMap);
    
    // Calculate overall market sentiment
    const avgSentiment = sentimentResults.reduce((sum, result) => sum + result.overallScore, 0) / sentimentResults.length;
    const avgImpact = sentimentResults.reduce((sum, result) => sum + result.impactScore, 0) / sentimentResults.length;
    const avgConfidence = sentimentResults.reduce((sum, result) => sum + result.confidence, 0) / sentimentResults.length;
    
    const marketSentiment = {
      overallScore: Math.round(avgSentiment * 100) / 100,
      sentiment: sentimentService.classifySentiment ? sentimentService.classifySentiment(avgSentiment) : 'neutral',
      averageImpact: Math.round(avgImpact),
      averageConfidence: Math.round(avgConfidence),
      cryptoCount: sentimentResults.length,
      breakdown: sentimentResults,
      timestamp: new Date().toISOString()
    };

    res.json(marketSentiment);
  } catch (error) {
    console.error("Error fetching market sentiment:", error.message);
    res.status(500).json({ message: "Failed to fetch market sentiment" });
  }
});

// --- News Endpoints ---

// Get news for a specific market
router.get("/news/:market", async (req, res) => {
  const { market } = req.params;
  try {
    const news = await newsService.getMarketNews(market);
    res.json(news);
  } catch (error) {
    console.error(`Error fetching news for ${market}:`, error.message);
    res.status(500).json({ message: "Failed to fetch news" });
  }
});

// Get all crypto news
router.get("/news/crypto/all", async (req, res) => {
  try {
    const cryptoNews = await newsService.getCryptoNews();
    res.json(cryptoNews);
  } catch (error) {
    console.error("Error fetching crypto news:", error.message);
    res.status(500).json({ message: "Failed to fetch crypto news" });
  }
});

// Get all general financial news
router.get("/news/general/all", async (req, res) => {
  try {
    const generalNews = await newsService.getGeneralNews();
    res.json(generalNews);
  } catch (error) {
    console.error("Error fetching general news:", error.message);
    res.status(500).json({ message: "Failed to fetch general news" });
  }
});

// Get news for a specific ticker
router.get("/news/ticker/:symbol", async (req, res) => {
  const { symbol } = req.params;
  try {
    const tickerNews = await newsService.getTickerNews(symbol);
    res.json(tickerNews);
  } catch (error) {
    console.error(`Error fetching news for ${symbol}:`, error.message);
    res.status(500).json({ message: "Failed to fetch ticker news" });
  }
});

// Get recent news from all sources (combined)
router.get("/news/recent/all", async (req, res) => {
  try {
    // Fetch news from all sources and combine them
    const [cryptoNews, generalNews] = await Promise.allSettled([
      newsService.getCryptoNews(),
      newsService.getGeneralNews()
    ]);

    let allNews = [];
    
    // Add crypto news
    if (cryptoNews.status === 'fulfilled') {
      allNews = allNews.concat(cryptoNews.value.map(news => ({
        ...news,
        category: 'crypto'
      })));
    }
    
    // Add general news  
    if (generalNews.status === 'fulfilled') {
      allNews = allNews.concat(generalNews.value.map(news => ({
        ...news,
        category: 'general'
      })));
    }

    // Sort by timestamp (most recent first) and limit to 20 items
    allNews.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const recentNews = allNews.slice(0, 20);

    res.json(recentNews);
  } catch (error) {
    console.error("Error fetching recent news:", error.message);
    res.status(500).json({ message: "Failed to fetch recent news" });
  }
});

// --- User Profile ---

router.get("/user/profile", (req, res) => {
  try {
    const profile = userService.getUserProfile();
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
});

// --- Watchlist CRUD ---

router.get("/watchlist", (req, res) => res.json(readFile(WATCHLIST_DB_PATH)));

router.post("/watchlist", (req, res) => {
  const { symbol } = req.body;
  if (!symbol) return res.status(400).json({ message: "Symbol is required" });

  const watchlist = readFile(WATCHLIST_DB_PATH);
  if (!watchlist.includes(symbol)) {
    watchlist.push(symbol);
    writeFile(WATCHLIST_DB_PATH, watchlist);
  }
  res.status(201).json(watchlist);
});

router.delete("/watchlist/:symbol", (req, res) => {
  const { symbol } = req.params;
  let watchlist = readFile(WATCHLIST_DB_PATH);
  const updatedWatchlist = watchlist.filter((s) => s !== symbol);

  writeFile(WATCHLIST_DB_PATH, updatedWatchlist);
  res.status(200).json(updatedWatchlist);
});

// --- Alerts CRUD ---
router.get("/alerts", (req, res) => {
  try {
    const alerts = readFile(ALERTS_DB_PATH);
    res.json(alerts);
  } catch (error) {
    console.error("Error reading alerts:", error.message);
    res.status(500).json({ message: "Failed to fetch alerts" });
  }
});

router.post("/alerts", (req, res) => {
  const { ticker, condition, targetPrice, sentimentTrigger, expiresAt } =
    req.body;

  if (!ticker || !condition) {
    return res
      .status(400)
      .json({ message: "Ticker and condition are required" });
  }

  try {
    const alerts = readFile(ALERTS_DB_PATH);
    const newAlert = {
      id: Date.now().toString(),
      ticker: ticker.toUpperCase(),
      condition,
      targetPrice: targetPrice ? parseFloat(targetPrice) : undefined,
      sentimentTrigger,
      isActive: true,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
    };

    alerts.push(newAlert);
    writeFile(ALERTS_DB_PATH, alerts);
    res.status(201).json(newAlert);
  } catch (error) {
    console.error("Error creating alert:", error.message);
    res.status(500).json({ message: "Failed to create alert" });
  }
});

router.delete("/alerts/:id", (req, res) => {
  const { id } = req.params;

  try {
    let alerts = readFile(ALERTS_DB_PATH);
    const alertIndex = alerts.findIndex((alert) => alert.id === id);

    if (alertIndex === -1) {
      return res.status(404).json({ message: "Alert not found" });
    }

    alerts = alerts.filter((alert) => alert.id !== id);
    writeFile(ALERTS_DB_PATH, alerts);
    res.status(200).json({ message: "Alert deleted successfully" });
  } catch (error) {
    console.error("Error deleting alert:", error.message);
    res.status(500).json({ message: "Failed to delete alert" });
  }
});

// --- User Profile Endpoints ---

// Get user profile
router.get("/user/profile", (req, res) => {
  try {
    const users = readFile(USERS_DB_PATH);
    const user = users.find(u => u.id === "user_1") || users[0];
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return profile in the expected format
    const profile = {
      name: user.name,
      email: user.email,
      memberSince: user.memberSince,
      membership: user.membership,
      subscription: user.subscription
    };

    res.json(profile);
  } catch (error) {
    console.error("Error fetching user profile:", error.message);
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
});

// Update user profile
router.put("/user/profile", (req, res) => {
  try {
    const { name, email, membership } = req.body;
    const users = readFile(USERS_DB_PATH);
    
    let user = users.find(u => u.id === "user_1");
    if (!user) {
      // Create new user if doesn't exist
      user = {
        id: "user_1",
        name: name || "Demo User",
        email: email || "demo@example.com",
        membership: membership || "Free Member",
        memberSince: new Date().toISOString().split('T')[0],
        subscription: {
          plan: "Free",
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        settings: {
          emailNotifications: true,
          pushNotifications: true,
          smsAlerts: false,
          portfolioVisibility: true,
          shareActivity: false,
          dataAnalytics: true
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      users.push(user);
    } else {
      // Update existing user
      if (name !== undefined) user.name = name;
      if (email !== undefined) user.email = email;
      if (membership !== undefined) user.membership = membership;
      user.updatedAt = new Date().toISOString();
    }

    writeFile(USERS_DB_PATH, users);
    
    // Return updated profile
    const profile = {
      name: user.name,
      email: user.email,
      memberSince: user.memberSince,
      membership: user.membership,
      subscription: user.subscription
    };

    res.json(profile);
  } catch (error) {
    console.error("Error updating user profile:", error.message);
    res.status(500).json({ message: "Failed to update user profile" });
  }
});

// Update user settings
router.put("/user/settings", (req, res) => {
  try {
    const settings = req.body;
    const users = readFile(USERS_DB_PATH);
    
    let user = users.find(u => u.id === "user_1");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update settings
    user.settings = { ...user.settings, ...settings };
    user.updatedAt = new Date().toISOString();

    writeFile(USERS_DB_PATH, users);
    res.json({ message: "Settings updated successfully", settings: user.settings });
  } catch (error) {
    console.error("Error updating user settings:", error.message);
    res.status(500).json({ message: "Failed to update user settings" });
  }
});

// Get user settings
router.get("/user/settings", (req, res) => {
  try {
    const users = readFile(USERS_DB_PATH);
    const user = users.find(u => u.id === "user_1") || users[0];
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.settings || {});
  } catch (error) {
    console.error("Error fetching user settings:", error.message);
    res.status(500).json({ message: "Failed to fetch user settings" });
  }
});

// Health check endpoints
router.get("/health", async (req, res) => {
  try {
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        crypto1: await crypto1.checkCrypto1Health(),
        alphaVantage: !!process.env.ALPHA_VANTAGE_API_KEY,
        coinGecko: true, // CoinGecko doesn't require auth
        mockData: true
      }
    };
    
    res.json(health);
  } catch (error) {
    console.error("Error checking health:", error.message);
    res.status(500).json({ message: "Health check failed" });
  }
});

// CRYPTO1 service specific health check
router.get("/health/crypto1", async (req, res) => {
  try {
    const isHealthy = await crypto1.checkCrypto1Health();
    res.json({
      service: "crypto1",
      status: isHealthy ? "healthy" : "unhealthy",
      endpoint: crypto1.CRYPTO1_BASE_URL,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error checking CRYPTO1 health:", error.message);
    res.status(500).json({ message: "CRYPTO1 health check failed" });
  }
});

module.exports = router;
