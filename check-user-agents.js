const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

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

async function checkUserAgents(userId) {
  try {
    console.log(`🔍 Checking user document for: ${userId}`);
    
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.log('❌ User document not found');
      return;
    }
    
    const userData = userDoc.data();
    const assignedAgents = userData.assignedAgents || [];
    
    console.log('✅ User document found:');
    console.log(`   Email: ${userData.email || 'No email'}`);
    console.log(`   Name: ${userData.name || 'No name'}`);
    console.log(`   Role: ${userData.role || 'No role'}`);
    console.log(`   Organization: ${userData.organizationId || 'None'}`);
    console.log(`   Assigned Agents: ${assignedAgents.length}`);
    
    if (assignedAgents.length > 0) {
      console.log('\n📋 Current assigned agents:');
      assignedAgents.forEach((agentId, index) => {
        console.log(`   ${index + 1}. ${agentId}`);
      });
    } else {
      console.log('\n📭 No agents currently assigned');
    }
    
    // Check specifically for Gemini
    const hasGemini = assignedAgents.includes('gemini-chat-agent');
    console.log(`\n🤖 Has Gemini agent: ${hasGemini ? '✅ YES' : '❌ NO'}`);
    
    if (!hasGemini) {
      console.log('\n💡 To add Gemini agent, run:');
      console.log(`   node force-add-gemini.js ${userId}`);
    }
    
  } catch (error) {
    console.error('❌ Error checking user agents:', error);
  }
}

async function main() {
  console.log('🔧 User Agents Check Tool\n');
  
  const userId = process.argv[2];
  
  if (!userId) {
    console.log('❌ Please provide a user ID as an argument');
    console.log('   Usage: node check-user-agents.js <USER_ID>');
    console.log('');
    console.log('💡 To get your user ID:');
    console.log('   1. Open your browser console on the Global Library page');
    console.log('   2. Type: console.log(window.currentUser?.uid)');
    console.log('   3. Copy the user ID and run this script with it');
    return;
  }
  
  await checkUserAgents(userId);
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
  checkUserAgents
};
