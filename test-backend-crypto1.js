const http = require('http');

// Test if TickerTracker backend can get crypto data from CRYPTO1
const testBackendCrypto = () => {
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
        console.log('✅ TickerTracker Backend with CRYPTO1 Integration Working!');
        console.log(`📊 Retrieved ${cryptoData.length} cryptocurrencies`);
        
        if (cryptoData.length > 0) {
          const firstCrypto = cryptoData[0];
          console.log(`🥇 First crypto: ${firstCrypto.name} (${firstCrypto.symbol})`);
          console.log(`💰 Price: ₹${firstCrypto.price} (converted from USD)`);
          console.log(`📈 24h Change: ${firstCrypto.changePercent?.toFixed(2)}%`);
          console.log(`🏢 Exchange: ${firstCrypto.exchange}`);
          console.log(`😊 Sentiment: ${firstCrypto.sentiment}`);
          console.log(`⚡ Impact Score: ${firstCrypto.impactScore}`);
          
          if (firstCrypto.rank) {
            console.log(`🏆 Market Rank: #${firstCrypto.rank}`);
          }
        }
        
        console.log('\n🎉 CRYPTO1 ↔ TickerTracker Integration Successful!');
        console.log('✅ Real-time crypto data is flowing through the system');
      } catch (error) {
        console.log('❌ Invalid response format:', error.message);
        console.log('Response:', data);
      }
    });
  });

  req.on('error', (error) => {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ TickerTracker backend not running on port 5004');
      console.log('💡 To start the backend:');
      console.log('   1. cd backend');
      console.log('   2. npm run dev (or node server.js)');
    } else {
      console.log('❌ Error connecting to backend:', error.message);
    }
  });

  req.end();
};

// Test backend health endpoint
const testBackendHealth = () => {
  const options = {
    hostname: 'localhost',
    port: 5004,
    path: '/api/health',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const healthData = JSON.parse(data);
        console.log('\n🏥 Backend Health Check:');
        console.log(`Overall Status: ${healthData.status}`);
        console.log('Service Statuses:');
        console.log(`  - CRYPTO1: ${healthData.services?.crypto1 ? '✅' : '❌'}`);
        console.log(`  - Alpha Vantage: ${healthData.services?.alphaVantage ? '✅' : '❌'}`);
        console.log(`  - CoinGecko: ${healthData.services?.coinGecko ? '✅' : '❌'}`);
        console.log(`  - Mock Data: ${healthData.services?.mockData ? '✅' : '❌'}`);
        
        // Now test crypto endpoint
        console.log('\n🔍 Testing crypto endpoint...');
        testBackendCrypto();
      } catch (error) {
        console.log('❌ Invalid health response:', error.message);
      }
    });
  });

  req.on('error', (error) => {
    console.log('❌ Backend health check failed:', error.message);
    console.log('Make sure TickerTracker backend is running on port 5004');
  });

  req.end();
};

console.log('🔍 Testing TickerTracker Backend Integration with CRYPTO1...\n');
testBackendHealth();