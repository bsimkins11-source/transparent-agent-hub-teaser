const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'ai-agent-hub-web-portal-79fb0'
  });
}

const db = admin.firestore();

async function addGeminiToUserLibrary() {
  try {
    console.log('🔧 Adding Gemini Agent to User Library...\n');

    // Replace with your actual user ID
    const userId = 'YOUR_USER_ID_HERE';
    const agentId = 'gemini-chat-agent';

    if (userId === 'YOUR_USER_ID_HERE') {
      console.log('❌ Please update the userId variable with your actual user ID');
      console.log('   You can find this in your browser console or by checking your user profile');
      console.log('   Or run this script with: node add-gemini-to-user-library.js YOUR_USER_ID');
      return;
    }

    // 1. Check current user document
    console.log('1. Checking current user document...');
    const userDocRef = db.collection('users').doc(userId);
    const userDoc = await userDocRef.get();
    
    if (!userDoc.exists) {
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
    await userDocRef.update({
      assignedAgents: admin.firestore.FieldValue.arrayUnion(agentId),
      updatedAt: new Date().toISOString()
    });

    console.log('✅ Gemini agent added successfully!');

    // 4. Verify the addition
    console.log('\n3. Verifying the addition...');
    const updatedUserDoc = await userDocRef.get();
    const updatedUserData = updatedUserDoc.data();
    
    console.log('   Updated assigned agents:', updatedUserData.assignedAgents);
    
    if (updatedUserData.assignedAgents?.includes(agentId)) {
      console.log('✅ Verification successful! Gemini agent is now in your library.');
      console.log('\n🚀 You should now see the Gemini agent in your personal library when you refresh the page.');
    } else {
      console.log('❌ Verification failed! Gemini agent was not added.');
    }

  } catch (error) {
    console.error('❌ Error during process:', error);
  }
}

// Check if user ID was passed as command line argument
const userId = process.argv[2];
if (userId) {
  // Update the script to use the passed user ID
  const scriptContent = require('fs').readFileSync(__filename, 'utf8');
  const updatedScript = scriptContent.replace("const userId = 'YOUR_USER_ID_HERE';", `const userId = '${userId}';`);
  require('fs').writeFileSync(__filename, updatedScript);
  console.log(`✅ Updated script with user ID: ${userId}`);
}

// Run the function
addGeminiToUserLibrary()
  .then(() => {
    console.log('\n🔧 Process complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Process failed:', error);
    process.exit(1);
  });
