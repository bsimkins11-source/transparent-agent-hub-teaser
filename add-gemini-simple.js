const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc, arrayUnion, getDoc, collection, getDocs } = require('firebase/firestore');

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

async function listUsers() {
  try {
    console.log('🔍 Listing all users...\n');
    
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    if (snapshot.empty) {
      console.log('❌ No users found in the system');
      return;
    }
    
    console.log(`✅ Found ${snapshot.size} users:\n`);
    
    snapshot.forEach((doc, index) => {
      const userData = doc.data();
      console.log(`${index + 1}. User ID: ${doc.id}`);
      console.log(`   Email: ${userData.email || 'No email'}`);
      console.log(`   Name: ${userData.name || 'No name'}`);
      console.log(`   Role: ${userData.role || 'No role'}`);
      console.log(`   Organization: ${userData.organizationId || 'None'}`);
      console.log(`   Assigned Agents: ${(userData.assignedAgents || []).length}`);
      console.log('');
    });
    
    return snapshot.docs;
    
  } catch (error) {
    console.error('❌ Error listing users:', error);
    return [];
  }
}

async function addGeminiToUser(userId) {
  try {
    console.log(`🚀 Adding Gemini agent to user: ${userId}`);
    
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
    
    // Add Gemini agent
    await updateDoc(userDocRef, {
      assignedAgents: arrayUnion(agentId),
      updatedAt: new Date().toISOString()
    });
    
    console.log('✅ Gemini agent added successfully!');
    
    // Verify
    const updatedDoc = await getDoc(userDocRef);
    const updatedData = updatedDoc.data();
    const updatedAgents = updatedData.assignedAgents || [];
    
    console.log(`   Updated agents: ${updatedAgents.length}`);
    console.log(`   Has Gemini: ${updatedAgents.includes(agentId)}`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Error adding Gemini agent:', error);
    return false;
  }
}

async function main() {
  console.log('🔧 Gemini Agent Addition Tool\n');
  
  try {
    // List all users first
    const users = await listUsers();
    
    if (!users || users.length === 0) {
      return;
    }
    
    // Ask which user to add Gemini to
    console.log('💡 To add Gemini agent to a specific user, run:');
    console.log('   node add-gemini-simple.js USER_ID');
    console.log('');
    console.log('📝 Or you can manually copy a user ID from the list above and run:');
    console.log('   node add-gemini-simple.js <USER_ID>');
    
    // If a user ID was provided as command line argument
    const userId = process.argv[2];
    if (userId) {
      console.log(`\n🎯 Adding Gemini agent to user: ${userId}`);
      const success = await addGeminiToUser(userId);
      if (success) {
        console.log('\n🎉 Success! Gemini agent has been added to the user library.');
      } else {
        console.log('\n❌ Failed to add Gemini agent.');
      }
    }
    
  } catch (error) {
    console.error('💥 Script failed:', error);
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
  listUsers,
  addGeminiToUser
};
