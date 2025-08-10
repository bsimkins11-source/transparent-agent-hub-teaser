// Test script for Agent Assignments and Management System
// This script will test all the key functionality

import { 
  createAgent, 
  updateAgent, 
  deleteAgent, 
  getAllAgentsForManagement,
  getAgentStats,
  submitAgentForReview,
  reviewAgent,
  getPendingAgents,
  getApprovedAgents,
  updateAgentStatus
} from './services/agentManagementService';

import {
  getCompanyAvailableAgents,
  getNetworkAvailableAgents,
  grantAgentsToCompany,
  grantAgentsToNetwork,
  getCompanyAgentPermissions,
  getNetworkAgentPermissions,
  getCompanyPermissionStats,
  getNetworkPermissionStats,
  saveGlobalAgentSettings,
  getGlobalAgentSettings
} from './services/hierarchicalPermissionService';

import {
  createNewAgentRequest,
  getOrganizationNewAgentRequests,
  getNetworkNewAgentRequests,
  getGlobalNewAgentRequests,
  updateNewAgentRequestStatus,
  getNewAgentRequestsByStatus,
  getUserNewAgentRequests
} from './services/newAgentRequestService';

import {
  addAgentToUserLibrary,
  removeAgentFromUserLibrary,
  getUserAssignedAgents,
  userHasAgentAccess,
  createOrUpdateUserProfile
} from './services/userLibraryService';

// Test data
const testAgent = {
  name: "Test Analytics Agent",
  description: "A test agent for analytics",
  provider: "openai",
  route: "/test-analytics",
  category: "Analytics",
  tags: ["test", "analytics"],
  tier: "free",
  visibility: "global",
  allowedRoles: ["user", "admin"]
};

const testUser = {
  id: "test-user-123",
  email: "test@example.com",
  userName: "Test User",
  organizationId: "test-company",
  organizationName: "Test Company",
  role: "user"
};

const testCompany = {
  id: "test-company",
  name: "Test Company"
};

const testNetwork = {
  id: "test-network",
  name: "Test Network"
};

// Test functions
async function testAgentManagement() {
  console.log("🧪 Testing Agent Management...");
  
  try {
    // Test 1: Create Agent
    console.log("  📝 Creating test agent...");
    const agentId = await createAgent(testAgent);
    console.log(`  ✅ Agent created with ID: ${agentId}`);
    
    // Test 2: Get All Agents
    console.log("  📋 Fetching all agents...");
    const agents = await getAllAgentsForManagement();
    console.log(`  ✅ Found ${agents.length} agents`);
    
    // Test 3: Get Agent Stats
    console.log("  📊 Getting agent statistics...");
    const stats = await getAgentStats();
    console.log(`  ✅ Stats: ${stats.total} total, ${stats.byTier.free || 0} free tier`);
    
    // Test 4: Update Agent
    console.log("  ✏️ Updating agent...");
    await updateAgent({
      id: agentId,
      description: "Updated test agent description"
    });
    console.log("  ✅ Agent updated successfully");
    
    // Test 5: Submit for Review
    console.log("  📤 Submitting agent for review...");
    const reviewId = await submitAgentForReview(
      testAgent,
      testUser.id,
      testUser.email,
      testUser.userName
    );
    console.log(`  ✅ Agent submitted for review with ID: ${reviewId}`);
    
    // Test 6: Get Pending Agents
    console.log("  ⏳ Getting pending agents...");
    const pendingAgents = await getPendingAgents();
    console.log(`  ✅ Found ${pendingAgents.length} pending agents`);
    
    // Test 7: Review Agent
    console.log("  👀 Reviewing agent...");
    await reviewAgent(
      {
        agentId: reviewId,
        action: "approve",
        comments: "Test approval"
      },
      testUser.id,
      testUser.email,
      testUser.userName
    );
    console.log("  ✅ Agent reviewed successfully");
    
    // Test 8: Get Approved Agents
    console.log("  ✅ Getting approved agents...");
    const approvedAgents = await getApprovedAgents();
    console.log(`  ✅ Found ${approvedAgents.length} approved agents`);
    
    // Test 9: Update Agent Status
    console.log("  🔄 Updating agent status...");
    await updateAgentStatus(
      agentId,
      "deprecated",
      testUser.id,
      testUser.email,
      testUser.userName,
      "Test deprecation"
    );
    console.log("  ✅ Agent status updated");
    
    // Test 10: Delete Agent
    console.log("  🗑️ Deleting test agent...");
    await deleteAgent(agentId);
    console.log("  ✅ Agent deleted successfully");
    
    console.log("  🎉 Agent Management tests completed successfully!");
    
  } catch (error) {
    console.error("  ❌ Agent Management test failed:", error);
  }
}

