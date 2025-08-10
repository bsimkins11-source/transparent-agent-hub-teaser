const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, getDoc } = require('firebase/firestore');

// Firebase configuration - using your actual config
const firebaseConfig = {
  apiKey: "AIzaSyAf2KwetCFEARZiaBP_QW07JVT1_tfZ_IY",
  authDomain: "ai-agent-hub-web-portal-79fb0.firebaseapp.com",
  projectId: "ai-agent-hub-web-portal-79fb0",
  storageBucket: "ai-agent-hub-web-portal-79fb0.firebasestorage.app",
  messagingSenderId: "72861076114",
  appId: "1:72861076114:web:1ea856ad05ef5f0eeef44b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Company IDs from the system
const companies = [
  'transparent-partners',
  'acme-corp', 
  'global-tech',
  'startup-inc'
];

// Working agents that exist in the system
const workingAgents = [
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
      tags: ['conversation', 'general-purpose', 'research', 'creative', 'coding', 'analysis'],
      tier: 'free',
      permissionType: 'direct'
    },
    capabilities: [
      'Natural conversation',
      'Current information access',
      'Creative writing assistance',
      'Code help and debugging',
      'Research and analysis',
      'Problem solving',
      'Question answering'
    ],
    pricing: {
      tier: 'free',
      limits: {
        daily: 100,
        monthly: 2000
      }
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
      tags: ['image-generation', 'creative', 'art', 'design', 'visual', 'prompting'],
      tier: 'premium',
      permissionType: 'approval'
    },
    capabilities: [
      'Text-to-image generation',
      'Prompt crafting assistance',
      'Multiple artistic styles',
      'High-resolution outputs',
      'Creative concept visualization',
      'Design ideation support'
    ],
    pricing: {
      tier: 'premium',
      limits: {
        daily: 20,
        monthly: 500
      }
    }
  }
];

