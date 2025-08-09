const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'ai-agent-hub-web-portal-79fb0'
  });
}

const db = admin.firestore();

async function checkImagenAgent() {
  try {
    console.log('🔍 Checking Imagen agent configuration...');
    
    const doc = await db.collection('agents').doc('imagen-agent').get();
    
    if (doc.exists) {
      const data = doc.data();
      console.log('\n📄 Imagen Agent Data:');
      console.log('Name:', data.name);
      console.log('Description:', data.description);
      console.log('Provider:', data.provider);
      console.log('Metadata:', JSON.stringify(data.metadata, null, 2));
      
      if (data.metadata?.tier) {
        console.log(`\n✅ Tier is set to: "${data.metadata.tier}"`);
        if (data.metadata.tier === 'premium') {
          console.log('✅ Imagen agent correctly configured as premium!');
        } else {
          console.log(`❌ Imagen agent tier should be "premium" but is "${data.metadata.tier}"`);
        }
      } else {
        console.log('\n❌ No tier metadata found! Need to add tier: "premium"');
      }
      
      if (data.metadata?.permissionType) {
        console.log(`✅ Permission type is set to: "${data.metadata.permissionType}"`);
      } else {
        console.log('❌ No permissionType metadata found!');
      }
      
    } else {
      console.log('❌ Imagen agent document not found in Firestore');
    }
  } catch (error) {
    console.error('Error checking Imagen agent:', error.message);
  }
}

checkImagenAgent();