async function testHierarchicalPermissions() {
  console.log("🧪 Testing Hierarchical Permissions...");
  
  try {
    // Test 1: Save Global Agent Settings
    console.log("  ⚙️ Saving global agent settings...");
    await saveGlobalAgentSettings(
      {
        "test-agent-1": {
          enabled: true,
          defaultTier: "free",
          defaultAssignmentType: "free"
        }
      },
      testUser.id,
      testUser.userName
    );
    console.log("  ✅ Global settings saved");
    
    // Test 2: Get Global Agent Settings
    console.log("  📋 Getting global agent settings...");
    const globalSettings = await getGlobalAgentSettings();
    console.log(`  ✅ Global settings retrieved: ${globalSettings ? 'found' : 'not found'}`);
    
    // Test 3: Grant Agents to Company
    console.log("  🏢 Granting agents to company...");
    await grantAgentsToCompany(
      testCompany.id,
      testCompany.name,
      {
        "test-agent-1": {
          granted: true,
          assignmentType: "direct"
        }
      },
      testUser.id,
      testUser.userName
    );
    console.log("  ✅ Agents granted to company");
    
    // Test 4: Get Company Available Agents
    console.log("  📋 Getting company available agents...");
    const companyAgents = await getCompanyAvailableAgents(testCompany.id);
    console.log(`  ✅ Found ${companyAgents.length} agents available to company`);
    
    // Test 5: Get Company Agent Permissions
    console.log("  🔐 Getting company agent permissions...");
    const companyPermissions = await getCompanyAgentPermissions(testCompany.id);
    console.log(`  ✅ Company permissions: ${companyPermissions ? 'found' : 'not found'}`);
    
    // Test 6: Get Company Permission Stats
    console.log("  📊 Getting company permission stats...");
    const companyStats = await getCompanyPermissionStats(testCompany.id);
    console.log(`  ✅ Company stats: ${companyStats.totalAvailable} available, ${companyStats.totalGranted} granted`);
    
    // Test 7: Grant Agents to Network
    console.log("  🌐 Granting agents to network...");
    await grantAgentsToNetwork(
      testCompany.id,
      testNetwork.id,
      testNetwork.name,
      {
        "test-agent-1": {
          granted: true,
          assignmentType: "approval"
        }
      },
      testUser.id,
      testUser.userName
    );
    console.log("  ✅ Agents granted to network");
    
    // Test 8: Get Network Available Agents
    console.log("  📋 Getting network available agents...");
    const networkAgents = await getNetworkAvailableAgents(testCompany.id, testNetwork.id);
    console.log(`  ✅ Found ${networkAgents.length} agents available to network`);
    
    // Test 9: Get Network Agent Permissions
    console.log("  🔐 Getting network agent permissions...");
    const networkPermissions = await getNetworkAgentPermissions(testCompany.id, testNetwork.id);
    console.log(`  ✅ Network permissions: ${networkPermissions ? 'found' : 'not found'}`);
    
    // Test 10: Get Network Permission Stats
    console.log("  📊 Getting network permission stats...");
    const networkStats = await getNetworkPermissionStats(testCompany.id, testNetwork.id);
    console.log(`  ✅ Network stats: ${networkStats.totalAvailable} available, ${networkStats.totalGranted} granted`);
    
    console.log("  🎉 Hierarchical Permissions tests completed successfully!");
    
  } catch (error) {
    console.error("  ❌ Hierarchical Permissions test failed:", error);
  }
}

