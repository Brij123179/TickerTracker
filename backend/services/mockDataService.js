// Base prices for realistic updates
const INDIAN_STOCKS_BASE = [
    { symbol: 'RELIANCE', name: 'Reliance Industries', basePrice: 2850.50, marketCap: 1930000, pe: 28.5, dividendYield: 0.35, baseVolume: 6.5 * 1e6 },
    { symbol: 'TCS', name: 'Tata Consultancy', basePrice: 3800.75, marketCap: 1380000, pe: 30.1, dividendYield: 1.25, baseVolume: 2.1 * 1e6 },
    { symbol: 'HDFCBANK', name: 'HDFC Bank', basePrice: 1520.00, marketCap: 1150000, pe: 19.2, dividendYield: 1.05, baseVolume: 15 * 1e6 },
    { symbol: 'INFY', name: 'Infosys', basePrice: 1550.20, marketCap: 650000, pe: 25.8, dividendYield: 2.10, baseVolume: 7.2 * 1e6 },
    { symbol: 'ICICIBANK', name: 'ICICI Bank', basePrice: 1100.40, marketCap: 770000, pe: 18.5, dividendYield: 0.50, baseVolume: 18 * 1e6 },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel', basePrice: 1285.60, marketCap: 750000, pe: 42.3, dividendYield: 0.45, baseVolume: 9.3 * 1e6 },
    { symbol: 'SBIN', name: 'State Bank of India', basePrice: 785.30, marketCap: 700000, pe: 12.8, dividendYield: 1.80, baseVolume: 25 * 1e6 },
    { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', basePrice: 2380.90, marketCap: 560000, pe: 58.2, dividendYield: 1.45, baseVolume: 1.8 * 1e6 },
    { symbol: 'ITC', name: 'ITC Limited', basePrice: 445.70, marketCap: 555000, pe: 27.5, dividendYield: 3.60, baseVolume: 12.5 * 1e6 },
    { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', basePrice: 1755.80, marketCap: 350000, pe: 16.4, dividendYield: 0.60, baseVolume: 4.2 * 1e6 },
    { symbol: 'LT', name: 'Larsen & Toubro', basePrice: 3520.40, marketCap: 490000, pe: 31.2, dividendYield: 0.75, baseVolume: 2.9 * 1e6 },
    { symbol: 'AXISBANK', name: 'Axis Bank', basePrice: 1142.50, marketCap: 352000, pe: 13.7, dividendYield: 0.35, baseVolume: 11.2 * 1e6 },
    { symbol: 'ASIANPAINT', name: 'Asian Paints', basePrice: 2825.30, marketCap: 271000, pe: 52.8, dividendYield: 1.15, baseVolume: 1.5 * 1e6 },
    { symbol: 'MARUTI', name: 'Maruti Suzuki', basePrice: 12450.60, marketCap: 376000, pe: 28.9, dividendYield: 0.85, baseVolume: 0.8 * 1e6 },
    { symbol: 'WIPRO', name: 'Wipro Limited', basePrice: 565.80, marketCap: 310000, pe: 24.6, dividendYield: 1.90, baseVolume: 8.7 * 1e6 },
];

const US_STOCKS_BASE = [
    { symbol: 'AAPL', name: 'Apple Inc.', basePrice: 189.50, marketCap: 2950000, pe: 31.2, dividendYield: 0.52, baseVolume: 52.3 * 1e6 },
    { symbol: 'MSFT', name: 'Microsoft Corporation', basePrice: 378.25, marketCap: 2810000, pe: 35.8, dividendYield: 0.78, baseVolume: 28.7 * 1e6 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', basePrice: 142.80, marketCap: 1780000, pe: 26.4, dividendYield: 0.00, baseVolume: 21.5 * 1e6 },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', basePrice: 178.35, marketCap: 1850000, pe: 72.3, dividendYield: 0.00, baseVolume: 45.2 * 1e6 },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', basePrice: 495.20, marketCap: 1220000, pe: 68.5, dividendYield: 0.03, baseVolume: 38.9 * 1e6 },
    { symbol: 'TSLA', name: 'Tesla Inc.', basePrice: 242.80, marketCap: 770000, pe: 78.2, dividendYield: 0.00, baseVolume: 125.4 * 1e6 },
    { symbol: 'META', name: 'Meta Platforms Inc.', basePrice: 485.60, marketCap: 1230000, pe: 29.7, dividendYield: 0.00, baseVolume: 18.3 * 1e6 },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.', basePrice: 185.40, marketCap: 535000, pe: 11.2, dividendYield: 2.35, baseVolume: 12.8 * 1e6 },
    { symbol: 'V', name: 'Visa Inc.', basePrice: 268.90, marketCap: 550000, pe: 32.8, dividendYield: 0.72, baseVolume: 7.5 * 1e6 },
    { symbol: 'WMT', name: 'Walmart Inc.', basePrice: 168.75, marketCap: 445000, pe: 28.5, dividendYield: 1.42, baseVolume: 8.2 * 1e6 },
    { symbol: 'PG', name: 'Procter & Gamble', basePrice: 158.30, marketCap: 378000, pe: 25.6, dividendYield: 2.48, baseVolume: 6.4 * 1e6 },
    { symbol: 'JNJ', name: 'Johnson & Johnson', basePrice: 162.45, marketCap: 395000, pe: 22.4, dividendYield: 2.95, baseVolume: 9.1 * 1e6 },
    { symbol: 'BAC', name: 'Bank of America', basePrice: 35.80, marketCap: 285000, pe: 10.8, dividendYield: 2.68, baseVolume: 42.3 * 1e6 },
    { symbol: 'XOM', name: 'Exxon Mobil', basePrice: 108.65, marketCap: 445000, pe: 10.2, dividendYield: 3.25, baseVolume: 18.7 * 1e6 },
    { symbol: 'DIS', name: 'Walt Disney Co.', basePrice: 92.40, baseVolume: 168000, pe: 45.3, dividendYield: 0.00, marketCap: 15.6 * 1e6 },
];

// Generate live price updates with realistic variations
const generateLivePrice = (baseStock) => {
    // Random price change between -2% to +2%
    const changePercent = (Math.random() - 0.5) * 4;
    const change = (baseStock.basePrice * changePercent) / 100;
    const price = baseStock.basePrice + change;
    const previousClose = baseStock.basePrice;
    
    // Volume variation (±30%)
    const volumeVariation = 0.7 + Math.random() * 0.6;
    const volume = Math.floor(baseStock.baseVolume * volumeVariation);
    
    return {
        symbol: baseStock.symbol,
        name: baseStock.name,
        price: parseFloat(price.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2)),
        volume: volume,
        marketCap: baseStock.marketCap,
        pe: baseStock.pe,
        dividendYield: baseStock.dividendYield,
        previousClose: previousClose
    };
};

const generateMockNews = (stock, source = 'Financial Times') => [{
    id: `news_${stock.symbol}_1`, 
    title: `${stock.name} ${stock.change > 0 ? 'gains on strong volume' : 'sees profit booking'}`,
    summary: `Shares of ${stock.name} reacted to the latest market trends today.`, 
    source: source,
    timestamp: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24),
    sentiment: stock.changePercent > 0.5 ? 'positive' : 'negative', 
    ticker: stock.symbol
}];

