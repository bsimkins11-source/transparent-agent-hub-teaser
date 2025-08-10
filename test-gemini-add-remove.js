const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc, arrayUnion, arrayRemove, getDoc } = require('firebase/firestore');

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

async function testGeminiAddRemove() {
  try {
    console.log('🧪 Testing Gemini Agent Add/Remove Functionality...\n');

    // Replace with your actual user ID
    const userId = 'YOUR_USER_ID_HERE';
    const agentId = 'gemini-chat-agent';

    if (userId === 'YOUR_USER_ID_HERE') {
      console.log('❌ Please update the userId variable with your actual user ID');
      console.log('   You can find this in your browser console or by checking your user profile');
      return;
    }

    // 1. Check initial state
    console.log('1. Checking initial state...');
    const userDocRef = doc(db, 'users', userId);
    const initialUserDoc = await getDoc(userDocRef);
    
    if (!initialUserDoc.exists()) {
      console.log('❌ User document not found. Please check the userId.');
      return;
    }

    const initialUserData = initialUserDoc.data();
    const initialAssignedAgents = initialUserData.assignedAgents || [];
    console.log('   Initial assigned agents:', initialAssignedAgents);
    console.log('   Has Gemini agent:', initialAssignedAgents.includes(agentId));

    // 2. Remove Gemini agent (if it exists)
    if (initialAssignedAgents.includes(agentId)) {
      console.log('\n2. Removing Gemini agent from library...');
      await updateDoc(userDocRef, {
        assignedAgents: arrayRemove(agentId),
        updatedAt: new Date().toISOString()
      });
      console.log('✅ Gemini agent removed successfully!');
    } else {
      console.log('\n2. Gemini agent not in library, skipping removal...');
    }

    // 3. Verify removal
    console.log('\n3. Verifying removal...');
    const afterRemovalDoc = await getDoc(userDocRef);
    const afterRemovalData = afterRemovalDoc.data();
    const afterRemovalAgents = afterRemovalData.assignedAgents || [];
    console.log('   Agents after removal:', afterRemovalAgents);
    console.log('   Has Gemini agent:', afterRemovalAgents.includes(agentId));

    if (afterRemovalAgents.includes(agentId)) {
      console.log('❌ Gemini agent still in library after removal!');
      return;
    } else {
      console.log('✅ Gemini agent successfully removed from library');
    }

    // 4. Add Gemini agent back
    console.log('\n4. Adding Gemini agent back to library...');
    await updateDoc(userDocRef, {
      assignedAgents: arrayUnion(agentId),
      updatedAt: new Date().toISOString()
    });
    console.log('✅ Gemini agent added back successfully!');

    // 5. Verify addition
    console.log('\n5. Verifying addition...');
    const afterAdditionDoc = await getDoc(userDocRef);
    const afterAdditionData = afterAdditionDoc.data();
    const afterAdditionAgents = afterAdditionData.assignedAgents || [];
    console.log('   Agents after addition:', afterAdditionAgents);
    console.log('   Has Gemini agent:', afterAdditionAgents.includes(agentId));

    if (afterAdditionAgents.includes(agentId)) {
      console.log('✅ Gemini agent successfully added back to library');
    } else {
      console.log('❌ Gemini agent not found in library after addition!');
      return;
    }

    // 6. Final verification
    console.log('\n6. Final verification...');
    const finalUserDoc = await getDoc(userDocRef);
    const finalUserData = finalUserDoc.data();
    const finalAssignedAgents = finalUserData.assignedAgents || [];
    
    console.log('   Final assigned agents:', finalAssignedAgents);
    console.log('   Final count:', finalAssignedAgents.length);
    
    if (finalAssignedAgents.includes(agentId)) {
      console.log('✅ Final verification successful! Gemini agent is in library');
    } else {
      console.log('❌ Final verification failed! Gemini agent not in library');
    }

    console.log('\n🎉 Test completed successfully!');
    console.log('✅ Add/Remove functionality is working correctly');

  } catch (error) {
    console.error('❌ Error during test:', error);
  }
}

// Run the test
testGeminiAddRemove()
  .then(() => {
    console.log('\n🧪 Test complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
