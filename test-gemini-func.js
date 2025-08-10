const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc, arrayUnion, arrayRemove, getDoc } = require('firebase/firestore');

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

async function testGeminiAddRemove() {
  try {
    console.log('🧪 Testing Gemini Agent Add/Remove...\n');
    
    const userId = 'bryan.simkins@transparent.partners';
    const agentId = 'gemini-chat-agent';
    
    // Check current state
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.log('❌ User not found');
      return;
    }
    
    const userData = userDoc.data();
    const currentAgents = userData.assignedAgents || [];
    console.log('Current agents:', currentAgents);
    
    // Test remove
    if (currentAgents.includes(agentId)) {
      console.log('Removing Gemini agent...');
      await updateDoc(userRef, {
        assignedAgents: arrayRemove(agentId),
        updatedAt: new Date().toISOString()
      });
      console.log('✅ Removed');
    }
    
    // Test add
    console.log('Adding Gemini agent...');
    await updateDoc(userRef, {
      assignedAgents: arrayUnion(agentId),
      updatedAt: new Date().toISOString()
    });
    console.log('✅ Added');
    
    // Verify
    const finalDoc = await getDoc(userRef);
    const finalData = finalDoc.data();
    const finalAgents = finalData.assignedAgents || [];
    console.log('Final agents:', finalAgents);
    
    if (finalAgents.includes(agentId)) {
      console.log('🎉 Test PASSED! Add/Remove functionality works');
    } else {
      console.log('❌ Test FAILED! Agent not found after add');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testGeminiAddRemove();
