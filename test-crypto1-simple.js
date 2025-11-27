const http = require('http');

// Simple test to check if CRYPTO1 is running
const testCrypto1 = () => {
  const options = {
    hostname: '127.0.0.1',
    port: 5000,
    path: '/health',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('✅ CRYPTO1 Health Check Response:');
      console.log(JSON.parse(data));
      
      // Test the API data endpoint
      testCrypto1Data();
    });
  });

  req.on('error', (error) => {
    console.log('❌ CRYPTO1 service not accessible:', error.message);
    console.log('Make sure CRYPTO1 Flask service is running on port 5000');
  });

  req.end();
};

const testCrypto1Data = () => {
  const options = {
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/data',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      const cryptoData = JSON.parse(data);
      console.log('\n✅ CRYPTO1 API Data Response:');
      console.log(`📊 Retrieved ${cryptoData.length} cryptocurrencies`);
      
      if (cryptoData.length > 0) {
        const firstCrypto = cryptoData[0];
        console.log(`🥇 First crypto: ${firstCrypto.name} (${firstCrypto.symbol?.toUpperCase()})`);
        console.log(`💰 Price: $${firstCrypto.current_price}`);
        console.log(`📈 24h Change: ${firstCrypto.price_change_percentage_24h?.toFixed(2)}%`);
      }
      
      console.log('\n🎉 CRYPTO1 service is working perfectly!');
      console.log('✅ Ready to integrate with TickerTracker backend');
    });
  });

  req.on('error', (error) => {
    console.log('❌ CRYPTO1 API not accessible:', error.message);
  });

  req.end();
};

console.log('🔍 Testing CRYPTO1 Flask Service Connection...\n');
testCrypto1();