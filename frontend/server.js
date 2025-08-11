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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('🚨 Express error:', err);
  res.status(500).send('Something broke!');
});

// Cloud Run requires using the PORT environment variable
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Frontend server listening on port ${port}`);
  console.log(`🔥 No caching - changes will be immediate!`);
  console.log(`☁️ Ready for Cloud Run deployment!`);
  console.log(`🌐 Server running at http://0.0.0.0:${port}`);
  console.log(`📁 Build directory: ${path.join(__dirname, 'build')}`);
  console.log(`📁 Current directory: ${__dirname}`);
});
