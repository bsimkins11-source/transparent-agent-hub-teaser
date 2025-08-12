// Simple local authentication middleware (Firebase removed)

// Mock database for local development
const db = {
  // Mock database methods
  collection: () => ({
    doc: () => ({
      get: async () => ({ exists: false, data: () => ({}) }),
      set: async () => ({}),
      update: async () => ({}),
      delete: async () => ({})
    })
  })
};

// Middleware to verify authentication token
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Simple token validation for local development
    // In production, this would validate against a proper auth service
    if (token === 'local-dev-token') {
      req.user = {
        uid: 'local-user-123',
        email: 'local@example.com',
        admin: true,
        client: true
      };
      next();
    } else {
      res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Middleware to require admin role
const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.admin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Middleware to require client role
const requireClient = (req, res, next) => {
  if (!req.user || !req.user.client) {
    return res.status(403).json({ error: 'Client access required' });
  }
  next();
};

// Optional auth - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1];
      
      // Simple token validation for local development
      if (token === 'local-dev-token') {
        req.user = {
          uid: 'local-user-123',
          email: 'local@example.com',
          admin: true,
          client: true
        };
      }
    }
    
    next();
  } catch (error) {
    // Continue without user if token is invalid
    next();
  }
};

module.exports = {
  requireAuth,
  requireAdmin,
  requireClient,
  optionalAuth,
  db
};