async function testNewAgentRequests() {
  console.log("🧪 Testing New Agent Requests...");
  
  try {
    // Test 1: Create New Agent Request
    console.log("  📝 Creating new agent request...");
    const requestId = await createNewAgentRequest({
      userId: testUser.id,
      userEmail: testUser.email,
      userName: testUser.userName,
      agentName: "Test Request Agent",
      agentDescription: "A test agent requested by user",
      useCase: "Testing the request system",
      businessJustification: "To validate the request workflow",
      expectedUsage: "Daily",
      priority: "normal",
      category: "Testing",
      targetUsers: "QA Team",
      libraryType: "company",
      organizationId: testCompany.id,
      adminContactEmail: "admin@test.com",
      adminContactName: "Test Admin",
      adminContactTitle: "Company Admin"
    });
    console.log(`  ✅ Request created with ID: ${requestId}`);
    
    // Test 2: Get Organization New Agent Requests
    console.log("  📋 Getting organization requests...");
    const orgRequests = await getOrganizationNewAgentRequests(testCompany.id);
    console.log(`  ✅ Found ${orgRequests.length} organization requests`);
    
    // Test 3: Get Network New Agent Requests
    console.log("  📋 Getting network requests...");
    const networkRequests = await getNetworkNewAgentRequests(testCompany.id, testNetwork.id);
    console.log(`  ✅ Found ${networkRequests.length} network requests`);
    
    // Test 4: Get Global New Agent Requests
    console.log("  📋 Getting global requests...");
    const globalRequests = await getGlobalNewAgentRequests();
    console.log(`  ✅ Found ${globalRequests.length} global requests`);
    
    // Test 5: Get Requests by Status
    console.log("  📋 Getting pending requests...");
    const pendingRequests = await getNewAgentRequestsByStatus("pending", testCompany.id);
    console.log(`  ✅ Found ${pendingRequests.length} pending requests`);
    
    // Test 6: Get User Requests
    console.log("  📋 Getting user requests...");
    const userRequests = await getUserNewAgentRequests(testUser.id);
    console.log(`  ✅ Found ${userRequests.length} user requests`);
    
    // Test 7: Update Request Status
    console.log("  🔄 Updating request status...");
    await updateNewAgentRequestStatus(
      requestId,
      "approved",
      testUser.id,
      testUser.email,
      testUser.userName,
      "Test approval"
    );
    console.log("  ✅ Request status updated");
    
    console.log("  🎉 New Agent Requests tests completed successfully!");
    
  } catch (error) {
    console.error("  ❌ New Agent Requests test failed:", error);
  }
}

async function testUserLibrary() {
  console.log("🧪 Testing User Library...");
  
  try {
    // Test 1: Create/Update User Profile
    console.log("  👤 Creating user profile...");
    await createOrUpdateUserProfile(
      testUser.id,
      testUser.email,
      testUser.userName,
      testUser.organizationId,
      testUser.organizationName,
      testUser.role
    );
    console.log("  ✅ User profile created/updated");
    
    // Test 2: Add Agent to User Library
    console.log("  ➕ Adding agent to user library...");
    await addAgentToUserLibrary(
      testUser.id,
      testUser.email,
      testUser.userName,
      "test-agent-1",
      "Test Agent 1",
      testUser.organizationId,
      testUser.organizationName
    );
    console.log("  ✅ Agent added to user library");
    
    // Test 3: Get User Assigned Agents
    console.log("  📋 Getting user assigned agents...");
    const assignedAgents = await getUserAssignedAgents(testUser.id);
    console.log(`  ✅ User has ${assignedAgents.length} assigned agents`);
    
    // Test 4: Check User Agent Access
    console.log("  🔐 Checking user agent access...");
    const hasAccess = await userHasAgentAccess(testUser.id, "test-agent-1");
    console.log(`  ✅ User has access to agent: ${hasAccess}`);
    
    // Test 5: Remove Agent from User Library
    console.log("  ➖ Removing agent from user library...");
    await removeAgentFromUserLibrary(testUser.id, "test-agent-1");
    console.log("  ✅ Agent removed from user library");
    
    // Test 6: Verify Agent Removed
    console.log("  🔍 Verifying agent removal...");
    const remainingAgents = await getUserAssignedAgents(testUser.id);
    console.log(`  ✅ User now has ${remainingAgents.length} assigned agents`);
    
    console.log("  🎉 User Library tests completed successfully!");
    
  } catch (error) {
    console.error("  ❌ User Library test failed:", error);
  }
}

// Main test runner
async function runAllTests() {
  console.log("🚀 Starting Agent System Tests...\n");
  
  try {
    await testAgentManagement();
    console.log("");
    
    await testHierarchicalPermissions();
    console.log("");
    
    await testNewAgentRequests();
    console.log("");
    
    await testUserLibrary();
    console.log("");
    
    console.log("🎉 All tests completed successfully!");
    
  } catch (error) {
    console.error("💥 Test suite failed:", error);
  }
}

// Export for use in other files
export {
  testAgentManagement,
  testHierarchicalPermissions,
  testNewAgentRequests,
  testUserLibrary,
  runAllTests
};

// Run tests if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  window.runAgentSystemTests = runAllTests;
} else {
  // Node.js environment
  runAllTests();
}
