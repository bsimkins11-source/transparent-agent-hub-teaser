const axios = require('axios');

const API_BASE_URL = 'https://agent-backend-dx7q5hdbiq-uc.a.run.app';

async function debugAuthIssue() {
  console.log('🔍 Debugging Authentication Issue');
  console.log('=====================================');
  
  try {
    // Test 1: Check if backend is accessible
    console.log('\n1️⃣ Testing backend accessibility...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Backend health check passed:', healthResponse.status);
    
    // Test 2: Check agents endpoint (should work without auth)
    console.log('\n2️⃣ Testing agents endpoint...');
    const agentsResponse = await axios.get(`${API_BASE_URL}/api/agents`);
    console.log('✅ Agents endpoint accessible:', agentsResponse.status);
    console.log('📋 Found agents:', agentsResponse.data.agents?.length || 0);
    
    // Test 3: Try to add agent without auth (should fail with 401)
    console.log('\n3️⃣ Testing add-to-library without auth...');
    try {
      await axios.post(`${API_BASE_URL}/api/agents/gemini-chat-agent/add-to-library`, {
        assignmentReason: 'Testing without auth'
      });
      console.log('❌ Unexpected success - should have failed without auth');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected without auth (401)');
      } else if (error.response?.status === 400) {
        console.log('⚠️ Got 400 instead of 401 - this suggests auth middleware issue');
        console.log('Response:', error.response.data);
      } else {
        console.log('❌ Unexpected error status:', error.response?.status);
        console.log('Response:', error.response?.data);
      }
    }
    
    // Test 4: Check what the frontend should be sending
    console.log('\n4️⃣ Frontend auth requirements:');
    console.log('   - Frontend should send: Authorization: Bearer <firebase_id_token>');
    console.log('   - Token should be stored in localStorage as "authToken"');
    console.log('   - Token should be refreshed automatically by Firebase');
    
    console.log('\n5️⃣ Debugging steps:');
    console.log('   a) Check browser console for auth errors');
    console.log('   b) Check localStorage for "authToken"');
    console.log('   c) Verify user is logged in to Firebase');
    console.log('   d) Check if token has expired');
    
  } catch (error) {
    console.error('❌ Debug script failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

debugAuthIssue();
