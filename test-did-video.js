require('dotenv').config();
const axios = require('axios');

async function testVideoGeneration() {
  const apiKey = process.env.DID_API_KEY;
  
  console.log('🎬 Testing D-ID Video Generation');
  console.log('=================================\n');

  const testScript = 'Hello! We are hiring for Full Stack Developer Intern position. This is a great opportunity to learn and grow with our team. Apply now!';

  console.log('📝 Script:', testScript);
  console.log('\n🚀 Creating video...\n');

  try {
    const response = await axios.post(
      'https://api.d-id.com/talks',
      {
        script: {
          type: 'text',
          input: testScript
        },
        source_url: 'https://d-id-public-bucket.s3.us-west-2.amazonaws.com/alice.jpg'
      },
      {
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json',
          'accept': 'application/json'
        }
      }
    );

    console.log('✅ SUCCESS! Video generation started!');
    console.log('\n📊 Response:');
    console.log(JSON.stringify(response.data, null, 2));
    console.log(`\n🎥 Video ID: ${response.data.id}`);
    console.log(`⏱️  Status: ${response.data.status}`);

  } catch (error) {
    console.error('❌ FAILED!');
    console.error('\nStatus:', error.response?.status);
    console.error('Error:', JSON.stringify(error.response?.data, null, 2));
    
    if (error.response?.status === 401) {
      console.error('\n💡 This means your API key is invalid or expired.');
      console.error('Please check:');
      console.error('1. API key is correct in .env file');
      console.error('2. API key has proper permissions');
      console.error('3. Account has available credits');
    }
  }
}

testVideoGeneration();
