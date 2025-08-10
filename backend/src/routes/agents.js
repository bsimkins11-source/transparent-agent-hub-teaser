const express = require('express');
const router = express.Router();
const { db, optionalAuth } = require('../middleware/auth');
const agentService = require('../services/agentService');
const admin = require('firebase-admin');

// GET /api/agents - List all agents
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { visibility, category, provider, tags } = req.query;
    
    let query = db.collection('agents');
    
    // Only apply visibility filter if explicitly requested
    // This allows the global library to show all agents (public + private)
    if (visibility === 'public') {
      query = query.where('visibility', '==', 'public');
    } else if (visibility === 'private' && req.user) {
      // For private agents, check if user has access
      query = query.where('visibility', '==', 'private');
    }
    // If no visibility filter, get all agents
    
    // Apply additional filters
    if (category) {
      query = query.where('metadata.category', '==', category);
    }
    
    if (provider) {
      query = query.where('provider', '==', provider);
    }
    
    const snapshot = await query.get();
    const agents = [];
    
    snapshot.forEach(doc => {
      const agent = { id: doc.id, ...doc.data() };
      
      // Filter by tags if specified
      if (tags && agent.metadata?.tags) {
        const tagArray = Array.isArray(tags) ? tags : [tags];
        if (!tagArray.some(tag => agent.metadata.tags.includes(tag))) {
          return; // Skip this agent
        }
      }
      
      // Add access information for premium agents
      if (agent.metadata?.tier === 'premium') {
        agent.accessInfo = {
          requiresApproval: agent.metadata.permissionType === 'approval',
          userHasAccess: req.user && (req.user.admin || req.user.client),
          accessMessage: agent.metadata.permissionType === 'approval' 
            ? 'Premium access requires admin approval' 
            : 'Premium access available'
        };
      }
      
      agents.push(agent);
    });
    
    res.json({ agents });
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

// GET /api/agents/categories - Get all categories
router.get('/categories', async (req, res) => {
  try {
    const snapshot = await db.collection('agents')
      .where('visibility', '==', 'public')
      .get();
    
    const categories = new Set();
    snapshot.forEach(doc => {
      const category = doc.data().metadata?.category;
      if (category) {
        categories.add(category);
      }
    });
    
    res.json({ categories: Array.from(categories) });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/agents/providers - Get all providers
router.get('/providers', async (req, res) => {
  try {
    const snapshot = await db.collection('agents')
      .where('visibility', '==', 'public')
      .get();
    
    const providers = new Set();
    snapshot.forEach(doc => {
      const provider = doc.data().provider;
      if (provider) {
        providers.add(provider);
      }
    });
    
    res.json({ providers: Array.from(providers) });
  } catch (error) {
    console.error('Error fetching providers:', error);
    res.status(500).json({ error: 'Failed to fetch providers' });
  }
});

// GET /api/agents/:id - Get specific agent
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('agents').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    const agent = { id: doc.id, ...doc.data() };
    
    // Check access for private agents
    if (agent.visibility === 'private' && (!req.user || !req.user.admin)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json({ agent });
  } catch (error) {
    console.error('Error fetching agent:', error);
    res.status(500).json({ error: 'Failed to fetch agent' });
  }
});

// POST /api/agents/:id/interact - Interact with an agent
router.post('/:id/interact', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { message, context = '' } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const doc = await db.collection('agents').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    const agent = { id: doc.id, ...doc.data() };
    
    // Check access for private agents
    if (agent.visibility === 'private' && (!req.user || (!req.user.admin && !req.user.client))) {
      return res.status(403).json({ error: 'Access denied. This agent requires special permissions.' });
    }
    
    // Pass user context for premium access control
    const userContext = req.user ? { user: req.user } : {};
    
    const response = await agentService.processInteraction(agent, message, context, userContext);
    
    // Log the interaction
    if (req.user) {
      await db.collection('agent_logs').add({
        userId: req.user.uid,
        agentId: id,
        message,
        response: response.substring(0, 500), // Limit response length in log
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    res.json({ response });
  } catch (error) {
    console.error('Error processing agent interaction:', error);
    
    // Handle specific access control errors
    if (error.message.includes('Premium agent access')) {
      return res.status(403).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to process interaction' });
  }
});

module.exports = router;
