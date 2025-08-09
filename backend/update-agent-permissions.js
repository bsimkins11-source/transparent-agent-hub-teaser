const admin = require('firebase-admin');

// Initialize Firebase Admin with application default credentials
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'ai-agent-hub-web-portal-79fb0'
  });
}

const db = admin.firestore();

async function updateAgentPermissions() {
  console.log('🔧 Updating agent permissions...');

  const updates = [
    {
      id: 'gemini-chat-agent',
      data: {
        metadata: {
          tags: ['chat', 'conversation', 'google', 'ai'],
          category: 'Productivity',
          permissionType: 'direct', // Can be directly added to user library
          tier: 'free'
        }
      }
    },
    {
      id: 'imagen-agent',
      data: {
        metadata: {
          tags: ['image', 'generation', 'creative', 'google', 'ai'],
          category: 'Creative',
          permissionType: 'approval', // Requires admin approval
          tier: 'premium'
        }
      }
    }
  ];

  for (const update of updates) {
    const agentRef = db.collection('agents').doc(update.id);
    try {
      await agentRef.set(update.data, { merge: true });
      console.log(`✅ Updated ${update.id} - ${update.data.metadata.permissionType} assignment (${update.data.metadata.tier})`);
    } catch (error) {
      console.error(`❌ Failed to update ${update.id}:`, error);
    }
  }

  console.log('\n🎉 Agent permissions updated successfully!');
  console.log('\n📋 Permission Summary:');
  updates.forEach(update => {
    const name = update.id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    console.log(`   • ${name}: ${update.data.metadata.permissionType} assignment (${update.data.metadata.tier} tier)`);
  });
}

updateAgentPermissions().catch(console.error);