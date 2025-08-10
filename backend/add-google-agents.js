#!/usr/bin/env node

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'ai-agent-hub-web-portal-79fb0'
  });
}

const db = admin.firestore();

const googleAgents = [
  {
    id: 'gemini-chat-agent',
    name: 'Gemini Chat Agent',
    description: 'Advanced conversational AI powered by Google\'s Gemini model. Engage in natural conversations, get help with creative tasks, research, coding, and general questions with access to current information.',
    provider: 'google',
    route: '/agents/gemini-chat-agent',
    metadata: {
      tags: ['conversation', 'general-purpose', 'research', 'creative', 'coding', 'analysis'],
      category: 'General AI'
    },
    visibility: 'public',
    allowedRoles: ['admin', 'client', 'user'],
    capabilities: [
      'Natural conversation',
      'Current information access',
      'Creative writing assistance',
      'Code help and debugging',
      'Research and analysis',
      'Problem solving',
      'Question answering'
    ],
    pricing: {
      tier: 'free',
      limits: {
        daily: 100,
        monthly: 2000
      }
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    id: 'imagen-agent',
    name: 'Google Imagen Agent',
    description: 'AI-powered image generation using Google\'s Imagen model. Create high-quality images from text descriptions, get help crafting effective prompts, and explore various artistic styles. **PREMIUM ACCESS REQUIRED** - Contact admin for approval.',
    provider: 'google',
    route: '/agents/imagen-agent',
    metadata: {
      tags: ['image-generation', 'creative', 'art', 'design', 'visual', 'premium', 'request-only'],
      category: 'Creative AI',
      tier: 'premium',
      permissionType: 'approval'
    },
    visibility: 'private',
    allowedRoles: ['admin', 'client'],
    capabilities: [
      'Text-to-image generation',
      'Prompt crafting assistance',
      'Multiple artistic styles',
      'High-resolution outputs',
      'Creative concept visualization',
      'Design ideation support'
    ],
    pricing: {
      tier: 'premium',
      limits: {
        daily: 20,
        monthly: 500
      }
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

async function addGoogleAgents() {
  console.log('🤖 Adding Google agents to Firestore...\n');
  
  try {
    const batch = db.batch();
    
    for (const agent of googleAgents) {
      const agentRef = db.collection('agents').doc(agent.id);
      batch.set(agentRef, agent);
      console.log(`✅ Prepared ${agent.name} for addition`);
    }
    
    await batch.commit();
    console.log('\n🎉 Successfully added all Google agents to Firestore!');
    
    // Verify the agents were added
    console.log('\n📋 Verifying agents in database...');
    for (const agent of googleAgents) {
      const doc = await db.collection('agents').doc(agent.id).get();
      if (doc.exists) {
        console.log(`✅ ${agent.name} - Verified in database`);
      } else {
        console.log(`❌ ${agent.name} - Not found in database`);
      }
    }
    
    console.log('\n🚀 Google agents are ready to use!');
    console.log('📝 Next steps:');
    console.log('   1. Deploy the updated backend with new agent configurations');
    console.log('   2. Test the agents through the UI');
    console.log('   3. Configure any additional permissions in the admin dashboard');
    
  } catch (error) {
    console.error('❌ Error adding agents:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  addGoogleAgents()
    .then(() => {
      console.log('\n✨ Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { addGoogleAgents };