const generateMockHistory = (price) => {
    return Array.from({ length: 90 }, (_, i) => ({
        date: new Date(Date.now() - (90 - i) * 24 * 60 * 60 * 1000),
        close: price * (1 + (Math.random() - 0.5) * 0.2)
    }));
};

const getIndianStocks = () => INDIAN_STOCKS_BASE.map(baseStock => {
    const stock = generateLivePrice(baseStock);
    return {
        ...stock, 
        exchange: 'NSE',
        sentiment: stock.changePercent > 0.5 ? 'positive' : stock.changePercent < -0.5 ? 'negative' : 'neutral',
        impactScore: Math.floor(Math.random() * 100),
        news: [],
        historicalData: [],
        currency: 'INR'
    };
});

const getUSStocks = () => US_STOCKS_BASE.map(baseStock => {
    const stock = generateLivePrice(baseStock);
    return {
        ...stock, 
        exchange: 'NASDAQ',
        sentiment: stock.changePercent > 0.5 ? 'positive' : stock.changePercent < -0.5 ? 'negative' : 'neutral',
        impactScore: Math.floor(Math.random() * 100),
        news: [],
        historicalData: [],
        currency: 'USD'
    };
});

const getTickerDetails = (symbol) => {
    const baseStock = INDIAN_STOCKS_BASE.find(s => s.symbol === symbol) || US_STOCKS_BASE.find(s => s.symbol === symbol);
    if (!baseStock) return null;
    
    const stock = generateLivePrice(baseStock);
    const isIndian = INDIAN_STOCKS_BASE.find(s => s.symbol === symbol);
    const exchange = isIndian ? 'NSE' : 'NASDAQ';
    const currency = isIndian ? 'INR' : 'USD';
    const source = isIndian ? 'Economic Times' : 'Bloomberg';
    
    return {
        ...stock, 
        exchange,
        sentiment: stock.changePercent > 0.5 ? 'positive' : stock.changePercent < -0.5 ? 'negative' : 'neutral',
        impactScore: Math.floor(Math.random() * 100),
        news: generateMockNews(stock, source),
        historicalData: generateMockHistory(stock.price),
        currency
    };
};

module.exports = { getIndianStocks, getUSStocks, getTickerDetails };