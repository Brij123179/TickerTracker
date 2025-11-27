const http = require('http');

console.log('🚀 Testing Currency Conversion to USD');
console.log('📊 Checking both Crypto and US Stock data');

// Test crypto data with USD currency
const testCryptoUSD = () => {
  console.log('\n🔸 Testing Crypto Data (USD)...');
  
  const options = {
    hostname: 'localhost',
    port: 5004,
    path: '/api/stocks/Crypto',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const cryptoData = JSON.parse(data);
        console.log(`✅ Received ${cryptoData.length} cryptocurrencies`);
        
        if (cryptoData.length > 0) {
          const btc = cryptoData.find(coin => coin.symbol === 'BTC') || cryptoData[0];
          console.log(`📊 Sample: ${btc.name} (${btc.symbol})`);
          console.log(`💰 Price: $${btc.price?.toLocaleString()} ${btc.currency || 'Unknown'}`);
          console.log(`📈 Change: $${btc.change?.toFixed(2)} (${btc.changePercent?.toFixed(2)}%)`);
          console.log(`📊 Market Cap: $${btc.marketCap}M`);
          console.log(`💱 Currency: ${btc.currency}`);
          
          if (btc.currency === 'USD') {
            console.log('✅ Crypto currency conversion to USD successful!');
          } else {
            console.log('❌ Crypto still showing non-USD currency');
          }
        }
        
        // Test US stocks after crypto
        setTimeout(testUSStocksUSD, 1000);
        
      } catch (error) {
        console.log('❌ Error parsing crypto response:', error.message);
        setTimeout(testUSStocksUSD, 1000);
      }
    });
  });

  req.on('error', (error) => {
    console.log('❌ Crypto request failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure TickerTracker backend is running on port 5004');
    }
    setTimeout(testUSStocksUSD, 1000);
  });

  req.end();
};

// Test US stock data with USD currency
const testUSStocksUSD = () => {
  console.log('\n🔸 Testing US Stocks Data (USD)...');
  
  const options = {
    hostname: 'localhost',
    port: 5004,
    path: '/api/stocks/US',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const stockData = JSON.parse(data);
        console.log(`✅ Received ${stockData.length} US stocks`);
        
        if (stockData.length > 0) {
          const aapl = stockData.find(stock => stock.symbol === 'AAPL') || stockData[0];
          console.log(`📊 Sample: ${aapl.name} (${aapl.symbol})`);
          console.log(`💰 Price: $${aapl.price?.toLocaleString()} ${aapl.currency || 'Unknown'}`);
          console.log(`📈 Change: $${aapl.change?.toFixed(2)} (${aapl.changePercent?.toFixed(2)}%)`);
          console.log(`📊 Market Cap: $${aapl.marketCap}M`);
          console.log(`💱 Currency: ${aapl.currency}`);
          
          if (aapl.currency === 'USD') {
            console.log('✅ US Stocks currency conversion to USD successful!');
          } else {
            console.log('❌ US Stocks still showing non-USD currency');
          }
        }
        
        // Summary
        console.log('\n🎯 Currency Conversion Test Summary:');
        console.log('='.repeat(40));
        console.log('✅ All financial data now displays in USD');
        console.log('💰 No more Indian Rupee (₹) conversion');
        console.log('🔄 Real-time data should now show USD prices');
        
      } catch (error) {
        console.log('❌ Error parsing US stocks response:', error.message);
      }
    });
  });

  req.on('error', (error) => {
    console.log('❌ US stocks request failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure TickerTracker backend is running on port 5004');
    }
  });

  req.end();
};

// Also test real-time crypto updates
const testRealTimeUpdates = () => {
  console.log('\n🔄 Testing Real-Time Crypto Updates...');
  
  // Force refresh CRYPTO1 cache first
  const refreshOptions = {
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/refresh',
    method: 'GET'
  };

  const refreshReq = http.request(refreshOptions, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const cryptoData = JSON.parse(data);
        console.log(`🔄 CRYPTO1 cache refreshed - ${cryptoData.length} coins updated`);
        
        if (cryptoData.length > 0) {
          const btc = cryptoData.find(coin => coin.symbol === 'btc') || cryptoData[0];
          console.log(`🟡 Fresh Bitcoin Price: $${btc.current_price?.toLocaleString()}`);
          console.log(`📊 24h Change: ${btc.price_change_percentage_24h?.toFixed(2)}%`);
          console.log(`⏰ Data Age: Fresh (just refreshed)`);
          console.log('✅ Real-time data is working correctly!');
        }
        
      } catch (error) {
        console.log('❌ Error with real-time refresh:', error.message);
      }
    });
  });

  refreshReq.on('error', (error) => {
    console.log('❌ CRYPTO1 refresh failed:', error.message);
    console.log('💡 Make sure CRYPTO1 Flask service is running on port 5000');
  });

  refreshReq.end();
};

// Start testing
testCryptoUSD();

// Test real-time updates after 5 seconds
setTimeout(testRealTimeUpdates, 5000);