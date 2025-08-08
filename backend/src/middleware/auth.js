const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID || 'ai-agent-hub-web-portal'
  });
}

const db = admin.firestore();

// Middleware to verify Firebase token
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Get user's custom claims
    const userRecord = await admin.auth().getUser(decodedToken.uid);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      admin: userRecord.customClaims?.admin || false,
      client: userRecord.customClaims?.client || false
    };
    
    next();
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
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      const userRecord = await admin.auth().getUser(decodedToken.uid);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        admin: userRecord.customClaims?.admin || false,
        client: userRecord.customClaims?.client || false
      };
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
  admin,
  db
};
