# Agent Management Guide

## Overview
The Transparent AI Agent Hub allows you to manage your personal collection of AI agents. You can add free agents directly to your library, request access to premium agents, and remove agents as needed.

## How to Add Agents to Your Library

### Free Agents (Like Gemini)
1. **Navigate to the Global Library** - This shows all available agents
2. **Find the Gemini Chat Agent** - Look for "Gemini Chat Agent" in the list
3. **Click "Add to Library"** - The button should be visible if the agent is free
4. **Agent Added Successfully** - The button will change to "Remove"

### Premium Agents
1. **Find the Premium Agent** - Look for agents marked as "Premium" or "Enterprise"
2. **Click "Request Access"** - This submits a request for approval
3. **Wait for Approval** - An admin will review your request
4. **Get Notified** - You'll receive an email when approved

## How to Remove Agents

1. **Go to "My Library"** - This shows agents currently in your library
2. **Find the Agent** - Locate the agent you want to remove
3. **Click "Remove"** - The button should now show "Remove" instead of "Add"
4. **Confirm Removal** - A dialog will ask for confirmation
5. **Agent Removed** - The agent is removed from your library

## How to Re-add Agents

1. **Go to "Global Library"** - Navigate back to see all available agents
2. **Find the Agent** - Locate the agent you previously removed
3. **Click "Add to Library"** - The button should be available again
4. **Agent Re-added** - The agent is back in your library

## Troubleshooting

### If "Add to Library" Button is Missing
- **Check if you're signed in** - You must be authenticated
- **Check agent tier** - Premium agents show "Request Access" instead
- **Check if already in library** - The button changes to "Remove" if already added

### If Agent Won't Add
- **Check console for errors** - Open browser dev tools (F12)
- **Check network tab** - Look for failed API calls
- **Use Debug Panel** - Click the "Debug" button in the stats section

### Debug Panel
The debug panel (accessible via the "Debug" button) will:
- Show your user profile information
- Check your current library status
- Test agent addition/removal
- Provide detailed error information

## Agent Tiers

### Free Tier
- **Direct Access** - Can be added immediately
- **No Approval Required** - Instant library addition
- **Examples** - Gemini Chat Agent, basic utility agents

### Premium Tier
- **Approval Required** - Must request access
- **Admin Review** - Company or network admin reviews
- **Examples** - Advanced AI models, specialized tools

### Enterprise Tier
- **Restricted Access** - Limited to specific organizations
- **Special Permissions** - May require additional setup
- **Examples** - Company-specific agents, sensitive tools

## Library Types

### Global Library
- **All Available Agents** - Shows every agent in the system
- **Public Access** - Visible to all authenticated users
- **Add/Request** - Primary place to discover new agents

### Personal Library
- **Your Collection** - Agents you've added or been assigned
- **Quick Access** - Easy access to your working agents
- **Manage** - Add, remove, and organize your agents

### Company Library
- **Organization Agents** - Agents available to your company
- **Admin Managed** - Company admins control access
- **Shared Resources** - Available to all company members

## Best Practices

1. **Start with Free Agents** - Test the system with Gemini Chat Agent
2. **Organize Your Library** - Use tags and categories to group agents
3. **Request Access Early** - Submit premium agent requests well in advance
4. **Monitor Usage** - Check your agent usage and costs regularly
5. **Report Issues** - Use the debug panel if something isn't working

## Common Issues and Solutions

### "Agent not found" Error
- **Refresh the page** - Data may be stale
- **Check agent ID** - Ensure the agent exists in the system
- **Clear browser cache** - Remove any cached data

### "Permission denied" Error
- **Check user role** - Ensure you have the right permissions
- **Contact admin** - Your organization may have restrictions
- **Verify authentication** - Make sure you're properly signed in

### "Library not loading" Issue
- **Check internet connection** - Ensure stable connectivity
- **Clear browser data** - Remove cookies and cache
- **Try different browser** - Test in Chrome, Firefox, or Safari

## Getting Help

If you continue to have issues:

1. **Use the Debug Panel** - Click the debug button for detailed information
2. **Check Browser Console** - Look for error messages (F12 → Console)
3. **Contact Support** - Reach out to your system administrator
4. **Check Documentation** - Review this guide and other system docs

## Quick Test

To verify everything is working:

1. Go to http://localhost:3000
2. Sign in to your account
3. Navigate to "Global Library"
4. Look for "Gemini Chat Agent"
5. Click "Add to Library"
6. Check "My Library" to confirm it was added
7. Go back and click "Remove"
8. Verify it was removed from your library

The system should work smoothly for these basic operations. If you encounter issues, use the debug panel to identify the problem.
