const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

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

async function testGeminiAccess() {
  try {
    console.log('🧪 Testing Gemini Agent Access After Security Fix...\n');
    
    // Try to fetch agents from the agents collection
    console.log('📋 Attempting to fetch agents...');
    const agentsRef = collection(db, 'agents');
    const agentsSnapshot = await getDocs(agentsRef);
    
    if (agentsSnapshot.empty) {
      console.log('❌ No agents found in collection');
      return;
    }
    
    console.log(`✅ Successfully fetched ${agentsSnapshot.size} agents!`);
    
    // Look for the Gemini agent specifically
    let geminiAgent = null;
    agentsSnapshot.forEach(doc => {
      const data = doc.data();
      if (doc.id === 'gemini-chat-agent') {
        geminiAgent = { id: doc.id, ...data };
      }
    });
    
    if (geminiAgent) {
      console.log('🎯 Gemini agent found:');
      console.log('  ID:', geminiAgent.id);
      console.log('  Name:', geminiAgent.name);
      console.log('  Visibility:', geminiAgent.visibility || 'not set');
      console.log('  Submitter ID:', geminiAgent.submitterId || 'not set');
      console.log('  Organization ID:', geminiAgent.organizationId || 'not set');
      console.log('  Network ID:', geminiAgent.networkId || 'not set');
    } else {
      console.log('❌ Gemini agent not found in collection');
    }
    
    console.log('\n🎉 Security rules fix successful!');
    console.log('The frontend should now be able to access agents.');
    
  } catch (error) {
    console.error('❌ Error testing access:', error);
  }
}

testGeminiAccess();
