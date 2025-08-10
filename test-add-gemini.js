const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc, arrayUnion, getDoc } = require('firebase/firestore');

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

async function testAddGeminiAgent() {
  try {
    console.log('🧪 Testing Gemini Agent Addition...\n');

    // Replace with your actual user ID
    const userId = 'YOUR_USER_ID_HERE';
    const agentId = 'gemini-chat-agent';

    if (userId === 'YOUR_USER_ID_HERE') {
      console.log('❌ Please update the userId variable with your actual user ID');
      console.log('   You can find this in your browser console or by checking your user profile');
      return;
    }

    // 1. Check current user document
    console.log('1. Checking current user document...');
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.log('❌ User document not found. Please check the userId.');
      return;
    }

    const userData = userDoc.data();
    console.log('   Current user data:', {
      email: userData.email,
      displayName: userData.displayName,
      assignedAgents: userData.assignedAgents || []
    });

    // 2. Check if Gemini agent is already assigned
    const hasGemini = userData.assignedAgents?.includes(agentId);
    if (hasGemini) {
      console.log('✅ Gemini agent is already assigned to this user');
      return;
    }

    // 3. Add Gemini agent to user's library
    console.log('\n2. Adding Gemini agent to user library...');
    await updateDoc(userDocRef, {
      assignedAgents: arrayUnion(agentId),
      updatedAt: new Date().toISOString()
    });

    console.log('✅ Gemini agent added successfully!');

    // 4. Verify the addition
    console.log('\n3. Verifying the addition...');
    const updatedUserDoc = await getDoc(userDocRef);
    const updatedUserData = updatedUserDoc.data();
    
    console.log('   Updated assigned agents:', updatedUserData.assignedAgents);
    
    if (updatedUserData.assignedAgents?.includes(agentId)) {
      console.log('✅ Verification successful! Gemini agent is now in your library.');
    } else {
      console.log('❌ Verification failed! Gemini agent was not added.');
    }

  } catch (error) {
    console.error('❌ Error during test:', error);
  }
}

// Run the test
testAddGeminiAgent()
  .then(() => {
    console.log('\n🧪 Test complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
