const axios = require('axios');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const projectId = 'ai-agent-hub-web-portal-79fb0';
const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

const googleAgents = [
  {
    id: 'gemini-chat-agent',
    data: {
      name: { stringValue: 'Gemini Chat Agent' },
      description: { stringValue: 'Advanced conversational AI powered by Google\'s Gemini model. Engage in natural conversations, get help with creative tasks, research, coding, and general questions with access to current information.' },
      provider: { stringValue: 'google' },
      route: { stringValue: '/agents/gemini-chat-agent' },
      visibility: { stringValue: 'public' },
      allowedRoles: { 
        arrayValue: { 
          values: [
            { stringValue: 'admin' },
            { stringValue: 'client' },
            { stringValue: 'user' }
          ]
        }
      },
      metadata: {
        mapValue: {
          fields: {
            category: { stringValue: 'General AI' },
            tags: {
              arrayValue: {
                values: [
                  { stringValue: 'conversation' },
                  { stringValue: 'general-purpose' },
                  { stringValue: 'research' },
                  { stringValue: 'creative' },
                  { stringValue: 'coding' },
                  { stringValue: 'analysis' }
                ]
              }
            }
          }
        }
      },
      capabilities: {
        arrayValue: {
          values: [
            { stringValue: 'Natural conversation' },
            { stringValue: 'Current information access' },
            { stringValue: 'Creative writing assistance' },
            { stringValue: 'Code help and debugging' },
            { stringValue: 'Research and analysis' },
            { stringValue: 'Problem solving' },
            { stringValue: 'Question answering' }
          ]
        }
      },
      pricing: {
        mapValue: {
          fields: {
            tier: { stringValue: 'free' },
            limits: {
              mapValue: {
                fields: {
                  daily: { integerValue: '100' },
                  monthly: { integerValue: '2000' }
                }
              }
            }
          }
        }
      },
      createdAt: { timestampValue: new Date().toISOString() },
      updatedAt: { timestampValue: new Date().toISOString() }
    }
  },
  {
    id: 'imagen-agent',
    data: {
      name: { stringValue: 'Google Imagen Agent' },
      description: { stringValue: 'AI-powered image generation using Google\'s Imagen model. Create high-quality images from text descriptions, get help crafting effective prompts, and explore various artistic styles.' },
      provider: { stringValue: 'google' },
      route: { stringValue: '/agents/imagen-agent' },
      visibility: { stringValue: 'public' },
      allowedRoles: { 
        arrayValue: { 
          values: [
            { stringValue: 'admin' },
            { stringValue: 'client' },
            { stringValue: 'user' }
          ]
        }
      },
      metadata: {
        mapValue: {
          fields: {
            category: { stringValue: 'Creative AI' },
            tags: {
              arrayValue: {
                values: [
                  { stringValue: 'image-generation' },
                  { stringValue: 'creative' },
                  { stringValue: 'art' },
                  { stringValue: 'design' },
                  { stringValue: 'visual' },
                  { stringValue: 'prompting' }
                ]
              }
            }
          }
        }
      },
      capabilities: {
        arrayValue: {
          values: [
            { stringValue: 'Text-to-image generation' },
            { stringValue: 'Prompt crafting assistance' },
            { stringValue: 'Multiple artistic styles' },
            { stringValue: 'High-resolution outputs' },
            { stringValue: 'Creative concept visualization' },
            { stringValue: 'Design ideation support' }
          ]
        }
      },
      pricing: {
        mapValue: {
          fields: {
            tier: { stringValue: 'premium' },
            limits: {
              mapValue: {
                fields: {
                  daily: { integerValue: '20' },
                  monthly: { integerValue: '500' }
                }
              }
            }
          }
        }
      },
      createdAt: { timestampValue: new Date().toISOString() },
      updatedAt: { timestampValue: new Date().toISOString() }
    }
  }
];

async function getAccessToken() {
  try {
    const { stdout } = await execAsync('firebase auth:print-access-token');
    return stdout.trim();
  } catch (error) {
    throw new Error('Failed to get Firebase access token. Make sure you are logged in with `firebase login`');
  }
}

async function addAgentToFirestore(agent, accessToken) {
  const url = `${baseUrl}/agents?documentId=${agent.id}`;
  
  try {
    const response = await axios.post(url, {
      fields: agent.data
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`HTTP ${error.response.status}: ${error.response.data.error?.message || error.response.statusText}`);
    }
    throw error;
  }
}

async function addGoogleAgents() {
  console.log('🤖 Adding Google agents to Firestore using REST API...\n');
  
  try {
    // Get Firebase access token
    console.log('🔑 Getting Firebase access token...');
    const accessToken = await getAccessToken();
    console.log('✅ Access token obtained\n');
    
    // Add each agent
    for (const agent of googleAgents) {
      console.log(`📝 Adding ${agent.data.name.stringValue}...`);
      await addAgentToFirestore(agent, accessToken);
      console.log(`✅ Successfully added ${agent.data.name.stringValue} (ID: ${agent.id})`);
    }
    
    console.log('\n🎉 All Google agents added successfully!');
    console.log('\n📋 Verification:');
    console.log('   • Gemini Chat Agent: https://console.firebase.google.com/project/ai-agent-hub-web-portal-79fb0/firestore/data/~2Fagents~2Fgemini-chat-agent');
    console.log('   • Google Imagen Agent: https://console.firebase.google.com/project/ai-agent-hub-web-portal-79fb0/firestore/data/~2Fagents~2Fimagen-agent');
    console.log('\n🚀 Test the agents at: https://ai-agent-hub-web-portal-79fb0.web.app/agents');
    
  } catch (error) {
    console.error('❌ Error adding agents:', error.message);
    process.exit(1);
  }
}

addGoogleAgents()
  .then(() => {
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error.message);
    process.exit(1);
  });
