#!/usr/bin/env node

/**
 * Script to populate company libraries with working agents and fake agents for testing
 * 
 * This script will:
 * 1. Add the working agents (Gemini and Imagen) to all company libraries
 * 2. Add fake agents for testing the distribution functionality
 * 3. Set up proper permissions and approval workflows
 * 
 * Run with: node scripts/populate-company-libraries.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, getDoc, collection, getDocs } = require('firebase/firestore');

// Firebase configuration - UPDATE THESE VALUES
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "your-api-key",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "ai-agent-hub-web-portal",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "your-sender-id",
  appId: process.env.FIREBASE_APP_ID || "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Company IDs from the system (matching the mock companies in SuperAdminDashboard)
const companies = [
  {
    id: 'transparent-partners',
    name: 'Transparent Partners'
  },
  {
    id: 'acme-corp',
    name: 'Acme Corporation'
  },
  {
    id: 'acme-branch',
    name: 'Acme Corporation (Branch)'
  },
  {
    id: 'global-tech',
    name: 'Global Tech Solutions'
  },
  {
    id: 'startup-inc',
    name: 'Startup Inc'
  }
];

// Working agents that exist in the system
const workingAgents = [
  {
    id: 'gemini-chat-agent',
    name: 'Gemini Chat Agent',
    description: 'Google Gemini AI assistant for conversations and creative tasks',
    provider: 'google',
    route: '/agents/gemini-chat',
    metadata: {
      tags: ['chat', 'creative', 'assistant'],
      category: 'AI Assistant',
      tier: 'free',
      permissionType: 'direct'
    },
    visibility: 'public',
    assignmentType: 'direct' // Free agents can be added directly
  },
  {
    id: 'imagen-agent', 
    name: 'Google Imagen Agent',
    description: 'AI image generation and visual creation assistant',
    provider: 'google',
    route: '/agents/imagen',
    metadata: {
      tags: ['image-generation', 'visual', 'creative'],
      category: 'Image Generation',
      tier: 'premium',
      permissionType: 'approval'
    },
    visibility: 'public',
    assignmentType: 'approval' // Premium agents require approval
  }
];

// Fake agent cards for testing (these don't have backend functionality yet)
const fakeAgents = [
  {
    id: 'marketing-assistant',
    name: 'Marketing Assistant',
    description: 'AI-powered marketing strategy and campaign optimization',
    provider: 'openai',
    route: '/agents/marketing-assistant',
    metadata: {
      tags: ['marketing', 'strategy', 'campaigns'],
      category: 'Marketing',
      tier: 'free',
      permissionType: 'direct'
    },
    visibility: 'public',
    assignmentType: 'direct'
  },
  {
    id: 'sales-analyzer',
    name: 'Sales Analyzer',
    description: 'Sales performance analysis and forecasting',
    provider: 'anthropic',
    route: '/agents/sales-analyzer',
    metadata: {
      tags: ['sales', 'analytics', 'forecasting'],
      category: 'Sales',
      tier: 'free', 
      permissionType: 'direct'
    },
    visibility: 'public',
    assignmentType: 'direct'
  },
  {
    id: 'customer-support-bot',
    name: 'Customer Support Bot',
    description: 'Intelligent customer service and support automation',
    provider: 'openai',
    route: '/agents/customer-support-bot',
    metadata: {
      tags: ['support', 'customer-service', 'automation'],
      category: 'Customer Support',
      tier: 'premium',
      permissionType: 'approval'
    },
    visibility: 'public',
    assignmentType: 'approval'
  },
  {
    id: 'data-analytics-agent',
    name: 'Data Analytics Agent',
    description: 'Advanced data analysis and business intelligence',
    provider: 'anthropic',
    route: '/agents/data-analytics-agent',
    metadata: {
      tags: ['analytics', 'data', 'business-intelligence'],
      category: 'Analytics',
      tier: 'premium',
      permissionType: 'approval'
    },
    visibility: 'public',
    assignmentType: 'approval'
  },
  {
    id: 'hr-recruiter',
    name: 'HR Recruiter',
    description: 'AI-powered recruitment and talent acquisition',
    provider: 'openai',
    route: '/agents/hr-recruiter',
    metadata: {
      tags: ['hr', 'recruitment', 'talent'],
      category: 'Human Resources',
      tier: 'free',
      permissionType: 'direct'
    },
    visibility: 'public',
    assignmentType: 'direct'
  },
  {
    id: 'legal-assistant',
    name: 'Legal Assistant',
    description: 'Legal document review and contract analysis',
    provider: 'anthropic',
    route: '/agents/legal-assistant',
    metadata: {
      tags: ['legal', 'contracts', 'documents'],
      category: 'Legal',
      tier: 'enterprise',
      permissionType: 'approval'
    },
    visibility: 'public',
    assignmentType: 'approval'
  }
];

// All agents to add to company libraries
const allAgents = [...workingAgents, ...fakeAgents];

/**
 * First, ensure all agents exist in the global agents collection
 */
