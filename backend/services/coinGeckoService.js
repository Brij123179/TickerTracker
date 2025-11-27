const axios = require('axios');
// Removed INR conversion imports - displaying in USD now
// const { convertUsdToInr, convertMarketCapToINRCrores } = require('./currencyService');

const BASE_URL = "https://api.coingecko.com/api/v3";

// Hardcoded map for simplicity. A real app would fetch the /coins/list endpoint.
const SYMBOL_TO_ID_MAP = {
  BTC: "bitcoin",
  ETH: "ethereum",
  BNB: "binancecoin",
  SOL: "solana",
  XRP: "ripple",
  DOGE: "dogecoin",
  ADA: "cardano",
  SHIB: "shiba-inu",
};

const getCryptoData = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/coins/markets`, {
      params: {
        vs_currency: "usd",
        order: "market_cap_desc",
        per_page: 50,
        page: 1,
        sparkline: false,
        price_change_percentage: "24h",
      },
    });

    return response.data.map((coin) => ({
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      exchange: "Crypto",
      price: coin.current_price, // Display in USD
      change: coin.price_change_24h, // Display in USD
      changePercent: coin.price_change_percentage_24h,
      volume: coin.total_volume, // Display in USD
      marketCap: coin.market_cap / 1000000, // Market cap in millions
      pe: 0,
      previousClose: coin.current_price - coin.price_change_24h, // Display in USD
      dividendYield: 0,
      sentiment: "neutral",
      impactScore: Math.floor(Math.random() * 100),
      news: [],
      historicalData: [],
      currency: 'USD', // Changed from INR to USD
    }));
  } catch (error) {
    console.error("Error fetching crypto data:", error.message);
    return [];
  }
};

const getCryptoDetails = async (symbol) => {
  const id = SYMBOL_TO_ID_MAP[symbol.toUpperCase()];
  if (!id) return null;

  try {
    const detailPromise = axios.get(`${BASE_URL}/coins/${id}`);
    const chartPromise = axios.get(`${BASE_URL}/coins/${id}/market_chart`, {
      params: { vs_currency: "usd", days: "90" },
    });

    const [detailRes, chartRes] = await Promise.all([
      detailPromise,
      chartPromise,
    ]);
    const detail = detailRes.data;
    const marketData = detail.market_data;

    const historicalData = chartRes.data.prices.map(([timestamp, price]) => ({
      date: new Date(timestamp),
      close: price, // Display in USD
    }));

    return {
      symbol: detail.symbol.toUpperCase(),
      name: detail.name,
      exchange: "Crypto",
      price: marketData.current_price.usd, // Display in USD
      change: marketData.price_change_24h_in_currency.usd, // Display in USD
      changePercent: marketData.price_change_percentage_24h,
      volume: marketData.total_volume.usd, // Display in USD
      marketCap: marketData.market_cap.usd / 1000000, // Market cap in millions
      pe: 0,
      previousClose: marketData.current_price.usd - marketData.price_change_24h_in_currency.usd, // Display in USD
      dividendYield: 0,
      sentiment: "neutral",
      impactScore: Math.floor(Math.random() * 100),
      historicalData,
      news: [], // CoinGecko doesn't provide news in this endpoint
      currency: 'USD', // Changed from INR to USD
    };
  } catch (error) {
    console.error(
      `Error fetching crypto details for ${symbol}:`,
      error.message,
    );
    return null;
  }
};

module.exports = { getCryptoData, getCryptoDetails };
