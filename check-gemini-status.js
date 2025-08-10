const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'ai-agent-hub-web-portal-79fb0'
});

const db = admin.firestore();

async function checkGeminiStatus() {
  try {
    console.log('🔍 Checking Gemini agent status...\n');
    
    // 1. Check if Gemini agent exists in global agents collection
    console.log('1️⃣ Checking global agents collection...');
    const agentsSnapshot = await db.collection('agents').get();
    console.log(`   Found ${agentsSnapshot.size} agents in global collection`);
    
    let geminiAgent = null;
    agentsSnapshot.forEach(doc => {
      const agent = doc.data();
      console.log(`   - ${doc.id}: ${agent.name} (tier: ${agent.metadata?.tier || 'undefined'})`);
      if (doc.id === 'gemini-chat-agent') {
        geminiAgent = { id: doc.id, ...agent };
      }
    });
    
    if (geminiAgent) {
      console.log(`\n✅ Gemini agent found: ${geminiAgent.name}`);
      console.log(`   Tier: ${geminiAgent.metadata?.tier || 'undefined'}`);
      console.log(`   Permission Type: ${geminiAgent.metadata?.permissionType || 'undefined'}`);
    } else {
      console.log('\n❌ Gemini agent NOT found in global collection');
    }
    
    // 2. Check user profiles for assigned agents
    console.log('\n2️⃣ Checking user profiles for assigned agents...');
    const usersSnapshot = await db.collection('users').get();
    console.log(`   Found ${usersSnapshot.size} user profiles`);
    
    usersSnapshot.forEach(doc => {
      const user = doc.data();
      const assignedAgents = user.assignedAgents || [];
      console.log(`   - ${user.email || 'Unknown'}: ${assignedAgents.length} assigned agents`);
      if (assignedAgents.includes('gemini-chat-agent')) {
        console.log(`     ✅ Has Gemini agent assigned`);
      }
      if (assignedAgents.length > 0) {
        console.log(`     Assigned agents: ${assignedAgents.join(', ')}`);
      }
    });
    
    // 3. Check if there are any agent assignments
    console.log('\n3️⃣ Checking agent assignments collection...');
    const assignmentsSnapshot = await db.collection('agentAssignments').get();
    console.log(`   Found ${assignmentsSnapshot.size} agent assignments`);
    
    if (assignmentsSnapshot.size > 0) {
      assignmentsSnapshot.forEach(doc => {
        const assignment = doc.data();
        console.log(`   - ${assignment.agentName} assigned to ${assignment.userEmail} (${assignment.status})`);
      });
    }
    
    console.log('\n📊 Summary:');
    console.log(`   - Global agents: ${agentsSnapshot.size}`);
    console.log(`   - User profiles: ${usersSnapshot.size}`);
    console.log(`   - Agent assignments: ${assignmentsSnapshot.size}`);
    console.log(`   - Gemini agent exists: ${geminiAgent ? 'Yes' : 'No'}`);
    
  } catch (error) {
    console.error('❌ Error checking Gemini status:', error);
  }
}

checkGeminiStatus().then(() => {
  console.log('\n✅ Check complete');
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
