const express = require('express');
const path = require('path');
const app = express();

// Add error handling for uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('🚨 Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Set aggressive no-cache headers for all routes
app.use((req, res, next) => {
  try {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
  } catch (error) {
    console.error('🚨 Error in middleware:', error);
    next(error);
  }
});

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, 'build'), {
  setHeaders: (res, filePath) => {
    try {
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0, proxy-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
    } catch (error) {
      console.error('🚨 Error setting headers for:', filePath, error);
    }
  }
}));

// Handle React routing - serve index.html for all routes
app.get('*', (req, res) => {
  try {
    console.log(`📡 Serving route: ${req.path}`);
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  } catch (error) {
    console.error('🚨 Error serving route:', req.path, error);
    res.status(500).send('Internal Server Error');
  }
});

// Health check endpoint for Cloud Run
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'production',
    port: process.env.PORT || 8080
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('🚨 Express error:', err);
  res.status(500).send('Something broke!');
});

// Cloud Run requires using the PORT environment variable
const port = process.env.PORT || 8080;

// Start the server with proper error handling
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Frontend server listening on port ${port}`);
  console.log(`🔥 No caching - changes will be immediate!`);
  console.log(`☁️ Ready for Cloud Run deployment!`);
  console.log(`🌐 Server running at http://0.0.0.0:${port}`);
  console.log(`📁 Build directory: ${path.join(__dirname, 'build')}`);
  console.log(`📁 Current directory: ${__dirname}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`📦 PORT env var: ${process.env.PORT}`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('🚨 Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error('🚨 Port is already in use');
  }
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
