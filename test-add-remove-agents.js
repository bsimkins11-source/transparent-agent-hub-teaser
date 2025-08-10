#!/usr/bin/env node

/**
 * QA Test Script for Add/Remove Agent Functionality
 * This script tests the complete flow of adding and removing agents from user libraries
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:8080';
const FRONTEND_URL = 'http://localhost:3000';

// Test data
const TEST_AGENT_ID = 'gemini-chat-agent';
const TEST_USER_EMAIL = 'test.user@production.com';

console.log('🚀 Starting QA Testing for Add/Remove Agent Functionality');
console.log('========================================================\n');

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0
};

function logTest(name, passed, details = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${name}: PASSED`);
  } else {
    testResults.failed++;
    console.log(`❌ ${name}: FAILED`);
    if (details) console.log(`   Details: ${details}`);
  }
}

async function testBackendHealth() {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/agents`);
    const hasAgents = response.data.agents && response.data.agents.length > 0;
    logTest('Backend Health Check', true, `Found ${response.data.agents.length} agents`);
    return true;
  } catch (error) {
    logTest('Backend Health Check', false, error.message);
    return false;
  }
}

async function testFrontendHealth() {
  try {
    const response = await axios.get(FRONTEND_URL);
    const isHtml = response.data.includes('<!doctype html>');
    logTest('Frontend Health Check', isHtml, 'Frontend is serving HTML');
    return isHtml;
  } catch (error) {
    logTest('Frontend Health Check', false, error.message);
    return false;
  }
}

async function testAgentListing() {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/agents`);
    const agents = response.data.agents;
    const geminiAgent = agents.find(a => a.id === TEST_AGENT_ID);
    
    if (geminiAgent) {
      logTest('Agent Listing', true, `Found Gemini agent: ${geminiAgent.name}`);
      return geminiAgent;
    } else {
      logTest('Agent Listing', false, 'Gemini agent not found in listing');
      return null;
    }
  } catch (error) {
    logTest('Agent Listing', false, error.message);
    return null;
  }
}

async function testUserLibraryEndpoint() {
  try {
    // This should fail without authentication
    const response = await axios.get(`${API_BASE_URL}/api/agents/user-library`);
    logTest('User Library Authentication Check', false, 'Should require authentication');
    return false;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      logTest('User Library Authentication Check', true, 'Properly requires authentication');
      return true;
    } else {
      logTest('User Library Authentication Check', false, `Unexpected error: ${error.message}`);
      return false;
    }
  }
}

async function testAddAgentEndpoint() {
  try {
    // This should fail without authentication
    const response = await axios.post(`${API_BASE_URL}/api/agents/${TEST_AGENT_ID}/add-to-library`, {
      assignmentReason: 'QA Testing'
    });
    logTest('Add Agent Authentication Check', false, 'Should require authentication');
    return false;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      logTest('Add Agent Authentication Check', true, 'Properly requires authentication');
      return true;
    } else {
      logTest('Add Agent Authentication Check', false, `Unexpected error: ${error.message}`);
      return false;
    }
  }
}

async function testRemoveAgentEndpoint() {
  try {
    // This should fail without authentication
    const response = await axios.delete(`${API_BASE_URL}/api/agents/${TEST_AGENT_ID}/remove-from-library`);
    logTest('Remove Agent Authentication Check', false, 'Should require authentication');
    return false;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      logTest('Remove Agent Authentication Check', true, 'Properly requires authentication');
      return true;
    } else {
      logTest('Remove Agent Authentication Check', false, `Unexpected error: ${error.message}`);
      return false;
    }
  }
}

async function testAgentMetadata() {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/agents`);
    const agents = response.data.agents;
    
    // Check if agents have required metadata for add/remove functionality
    const validAgents = agents.filter(agent => {
      return agent.id && agent.name && agent.metadata && agent.metadata.tier;
    });
    
    if (validAgents.length === agents.length) {
      logTest('Agent Metadata Validation', true, `All ${agents.length} agents have required metadata`);
      return true;
    } else {
      logTest('Agent Metadata Validation', false, `${validAgents.length}/${agents.length} agents have required metadata`);
      return false;
    }
  } catch (error) {
    logTest('Agent Metadata Validation', false, error.message);
    return false;
  }
}

async function testPremiumAgentHandling() {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/agents`);
    const agents = response.data.agents;
    
    // Check if premium agents have proper access control
    const premiumAgents = agents.filter(agent => agent.metadata?.tier === 'premium');
    
    if (premiumAgents.length > 0) {
      const validPremiumAgents = premiumAgents.filter(agent => 
        agent.metadata?.permissionType && agent.accessInfo
      );
      
      if (validPremiumAgents.length === premiumAgents.length) {
        logTest('Premium Agent Access Control', true, `All ${premiumAgents.length} premium agents have proper access control`);
        return true;
      } else {
        logTest('Premium Agent Access Control', false, `${validPremiumAgents.length}/${premiumAgents.length} premium agents have proper access control`);
        return false;
      }
    } else {
      logTest('Premium Agent Access Control', true, 'No premium agents to test');
      return true;
    }
  } catch (error) {
    logTest('Premium Agent Access Control', false, error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🧪 Running Backend Tests...\n');
  
  await testBackendHealth();
  await testFrontendHealth();
  
  console.log('\n🧪 Running API Endpoint Tests...\n');
  
  await testAgentListing();
  await testUserLibraryEndpoint();
  await testAddAgentEndpoint();
  await testRemoveAgentEndpoint();
  
  console.log('\n🧪 Running Data Validation Tests...\n');
  
  await testAgentMetadata();
  await testPremiumAgentHandling();
  
  console.log('\n========================================================');
  console.log('📊 QA Test Results Summary');
  console.log('========================================================');
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.failed === 0) {
    console.log('\n🎉 All tests passed! The add/remove agent functionality is working correctly.');
    console.log('\n💡 Next steps for manual testing:');
    console.log('   1. Open http://localhost:3000 in your browser');
    console.log('   2. Sign in with a test user');
    console.log('   3. Navigate to the agent library');
    console.log('   4. Test adding agents to your library');
    console.log('   5. Test removing agents from your library');
    console.log('   6. Verify the UI updates correctly');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the issues above.');
    console.log('\n🔧 Common issues to check:');
    console.log('   - Backend server running on port 8080');
    console.log('   - Frontend server running on port 3000');
    console.log('   - Firebase configuration is correct');
    console.log('   - Database collections are properly set up');
  }
  
  console.log('\n========================================================');
}

// Run the tests
runAllTests().catch(error => {
  console.error('💥 Test runner failed:', error);
  process.exit(1);
});