// Fake agent cards for testing (these don't have backend functionality yet)
const fakeAgents = [
  {
    id: 'marketing-assistant',
    name: 'Marketing Assistant',
    description: 'AI-powered marketing assistant that helps create campaigns, analyze performance, and optimize marketing strategies. Provides insights on customer behavior and market trends.',
    provider: 'openai',
    route: '/agents/marketing-assistant',
    visibility: 'public',
    allowedRoles: ['admin', 'client', 'user'],
    metadata: {
      category: 'Marketing',
      tags: ['marketing', 'campaigns', 'analytics', 'strategy', 'customer-insights'],
      tier: 'free',
      permissionType: 'direct'
    },
    capabilities: [
      'Campaign creation and optimization',
      'Marketing performance analysis',
      'Customer behavior insights',
      'Market trend analysis',
      'Content strategy recommendations',
      'ROI optimization suggestions'
    ],
    pricing: {
      tier: 'free',
      limits: {
        daily: 50,
        monthly: 1000
      }
    }
  },
  {
    id: 'sales-analyzer',
    name: 'Sales Analyzer',
    description: 'Intelligent sales analytics agent that helps analyze sales data, identify opportunities, and provide actionable insights to improve sales performance and forecasting.',
    provider: 'anthropic',
    route: '/agents/sales-analyzer',
    visibility: 'public',
    allowedRoles: ['admin', 'client', 'user'],
    metadata: {
      category: 'Sales',
      tags: ['sales', 'analytics', 'forecasting', 'opportunities', 'performance'],
      tier: 'free',
      permissionType: 'direct'
    },
    capabilities: [
      'Sales data analysis',
      'Performance forecasting',
      'Opportunity identification',
      'Sales pipeline optimization',
      'Customer segmentation analysis',
      'Revenue trend analysis'
    ],
    pricing: {
      tier: 'free',
      limits: {
        daily: 75,
        monthly: 1500
      }
    }
  },
  {
    id: 'customer-support-bot',
    name: 'Customer Support Bot',
    description: 'Advanced customer support AI that handles inquiries, provides solutions, and escalates complex issues. Integrates with knowledge bases and support systems.',
    provider: 'openai',
    route: '/agents/customer-support-bot',
    visibility: 'public',
    allowedRoles: ['admin', 'client', 'user'],
    metadata: {
      category: 'Customer Support',
      tags: ['support', 'customer-service', 'troubleshooting', 'knowledge-base', 'escalation'],
      tier: 'premium',
      permissionType: 'approval'
    },
    capabilities: [
      'Customer inquiry handling',
      'Automated troubleshooting',
      'Knowledge base integration',
      'Issue escalation management',
      'Support ticket creation',
      'Customer satisfaction tracking'
    ],
    pricing: {
      tier: 'premium',
      limits: {
        daily: 200,
        monthly: 4000
      }
    }
  },
  {
    id: 'data-analytics-agent',
    name: 'Data Analytics Agent',
    description: 'Sophisticated data analytics AI that processes large datasets, generates insights, and creates visualizations. Helps with business intelligence and data-driven decision making.',
    provider: 'anthropic',
    route: '/agents/data-analytics-agent',
    visibility: 'public',
    allowedRoles: ['admin', 'client', 'user'],
    metadata: {
      category: 'Analytics',
      tags: ['analytics', 'data-processing', 'visualization', 'business-intelligence', 'insights'],
      tier: 'premium',
      permissionType: 'approval'
    },
    capabilities: [
      'Large dataset processing',
      'Statistical analysis',
      'Data visualization creation',
      'Business intelligence insights',
      'Trend identification',
      'Predictive modeling support'
    ],
    pricing: {
      tier: 'premium',
      limits: {
        daily: 100,
        monthly: 2000
      }
    }
  },
  {
    id: 'hr-recruiter',
    name: 'HR Recruiter',
    description: 'AI-powered HR recruitment assistant that helps screen candidates, analyze resumes, and streamline the hiring process. Provides insights on candidate fit and market trends.',
    provider: 'openai',
    route: '/agents/hr-recruiter',
    visibility: 'public',
    allowedRoles: ['admin', 'client', 'user'],
    metadata: {
      category: 'Human Resources',
      tags: ['hr', 'recruitment', 'hiring', 'candidate-screening', 'resume-analysis'],
      tier: 'free',
      permissionType: 'direct'
    },
    capabilities: [
      'Resume screening and analysis',
      'Candidate matching',
      'Interview scheduling assistance',
      'Market salary analysis',
      'Diversity and inclusion insights',
      'Hiring process optimization'
    ],
    pricing: {
      tier: 'free',
      limits: {
        daily: 30,
        monthly: 600
      }
    }
  },
  {
    id: 'legal-assistant',
    name: 'Legal Assistant',
    description: 'Professional legal AI assistant that helps with contract review, legal research, compliance checking, and document analysis. Provides legal insights and recommendations.',
    provider: 'anthropic',
    route: '/agents/legal-assistant',
    visibility: 'public',
    allowedRoles: ['admin', 'client', 'user'],
    metadata: {
      category: 'Legal',
      tags: ['legal', 'contracts', 'compliance', 'research', 'document-analysis'],
      tier: 'enterprise',
      permissionType: 'approval'
    },
    capabilities: [
      'Contract review and analysis',
      'Legal research assistance',
      'Compliance checking',
      'Document analysis',
      'Risk assessment',
      'Legal precedent research'
    ],
    pricing: {
      tier: 'enterprise',
      limits: {
        daily: 25,
        monthly: 500
      }
    }
  }
];

// All agents to add to the system and company libraries
const allAgents = [...workingAgents, ...fakeAgents];

/**
 * Add an agent to the agents collection
 */
