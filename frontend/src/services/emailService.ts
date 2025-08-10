import { logger } from '../utils/logger';

export interface EmailRequest {
  to: string;
  subject: string;
  body: string;
  from?: string;
  replyTo?: string;
}

export interface AgentRequestEmailData {
  agentName: string;
  agentDescription: string;
  useCase: string;
  businessJustification: string;
  expectedUsage: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category: string;
  targetUsers: string;
  requesterName: string;
  requesterEmail: string;
  libraryType: string;
  companySlug?: string;
  networkSlug?: string;
}

/**
 * Send an email using the configured email service
 * In production, this would integrate with SendGrid, AWS SES, or similar
 */
export async function sendEmail(emailRequest: EmailRequest): Promise<boolean> {
  try {
    logger.debug('Sending email', { to: emailRequest.to, subject: emailRequest.subject }, 'EmailService');

    // For now, we'll use a simple approach that opens the user's email client
    // In production, you would integrate with a proper email service
    
    // Option 1: Use mailto link (current implementation)
    const mailtoLink = `mailto:${emailRequest.to}?subject=${encodeURIComponent(emailRequest.subject)}&body=${encodeURIComponent(emailRequest.body)}`;
    window.open(mailtoLink, '_blank');
    
    // Option 2: Send to backend API (uncomment when backend is ready)
    /*
    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailRequest),
    });
    
    if (!response.ok) {
      throw new Error(`Email service responded with ${response.status}`);
    }
    
    const result = await response.json();
    return result.success;
    */
    
    return true;
  } catch (error) {
    logger.error('Failed to send email', { error, emailRequest }, 'EmailService');
    return false;
  }
}

/**
 * Send an agent request email to the appropriate administrator
 */
export async function sendAgentRequestEmail(data: AgentRequestEmailData): Promise<boolean> {
  try {
    // Determine recipient based on library type
    let recipientEmail: string;
    let recipientName: string;
    let recipientTitle: string;
    
    if (data.libraryType === 'company' && data.companySlug) {
      recipientEmail = `admin@${data.companySlug}.com`; // This would come from company settings
      recipientName = 'Company Administrator';
      recipientTitle = 'Company Admin';
    } else if (data.libraryType === 'network' && data.companySlug && data.networkSlug) {
      recipientEmail = `network-admin@${data.companySlug}.com`; // This would come from network settings
      recipientName = 'Network Administrator';
      recipientTitle = 'Network Admin';
    } else if (data.libraryType === 'global') {
      recipientEmail = 'super-admin@transparent-partners.com'; // Super admin for global requests
      recipientName = 'Super Administrator';
      recipientTitle = 'Super Admin';
    } else {
      recipientEmail = 'admin@transparent-partners.com'; // Default admin
      recipientName = 'System Administrator';
      recipientTitle = 'System Admin';
    }

    // Create email content
    const subject = `New Agent Request: ${data.agentName}`;
    const body = `
New Agent Request

From: ${data.requesterName} (${data.requesterEmail})
Library: ${data.libraryType.charAt(0).toUpperCase() + data.libraryType.slice(1)} Library
${data.companySlug ? `Company: ${data.companySlug}` : ''}
${data.networkSlug ? `Network: ${data.networkSlug}` : ''}

Agent Details:
- Name: ${data.agentName}
- Category: ${data.category || 'Not specified'}
- Priority: ${data.priority.toUpperCase()}
- Description: ${data.agentDescription}

Use Case:
${data.useCase}

Business Justification:
${data.businessJustification}

Expected Usage:
${data.expectedUsage}

Target Users:
${data.targetUsers}

Requested at: ${new Date().toLocaleString()}

Please review this request and consider adding this agent to the ${data.libraryType} library.

Best regards,
${data.requesterName}
    `.trim();

    // Send the email
    const success = await sendEmail({
      to: recipientEmail,
      subject,
      body,
      replyTo: data.requesterEmail
    });

    if (success) {
      logger.info('Agent request email sent successfully', {
        recipient: recipientEmail,
        agentName: data.agentName,
        requester: data.requesterEmail
      }, 'EmailService');
    }

    return success;
  } catch (error) {
    logger.error('Failed to send agent request email', { error, data }, 'EmailService');
    return false;
  }
}

/**
 * Send a notification email to the requester confirming their request was sent
 */
export async function sendRequestConfirmationEmail(data: AgentRequestEmailData): Promise<boolean> {
  try {
    const subject = `Agent Request Confirmation: ${data.agentName}`;
    const body = `
Dear ${data.requesterName},

Your request for a new AI agent has been submitted successfully.

Request Details:
- Agent Name: ${data.agentName}
- Category: ${data.category || 'Not specified'}
- Priority: ${data.priority.toUpperCase()}
- Library: ${data.libraryType.charAt(0).toUpperCase() + data.libraryType.slice(1)} Library

Your request has been sent to the appropriate administrator for review. You will be notified once a decision has been made.

If you have any questions about your request, please contact your administrator.

Best regards,
The Transparent AI Agent Hub Team
    `.trim();

    const success = await sendEmail({
      to: data.requesterEmail,
      subject,
      body
    });

    if (success) {
      logger.info('Request confirmation email sent successfully', {
        recipient: data.requesterEmail,
        agentName: data.agentName
      }, 'EmailService');
    }

    return success;
  } catch (error) {
    logger.error('Failed to send request confirmation email', { error, data }, 'EmailService');
    return false;
  }
}
