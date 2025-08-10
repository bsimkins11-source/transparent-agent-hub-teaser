# Company Admin Features

## Overview
The company admin section provides comprehensive management capabilities for company administrators to manage users, distribute agents, and handle approval workflows within their organization.

## Core Functionality

### 1. User Management
- **Add Users to Company Portal**: Company admins can invite new users by email
- **Remove Users from Company Portal**: Suspend user access and archive their data
- **Automatic Agent Library Creation**: Every new user gets a dedicated agent library automatically
- **User Status Management**: Track active, pending, and suspended users

### 2. Agent Distribution
- **Access to Super Admin Assigned Agents**: Company admins can only distribute agents that have been assigned to the company by the super admin
- **Cannot Add New Agents**: Company admins cannot add new agents to the company library
- **Agent Assignment to Users**: Distribute available agents to individual users
- **Agent Assignment to Networks**: Assign agents to specific networks within the company

### 3. Approval Workflow
- **Company Users**: Agent requests go directly to company admin for approval
- **Network Users**: Requests go to network admin first, then company admin if approved
- **Premium Agents**: Always require approval regardless of user type
- **Automatic Library Updates**: Approved agents are automatically added to user's library

### 4. Company Branding Configuration
- **Company Colors**: Configure primary and secondary colors for the company portal
- **Company Logo**: Upload and manage company branding
- **UI Inheritance**: Networks and users inherit company UI configurations
- **Branding Preview**: Visual preview of current company branding

## User Interface Components

### Dashboard Overview
- Company statistics and metrics
- Quick access to user management
- Agent distribution status
- Pending approval requests

### User Management Modal
- **Users Tab**: View all company users, their roles, and agent library counts
- **Requests Tab**: Review and approve/deny agent requests
- **User Actions**: Add new users, remove existing users, view user libraries

### Agent Management
- **Available Agents Display**: Show agents assigned by super admin
- **Distribution Statistics**: Track how many agents are distributed
- **Agent Details**: View agent tiers, approval requirements, and descriptions

### Company Branding
- **Color Configuration**: Primary and secondary color pickers
- **Logo Management**: Upload and preview company logos
- **Real-time Preview**: See branding changes immediately

## Data Flow

### User Addition Process
1. Company admin enters user email
2. System creates user account with pending status
3. User's dedicated agent library is initialized
4. Invitation email is sent to user
5. User accepts invitation and account becomes active

### Agent Request Process
1. User requests agent from company library
2. System determines approval level (network vs company admin)
3. Request is routed to appropriate admin
4. Admin reviews and approves/denies request
5. If approved, agent is automatically added to user's library

### Agent Distribution
1. Super admin assigns agents to company
2. Company admin can see available agents
3. Company admin distributes agents to users/networks
4. Users can request additional agents
5. Approval workflow handles premium agent requests

## Technical Implementation

### Services
- **userManagementService.ts**: Handles user CRUD operations and agent library management
- **hierarchicalPermissionService.ts**: Manages agent permissions and distribution
- **requestService.ts**: Handles agent request approval workflows

### Database Collections
- `companyUsers`: Company user accounts and metadata
- `userAgentLibraries`: Individual user agent libraries
- `agentRequests`: Pending and processed agent requests
- `userInvitations`: User invitation tracking

### Key Features
- **Real-time Updates**: Dashboard refreshes automatically
- **Permission-based Access**: Role-based access control
- **Audit Trail**: Track all user and agent changes
- **Responsive Design**: Works on all device sizes

## Security Considerations

### Access Control
- Only company admins can access company admin features
- User data is isolated by company
- Network admins have limited scope within their networks

### Data Privacy
- User information is company-scoped
- Agent libraries are user-specific
- Approval workflows maintain audit trails

## Future Enhancements

### Planned Features
- **Bulk User Operations**: Add/remove multiple users at once
- **Advanced Reporting**: Detailed analytics on agent usage
- **Automated Workflows**: Rule-based agent approval
- **Integration APIs**: Connect with external HR systems

### Scalability
- **Multi-tenant Architecture**: Support for large organizations
- **Performance Optimization**: Efficient data loading and caching
- **Mobile App**: Native mobile application for admins

## Usage Examples

### Adding a New User
1. Navigate to User Management
2. Click "Add User"
3. Enter user's email address
4. Select user role (user, network_admin, company_admin)
5. Optionally assign to a specific network
6. Send invitation

### Approving Agent Requests
1. Check Pending Requests tab
2. Review request details and business justification
3. Click "Approve" or "Deny"
4. Provide reason for denial if applicable
5. Agent is automatically added to user's library if approved

### Configuring Company Branding
1. Navigate to Company Branding section
2. Upload company logo
3. Select primary and secondary colors
4. Preview changes in real-time
5. Save configuration

## Support and Troubleshooting

### Common Issues
- **User Invitations Not Sent**: Check email configuration
- **Agent Requests Not Appearing**: Verify user permissions
- **Branding Not Updating**: Clear browser cache

### Best Practices
- **Regular User Reviews**: Periodically review user access
- **Agent Distribution**: Monitor agent usage and distribution
- **Branding Consistency**: Maintain consistent company branding across all touchpoints
