#!/usr/bin/env node

/**
 * Debug Script for Remove Agent Issue
 * This script helps identify why the remove functionality isn't working in production
 */

const axios = require('axios');

// Configuration
const PRODUCTION_URL = 'https://ai-agent-hub-web-portal-79fb0.web.app';
const API_BASE_URL = 'https://ai-agent-hub-web-portal-79fb0.web.app'; // Assuming same domain for API

console.log('🔍 Debugging Remove Agent Issue in Production');
console.log('=============================================\n');

async function checkProductionHealth() {
  try {
    console.log('🌐 Checking production site health...');
    const response = await axios.get(PRODUCTION_URL);
    console.log('✅ Production site is accessible');
    console.log(`   Status: ${response.status}`);
    console.log(`   Content-Type: ${response.headers['content-type']}`);
    return true;
  } catch (error) {
    console.log('❌ Production site is not accessible');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function checkAPIEndpoints() {
  console.log('\n🔌 Checking API endpoints...');
  
  // Test if API endpoints are accessible (they should return 401 without auth)
  const endpoints = [
    '/api/agents',
    '/api/agents/user-library',
    '/api/agents/gemini-chat-agent/remove-from-library'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`${API_BASE_URL}${endpoint}`);
      console.log(`⚠️  ${endpoint}: Unexpectedly accessible (${response.status})`);
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          console.log(`✅ ${endpoint}: Properly requires authentication (401)`);
        } else if (error.response.status === 404) {
          console.log(`❌ ${endpoint}: Not found (404)`);
        } else {
          console.log(`⚠️  ${endpoint}: Unexpected status (${error.response.status})`);
        }
      } else {
        console.log(`❌ ${endpoint}: Network error - ${error.message}`);
      }
    }
  }
}

async function checkFirebaseConfig() {
  console.log('\n🔥 Checking Firebase configuration...');
  
  try {
    // Try to access the main page to see if Firebase is configured
    const response = await axios.get(PRODUCTION_URL);
    const html = response.data;
    
    // Check for Firebase config
    if (html.includes('firebase')) {
      console.log('✅ Firebase configuration found in HTML');
    } else {
      console.log('⚠️  Firebase configuration not found in HTML');
    }
    
    // Check for environment variables
    if (html.includes('VITE_')) {
      console.log('✅ Vite environment variables found');
    } else {
      console.log('⚠️  Vite environment variables not found');
    }
    
    // Check for API URL configuration
    if (html.includes('localhost:8080') || html.includes('localhost:3000')) {
      console.log('⚠️  Local development URLs found in production build');
    } else {
      console.log('✅ No local development URLs found');
    }
    
  } catch (error) {
    console.log('❌ Could not check Firebase configuration');
  }
}

async function generateDebuggingSteps() {
  console.log('\n🔧 Debugging Steps for Production Issue');
  console.log('=========================================\n');
  
  console.log('1. **Check Browser Console**');
  console.log('   - Open https://ai-agent-hub-web-portal-79fb0.web.app/my-agents');
  console.log('   - Press F12 to open Developer Tools');
  console.log('   - Go to Console tab');
  console.log('   - Look for JavaScript errors when clicking Remove button');
  console.log('   - Look for network request failures');
  
  console.log('\n2. **Check Network Tab**');
  console.log('   - In Developer Tools, go to Network tab');
  console.log('   - Click the Remove button');
  console.log('   - Look for failed API requests');
  console.log('   - Check if the DELETE request is being made');
  console.log('   - Check response status and error messages');
  
  console.log('\n3. **Check Authentication**');
  console.log('   - Verify you are signed in');
  console.log('   - Check if auth token is valid');
  console.log('   - Look for 401 errors in network requests');
  
  console.log('\n4. **Check Environment Configuration**');
  console.log('   - Verify production environment variables are set correctly');
  console.log('   - Check if API_BASE_URL points to production backend');
  console.log('   - Verify Firebase project configuration');
  
  console.log('\n5. **Check Backend Status**');
  console.log('   - Verify production backend is running');
  console.log('   - Check backend logs for errors');
  console.log('   - Verify database connectivity');
  
  console.log('\n6. **Common Issues to Check**');
  console.log('   - CORS configuration on production backend');
  console.log('   - Firebase security rules blocking operations');
  console.log('   - Environment variable mismatches');
  console.log('   - Build configuration issues');
  console.log('   - API endpoint routing problems');
}

async function runDebugChecks() {
  console.log('🚀 Starting production debugging checks...\n');
  
  await checkProductionHealth();
  await checkAPIEndpoints();
  await checkFirebaseConfig();
  await generateDebuggingSteps();
  
  console.log('\n=============================================');
  console.log('📋 Next Steps:');
  console.log('1. Follow the debugging steps above');
  console.log('2. Check browser console for errors');
  console.log('3. Verify network requests are working');
  console.log('4. Check if backend is accessible from production');
  console.log('5. Verify Firebase configuration is correct');
  console.log('\n💡 If you find specific errors, please share them for further assistance.');
}

// Run the debug checks
runDebugChecks().catch(error => {
  console.error('💥 Debug script failed:', error);
  process.exit(1);
});
