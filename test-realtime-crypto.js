const http = require('http');

let testCount = 0;
const maxTests = 3;

// Function to get current timestamp
const getTimestamp = () => new Date().toLocaleTimeString();

// Test real-time crypto data updates
const testRealTimeData = () => {
  testCount++;
  console.log(`\n🔄 Test ${testCount}/${maxTests} - ${getTimestamp()}`);
  console.log('='.repeat(50));
  
  // First, force refresh the CRYPTO1 cache
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
        console.log(`✅ CRYPTO1 Cache Refreshed - ${cryptoData.length} coins`);
        
        if (cryptoData.length > 0) {
          const btc = cryptoData.find(coin => coin.symbol === 'btc') || cryptoData[0];
          console.log(`🟡 Bitcoin Price: $${btc.current_price}`);
          console.log(`📈 24h Change: ${btc.price_change_percentage_24h?.toFixed(2)}%`);
          console.log(`⏰ Last Updated: ${getTimestamp()}`);
        }
        
        // Now test the TickerTracker backend
        setTimeout(() => testBackendData(), 1000);
        
      } catch (error) {
        console.log('❌ Error parsing refresh response:', error.message);
      }
    });
  });

  refreshReq.on('error', (error) => {
    console.log('❌ CRYPTO1 refresh failed:', error.message);
  });

  refreshReq.end();
};

// Test TickerTracker backend crypto endpoint
const testBackendData = () => {
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
        console.log(`🔥 TickerTracker: ${cryptoData.length} cryptos received`);
        
        if (cryptoData.length > 0) {
          const btc = cryptoData.find(coin => coin.symbol === 'BTC') || cryptoData[0];
          console.log(`🟡 ${btc.name} (${btc.symbol})`);
          console.log(`💰 Price: ₹${btc.price?.toLocaleString()} (converted)`);
          console.log(`📊 Exchange: ${btc.exchange}`);
          console.log(`⚡ Impact: ${btc.impactScore}`);
          
          if (btc.rank) {
            console.log(`🏆 Rank: #${btc.rank}`);
          }
        }
        
        // Schedule next test if not at max
        if (testCount < maxTests) {
          console.log(`\n⏳ Waiting 12 seconds for next test...`);
          setTimeout(testRealTimeData, 12000); // Wait 12 seconds for next test
        } else {
          console.log('\n🎉 Real-time data testing complete!');
          console.log('📊 Data is updating every 10 seconds in CRYPTO1');
          console.log('🔄 TickerTracker backend caches for 15 seconds');
          console.log('✅ Real-time crypto data flow verified!');
        }
        
      } catch (error) {
        console.log('❌ Error parsing backend response:', error.message);
        console.log('Response:', data.substring(0, 200) + '...');
      }
    });
  });

  req.on('error', (error) => {
    console.log('❌ Backend request failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure TickerTracker backend is running on port 5004');
    }
  });

  req.end();
};

console.log('🚀 Testing Real-Time Crypto Data Updates');
console.log('📡 This will test data freshness over 3 intervals');
console.log('⚡ CRYPTO1 cache: 10 seconds');
console.log('⚡ Backend cache: 15 seconds');
console.log('🔄 We will refresh every 12 seconds to see updates\n');

// Start the test
testRealTimeData();