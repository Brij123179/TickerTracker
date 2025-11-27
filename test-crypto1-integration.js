const axios = require('axios');

// Test script to verify CRYPTO1 integration with TickerTracker
const testCrypto1Integration = async () => {
  console.log('🔍 Testing CRYPTO1 Integration with TickerTracker...\n');

  // Test 1: Check if CRYPTO1 Flask app is running
  console.log('1. Testing CRYPTO1 Flask app availability...');
  try {
    const response = await axios.get('http://127.0.0.1:5000/health');
    console.log('✅ CRYPTO1 Flask app is running!');
    console.log(`   Status: ${response.data.status}`);
    console.log(`   Service: ${response.data.service}`);
    
    if (response.data.cache_status?.has_data) {
      console.log(`   Cache status: Data available (age: ${response.data.cache_status.cache_age_seconds?.toFixed(1)}s)`);
    } else {
      console.log('   Cache status: No cached data');
    }
  } catch (error) {
    console.log('❌ CRYPTO1 Flask app not accessible:', error.message);
    console.log('   Make sure to start the CRYPTO1 service first using start-crypto1.bat or start-crypto1.ps1');
  }

  console.log('\n' + '='.repeat(70) + '\n');

  // Test 2: Direct CRYPTO1 API call
  console.log('2. Testing direct CRYPTO1 API...');
  try {
    const response = await axios.get('http://127.0.0.1:5000/api/data');
    console.log('✅ CRYPTO1 API working!');
    console.log(`   Retrieved ${response.data.length} cryptocurrencies`);
    
    if (response.data.length > 0) {
      const firstCrypto = response.data[0];
      console.log(`   First crypto: ${firstCrypto.name} (${firstCrypto.symbol?.toUpperCase()})`);
      console.log(`   Price: $${firstCrypto.current_price}`);
      console.log(`   Market Cap: $${firstCrypto.market_cap?.toLocaleString()}`);
      console.log(`   24h Change: ${firstCrypto.price_change_percentage_24h?.toFixed(2)}%`);
    }
  } catch (error) {
    console.log('❌ CRYPTO1 API failed:', error.message);
  }

  console.log('\n' + '='.repeat(70) + '\n');

  // Test 3: TickerTracker backend crypto endpoint (via CRYPTO1)
  console.log('3. Testing TickerTracker backend with CRYPTO1 integration...');
  try {
    const response = await axios.get('http://localhost:5004/api/stocks/Crypto');
    console.log('✅ TickerTracker crypto endpoint working with CRYPTO1!');
    console.log(`   Retrieved ${response.data.length} cryptocurrencies`);

    if (response.data.length > 0) {
      const firstCrypto = response.data[0];
      console.log(`   First crypto: ${firstCrypto.name} (${firstCrypto.symbol})`);
      console.log(`   Exchange: ${firstCrypto.exchange}`);
      console.log(`   Price: $${firstCrypto.price} (converted from USD)`);
      console.log(`   Change: ${firstCrypto.changePercent?.toFixed(2)}%`);
      console.log(`   Market Cap: $${firstCrypto.marketCap} crores`);
      console.log(`   Sentiment: ${firstCrypto.sentiment}`);
      console.log(`   Impact Score: ${firstCrypto.impactScore}`);

      // Test data structure compatibility
      const hasRequiredFields = firstCrypto.symbol && firstCrypto.name && 
                               firstCrypto.price && firstCrypto.exchange === 'Crypto';
      
      console.log(`   ✅ Data structure valid: ${hasRequiredFields}`);
      
      if (firstCrypto.rank) {
        console.log(`   Market Rank: #${firstCrypto.rank}`);
      }
    }
  } catch (error) {
    console.log('❌ TickerTracker backend crypto API failed:', error.message);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Message: ${error.response.data?.message || 'No message'}`);
    }
  }

  console.log('\n' + '='.repeat(70) + '\n');

  // Test 4: Backend health check
  console.log('4. Testing TickerTracker backend health check...');
  try {
    const response = await axios.get('http://localhost:5004/api/health');
    console.log('✅ TickerTracker backend health check passed!');
    console.log(`   Overall status: ${response.data.status}`);
    console.log('   Service statuses:');
    console.log(`     - CRYPTO1: ${response.data.services?.crypto1 ? '✅' : '❌'}`);
    console.log(`     - Alpha Vantage: ${response.data.services?.alphaVantage ? '✅' : '❌'}`);
    console.log(`     - CoinGecko: ${response.data.services?.coinGecko ? '✅' : '❌'}`);
    console.log(`     - Mock Data: ${response.data.services?.mockData ? '✅' : '❌'}`);
  } catch (error) {
    console.log('❌ TickerTracker backend health check failed:', error.message);
  }

  console.log('\n' + '='.repeat(70) + '\n');

  // Test 5: Specific CRYPTO1 health check
  console.log('5. Testing CRYPTO1 specific health check...');
  try {
    const response = await axios.get('http://localhost:5004/api/health/crypto1');
    console.log('✅ CRYPTO1 health check passed!');
    console.log(`   Service: ${response.data.service}`);
    console.log(`   Status: ${response.data.status}`);
    console.log(`   Endpoint: ${response.data.endpoint}`);
  } catch (error) {
    console.log('❌ CRYPTO1 health check failed:', error.message);
  }

  console.log('\n' + '='.repeat(70) + '\n');

  // Test 6: Individual ticker details
  console.log('6. Testing individual crypto ticker details...');
  try {
    const response = await axios.get('http://localhost:5004/api/ticker/BTC');
    console.log('✅ Individual crypto ticker details working!');
    console.log(`   Symbol: ${response.data.symbol}`);
    console.log(`   Name: ${response.data.name}`);
    console.log(`   Price: $${response.data.price}`);
    console.log(`   Historical data points: ${response.data.historicalData?.length || 0}`);
    
    if (response.data.rank) {
      console.log(`   Market Rank: #${response.data.rank}`);
    }
  } catch (error) {
    console.log('❌ Individual crypto ticker failed:', error.message);
  }

  console.log('\n' + '🎉'.repeat(35));
  console.log('Integration test completed!');
  console.log('\n📋 Setup Instructions:');
  console.log('1. Start CRYPTO1 service: run start-crypto1.bat or start-crypto1.ps1');
  console.log('2. Start TickerTracker backend: cd backend && npm run dev');
  console.log('3. Start TickerTracker frontend: cd Frontend && npm run dev');
  console.log('4. Access the app at http://localhost:5173');
  console.log('\n🔄 The CRYPTO1 service provides real-time crypto data with 2-minute caching');
  console.log('💡 Check the Crypto market in the TickerTracker UI for live data!');
};

// Run the integration tests
testCrypto1Integration().catch(console.error);