const admin = require('firebase-admin');

// Initialize Firebase Admin for production
const app = admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'ai-agent-hub-web-portal-79fb0'
});

async function generateTestToken() {
  try {
    console.log('🔑 Generating Firebase ID token for test user...\n');

    // Create a custom token for the test user
    const customToken = await admin.auth().createCustomToken('test-user-prod', {
      // Add any custom claims if needed
      role: 'user',
      organizationId: 'test-org-prod'
    });

    console.log('✅ Custom token generated successfully!');
    console.log('\n🔑 Custom Token:');
    console.log(customToken);
    
    console.log('\n💡 To get an ID token, you need to:');
    console.log('   1. Use this custom token in a Firebase client');
    console.log('   2. Call signInWithCustomToken()');
    console.log('   3. Get the ID token from the user object');
    
    console.log('\n🚀 For testing purposes, you can:');
    console.log('   1. Open the frontend in a browser');
    console.log('   2. Sign in with the test user');
    console.log('   3. Test the add/remove functionality');

  } catch (error) {
    console.error('❌ Error generating custom token:', error);
  } finally {
    process.exit(0);
  }
}

generateTestToken();
