const { spawn } = require('child_process');
const fs = require('fs');

const agents = {
  "gemini-chat-agent": {
    "name": "Gemini Chat Agent",
    "description": "Advanced conversational AI powered by Google's Gemini model. Engage in natural conversations, get help with creative tasks, research, coding, and general questions with access to current information.",
    "provider": "google",
    "route": "/agents/gemini-chat-agent",
    "visibility": "public",
    "allowedRoles": ["admin", "client", "user"],
    "metadata": {
      "category": "General AI",
      "tags": ["conversation", "general-purpose", "research", "creative", "coding", "analysis"]
    },
    "capabilities": [
      "Natural conversation",
      "Current information access",
      "Creative writing assistance", 
      "Code help and debugging",
      "Research and analysis",
      "Problem solving",
      "Question answering"
    ],
    "pricing": {
      "tier": "free",
      "limits": {
        "daily": 100,
        "monthly": 2000
      }
    }
  },
  "imagen-agent": {
    "name": "Google Imagen Agent",
    "description": "AI-powered image generation using Google's Imagen model. Create high-quality images from text descriptions, get help crafting effective prompts, and explore various artistic styles.",
    "provider": "google",
    "route": "/agents/imagen-agent", 
    "visibility": "public",
    "allowedRoles": ["admin", "client", "user"],
    "metadata": {
      "category": "Creative AI",
      "tags": ["image-generation", "creative", "art", "design", "visual", "prompting"]
    },
    "capabilities": [
      "Text-to-image generation",
      "Prompt crafting assistance",
      "Multiple artistic styles",
      "High-resolution outputs",
      "Creative concept visualization", 
      "Design ideation support"
    ],
    "pricing": {
      "tier": "premium",
      "limits": {
        "daily": 20,
        "monthly": 500
      }
    }
  }
};

async function addAgentToFirestore(agentId, agentData) {
  return new Promise((resolve, reject) => {
    // Create temporary JSON file for this agent
    const tempFile = `temp-${agentId}.json`;
    fs.writeFileSync(tempFile, JSON.stringify(agentData, null, 2));
    
    console.log(`📝 Adding ${agentData.name}...`);
    
    // Use Firebase CLI to add document
    const firebaseProcess = spawn('firebase', [
      'firestore:set',
      `agents/${agentId}`,
      tempFile,
      '--project', 'ai-agent-hub-web-portal-79fb0'
    ], { stdio: ['pipe', 'pipe', 'pipe'] });
    
    let output = '';
    let errorOutput = '';
    
    firebaseProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    firebaseProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    firebaseProcess.on('close', (code) => {
      // Clean up temp file
      try {
        fs.unlinkSync(tempFile);
      } catch (e) {
        // Ignore cleanup errors
      }
      
      if (code === 0) {
        console.log(`✅ Successfully added ${agentData.name} (ID: ${agentId})`);
        resolve();
      } else {
        console.log(`❌ Failed to add ${agentData.name}`);
        console.log('Error:', errorOutput);
        reject(new Error(`Firebase CLI exited with code ${code}: ${errorOutput}`));
      }
    });
  });
}

async function addAllAgents() {
  console.log('🤖 Adding Google agents to Firestore using Firebase CLI...\n');
  
  try {
    for (const [agentId, agentData] of Object.entries(agents)) {
      await addAgentToFirestore(agentId, agentData);
    }
    
    console.log('\n🎉 All Google agents added successfully!');
    console.log('\n📋 Verification URLs:');
    console.log('   • Gemini Chat Agent: https://console.firebase.google.com/project/ai-agent-hub-web-portal-79fb0/firestore/data/~2Fagents~2Fgemini-chat-agent');
    console.log('   • Google Imagen Agent: https://console.firebase.google.com/project/ai-agent-hub-web-portal-79fb0/firestore/data/~2Fagents~2Fimagen-agent');
    console.log('\n🚀 Test the agents at: https://ai-agent-hub-web-portal-79fb0.web.app/agents');
    
  } catch (error) {
    console.error('❌ Error adding agents:', error.message);
    process.exit(1);
  }
}

addAllAgents()
  .then(() => {
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error.message);
    process.exit(1);
  });
