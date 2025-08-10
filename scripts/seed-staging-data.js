const admin = require('firebase-admin');

// Initialize Firebase Admin for staging
const stagingApp = admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'transparent-ai-staging'
}, 'staging');

const stagingDb = stagingApp.firestore();

async function seedStagingData() {
  try {
    console.log('🌱 Seeding staging environment with test data...\n');

    // 1. Create test agents
    console.log('1️⃣ Creating test agents...');
    const testAgents = [
      {
        id: 'gemini-chat-agent',
        name: 'Gemini Chat Agent (Staging)',
        description: 'Test version of Gemini agent for staging environment',
        provider: 'Google',
        metadata: {
          tier: 'free',
          permissionType: 'free',
          category: 'chat',
          tags: ['ai', 'chat', 'google', 'staging']
        }
      },
      {
        id: 'test-premium-agent',
        name: 'Test Premium Agent',
        description: 'A premium agent for testing approval workflows',
        provider: 'OpenAI',
        metadata: {
          tier: 'premium',
          permissionType: 'approval',
          category: 'analysis',
          tags: ['ai', 'premium', 'openai', 'staging']
        }
      }
    ];

    for (const agent of testAgents) {
      await stagingDb.collection('agents').doc(agent.id).set(agent);
      console.log(`   ✅ Created agent: ${agent.name}`);
    }

    // 2. Create test users
    console.log('\n2️⃣ Creating test users...');
    const testUsers = [
      {
        uid: 'test-user-1',
        email: 'test.user@staging.com',
        displayName: 'Test User',
        organizationId: 'test-org',
        organizationName: 'Test Organization',
        role: 'user',
        assignedAgents: ['gemini-chat-agent']
      },
      {
        uid: 'test-admin-1',
        email: 'test.admin@staging.com',
        displayName: 'Test Admin',
        organizationId: 'test-org',
        organizationName: 'Test Organization',
        role: 'company_admin',
        assignedAgents: ['gemini-chat-agent', 'test-premium-agent']
      }
    ];

    for (const user of testUsers) {
      await stagingDb.collection('users').doc(user.uid).set(user);
      console.log(`   ✅ Created user: ${user.displayName} (${user.role})`);
    }

    // 3. Create test organizations
    console.log('\n3️⃣ Creating test organizations...');
    const testOrgs = [
      {
        id: 'test-org',
        name: 'Test Organization',
        description: 'Test organization for staging environment',
        type: 'company',
        status: 'active'
      }
    ];

    for (const org of testOrgs) {
      await stagingDb.collection('organizations').doc(org.id).set(org);
      console.log(`   ✅ Created organization: ${org.name}`);
    }

    console.log('\n✅ Staging environment seeded successfully!');
    console.log('\n🔗 Staging URLs:');
    console.log('   - Firebase Console: https://console.firebase.google.com/project/transparent-ai-staging');
    console.log('   - Hosting: https://transparent-ai-staging.web.app');
    console.log('\n🧪 Test Accounts:');
    console.log('   - User: test.user@staging.com');
    console.log('   - Admin: test.admin@staging.com');

  } catch (error) {
    console.error('❌ Error seeding staging data:', error);
  } finally {
    process.exit(0);
  }
}

seedStagingData();
