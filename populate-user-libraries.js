const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc, arrayUnion, getDocs, collection } = require('firebase/firestore');

// Firebase configuration - you'll need to add your actual config here
const firebaseConfig = {
  // Add your Firebase config here
  // apiKey: "your-api-key",
  // authDomain: "your-project.firebaseapp.com",
  // projectId: "your-project-id",
  // storageBucket: "your-project.appspot.com",
  // messagingSenderId: "your-sender-id",
  // appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function populateUserLibraries() {
  try {
    console.log('🔧 Populating User Libraries with Gemini Agent...\n');

    const agentId = 'gemini-chat-agent';

    // 1. Check if Gemini agent exists in global collection
    console.log('1. Checking if Gemini agent exists in global collection...');
    const agentDoc = await getDocs(collection(db, 'agents'));
    const agents = [];
    agentDoc.forEach(doc => {
      agents.push({
        id: doc.id,
        name: doc.data().name
      });
    });
    
    const geminiAgent = agents.find(a => a.id === agentId);
    if (!geminiAgent) {
      console.log('❌ Gemini agent not found in global collection. Please run add-agents-direct.js first.');
      return;
    }
    console.log(`✅ Found Gemini agent: ${geminiAgent.name}`);

    // 2. Get all users
    console.log('\n2. Getting all users...');
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const users = [];
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      users.push({
        id: doc.id,
        email: data.email,
        displayName: data.displayName,
        assignedAgents: data.assignedAgents || []
      });
    });
    
    console.log(`   Found ${users.length} users`);

    // 3. Add Gemini agent to users who don't have it
    console.log('\n3. Adding Gemini agent to user libraries...');
    let addedCount = 0;
    let alreadyHadCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        if (user.assignedAgents.includes(agentId)) {
          console.log(`   ✅ User ${user.email} already has Gemini agent`);
          alreadyHadCount++;
          continue;
        }

        // Add Gemini agent to user's library
        await updateDoc(doc(db, 'users', user.id), {
          assignedAgents: arrayUnion(agentId),
          updatedAt: new Date().toISOString()
        });

        console.log(`   ✅ Added Gemini agent to ${user.email}`);
        addedCount++;

      } catch (error) {
        console.log(`   ❌ Failed to add Gemini agent to ${user.email}: ${error.message}`);
        errorCount++;
      }
    }

    // 4. Summary
    console.log('\n4. Summary:');
    console.log(`   ✅ Users who already had Gemini agent: ${alreadyHadCount}`);
    console.log(`   ✅ Users who got Gemini agent added: ${addedCount}`);
    if (errorCount > 0) {
      console.log(`   ❌ Users with errors: ${errorCount}`);
    }
    
    console.log(`\n🚀 Total users with Gemini agent: ${alreadyHadCount + addedCount}`);
    console.log('   You should now see the Gemini agent in your personal library when you refresh the page.');

  } catch (error) {
    console.error('❌ Error during process:', error);
  }
}

// Run the function
populateUserLibraries()
  .then(() => {
    console.log('\n🔧 Process complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Process failed:', error);
    process.exit(1);
  });
