const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

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

/**
 * Add a fake agent to the agents collection
 */
async function addFakeAgent(agent) {
  try {
    console.log(`\n🔄 Adding ${agent.name} (${agent.id})...`);
    
    const agentRef = doc(db, 'agents', agent.id);
    
    const agentData = {
      ...agent,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await setDoc(agentRef, agentData);
    console.log(`  ✅ Successfully added ${agent.name}`);
    
    return true;
    
  } catch (error) {
    console.error(`  ❌ Error adding ${agent.name}:`, error);
    return false;
  }
}

/**
 * Main function to add all fake agents
 */
async function addAllFakeAgents() {
  console.log('🚀 Starting to add fake agents to the system...\n');
  
  let successCount = 0;
  let totalCount = fakeAgents.length;
  
  for (const agent of fakeAgents) {
    const success = await addFakeAgent(agent);
    if (success) successCount++;
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`  ✅ Successfully added: ${successCount}/${totalCount} fake agents`);
  
  if (successCount === totalCount) {
    console.log('\n🎉 All fake agents have been added successfully!');
    console.log('\n📝 Next steps:');
    console.log('  1. Run add-agents-to-companies.js to add these agents to company libraries');
    console.log('  2. Test the agent assignment functionality in the UI');
  } else {
    console.log('\n⚠️  Some fake agents failed to add. Check the logs above.');
  }
}

// Run the script
if (require.main === module) {
  addAllFakeAgents()
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
  addFakeAgent,
  addAllFakeAgents,
  fakeAgents
};
