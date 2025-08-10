const admin = require('firebase-admin');

// Initialize Firebase Admin for production
const app = admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'ai-agent-hub-web-portal-79fb0'
});

const db = app.firestore();

async function createTestUser() {
  try {
    console.log('🔧 Creating test user for production environment...\n');

    // Create a test user profile
    const testUser = {
      uid: 'test-user-prod',
      email: 'test.user@production.com',
      displayName: 'Test User (Production)',
      organizationId: 'test-org-prod',
      organizationName: 'Test Organization (Production)',
      role: 'user',
      assignedAgents: ['gemini-chat-agent'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Create user profile in users collection
    await db.collection('users').doc(testUser.uid).set(testUser);
    console.log(`✅ Created user profile: ${testUser.displayName}`);

    // Also create in userProfiles collection for compatibility
    await db.collection('userProfiles').doc(testUser.uid).set(testUser);
    console.log(`✅ Created user profile in userProfiles collection`);

    // Create test organization
    const testOrg = {
      id: 'test-org-prod',
      name: 'Test Organization (Production)',
      description: 'Test organization for production environment',
      type: 'company',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.collection('organizations').doc(testOrg.id).set(testOrg);
    console.log(`✅ Created organization: ${testOrg.name}`);

    console.log('\n✅ Test user created successfully!');
    console.log('\n🧪 Test User Details:');
    console.log(`   - UID: ${testUser.uid}`);
    console.log(`   - Email: ${testUser.email}`);
    console.log(`   - Display Name: ${testUser.displayName}`);
    console.log(`   - Organization: ${testUser.organizationName}`);
    console.log(`   - Assigned Agents: ${testUser.assignedAgents.join(', ')}`);

    console.log('\n💡 You can now use this user to test the add/remove functionality');
    console.log('   - The user already has the Gemini agent assigned');
    console.log('   - You can test removing and re-adding it');

  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    process.exit(0);
  }
}

createTestUser();
