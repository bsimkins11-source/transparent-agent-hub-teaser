// Simple script to add agents using environment variables
const { execSync } = require('child_process');

console.log('🤖 Adding Google agents to Firestore...\n');

const agents = [
  {
    id: 'gemini-chat-agent',
    name: 'Gemini Chat Agent',
    description: 'Advanced conversational AI powered by Google\'s Gemini model. Engage in natural conversations, get help with creative tasks, research, coding, and general questions with access to current information.',
    provider: 'google',
    route: '/agents/gemini-chat-agent',
    visibility: 'public',
    allowedRoles: ['admin', 'client', 'user'],
    metadata: {
      category: 'General AI',
      tags: ['conversation', 'general-purpose', 'research', 'creative', 'coding', 'analysis']
    }
  },
  {
    id: 'imagen-agent',
    name: 'Google Imagen Agent', 
    description: 'AI-powered image generation using Google\'s Imagen model. Create high-quality images from text descriptions, get help crafting effective prompts, and explore various artistic styles.',
    provider: 'google',
    route: '/agents/imagen-agent',
    visibility: 'public',
    allowedRoles: ['admin', 'client', 'user'],
    metadata: {
      category: 'Creative AI',
      tags: ['image-generation', 'creative', 'art', 'design', 'visual', 'prompting']
    }
  }
];

try {
  // Enable Firestore API first
  console.log('🔧 Enabling Firestore API...');
  try {
    execSync('gcloud services enable firestore.googleapis.com --project=ai-agent-hub-web-portal-79fb0', { stdio: 'ignore' });
    console.log('✅ Firestore API enabled');
  } catch (e) {
    console.log('⚠️  Firestore API may already be enabled or you may need to enable it manually');
  }
  
  // Add each agent using curl with gcloud auth
  for (const agent of agents) {
    console.log(`\n📝 Adding ${agent.name}...`);
    
    // Get access token
    const accessToken = execSync('gcloud auth print-access-token', { encoding: 'utf8' }).trim();
    
    // Prepare the Firestore document
    const firestoreDoc = {
      fields: {
        name: { stringValue: agent.name },
        description: { stringValue: agent.description },
        provider: { stringValue: agent.provider },
        route: { stringValue: agent.route },
        visibility: { stringValue: agent.visibility },
        allowedRoles: {
          arrayValue: {
            values: agent.allowedRoles.map(role => ({ stringValue: role }))
          }
        },
        metadata: {
          mapValue: {
            fields: {
              category: { stringValue: agent.metadata.category },
              tags: {
                arrayValue: {
                  values: agent.metadata.tags.map(tag => ({ stringValue: tag }))
                }
              }
            }
          }
        }
      }
    };
    
    // Write to temp file
    const fs = require('fs');
    const tempFile = `temp-${agent.id}.json`;
    fs.writeFileSync(tempFile, JSON.stringify(firestoreDoc, null, 2));
    
    // Use curl to create the document
    const curlCommand = `curl -s -X POST "https://firestore.googleapis.com/v1/projects/ai-agent-hub-web-portal-79fb0/databases/(default)/documents/agents?documentId=${agent.id}" -H "Authorization: Bearer ${accessToken}" -H "Content-Type: application/json" -d @${tempFile}`;
    
    try {
      const result = execSync(curlCommand, { encoding: 'utf8' });
      const response = JSON.parse(result);
      
      if (response.error) {
        console.log(`❌ Failed to add ${agent.name}: ${response.error.message}`);
      } else {
        console.log(`✅ Successfully added ${agent.name} (ID: ${agent.id})`);
      }
    } catch (error) {
      console.log(`❌ Failed to add ${agent.name}: ${error.message}`);
    }
    
    // Clean up temp file
    try {
      fs.unlinkSync(tempFile);
    } catch (e) {
      // Ignore cleanup errors
    }
  }
  
  console.log('\n🎉 Agent addition process completed!');
  console.log('\n📋 Verification URLs:');
  console.log('   • Gemini Chat Agent: https://console.firebase.google.com/project/ai-agent-hub-web-portal-79fb0/firestore/data/~2Fagents~2Fgemini-chat-agent');
  console.log('   • Google Imagen Agent: https://console.firebase.google.com/project/ai-agent-hub-web-portal-79fb0/firestore/data/~2Fagents~2Fimagen-agent');
  console.log('\n🚀 Test the agents at: https://ai-agent-hub-web-portal-79fb0.web.app/agents');
  
} catch (error) {
  console.error('💥 Script failed:', error.message);
  process.exit(1);
}
