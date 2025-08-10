#!/usr/bin/env node

/**
 * Setup and Run Script for Transparent Agent Hub Backend
 * 
 * This script helps you set up the environment and run the backend server
 * with Google Gemini API integration.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('🚀 Setting up Transparent Agent Hub Backend...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log('📝 Creating .env file...');
  
  const envContent = `# Environment Configuration for Transparent Agent Hub Backend

# Server Configuration
PORT=8080
NODE_ENV=development
FRONTEND_URL=https://ai-agent-hub-web-portal-79fb0.web.app

# Google Cloud / Firebase Configuration
FIREBASE_PROJECT_ID=ai-agent-hub-web-portal-79fb0

# AI API Keys
GOOGLE_API_KEY=your-google-gemini-api-key-here
OPENAI_API_KEY=your-openai-api-key-here
ANTHROPIC_API_KEY=your-anthropic-api-key-here

# Security
JWT_SECRET=your-random-jwt-secret-here
`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created!\n');
  
  console.log('⚠️  IMPORTANT: Please update your .env file with your actual API keys:');
  console.log('   1. Get Google API Key from: https://console.cloud.google.com/');
  console.log('   2. Enable "Generative Language API" in your Google Cloud project');
  console.log('   3. Replace "your-google-gemini-api-key-here" with your actual key\n');
  
  // Don't start server if API key is not set
  const envContent2 = fs.readFileSync(envPath, 'utf8');
  if (envContent2.includes('your-google-gemini-api-key-here')) {
    console.log('🛑 Please set your GOOGLE_API_KEY in .env file before running the server.');
    console.log('   After updating .env, run: npm run dev\n');
    process.exit(0);
  }
}

// Load environment variables
require('dotenv').config();

// Check if Google API key is set
if (!process.env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY === 'your-google-gemini-api-key-here') {
  console.log('🛑 Google API Key not configured!');
  console.log('   Please set GOOGLE_API_KEY in your .env file');
  console.log('   Get your key from: https://console.cloud.google.com/\n');
  process.exit(1);
}

console.log('🔧 Configuration loaded:');
console.log(`   PORT: ${process.env.PORT || 8080}`);
console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL}`);
console.log(`   GOOGLE_API_KEY: ${process.env.GOOGLE_API_KEY ? '✅ Set' : '❌ Missing'}`);
console.log('');

// Start the server
console.log('🚀 Starting backend server...\n');

const server = spawn('node', ['src/index.js'], {
  stdio: 'inherit',
  env: { ...process.env }
});

server.on('close', (code) => {
  console.log(`\n🛑 Backend server stopped with code ${code}`);
});

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down backend server...');
  server.kill('SIGINT');
  process.exit(0);
});
