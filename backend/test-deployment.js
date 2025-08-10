#!/usr/bin/env node

/**
 * Test Script for Production Backend Deployment
 * This script tests the deployed backend to ensure it's working correctly
 */

const axios = require('axios');

// Configuration - Update this URL after deployment
const BACKEND_URL = process.env.BACKEND_URL || 'https://your-backend-url-here.com';

console.log('🧪 Testing Production Backend Deployment');
console.log('=======================================\n');
console.log(`🌐 Backend URL: ${BACKEND_URL}\n`);

async function testHealthCheck() {
  try {
    console.log('1️⃣ Testing Health Check...');
    const response = await axios.get(`${BACKEND_URL}/health`);
    console.log('✅ Health check passed');
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
    return true;
  } catch (error) {
    console.log('❌ Health check failed');
    console.log(`   Error: ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    return false;
  }
}

async function testAgentsEndpoint() {
  try {
    console.log('\n2️⃣ Testing Agents Endpoint...');
    const response = await axios.get(`${BACKEND_URL}/api/agents`);
    console.log('✅ Agents endpoint working');
    console.log(`   Status: ${response.status}`);
    console.log(`   Agent Count: ${response.data.agents?.length || 0}`);
    return true;
  } catch (error) {
    console.log('❌ Agents endpoint failed');
    console.log(`   Error: ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
    }
    return false;
  }
}

async function testAuthenticationRequired() {
  try {
    console.log('\n3️⃣ Testing Authentication Requirements...');
    
    // Test user library endpoint without auth (should return 401)
    try {
      await axios.get(`${BACKEND_URL}/api/agents/user-library`);
      console.log('⚠️  User library endpoint accessible without auth (security issue!)');
      return false;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ User library endpoint properly requires authentication (401)');
      } else {
        console.log(`⚠️  Unexpected response: ${error.response?.status || 'no response'}`);
        return false;
      }
    }
    
    // Test add to library endpoint without auth (should return 401)
    try {
      await axios.post(`${BACKEND_URL}/api/agents/test-agent/add-to-library`);
      console.log('⚠️  Add to library endpoint accessible without auth (security issue!)');
      return false;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Add to library endpoint properly requires authentication (401)');
      } else {
        console.log(`⚠️  Unexpected response: ${error.response?.status || 'no response'}`);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.log('❌ Authentication test failed');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testCORSConfiguration() {
  try {
    console.log('\n4️⃣ Testing CORS Configuration...');
    
    // Test with frontend origin
    const response = await axios.get(`${BACKEND_URL}/health`, {
      headers: {
        'Origin': 'https://ai-agent-hub-web-portal-79fb0.web.app'
      }
    });
    
    console.log('✅ CORS test passed');
    console.log(`   Status: ${response.status}`);
    return true;
  } catch (error) {
    console.log('❌ CORS test failed');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function generateTestReport() {
  console.log('\n📊 Deployment Test Report');
  console.log('==========================');
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log(`Test Time: ${new Date().toISOString()}`);
  console.log('');
  
  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'Agents Endpoint', fn: testAgentsEndpoint },
    { name: 'Authentication', fn: testAuthenticationRequired },
    { name: 'CORS Configuration', fn: testCORSConfiguration }
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    const result = await test.fn();
    if (result) passedTests++;
  }
  
  console.log('\n📈 Test Results Summary');
  console.log('========================');
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Your backend is ready for production.');
    console.log('\n📋 Next steps:');
    console.log('1. Update frontend VITE_API_URL to:', BACKEND_URL);
    console.log('2. Rebuild and redeploy frontend');
    console.log('3. Test the remove functionality');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the issues above.');
    console.log('\n🔧 Troubleshooting:');
    console.log('- Verify backend is running and accessible');
    console.log('- Check environment variables are set correctly');
    console.log('- Verify CORS configuration allows your frontend domain');
    console.log('- Check backend logs for errors');
  }
}

// Run the tests
async function runTests() {
  if (BACKEND_URL === 'https://your-backend-url-here.com') {
    console.log('❌ Please set BACKEND_URL environment variable to your deployed backend URL');
    console.log('Example: BACKEND_URL=https://agent-backend-abc123-uc.a.run.app node test-deployment.js');
    process.exit(1);
  }
  
  await generateTestReport();
}

runTests().catch(error => {
  console.error('💥 Test script failed:', error);
  process.exit(1);
});
