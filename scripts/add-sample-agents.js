const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('../backend/service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'ai-agent-hub-web-portal-79fb0'
});

const db = admin.firestore();

const sampleAgents = [
  {
    name: "Test Agent 1",
    description: "A simple test agent for basic functionality.",
    provider: "openai",
    route: "/agents/test-1",
    metadata: {
      tags: ["test", "simple"],
      category: "Test"
    },
    visibility: "public",
    allowedRoles: ["admin", "client"]
  },
  {
    name: "Test Agent 2",
    description: "Another simple test agent.",
    provider: "google",
    route: "/agents/test-2",
    metadata: {
      tags: ["test", "demo"],
      category: "Test"
    },
    visibility: "public",
    allowedRoles: ["admin", "client"]
  },
  {
    name: "Test Agent 3",
    description: "Third test agent for demonstration.",
    provider: "anthropic",
    route: "/agents/test-3",
    metadata: {
      tags: ["test", "demo"],
      category: "Test"
    },
    visibility: "public",
    allowedRoles: ["admin", "client"]
  }
];

async function addSampleAgents() {
  try {
    console.log('Adding simple test agents to Firestore...');
    
    for (const agent of sampleAgents) {
      const docRef = await db.collection('agents').add({
        ...agent,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`✅ Added agent: ${agent.name} (ID: ${docRef.id})`);
    }
    
    console.log('🎉 All test agents added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding agents:', error);
    process.exit(1);
  }
}

addSampleAgents();
