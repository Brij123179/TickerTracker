// Currency conversion service
// Note: In production, you would fetch real-time exchange rates from an API
// For now, using a fixed conversion rate

const USD_TO_INR_RATE = 83.25; // Approximate rate as of 2024

/**
 * Convert USD to INR
 * @param {number} usdAmount - Amount in USD
 * @returns {number} Amount in INR
 */
const convertUsdToInr = (usdAmount) => {
  if (typeof usdAmount !== 'number' || isNaN(usdAmount)) {
    return 0;
  }
  return Math.round(usdAmount * USD_TO_INR_RATE * 100) / 100; // Round to 2 decimal places
};

/**
 * Format price in INR with ₹ symbol
 * @param {number} inrAmount - Amount in INR
 * @returns {string} Formatted price string
 */
const formatINR = (inrAmount) => {
  if (typeof inrAmount !== 'number' || isNaN(inrAmount)) {
    return '₹0.00';
  }
  return `₹${inrAmount.toLocaleString('en-IN', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
};

/**
 * Convert market cap from USD to INR (in crores for better readability)
 * @param {number} usdMarketCap - Market cap in USD
 * @returns {number} Market cap in INR crores
 */
const convertMarketCapToINRCrores = (usdMarketCap) => {
  if (typeof usdMarketCap !== 'number' || isNaN(usdMarketCap)) {
    return 0;
  }
  const inrMarketCap = usdMarketCap * USD_TO_INR_RATE;
  return Math.round(inrMarketCap / 10000000 * 100) / 100; // Convert to crores and round
};

/**
 * Get current USD to INR exchange rate
 * @returns {number} Current exchange rate
 */
const getExchangeRate = () => {
  return USD_TO_INR_RATE;
};

module.exports = {
  convertUsdToInr,
  formatINR,
  convertMarketCapToINRCrores,
  getExchangeRate,
  USD_TO_INR_RATE
};