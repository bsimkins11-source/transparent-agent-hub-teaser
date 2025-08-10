const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, collection, getDocs, query, where } = require('firebase/firestore');

// Firebase configuration (you'll need to add your config here)
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

async function debugGeminiAgent() {
  try {
    console.log('🔍 Starting Gemini Agent Debug...\n');

    // 1. Check all agents in the global collection
    console.log('1. Checking global agents collection...');
    const agentsSnapshot = await getDocs(collection(db, 'agents'));
    const agents = [];
    agentsSnapshot.forEach(doc => {
      const data = doc.data();
      agents.push({
        id: doc.id,
        name: data.name,
        provider: data.provider,
        tier: data.metadata?.tier
      });
    });
    
    const geminiAgent = agents.find(a => a.name.includes('Gemini'));
    console.log(`   Found ${agents.length} agents total`);
    if (geminiAgent) {
      console.log(`   Gemini agent found:`, geminiAgent);
    } else {
      console.log('   ❌ No Gemini agent found in global collection');
    }

    // 2. Check user profiles for assigned agents
    console.log('\n2. Checking user profiles for assigned agents...');
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
    users.forEach(user => {
      if (user.assignedAgents.length > 0) {
        console.log(`   User ${user.email} (${user.displayName}) has ${user.assignedAgents.length} assigned agents:`, user.assignedAgents);
      }
    });

    // 3. Check agent assignments collection
    console.log('\n3. Checking agent assignments collection...');
    const assignmentsSnapshot = await getDocs(collection(db, 'agentAssignments'));
    const assignments = [];
    assignmentsSnapshot.forEach(doc => {
      const data = doc.data();
      assignments.push({
        id: doc.id,
        userId: data.userId,
        agentId: data.agentId,
        agentName: data.agentName,
        status: data.status,
        createdAt: data.createdAt
      });
    });
    
    console.log(`   Found ${assignments.length} agent assignments`);
    const geminiAssignments = assignments.filter(a => a.agentName.includes('Gemini'));
    if (geminiAssignments.length > 0) {
      console.log('   Gemini agent assignments:', geminiAssignments);
    } else {
      console.log('   No Gemini agent assignments found');
    }

    // 4. Summary and recommendations
    console.log('\n4. Summary and Recommendations:');
    if (geminiAgent) {
      console.log(`   ✅ Gemini agent exists in global collection with ID: ${geminiAgent.id}`);
      
      // Check if any users have this agent assigned
      const usersWithGemini = users.filter(user => 
        user.assignedAgents.includes(geminiAgent.id)
      );
      
      if (usersWithGemini.length > 0) {
        console.log(`   ✅ ${usersWithGemini.length} users have Gemini agent assigned:`, 
          usersWithGemini.map(u => u.email));
      } else {
        console.log('   ❌ No users have Gemini agent assigned');
      }
      
      // Check assignments
      const geminiAssignmentsForUsers = assignments.filter(a => 
        a.agentId === geminiAgent.id && a.status === 'active'
      );
      
      if (geminiAssignmentsForUsers.length > 0) {
        console.log(`   ✅ ${geminiAssignmentsForUsers.length} active Gemini assignments found`);
      } else {
        console.log('   ❌ No active Gemini assignments found');
      }
    } else {
      console.log('   ❌ Gemini agent not found in global collection');
    }

  } catch (error) {
    console.error('❌ Error during debug:', error);
  }
}

// Run the debug function
debugGeminiAgent()
  .then(() => {
    console.log('\n🔍 Debug complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Debug failed:', error);
    process.exit(1);
  });