async function ensureAgentsExist() {
  console.log('🔍 Checking if all agents exist in global collection...');
  
  try {
    const agentsRef = collection(db, 'agents');
    const snapshot = await getDocs(agentsRef);
    const existingAgents = new Set();
    
    snapshot.forEach(doc => {
      existingAgents.add(doc.id);
    });
    
    let addedCount = 0;
    
    for (const agent of allAgents) {
      if (!existingAgents.has(agent.id)) {
        console.log(`  ➕ Adding ${agent.name} to global agents collection...`);
        
        const agentData = {
          name: agent.name,
          description: agent.description,
          provider: agent.provider,
          route: agent.route,
          metadata: agent.metadata,
          visibility: agent.visibility,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        await setDoc(doc(db, 'agents', agent.id), agentData);
        addedCount++;
        console.log(`  ✅ Added ${agent.name} to global collection`);
      } else {
        console.log(`  ✅ ${agent.name} already exists in global collection`);
      }
    }
    
    console.log(`\n📊 Global agents summary:`);
    console.log(`  ✅ ${existingAgents.size} existing agents`);
    console.log(`  ➕ ${addedCount} new agents added`);
    console.log(`  📝 Total: ${existingAgents.size + addedCount} agents`);
    
  } catch (error) {
    console.error('❌ Error ensuring agents exist:', error);
    throw error;
  }
}

/**
 * Add agents to a company's library
 */
async function addAgentsToCompany(companyId, companyName) {
  try {
    console.log(`\n🔄 Adding agents to ${companyName} (${companyId})...`);
    
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
        assignmentType: agent.assignmentType,
        grantedBy: 'super_admin', // This script is run by super admin
        grantedAt: new Date().toISOString(),
        tier: agent.metadata.tier,
        category: agent.metadata.category,
        provider: agent.provider
      };
      
      console.log(`  ➕ Added ${agent.name} (${agent.metadata.tier}) to ${companyName}`);
    }
    
    // Save the updated permissions
    const companyPermissions = {
      companyId,
      companyName,
      permissions,
      updatedAt: new Date().toISOString(),
      updatedBy: 'super_admin',
      totalAgents: Object.keys(permissions).length
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
 * Main function to add agents to all companies
 */
async function addAgentsToAllCompanies() {
  console.log('🚀 Starting to populate company libraries with agents...\n');
  
  try {
    // First ensure all agents exist in the global collection
    await ensureAgentsExist();
    
    console.log('\n🏢 Now adding agents to company libraries...\n');
    
    let successCount = 0;
    let totalCount = companies.length;
    
    for (const company of companies) {
      const success = await addAgentsToCompany(company.id, company.name);
      if (success) successCount++;
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`  ✅ Successfully updated: ${successCount}/${totalCount} companies`);
    console.log(`  📝 Added ${allAgents.length} agents to each company library`);
    console.log(`  🔧 Working agents: ${workingAgents.length} (Gemini, Imagen)`);
    console.log(`  🎭 Fake agents: ${fakeAgents.length} (for testing)`);
    console.log(`  🆓 Free agents: ${allAgents.filter(a => a.metadata.tier === 'free').length}`);
    console.log(`  💎 Premium agents: ${allAgents.filter(a => a.metadata.tier === 'premium').length}`);
    console.log(`  🏢 Enterprise agents: ${allAgents.filter(a => a.metadata.tier === 'enterprise').length}`);
    
    if (successCount === totalCount) {
      console.log('\n🎉 All companies have been updated successfully!');
      console.log('\n💡 Next steps:');
      console.log('  1. Company admins can now see these agents in their dashboards');
      console.log('  2. Users can request agents from the company library');
      console.log('  3. Test the approval workflow with premium agents');
      console.log('  4. Test the distribution functionality with free agents');
    } else {
      console.log('\n⚠️  Some companies failed to update. Check the logs above.');
    }
    
  } catch (error) {
    console.error('\n💥 Script failed:', error);
    throw error;
  }
}

// Check if Firebase config is properly set
function validateConfig() {
  const requiredFields = ['apiKey', 'authDomain', 'projectId'];
  const missingFields = requiredFields.filter(field => 
    !firebaseConfig[field] || firebaseConfig[field].includes('your-')
  );
  
  if (missingFields.length > 0) {
    console.error('❌ Firebase configuration is incomplete!');
    console.error('Missing or invalid fields:', missingFields);
    console.error('\nPlease set the following environment variables:');
    missingFields.forEach(field => {
      console.error(`  - FIREBASE_${field.toUpperCase()}`);
    });
    console.error('\nOr update the firebaseConfig object in this script.');
    return false;
  }
  
  return true;
}

// Run the script
if (require.main === module) {
  if (!validateConfig()) {
    process.exit(1);
  }
  
  addAgentsToAllCompanies()
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
  addAgentsToCompany,
  addAgentsToAllCompanies,
  workingAgents,
  fakeAgents,
  ensureAgentsExist
};
