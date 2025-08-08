const express = require('express');
const router = express.Router();
const { db, optionalAuth, admin } = require('../middleware/auth');
const agentService = require('../services/agentService');

// GET /api/agents - List all agents
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { visibility = 'public', category, provider, tags } = req.query;
    
    let query = db.collection('agents');
    
    // Filter by visibility
    if (visibility === 'public') {
      query = query.where('visibility', '==', 'public');
    } else if (visibility === 'private' && req.user) {
      // For private agents, check if user has access
      query = query.where('visibility', '==', 'private');
    }
    
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
      
      agents.push(agent);
    });
    
    res.json({ agents });
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
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
    const { message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Get agent details
    const doc = await db.collection('agents').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    const agent = { id: doc.id, ...doc.data() };
    
    // Check access for private agents
    if (agent.visibility === 'private' && (!req.user || !req.user.admin)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Process the interaction
    const response = await agentService.processInteraction(agent, message, context);
    
    // Log the interaction if user is authenticated
    if (req.user) {
      await db.collection('agent_logs').add({
        userId: req.user.uid,
        agentId: id,
        message,
        response: response.substring(0, 500), // Truncate for storage
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    res.json({ response });
  } catch (error) {
    console.error('Error processing interaction:', error);
    res.status(500).json({ error: 'Failed to process interaction' });
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

module.exports = router;
