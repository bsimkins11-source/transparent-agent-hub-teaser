const express = require('express');
const path = require('path');
const app = express();

console.log('🚀 Starting server...');
console.log('📁 Current directory:', __dirname);
console.log('📁 Build directory:', path.join(__dirname, 'build'));

// Simple static file serving
app.use(express.static(path.join(__dirname, 'build')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Serve index.html for all other routes (React routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start server
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${port}`);
  console.log(`🌐 Health check: http://localhost:${port}/health`);
});
