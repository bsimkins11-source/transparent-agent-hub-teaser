const express = require('express');
const path = require('path');
const app = express();

// Set aggressive no-cache headers for all routes
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, 'build'), {
  setHeaders: (res, path) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
}));

// Handle React routing - serve index.html for all routes
app.get('*', (req, res) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Cloud Run requires using the PORT environment variable
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Frontend server listening on port ${port}`);
  console.log(`🔥 No caching - changes will be immediate!`);
  console.log(`☁️ Ready for Cloud Run deployment!`);
  console.log(`🌐 Server running at http://0.0.0.0:${port}`);
});
