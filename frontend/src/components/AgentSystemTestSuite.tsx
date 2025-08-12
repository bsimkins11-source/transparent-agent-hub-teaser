import React, { useState, useEffect } from 'react';

// Import services with error handling
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
} from '../services/agentManagementService';

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
} from '../services/hierarchicalPermissionService';

import {
  createNewAgentRequest,
  getOrganizationNewAgentRequests,
  getNetworkNewAgentRequests,
  getGlobalNewAgentRequests,
  updateNewAgentRequestStatus,
  getNewAgentRequestsByStatus,
  getUserNewAgentRequests
} from '../services/newAgentRequestService';

import {
  addAgentToUserLibrary,
  removeAgentFromUserLibrary,
  getUserAssignedAgents,
  userHasAgentAccess,
  createOrUpdateUserProfile
} from '../services/userLibraryService';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  message: string;
  error?: string;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
}

const AgentSystemTestSuite: React.FC = () => {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([
    {
      name: 'Agent Management',
      tests: [
        { name: 'Create Agent', status: 'pending', message: '' },
        { name: 'Get All Agents', status: 'pending', message: '' },
        { name: 'Get Agent Stats', status: 'pending', message: '' },
        { name: 'Update Agent', status: 'pending', message: '' },
        { name: 'Submit Agent for Review', status: 'pending', message: '' },
        { name: 'Review Agent', status: 'pending', message: '' },
        { name: 'Delete Agent', status: 'pending', message: '' }
      ],
      status: 'pending'
    },
    {
      name: 'Hierarchical Permissions',
      tests: [
        { name: 'Grant Agents to Company', status: 'pending', message: '' },
        { name: 'Grant Agents to Network', status: 'pending', message: '' },
        { name: 'Get Company Agent Permissions', status: 'pending', message: '' },
        { name: 'Get Network Agent Permissions', status: 'pending', message: '' },
        { name: 'Save Global Agent Settings', status: 'pending', message: '' }
      ],
      status: 'pending'
    },
    {
      name: 'New Agent Requests',
      tests: [
        { name: 'Create New Agent Request', status: 'pending', message: '' },
        { name: 'Get Organization Requests', status: 'pending', message: '' },
        { name: 'Get Network Requests', status: 'pending', message: '' },
        { name: 'Update Request Status', status: 'pending', message: '' }
      ],
      status: 'pending'
    },
    {
      name: 'User Library Management',
      tests: [
        { name: 'Add Agent to User Library', status: 'pending', message: '' },
        { name: 'Remove Agent from User Library', status: 'pending', message: '' },
        { name: 'Get User Assigned Agents', status: 'pending', message: '' },
        { name: 'Check User Agent Access', status: 'pending', message: '' },
        { name: 'Create/Update User Profile', status: 'pending', message: '' }
      ],
      status: 'pending'
    }
  ]);

  const [overallStatus, setOverallStatus] = useState<'pending' | 'running' | 'passed' | 'failed' | 'skipped'>('pending');
  const [isRunning, setIsRunning] = useState(false);
  const [firebaseStatus, setFirebaseStatus] = useState<'checking' | 'available' | 'unavailable'>('unavailable');

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

  // Check Firebase availability
  useEffect(() => {
    // Firebase not available in Vercel deployment
    console.log('🚫 Firebase disabled for Vercel deployment');
    setFirebaseStatus('unavailable');
  }, []);

  const updateTestStatus = (suiteIndex: number, testIndex: number, status: TestResult['status'], message: string, error?: string) => {
    setTestSuites(prev => {
      const newSuites = [...prev];
      newSuites[suiteIndex].tests[testIndex] = {
        ...newSuites[suiteIndex].tests[testIndex],
        status,
        message,
        error
      };
      
      // Update suite status
      const allTests = newSuites[suiteIndex].tests;
      if (allTests.every(test => test.status === 'passed')) {
        newSuites[suiteIndex].status = 'passed';
      } else if (allTests.some(test => test.status === 'failed')) {
        newSuites[suiteIndex].status = 'failed';
      } else if (allTests.some(test => test.status === 'running')) {
        newSuites[suiteIndex].status = 'running';
      } else if (allTests.every(test => test.status === 'skipped')) {
        newSuites[suiteIndex].status = 'skipped';
      }
      
      return newSuites;
    });
  };

  const updateOverallStatus = () => {
    const allSuites = testSuites;
    if (allSuites.every(suite => suite.status === 'passed')) {
      setOverallStatus('passed');
    } else if (allSuites.some(suite => suite.status === 'failed')) {
      setOverallStatus('failed');
    } else if (allSuites.some(suite => suite.status === 'running')) {
      setOverallStatus('running');
    } else if (allSuites.every(suite => suite.status === 'skipped')) {
      setOverallStatus('skipped');
    }
  };

  useEffect(() => {
    updateOverallStatus();
  }, [testSuites]);

  const runAgentManagementTests = async () => {
    const suiteIndex = 0;
    
    if (firebaseStatus !== 'available') {
      // Skip all tests if Firebase is not available
      for (let i = 0; i < 7; i++) {
        updateTestStatus(suiteIndex, i, 'skipped', 'Firebase not available - test skipped');
      }
      return;
    }
    
    try {
      // Test 1: Create Agent
      updateTestStatus(suiteIndex, 0, 'running', 'Creating test agent...');
      if (!createAgent) {
        updateTestStatus(suiteIndex, 0, 'failed', 'Create agent function not available');
        return;
      }
      const agentId = await createAgent(testAgent);
      updateTestStatus(suiteIndex, 0, 'passed', `Agent created with ID: ${agentId}`);
      
      // Test 2: Get All Agents
      updateTestStatus(suiteIndex, 1, 'running', 'Fetching all agents...');
      if (!getAllAgentsForManagement) {
        updateTestStatus(suiteIndex, 1, 'failed', 'Get all agents function not available');
        return;
      }
      const agents = await getAllAgentsForManagement();
      updateTestStatus(suiteIndex, 1, 'passed', `Found ${agents.length} agents`);
      
      // Test 3: Get Agent Stats
      updateTestStatus(suiteIndex, 2, 'running', 'Getting agent statistics...');
      if (!getAgentStats) {
        updateTestStatus(suiteIndex, 2, 'failed', 'Get agent stats function not available');
        return;
      }
      const stats = await getAgentStats();
      updateTestStatus(suiteIndex, 2, 'passed', `Stats: ${stats.total} total, ${stats.byTier.free || 0} free tier`);
      
      // Test 4: Update Agent
      updateTestStatus(suiteIndex, 3, 'running', 'Updating agent...');
      if (!updateAgent) {
        updateTestStatus(suiteIndex, 3, 'failed', 'Update agent function not available');
        return;
      }
      await updateAgent({
        id: agentId,
        name: "Updated Test Analytics Agent",
        description: "Updated description"
      });
      updateTestStatus(suiteIndex, 3, 'passed', 'Agent updated successfully');
      
      // Test 5: Submit Agent for Review
      updateTestStatus(suiteIndex, 4, 'running', 'Submitting agent for review...');
      if (!submitAgentForReview) {
        updateTestStatus(suiteIndex, 4, 'failed', 'Submit agent for review function not available');
        return;
      }
      const submissionId = await submitAgentForReview(
        { agentId, notes: "Test submission" },
        testUser.id,
        testUser.email,
        testUser.userName
      );
      updateTestStatus(suiteIndex, 4, 'passed', `Agent submitted for review with ID: ${submissionId}`);
      
      // Test 6: Review Agent
      updateTestStatus(suiteIndex, 5, 'running', 'Reviewing agent...');
      if (!reviewAgent) {
        updateTestStatus(suiteIndex, 5, 'failed', 'Review agent function not available');
        return;
      }
      await reviewAgent(
        { submissionId, action: 'approve', notes: 'Test approval' },
        testUser.id,
        testUser.email,
        testUser.userName
      );
      updateTestStatus(suiteIndex, 5, 'passed', 'Agent reviewed and approved');
      
      // Test 7: Delete Agent
      updateTestStatus(suiteIndex, 6, 'running', 'Deleting test agent...');
      if (!deleteAgent) {
        updateTestStatus(suiteIndex, 6, 'failed', 'Delete agent function not available');
        return;
      }
      await deleteAgent(agentId);
      updateTestStatus(suiteIndex, 6, 'passed', 'Test agent deleted successfully');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      updateTestStatus(suiteIndex, 0, 'failed', 'Test failed', errorMessage);
    }
  };

  const runHierarchicalPermissionsTests = async () => {
    const suiteIndex = 1;
    
    if (firebaseStatus !== 'available') {
      // Skip all tests if Firebase is not available
      for (let i = 0; i < 5; i++) {
        updateTestStatus(suiteIndex, i, 'skipped', 'Firebase not available - test skipped');
      }
      return;
    }
    
    try {
      // Test 1: Grant Agents to Company
      updateTestStatus(suiteIndex, 0, 'running', 'Granting agents to company...');
      if (!grantAgentsToCompany) {
        updateTestStatus(suiteIndex, 0, 'failed', 'Grant agents to company function not available');
        return;
      }
      await grantAgentsToCompany(
        testCompany.id,
        testCompany.name,
        { "test-agent-1": { granted: true, assignmentType: 'free' } },
        testUser.id,
        testUser.userName
      );
      updateTestStatus(suiteIndex, 0, 'passed', 'Agents granted to company successfully');
      
      // Test 2: Grant Agents to Network
      updateTestStatus(suiteIndex, 1, 'running', 'Granting agents to network...');
      if (!grantAgentsToNetwork) {
        updateTestStatus(suiteIndex, 1, 'failed', 'Grant agents to network function not available');
        return;
      }
      await grantAgentsToNetwork(
        testCompany.id,
        testNetwork.id,
        testNetwork.name,
        { "test-agent-2": { granted: true, assignmentType: 'approval' } },
        testUser.id,
        testUser.userName
      );
      updateTestStatus(suiteIndex, 1, 'passed', 'Agents granted to network successfully');
      
      // Test 3: Get Company Agent Permissions
      updateTestStatus(suiteIndex, 2, 'running', 'Getting company agent permissions...');
      if (!getCompanyAgentPermissions) {
        updateTestStatus(suiteIndex, 2, 'failed', 'Get company agent permissions function not available');
        return;
      }
      const companyPermissions = await getCompanyAgentPermissions(testCompany.id);
      updateTestStatus(suiteIndex, 2, 'passed', `Found ${Object.keys(companyPermissions).length} company permissions`);
      
      // Test 4: Get Network Agent Permissions
      updateTestStatus(suiteIndex, 3, 'running', 'Getting network agent permissions...');
      if (!getNetworkAgentPermissions) {
        updateTestStatus(suiteIndex, 3, 'failed', 'Get network agent permissions function not available');
        return;
      }
      const networkPermissions = await getNetworkAgentPermissions(testCompany.id, testNetwork.id);
      updateTestStatus(suiteIndex, 3, 'passed', `Found ${Object.keys(networkPermissions).length} network permissions`);
      
      // Test 5: Save Global Agent Settings
      updateTestStatus(suiteIndex, 4, 'running', 'Saving global agent settings...');
      if (!saveGlobalAgentSettings) {
        updateTestStatus(suiteIndex, 4, 'failed', 'Save global agent settings function not available');
        return;
      }
      await saveGlobalAgentSettings(
        { "test-agent-3": { enabled: true, defaultTier: 'free', defaultAssignmentType: 'free' } },
        testUser.id,
        testUser.userName
      );
      updateTestStatus(suiteIndex, 4, 'passed', 'Global agent settings saved successfully');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      updateTestStatus(suiteIndex, 0, 'failed', 'Test failed', errorMessage);
    }
  };

  const runNewAgentRequestsTests = async () => {
    const suiteIndex = 2;
    
    if (firebaseStatus !== 'available') {
      // Skip all tests if Firebase is not available
      for (let i = 0; i < 4; i++) {
        updateTestStatus(suiteIndex, i, 'skipped', 'Firebase not available - test skipped');
      }
      return;
    }
    
    try {
      // Test 1: Create New Agent Request
      updateTestStatus(suiteIndex, 0, 'running', 'Creating new agent request...');
      if (!createNewAgentRequest) {
        updateTestStatus(suiteIndex, 0, 'failed', 'Create new agent request function not available');
        return;
      }
      const requestId = await createNewAgentRequest({
        agentName: "Test Premium Agent",
        agentDescription: "A test premium agent",
        useCase: "Testing premium agent functionality",
        requesterId: testUser.id,
        requesterEmail: testUser.email,
        requesterName: testUser.userName,
        organizationId: testCompany.id,
        organizationName: testCompany.name,
        networkId: testNetwork.id,
        networkName: testNetwork.name,
        status: 'pending',
        requestedAt: new Date()
      });
      updateTestStatus(suiteIndex, 0, 'passed', `New agent request created with ID: ${requestId}`);
      
      // Test 2: Get Organization Requests
      updateTestStatus(suiteIndex, 1, 'running', 'Getting organization requests...');
      if (!getOrganizationNewAgentRequests) {
        updateTestStatus(suiteIndex, 1, 'failed', 'Get organization requests function not available');
        return;
      }
      const orgRequests = await getOrganizationNewAgentRequests(testCompany.id);
      updateTestStatus(suiteIndex, 1, 'passed', `Found ${orgRequests.length} organization requests`);
      
      // Test 3: Get Network Requests
      updateTestStatus(suiteIndex, 2, 'running', 'Getting network requests...');
      if (!getNetworkNewAgentRequests) {
        updateTestStatus(suiteIndex, 2, 'failed', 'Get network requests function not available');
        return;
      }
      const networkRequests = await getNetworkNewAgentRequests(testCompany.id, testNetwork.id);
      updateTestStatus(suiteIndex, 2, 'passed', `Found ${networkRequests.length} network requests`);
      
      // Test 4: Update Request Status
      updateTestStatus(suiteIndex, 3, 'running', 'Updating request status...');
      if (!updateNewAgentRequestStatus) {
        updateTestStatus(suiteIndex, 3, 'failed', 'Update request status function not available');
        return;
      }
      await updateNewAgentRequestStatus(
        requestId,
        'approved',
        testUser.id,
        testUser.email,
        testUser.userName,
        'Test approval'
      );
      updateTestStatus(suiteIndex, 3, 'passed', 'Request status updated successfully');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      updateTestStatus(suiteIndex, 0, 'failed', 'Test failed', errorMessage);
    }
  };

  const runUserLibraryTests = async () => {
    const suiteIndex = 3;
    
    if (firebaseStatus !== 'available') {
      // Skip all tests if Firebase is not available
      for (let i = 0; i < 5; i++) {
        updateTestStatus(suiteIndex, i, 'skipped', 'Firebase not available - test skipped');
      }
      return;
    }
    
    try {
      // Test 1: Create/Update User Profile
      updateTestStatus(suiteIndex, 0, 'running', 'Creating/updating user profile...');
      if (!createOrUpdateUserProfile) {
        updateTestStatus(suiteIndex, 0, 'failed', 'Create/update user profile function not available');
        return;
      }
      await createOrUpdateUserProfile(
        testUser.id,
        testUser.email,
        testUser.userName,
        testUser.organizationId,
        testUser.organizationName,
        testUser.role,
        testNetwork.id,
        testNetwork.name
      );
      updateTestStatus(suiteIndex, 0, 'passed', 'User profile created/updated successfully');
      
      // Test 2: Add Agent to User Library
      updateTestStatus(suiteIndex, 1, 'running', 'Adding agent to user library...');
      if (!addAgentToUserLibrary) {
        updateTestStatus(suiteIndex, 1, 'failed', 'Add agent to user library function not available');
        return;
      }
      await addAgentToUserLibrary(
        testUser.id,
        testUser.email,
        testUser.userName,
        "test-agent-4",
        "Test Agent",
        testUser.organizationId,
        testUser.organizationName,
        testNetwork.id,
        testNetwork.name,
        "Test assignment"
      );
      updateTestStatus(suiteIndex, 1, 'passed', 'Agent added to user library successfully');
      
      // Test 3: Get User Assigned Agents
      updateTestStatus(suiteIndex, 2, 'running', 'Getting user assigned agents...');
      if (!getUserAssignedAgents) {
        updateTestStatus(suiteIndex, 2, 'failed', 'Get user assigned agents function not available');
        return;
      }
      const userAgents = await getUserAssignedAgents(testUser.id);
      updateTestStatus(suiteIndex, 2, 'passed', `Found ${userAgents.length} assigned agents`);
      
      // Test 4: Check User Agent Access
      updateTestStatus(suiteIndex, 3, 'running', 'Checking user agent access...');
      if (!userHasAgentAccess) {
        updateTestStatus(suiteIndex, 3, 'failed', 'Check user agent access function not available');
        return;
      }
      const hasAccess = await userHasAgentAccess(testUser.id, "test-agent-4");
      updateTestStatus(suiteIndex, 3, 'passed', `User has access: ${hasAccess}`);
      
      // Test 5: Remove Agent from User Library
      updateTestStatus(suiteIndex, 4, 'running', 'Removing agent from user library...');
      if (!removeAgentFromUserLibrary) {
        updateTestStatus(suiteIndex, 4, 'failed', 'Remove agent from user library function not available');
        return;
      }
      await removeAgentFromUserLibrary(testUser.id, "test-agent-4");
      updateTestStatus(suiteIndex, 4, 'passed', 'Agent removed from user library successfully');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      updateTestStatus(suiteIndex, 0, 'failed', 'Test failed', errorMessage);
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setOverallStatus('running');
    
    // Reset all test statuses
    setTestSuites(prev => prev.map(suite => ({
      ...suite,
      status: 'pending',
      tests: suite.tests.map(test => ({ ...test, status: 'pending', message: '', error: undefined }))
    })));
    
    try {
      await Promise.all([
        runAgentManagementTests(),
        runHierarchicalPermissionsTests(),
        runNewAgentRequestsTests(),
        runUserLibraryTests()
      ]);
    } catch (error) {
      console.error('Test execution error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runTestSuite = async (suiteIndex: number) => {
    setIsRunning(true);
    
    try {
      switch (suiteIndex) {
        case 0:
          await runAgentManagementTests();
          break;
        case 1:
          await runHierarchicalPermissionsTests();
          break;
        case 2:
          await runNewAgentRequestsTests();
          break;
        case 3:
          await runUserLibraryTests();
          break;
      }
    } catch (error) {
      console.error('Test suite execution error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'text-green-600 bg-green-50 border-green-200';
      case 'failed': return 'text-red-600 bg-red-50 border-red-200';
      case 'running': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'skipped': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return '✅';
      case 'failed': return '❌';
      case 'running': return '🔄';
      case 'skipped': return '⏭️';
      default: return '⏳';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Agent System Test Suite</h1>
        <p className="text-gray-600 mb-6">
          Comprehensive testing of agent assignments and management functionality
        </p>
        
        {/* Firebase Status */}
        <div className="mb-4 p-4 rounded-lg border">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-700">Firebase Status:</span>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              firebaseStatus === 'available' ? 'text-green-600 bg-green-100' :
              firebaseStatus === 'unavailable' ? 'text-red-600 bg-red-100' :
              'text-yellow-600 bg-yellow-100'
            }`}>
              {firebaseStatus === 'available' ? 'Available' :
               firebaseStatus === 'unavailable' ? 'Unavailable' :
               'Checking...'}
            </span>
            {firebaseStatus === 'unavailable' && (
              <span className="text-sm text-red-600">
                Tests will be skipped - Firebase configuration required
              </span>
            )}
          </div>
        </div>
        
        <div className="flex space-x-4 mb-6">
          <button
            onClick={runAllTests}
            disabled={isRunning}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </button>
          
          <div className={`px-4 py-2 rounded-lg border ${getStatusColor(overallStatus)}`}>
            Overall Status: {overallStatus.toUpperCase()}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {testSuites.map((suite, suiteIndex) => (
          <div key={suite.name} className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">{suite.name}</h2>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(suite.status)}`}>
                {suite.status.toUpperCase()}
              </div>
            </div>
            
            <div className="mb-4">
              <button
                onClick={() => runTestSuite(suiteIndex)}
                disabled={isRunning}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Run {suite.name} Tests
              </button>
            </div>
            
            <div className="space-y-3">
              {suite.tests.map((test, testIndex) => (
                <div key={test.name} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-lg">{getStatusIcon(test.status)}</span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{test.name}</div>
                    {test.message && (
                      <div className="text-sm text-gray-600">{test.message}</div>
                    )}
                    {test.error && (
                      <div className="text-sm text-red-600 mt-1">{test.error}</div>
                    )}
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(test.status)}`}>
                    {test.status.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentSystemTestSuite;