async function addAgentToCollection(agent) {
  try {
    console.log(`\n🔄 Adding ${agent.name} (${agent.id}) to agents collection...`);
    
    const agentRef = doc(db, 'agents', agent.id);
    
    const agentData = {
      ...agent,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await setDoc(agentRef, agentData);
    console.log(`  ✅ Successfully added ${agent.name} to agents collection`);
    
    return true;
    
  } catch (error) {
    console.error(`  ❌ Error adding ${agent.name} to agents collection:`, error);
    return false;
  }
}

/**
 * Add agents to a company's library
 */
async function addAgentsToCompany(companyId, companyName) {
  try {
    console.log(`\n🔄 Adding agents to ${companyName} (${companyId}) company library...`);
    
    // Check if company permissions already exist
    const companyPermissionsRef = doc(db, 'companyAgentPermissions', companyId);
    const existingDoc = await getDoc(companyPermissionsRef);
    
    let permissions = {};
    
    if (existingDoc.exists()) {
      console.log(`  📋 Found existing permissions for ${companyName}`);
      permissions = existingDoc.data().permissions || {};
    } else {
      console.log(`  🆕 Creating new permissions for ${companyName}`);
    }
    
    // Add each agent to the company
    for (const agent of allAgents) {
      const existingPermission = permissions[agent.id];
      
      if (existingPermission && existingPermission.granted) {
        console.log(`  ✅ ${agent.name} already granted to ${companyName}`);
        continue;
      }
      
      // Create permission for the agent
      permissions[agent.id] = {
        agentId: agent.id,
        agentName: agent.name,
        granted: true,
        assignmentType: agent.metadata.permissionType === 'direct' ? 'free' : 'approval',
        grantedBy: 'super_admin', // This script is run by super admin
        grantedAt: new Date().toISOString(),
        tier: agent.metadata.tier
      };
      
      console.log(`  ➕ Added ${agent.name} (${agent.metadata.tier}) to ${companyName}`);
    }
    
    // Save the updated permissions
    const companyPermissions = {
      companyId,
      companyName,
      permissions,
      updatedAt: new Date().toISOString(),
      updatedBy: 'super_admin'
    };
    
    await setDoc(companyPermissionsRef, companyPermissions);
    console.log(`  💾 Saved permissions for ${companyName}`);
    
    return true;
    
  } catch (error) {
    console.error(`  ❌ Error adding agents to ${companyName}:`, error);
    return false;
  }
}

/**
 * Main setup function
 */
async function setupCompanyLibraries() {
  console.log('🚀 Starting comprehensive company library setup...\n');
  
  // Step 1: Add all agents to the agents collection
  console.log('📝 Step 1: Adding agents to the agents collection...');
  let agentSuccessCount = 0;
  let totalAgentCount = allAgents.length;
  
  for (const agent of allAgents) {
    const success = await addAgentToCollection(agent);
    if (success) agentSuccessCount++;
  }
  
  console.log(`\n📊 Agents Summary:`);
  console.log(`  ✅ Successfully added: ${agentSuccessCount}/${totalAgentCount} agents to collection`);
  
  if (agentSuccessCount !== totalAgentCount) {
    console.log('\n⚠️  Some agents failed to add. Continuing with company library setup...');
  }
  
  // Step 2: Add agents to all company libraries
  console.log('\n📚 Step 2: Adding agents to company libraries...');
  let companySuccessCount = 0;
  let totalCompanyCount = companies.length;
  
  for (const companyId of companies) {
    // Get company name from the company ID
    const companyName = companyId.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    
    const success = await addAgentsToCompany(companyId, companyName);
    if (success) companySuccessCount++;
  }
  
  console.log(`\n📊 Company Libraries Summary:`);
  console.log(`  ✅ Successfully updated: ${companySuccessCount}/${totalCompanyCount} companies`);
  
  // Final summary
  console.log(`\n🎯 Final Summary:`);
  console.log(`  🔧 Working agents: ${workingAgents.length} (Gemini, Imagen)`);
  console.log(`  🎭 Fake agents: ${fakeAgents.length} (for testing)`);
  console.log(`  🏢 Companies updated: ${companySuccessCount}/${totalCompanyCount}`);
  console.log(`  📝 Total agents in system: ${agentSuccessCount}`);
  
  if (agentSuccessCount === totalAgentCount && companySuccessCount === totalCompanyCount) {
    console.log('\n🎉 Setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('  1. Test the agent assignment functionality in the UI');
    console.log('  2. Verify agents appear in company libraries');
    console.log('  3. Test adding agents to user libraries');
  } else {
    console.log('\n⚠️  Setup completed with some issues. Check the logs above.');
  }
}

// Run the script
if (require.main === module) {
  setupCompanyLibraries()
    .then(() => {
      console.log('\n✨ Script completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = {
  addAgentToCollection,
  addAgentsToCompany,
  setupCompanyLibraries,
  workingAgents,
  fakeAgents,
  allAgents
};
