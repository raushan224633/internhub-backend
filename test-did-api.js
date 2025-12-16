// Test D-ID API connection
require('dotenv').config();
const axios = require('axios');

async function testDIDConnection() {
  const apiKey = process.env.DID_API_KEY;
  
  console.log('🔑 Testing D-ID API Connection');
  console.log('================================\n');
  console.log('API Key:', apiKey ? `${apiKey.substring(0, 20)}...` : 'NOT FOUND');
  console.log('\n📡 Making test request to D-ID API...\n');

  try {
    // Test with a simple credits check endpoint
    const response = await axios.get('https://api.d-id.com/credits', {
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ SUCCESS! Connection working!');
    console.log('\n📊 Your D-ID Account Info:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ FAILED! Connection error:');
    console.error('\nStatus:', error.response?.status);
    console.error('Message:', error.response?.data);
    console.error('\n💡 Troubleshooting:');
    console.error('1. Check if your API key is correct');
    console.error('2. Verify format: Basic <base64_credentials>');
    console.error('3. Make sure you have credits in D-ID account');
    console.error('4. Check if API key has proper permissions\n');
  }
}

testDIDConnection();
