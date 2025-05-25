// Test script to verify the dispense fuel endpoint
// Run this with: node test-dispense-endpoint.js

const fetch = require('node-fetch');

const API_BASE_URL = 'http://192.168.133.111:8888';

// Test data - using string values for BigDecimal compatibility
const testData = {
  vehicleId: 4,
  stationId: 1,
  fuelType: "AUTO_DIESEL",
  amount: "50.0",  // String for BigDecimal
  unitPrice: "150.0"  // String for BigDecimal
};

async function testDispenseEndpoint() {
  try {
    console.log('🧪 Testing dispense fuel endpoint...');
    console.log('📤 Request data:', JSON.stringify(testData, null, 2));
    
    const response = await fetch(`${API_BASE_URL}/api/station/quota/dispense`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_VALID_JWT_TOKEN_HERE', // Replace with valid token
        'X-Mobile-App': 'quota-app',
        'X-App-Version': '1.0.0'
      },
      body: JSON.stringify(testData)
    });

    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📥 Response body:', responseText);
    
    if (response.status === 404) {
      console.log('❌ 404 Error: Endpoint not found');
      console.log('🔍 Check if backend is running and endpoint is properly mapped');
    } else if (response.status === 401 || response.status === 403) {
      console.log('🔐 Authentication Error: Invalid or expired JWT token');
      console.log('💡 Get a valid token from login endpoint first');
    } else if (response.status === 400) {
      console.log('📝 Validation Error: Check request data format');
    } else if (response.status === 200) {
      console.log('✅ Success: Endpoint is working correctly');
    }
    
  } catch (error) {
    console.error('💥 Network Error:', error.message);
    console.log('🔍 Check if backend server is running at', API_BASE_URL);
  }
}

// Test endpoint availability first
async function testEndpointAvailability() {
  try {
    console.log('🔍 Testing endpoint availability...');
    
    const response = await fetch(`${API_BASE_URL}/api/station/quota/dispense`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3003',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type,Authorization'
      }
    });
    
    console.log('📊 OPTIONS response status:', response.status);
    console.log('📊 CORS headers:', {
      'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
    });
    
  } catch (error) {
    console.error('💥 OPTIONS request failed:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting endpoint tests...\n');
  
  await testEndpointAvailability();
  console.log('\n' + '='.repeat(50) + '\n');
  await testDispenseEndpoint();
  
  console.log('\n🏁 Tests completed');
}

runTests();
