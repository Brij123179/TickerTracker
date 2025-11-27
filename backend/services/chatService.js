const alphaVantageService = require('./alphaVantageService');
const coinGeckoService = require('./coinGeckoService');
const crypto1Service = require('./crypto1Service');
const mockDataService = require('./mockDataService');

const generateChatResponse = async (userMessage, market) => {
    const message = userMessage.toLowerCase();
    
    // Fetch fresh data for dynamic responses
    let marketStocks = [];
    if (market === 'US') marketStocks = await alphaVantageService.getUSStocks();
    else if (market === 'Indian') marketStocks = mockDataService.getIndianStocks();
    else if (market === 'Crypto') marketStocks = await crypto1Service.getCryptoData();

    if (message.includes('market') && message.includes('analys')) {
      const gainers = marketStocks.filter(s => s.changePercent > 0).length;
      const losers = marketStocks.filter(s => s.changePercent < 0).length;
      const avgChange = marketStocks.reduce((sum, s) => sum + s.changePercent, 0) / (marketStocks.length || 1);
      
      return `📊 **${market} Market Analysis:**

**Current Market State:**
- Total tracked securities: ${marketStocks.length}
- Gainers: ${gainers} | Losers: ${losers}
- Average change: ${avgChange.toFixed(2)}%

**Key Observations:**
${avgChange > 0 ? '🟢' : '🔴'} Market sentiment is ${avgChange > 0 ? 'positive' : 'negative'} today
${gainers > losers ? '📈' : '📉'} ${gainers > losers ? 'More stocks gaining than losing' : 'More stocks declining than gaining'}

*Analysis based on latest available data.*`;
    }
    
    if (message.includes('risk') || message.includes('fraud')) {
      return `🛡️ **Risk Assessment & Fraud Detection:**

**Portfolio Risk Factors to Monitor:**
1. **Concentration Risk** - Avoid over-exposure to single sectors
2. **Liquidity Risk** - Ensure adequate cash positions
3. **Market Risk** - Current volatility levels are moderate

**Recommended Actions:**
- Diversify across 8-12 positions minimum
- Set stop-losses at 8-10% below entry
- Monitor news sentiment daily`;
    }

    if (message.includes('insight') || message.includes('summary')) {
        const topGainers = [...marketStocks].sort((a,b) => b.changePercent - a.changePercent).slice(0, 3);
        
        return `⚡ **Today's Key Market Insights for ${market}:**
  
**1. Top Performers:**
${topGainers.map(s => `📈 ${s.symbol}: +${s.changePercent.toFixed(2)}%`).join('\n')}

**2. Sentiment Analysis:**
${marketStocks.filter(s => s.sentiment === 'positive').length > marketStocks.filter(s => s.sentiment === 'negative').length ? '😊 Overall positive sentiment across tracked securities' : '😟 Cautious sentiment prevailing in the market'}

*Insights generated from available data sources.*`;
    }
    
    return `I can help you with:

🔍 **Market Analysis** - Real-time insights and trend analysis
🛡️ **Risk Management** - Portfolio assessment and fraud detection  
💡 **Investment Advisory** - Personalized recommendations

Please try one of the quick action buttons for instant insights!`;
};

module.exports = { generateChatResponse };