const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc, arrayUnion, getDoc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAf2KwetCFEARZiaBP_QW07JVT1_tfZ_IY",
  authDomain: "ai-agent-hub-web-portal-79fb0.firebaseapp.com",
  projectId: "ai-agent-hub-web-portal-79fb0",
  storageBucket: "ai-agent-hub-web-portal-79fb0.firebasestorage.app",
  messagingSenderId: "72861076114",
  appId: "1:72861076114:web:1ea856ad05ef5f0eeef44b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const agentId = 'gemini-chat-agent';

async function forceAddGeminiToUser(userId) {
  try {
    console.log(`🚀 Force adding Gemini agent to user: ${userId}`);
    
    // Check if user exists
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.log('❌ User not found');
      return false;
    }
    
    const userData = userDoc.data();
    const currentAgents = userData.assignedAgents || [];
    
    console.log(`   Current agents: ${currentAgents.length}`);
    console.log(`   Has Gemini: ${currentAgents.includes(agentId)}`);
    
    if (currentAgents.includes(agentId)) {
      console.log('✅ User already has Gemini agent');
      return true;
    }
    
    // Force add Gemini agent
    console.log('🔧 Force adding Gemini agent...');
    await updateDoc(userDocRef, {
      assignedAgents: arrayUnion(agentId),
      updatedAt: new Date().toISOString()
    });
    
    console.log('✅ Gemini agent force-added successfully!');
    
    // Verify
    const updatedDoc = await getDoc(userDocRef);
    const updatedData = updatedDoc.data();
    const updatedAgents = updatedData.assignedAgents || [];
    
    console.log(`   Updated agents: ${updatedAgents.length}`);
    console.log(`   Has Gemini: ${updatedAgents.includes(agentId)}`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Error force-adding Gemini agent:', error);
    return false;
  }
}

async function main() {
  console.log('🔧 Force Add Gemini Agent Tool\n');
  
  const userId = process.argv[2];
  
  if (!userId) {
    console.log('❌ Please provide a user ID as an argument');
    console.log('   Usage: node force-add-gemini.js <USER_ID>');
    console.log('');
    console.log('💡 To get your user ID:');
    console.log('   1. Open your browser console on the Global Library page');
    console.log('   2. Type: console.log(window.currentUser?.uid)');
    console.log('   3. Copy the user ID and run this script with it');
    return;
  }
  
  console.log(`🎯 Force adding Gemini agent to user: ${userId}`);
  const success = await forceAddGeminiToUser(userId);
  
  if (success) {
    console.log('\n🎉 Success! Gemini agent has been force-added to your library.');
    console.log('💡 Now refresh your Global Library page and check "My Library" tab');
  } else {
    console.log('\n❌ Failed to force-add Gemini agent.');
  }
}

// Run the script
if (require.main === module) {
  main()
    .then(() => {
      console.log('\n✨ Script completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = {
  forceAddGeminiToUser
};
