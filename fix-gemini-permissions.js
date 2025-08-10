const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc, getDoc } = require('firebase/firestore');

// Firebase config for production
const firebaseConfig = {
  apiKey: "AIzaSyBxGxGxGxGxGxGxGxGxGxGxGxGxGxGxGx",
  authDomain: "ai-agent-hub-web-portal-79fb0.firebaseapp.com",
  projectId: "ai-agent-hub-web-portal-79fb0",
  storageBucket: "ai-agent-hub-web-portal-79fb0.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixGeminiPermissions() {
  try {
    console.log('🔧 Fixing Gemini Agent Permissions...\n');
    
    const agentId = 'gemini-chat-agent';
    const agentRef = doc(db, 'agents', agentId);
    
    // First, let's see what the current agent looks like
    console.log('📋 Checking current agent metadata...');
    const agentDoc = await getDoc(agentRef);
    
    if (!agentDoc.exists()) {
      console.log('❌ Agent not found!');
      return;
    }
    
    const currentData = agentDoc.data();
    console.log('Current agent data:', JSON.stringify(currentData, null, 2));
    
    // Check if visibility field exists and is set to 'global'
    if (currentData.visibility !== 'global') {
      console.log('🔒 Setting visibility to "global"...');
      
      const updateData = {
        visibility: 'global',
        // Ensure other required fields are present
        submitterId: currentData.submitterId || 'system',
        organizationId: null, // Global agents don't belong to specific orgs
        networkId: null,      // Global agents don't belong to specific networks
        updatedAt: new Date()
      };
      
      await updateDoc(agentRef, updateData);
      console.log('✅ Visibility updated to "global"');
    } else {
      console.log('✅ Visibility already set to "global"');
    }
    
    // Also check if the agent has the required fields for the security rules
    const requiredFields = ['visibility', 'submitterId'];
    const missingFields = requiredFields.filter(field => !currentData[field]);
    
    if (missingFields.length > 0) {
      console.log(`⚠️  Missing required fields: ${missingFields.join(', ')}`);
      console.log('🔧 Adding missing fields...');
      
      const additionalUpdates = {};
      missingFields.forEach(field => {
        if (field === 'submitterId') {
          additionalUpdates[field] = 'system';
        }
      });
      
      if (Object.keys(additionalUpdates).length > 0) {
        await updateDoc(agentRef, additionalUpdates);
        console.log('✅ Missing fields added');
      }
    }
    
    console.log('\n🎯 Gemini agent permissions fixed!');
    console.log('The agent should now be accessible to all authenticated users.');
    
  } catch (error) {
    console.error('❌ Error fixing permissions:', error);
  }
}

fixGeminiPermissions();
