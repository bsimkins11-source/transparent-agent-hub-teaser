const admin = require('firebase-admin');

// Initialize Firebase Admin with application default credentials
const app = admin.initializeApp({
  projectId: 'ai-agent-hub-web-portal-79fb0'
});

const db = admin.firestore();

const googleAgents = [
  {
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
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Google Imagen Agent',
    description: 'AI-powered image generation using Google\'s Imagen model. Create high-quality images from text descriptions, get help crafting effective prompts, and explore various artistic styles.',
    provider: 'google',
    route: '/agents/imagen-agent',
    metadata: {
      tags: ['image-generation', 'creative', 'art', 'design', 'visual', 'prompting'],
      category: 'Creative AI'
    },
    visibility: 'public',
    allowedRoles: ['admin', 'client', 'user'],
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
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function addAgents() {
  console.log('🤖 Adding Google agents to Firestore...\n');
  
  try {
    for (const agent of googleAgents) {
      const agentId = agent.route.replace('/agents/', '');
      const docRef = db.collection('agents').doc(agentId);
      
      await docRef.set(agent);
      console.log(`✅ Added ${agent.name} (ID: ${agentId})`);
    }
    
    console.log('\n🎉 Successfully added all Google agents to Firestore!');
    console.log('\n📋 Verifying agents in database...');
    
    for (const agent of googleAgents) {
      const agentId = agent.route.replace('/agents/', '');
      const doc = await db.collection('agents').doc(agentId).get();
      if (doc.exists) {
        console.log(`✅ ${agent.name} - Verified in database`);
      } else {
        console.log(`❌ ${agent.name} - Not found in database`);
      }
    }
    
    console.log('\n🚀 Google agents are ready to use!');
    console.log('🌐 Test them at: https://ai-agent-hub-web-portal-79fb0.web.app/agents');
    
  } catch (error) {
    console.error('❌ Error adding agents:', error);
    process.exit(1);
  }
}

addAgents()
  .then(() => {
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
