// This script sets up basic permissions for Transparent Partners company
// Run this once to initialize the permission structure

import { grantAgentsToCompany } from './frontend/src/services/hierarchicalPermissionService.js';

async function setupTransparentPermissions() {
  try {
    console.log('Setting up Transparent Partners permissions...');
    
    // Grant basic agents to Transparent Partners company
    const agentPermissions = {
      'gemini-chat-agent': {
        granted: true,
        assignmentType: 'free' // Users can add directly
      },
      'google-imagen-agent': {
        granted: true,
        assignmentType: 'approval' // Users must request access
      }
    };
    
    await grantAgentsToCompany(
      'transparent-partners',
      'Transparent Partners',
      agentPermissions,
      'super-admin-setup', // Admin ID
      'System Setup' // Admin name
    );
    
    console.log('✅ Transparent Partners permissions set up successfully!');
    console.log('- Gemini Chat Agent: Free (direct add)');
    console.log('- Google Imagen Agent: Premium (requires approval)');
    
  } catch (error) {
    console.error('❌ Error setting up permissions:', error);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupTransparentPermissions();
}
