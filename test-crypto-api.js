const axios = require('axios');

// Test script to debug crypto API issues
const testCryptoAPI = async () => {
  console.log('🔍 Testing Crypto API endpoints...\n');

  // Test 1: Direct CoinGecko API call
  console.log('1. Testing direct CoinGecko API...');
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 10,
        page: 1,
        sparkline: false,
        price_change_percentage: '24h'
      }
    });

    console.log('✅ CoinGecko API working!');
    console.log(`   Retrieved ${response.data.length} cryptocurrencies`);
    console.log(`   First crypto: ${response.data[0]?.name} (${response.data[0]?.symbol.toUpperCase()})`);
    console.log(`   Price: $${response.data[0]?.current_price}`);
  } catch (error) {
    console.log('❌ CoinGecko API failed:', error.message);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 2: Backend crypto service
  console.log('2. Testing backend crypto service...');
  try {
    const response = await axios.get('http://localhost:5004/api/stocks/Crypto');
    console.log('✅ Backend crypto API working!');
    console.log(`   Retrieved ${response.data.length} cryptocurrencies`);

    if (response.data.length > 0) {
      const firstCrypto = response.data[0];
      console.log(`   First crypto: ${firstCrypto.name} (${firstCrypto.symbol})`);
      console.log(`   Exchange: ${firstCrypto.exchange}`);
      console.log(`   Price: $${firstCrypto.price}`);
      console.log(`   Change: ${firstCrypto.changePercent}%`);
      console.log('\n   Sample data structure:');
      console.log(JSON.stringify(firstCrypto, null, 2));
    }
  } catch (error) {
    console.log('❌ Backend crypto API failed:', error.message);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Message: ${error.response.data?.message || 'No message'}`);
    }
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 3: Frontend API call simulation
  console.log('3. Testing frontend API call...');
  try {
    const response = await axios.get('http://localhost:5004/api/stocks/Crypto', {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Frontend-style API call working!');

    // Check data structure compatibility
    const cryptos = response.data;
    const hasCorrectExchange = cryptos.every(crypto => crypto.exchange === 'Crypto');
    const hasRequiredFields = cryptos.every(crypto =>
      crypto.symbol && crypto.name && crypto.price && crypto.exchange
    );

    console.log(`   All cryptos have exchange='Crypto': ${hasCorrectExchange}`);
    console.log(`   All cryptos have required fields: ${hasRequiredFields}`);

    if (!hasCorrectExchange) {
      console.log('   ⚠️  Exchange field issue detected!');
      console.log('   Exchanges found:', [...new Set(cryptos.map(c => c.exchange))]);
    }

    if (!hasRequiredFields) {
      console.log('   ⚠️  Missing fields detected!');
      const missingFields = cryptos.find(crypto =>
        !crypto.symbol || !crypto.name || !crypto.price || !crypto.exchange
      );
      console.log('   First crypto with missing fields:', missingFields);
    }

  } catch (error) {
    console.log('❌ Frontend-style API call failed:', error.message);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 4: Check backend server status
  console.log('4. Testing backend server status...');
  try {
    const response = await axios.get('http://localhost:5004');
    console.log('✅ Backend server is running!');
    console.log(`   Response: ${response.data}`);
  } catch (error) {
    console.log('❌ Backend server not accessible:', error.message);
    console.log('   Make sure the backend is running on port 5004');
  }
};

// Run the tests
testCryptoAPI().catch(console.error);
