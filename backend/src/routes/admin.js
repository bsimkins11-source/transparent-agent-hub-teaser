const express = require('express');
const router = express.Router();
const { db, admin } = require('../middleware/auth');
const Joi = require('joi');

// Validation schema for agent creation/update
const agentSchema = Joi.object({
  name: Joi.string().required().min(1).max(100),
  description: Joi.string().required().min(10).max(500),
  provider: Joi.string().valid('openai', 'google', 'anthropic').required(),
  route: Joi.string().required().pattern(/^\/agents\/[a-z0-9-]+$/),
  metadata: Joi.object({
    tags: Joi.array().items(Joi.string()),
    category: Joi.string().required()
  }).required(),
  visibility: Joi.string().valid('public', 'private').required(),
  allowedRoles: Joi.array().items(Joi.string().valid('admin', 'client'))
});

// GET /api/admin/agents - Get all agents (admin view)
router.get('/agents', async (req, res) => {
  try {
    const snapshot = await db.collection('agents').get();
    const agents = [];
    
    snapshot.forEach(doc => {
      agents.push({ id: doc.id, ...doc.data() });
    });
    
    res.json({ agents });
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

// POST /api/admin/agents - Create new agent
router.post('/agents', async (req, res) => {
  try {
    const { error, value } = agentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const agentData = {
      ...value,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('agents').add(agentData);
    
    res.status(201).json({ 
      id: docRef.id, 
      message: 'Agent created successfully' 
    });
  } catch (error) {
    console.error('Error creating agent:', error);
    res.status(500).json({ error: 'Failed to create agent' });
  }
});

// PUT /api/admin/agents/:id - Update agent
router.put('/agents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = agentSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const updateData = {
      ...value,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('agents').doc(id).update(updateData);
    
    res.json({ message: 'Agent updated successfully' });
  } catch (error) {
    console.error('Error updating agent:', error);
    res.status(500).json({ error: 'Failed to update agent' });
  }
});

// DELETE /api/admin/agents/:id - Delete agent
router.delete('/agents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if agent exists
    const doc = await db.collection('agents').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    await db.collection('agents').doc(id).delete();
    
    res.json({ message: 'Agent deleted successfully' });
  } catch (error) {
    console.error('Error deleting agent:', error);
    res.status(500).json({ error: 'Failed to delete agent' });
  }
});

// GET /api/admin/logs - Get agent usage logs
router.get('/logs', async (req, res) => {
  try {
    const { agentId, userId, limit = 50 } = req.query;
    
    let query = db.collection('agent_logs').orderBy('timestamp', 'desc');
    
    if (agentId) {
      query = query.where('agentId', '==', agentId);
    }
    
    if (userId) {
      query = query.where('userId', '==', userId);
    }
    
    const snapshot = await query.limit(parseInt(limit)).get();
    const logs = [];
    
    snapshot.forEach(doc => {
      logs.push({ id: doc.id, ...doc.data() });
    });
    
    res.json({ logs });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// GET /api/admin/users - Get all users
router.get('/users', async (req, res) => {
  try {
    const listUsersResult = await admin.auth().listUsers();
    const users = listUsersResult.users.map(user => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      customClaims: user.customClaims,
      disabled: user.disabled,
      createdAt: user.metadata.creationTime
    }));
    
    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST /api/admin/users/:uid/role - Set user role
router.post('/users/:uid/role', async (req, res) => {
  try {
    const { uid } = req.params;
    const { role } = req.body;
    
    if (!['admin', 'client'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be admin or client' });
    }

    const customClaims = { [role]: true };
    await admin.auth().setCustomUserClaims(uid, customClaims);
    
    res.json({ message: `User role set to ${role} successfully` });
  } catch (error) {
    console.error('Error setting user role:', error);
    res.status(500).json({ error: 'Failed to set user role' });
  }
});

// GET /api/admin/stats - Get system statistics
router.get('/stats', async (req, res) => {
  try {
    // Get total agents
    const agentsSnapshot = await db.collection('agents').get();
    const totalAgents = agentsSnapshot.size;
    
    // Get total interactions
    const logsSnapshot = await db.collection('agent_logs').get();
    const totalInteractions = logsSnapshot.size;
    
    // Get total users
    const listUsersResult = await admin.auth().listUsers();
    const totalUsers = listUsersResult.users.length;
    
    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentLogsSnapshot = await db.collection('agent_logs')
      .where('timestamp', '>=', sevenDaysAgo)
      .get();
    
    const recentInteractions = recentLogsSnapshot.size;
    
    res.json({
      totalAgents,
      totalInteractions,
      totalUsers,
      recentInteractions,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;
