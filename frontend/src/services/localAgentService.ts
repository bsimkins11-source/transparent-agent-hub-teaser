import { Agent } from '../types/agent';

// Local agent data - completely self-contained
const localAgents: Agent[] = [
  {
    id: 'gemini-chat-agent',
    name: 'Gemini Chat Agent',
    description: 'Advanced conversational AI powered by Google\'s Gemini model. Engage in natural conversations, get help with creative tasks, research, coding, and general questions with access to current information.',
    provider: 'google',
    route: '/agents/gemini-chat-agent',
    metadata: {
      tags: ['conversation', 'general-purpose', 'research', 'creative', 'coding', 'analysis', 'ai-assistant'],
      category: 'General AI',
      tier: 'free',
      permissionType: 'free',
      version: '1.0.0',
      promptTemplateId: 'gemini-chat-template',
      executionTarget: 'vertex',
      testConfig: {},
      changelog: ['Initial release with Gemini Pro capabilities']
    },
    visibility: 'global',
    allowedClients: [],
    allowedRoles: ['admin', 'client', 'user'],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    status: 'approved',
    submitterId: 'google-system',
    submitterEmail: 'gemini@google.com',
    submitterName: 'Google AI',
    submissionDate: '2024-01-15T00:00:00Z',
    reviewedBy: 'google-system',
    reviewerEmail: 'gemini@google.com',
    reviewerName: 'Google AI',
    approvalDate: '2024-01-15T00:00:00Z',
    rejectionReason: '',
    auditTrail: [],
    organizationId: '',
    organizationName: '',
    networkId: '',
    networkName: '',
    icon: '🤖'
  },
  {
    id: 'imagen-agent',
    name: 'Google Imagen Agent',
    description: 'AI-powered image generation using Google\'s Imagen model. Create high-quality images from text descriptions, get help crafting effective prompts, and explore various artistic styles.',
    provider: 'google',
    route: '/agents/imagen-agent',
    metadata: {
      tags: ['image-generation', 'creative', 'art', 'design', 'visual', 'prompting', 'ai-art'],
      category: 'Creative AI',
      tier: 'premium',
      permissionType: 'request',
      version: '1.0.0',
      promptTemplateId: 'imagen-template',
      executionTarget: 'vertex',
      testConfig: {},
      changelog: ['Initial release with Imagen 2.0 capabilities']
    },
    visibility: 'global',
    allowedClients: [],
    allowedRoles: ['admin', 'client', 'user'],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    status: 'approved',
    submitterId: 'google-system',
    submitterEmail: 'imagen@google.com',
    submitterName: 'Google AI',
    submissionDate: '2024-01-15T00:00:00Z',
    reviewedBy: 'google-system',
    reviewerEmail: 'imagen@google.com',
    reviewerName: 'Google AI',
    approvalDate: '2024-01-15T00:00:00Z',
    rejectionReason: '',
    auditTrail: [],
    organizationId: '',
    organizationName: '',
    networkId: '',
    networkName: '',
    icon: '🎨'
  },
  {
    id: 'fake-agent-1',
    name: 'Demo Agent 1',
    description: 'A simple demo agent for testing purposes.',
    provider: 'demo',
    route: '/agents/fake-agent-1',
    metadata: {
      tags: ['demo', 'test'],
      category: 'Demo',
      tier: 'free',
      permissionType: 'free',
      version: '1.0.0'
    },
    visibility: 'global',
    allowedClients: [],
    allowedRoles: ['admin', 'client', 'user'],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    status: 'approved',
    submitterId: 'demo-system',
    submitterEmail: 'demo@example.com',
    submitterName: 'Demo System',
    submissionDate: '2024-01-15T00:00:00Z',
    reviewedBy: 'demo-system',
    reviewerEmail: 'demo@example.com',
    reviewerName: 'Demo System',
    approvalDate: '2024-01-15T00:00:00Z',
    rejectionReason: '',
    auditTrail: [],
    organizationId: '',
    organizationName: '',
    networkId: '',
    networkName: '',
    icon: '🧪'
  },
  {
    id: 'fake-agent-2',
    name: 'Demo Agent 2',
    description: 'Another simple demo agent for testing purposes.',
    provider: 'demo',
    route: '/agents/fake-agent-2',
    metadata: {
      tags: ['demo', 'test'],
      category: 'Demo',
      tier: 'free',
      permissionType: 'free',
      version: '1.0.0'
    },
    visibility: 'global',
    allowedClients: [],
    allowedRoles: ['admin', 'client', 'user'],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    status: 'approved',
    submitterId: 'demo-system',
    submitterEmail: 'demo@example.com',
    submitterName: 'Demo System',
    submissionDate: '2024-01-15T00:00:00Z',
    reviewedBy: 'demo-system',
    reviewerEmail: 'demo@example.com',
    reviewerName: 'Demo System',
    approvalDate: '2024-01-15T00:00:00Z',
    rejectionReason: '',
    auditTrail: [],
    organizationId: '',
    organizationName: '',
    networkId: '',
    networkName: '',
    icon: '🧪'
  },
  {
    id: 'marketing-assistant',
    name: 'Marketing Assistant',
    description: 'AI-powered marketing assistant that helps create campaigns, analyze performance, and optimize strategies. Perfect for marketing teams and agencies.',
    provider: 'openai',
    route: '/agents/marketing-assistant',
    metadata: {
      tags: ['marketing', 'campaigns', 'analytics', 'strategy', 'social-media', 'content'],
      category: 'Business',
      tier: 'free',
      permissionType: 'free',
      version: '1.0.0'
    },
    visibility: 'global',
    allowedClients: [],
    allowedRoles: ['admin', 'client', 'user'],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    status: 'approved',
    submitterId: 'openai-system',
    submitterEmail: 'assistants@openai.com',
    submitterName: 'OpenAI',
    submissionDate: '2024-01-15T00:00:00Z',
    reviewedBy: 'openai-system',
    reviewerEmail: 'assistants@openai.com',
    reviewerName: 'OpenAI',
    approvalDate: '2024-01-15T00:00:00Z',
    rejectionReason: '',
    auditTrail: [],
    organizationId: '',
    organizationName: '',
    networkId: '',
    networkName: '',
    icon: '📈'
  },
  {
    id: 'sales-analyzer',
    name: 'Sales Analyzer',
    description: 'Intelligent sales analytics agent that helps analyze sales data, identify opportunities, and provide actionable insights for sales teams.',
    provider: 'anthropic',
    route: '/agents/sales-analyzer',
    metadata: {
      tags: ['sales', 'analytics', 'data', 'insights', 'opportunities', 'performance'],
      category: 'Business',
      tier: 'premium',
      permissionType: 'approval',
      version: '1.0.0'
    },
    visibility: 'global',
    allowedClients: [],
    allowedRoles: ['admin', 'client', 'user'],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    status: 'approved',
    submitterId: 'anthropic-system',
    submitterEmail: 'assistants@anthropic.com',
    submitterName: 'Anthropic',
    submissionDate: '2024-01-15T00:00:00Z',
    reviewedBy: 'anthropic-system',
    reviewerEmail: 'assistants@anthropic.com',
    reviewerName: 'Anthropic',
    approvalDate: '2024-01-15T00:00:00Z',
    rejectionReason: '',
    auditTrail: [],
    organizationId: '',
    organizationName: '',
    networkId: '',
    networkName: '',
    icon: '💰'
  },
  {
    id: 'content-writer',
    name: 'Content Writer',
    description: 'AI-powered content creation assistant that helps write blogs, articles, marketing copy, and other written content with SEO optimization.',
    provider: 'openai',
    route: '/agents/content-writer',
    metadata: {
      tags: ['writing', 'content', 'blog', 'seo', 'marketing', 'creative'],
      category: 'Creative',
      tier: 'free',
      permissionType: 'free',
      version: '1.0.0'
    },
    visibility: 'global',
    allowedClients: [],
    allowedRoles: ['admin', 'client', 'user'],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    status: 'approved',
    submitterId: 'openai-system',
    submitterEmail: 'assistants@openai.com',
    submitterName: 'OpenAI',
    submissionDate: '2024-01-15T00:00:00Z',
    reviewedBy: 'openai-system',
    reviewerEmail: 'assistants@openai.com',
    reviewerName: 'OpenAI',
    approvalDate: '2024-01-15T00:00:00Z',
    rejectionReason: '',
    auditTrail: [],
    organizationId: '',
    organizationName: '',
    networkId: '',
    networkName: '',
    icon: '✍️'
  },
  {
    id: 'data-analyst',
    name: 'Data Analyst',
    description: 'Advanced data analysis agent that helps interpret complex datasets, create visualizations, and generate insights for business intelligence.',
    provider: 'anthropic',
    route: '/agents/data-analyst',
    metadata: {
      tags: ['data', 'analytics', 'visualization', 'business-intelligence', 'insights', 'reporting'],
      category: 'Analytics',
      tier: 'premium',
      permissionType: 'approval',
      version: '1.0.0'
    },
    visibility: 'global',
    allowedClients: [],
    allowedRoles: ['admin', 'client', 'user'],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    status: 'approved',
    submitterId: 'anthropic-system',
    submitterEmail: 'assistants@anthropic.com',
    submitterName: 'Anthropic',
    submissionDate: '2024-01-15T00:00:00Z',
    reviewedBy: 'anthropic-system',
    reviewerEmail: 'assistants@anthropic.com',
    reviewerName: 'Anthropic',
    approvalDate: '2024-01-15T00:00:00Z',
    rejectionReason: '',
    auditTrail: [],
    organizationId: '',
    organizationName: '',
    networkId: '',
    networkName: '',
    icon: '📊'
  },
  {
    id: 'customer-support',
    name: 'Customer Support',
    description: 'AI-powered customer support agent that handles inquiries, provides solutions, and escalates complex issues to human agents.',
    provider: 'openai',
    route: '/agents/customer-support',
    metadata: {
      tags: ['support', 'customer-service', 'helpdesk', 'inquiries', 'solutions', 'escalation'],
      category: 'Business',
      tier: 'free',
      permissionType: 'free',
      version: '1.0.0'
    },
    visibility: 'global',
    allowedClients: [],
    allowedRoles: ['admin', 'client', 'user'],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    status: 'approved',
    submitterId: 'openai-system',
    submitterEmail: 'assistants@openai.com',
    submitterName: 'OpenAI',
    submissionDate: '2024-01-15T00:00:00Z',
    reviewedBy: 'openai-system',
    reviewerEmail: 'assistants@openai.com',
    reviewerName: 'OpenAI',
    approvalDate: '2024-01-15T00:00:00Z',
    rejectionReason: '',
    auditTrail: [],
    organizationId: '',
    organizationName: '',
    networkId: '',
    networkName: '',
    icon: '🎧'
  },
  {
    id: 'code-assistant',
    name: 'Code Assistant',
    description: 'Intelligent coding assistant that helps with code review, debugging, optimization, and best practices across multiple programming languages.',
    provider: 'anthropic',
    route: '/agents/code-assistant',
    metadata: {
      tags: ['coding', 'programming', 'debugging', 'review', 'optimization', 'best-practices'],
      category: 'Development',
      tier: 'premium',
      permissionType: 'approval',
      version: '1.0.0'
    },
    visibility: 'global',
    allowedClients: [],
    allowedRoles: ['admin', 'client', 'user'],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    status: 'approved',
    submitterId: 'anthropic-system',
    submitterEmail: 'assistants@anthropic.com',
    submitterName: 'Anthropic',
    submissionDate: '2024-01-15T00:00:00Z',
    reviewedBy: 'anthropic-system',
    reviewerEmail: 'assistants@anthropic.com',
    reviewerName: 'Anthropic',
    approvalDate: '2024-01-15T00:00:00Z',
    rejectionReason: '',
    auditTrail: [],
    organizationId: '',
    organizationName: '',
    networkId: '',
    networkName: '',
    icon: '💻'
  },
  {
    id: 'research-assistant',
    name: 'Research Assistant',
    description: 'Comprehensive research agent that helps gather information, analyze sources, and synthesize findings for academic and business research.',
    provider: 'openai',
    route: '/agents/research-assistant',
    metadata: {
      tags: ['research', 'information-gathering', 'analysis', 'synthesis', 'academic', 'business'],
      category: 'Research',
      tier: 'free',
      permissionType: 'free',
      version: '1.0.0'
    },
    visibility: 'global',
    allowedClients: [],
    allowedRoles: ['admin', 'client', 'user'],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    status: 'approved',
    submitterId: 'openai-system',
    submitterEmail: 'assistants@openai.com',
    submitterName: 'OpenAI',
    submissionDate: '2024-01-15T00:00:00Z',
    reviewedBy: 'openai-system',
    reviewerEmail: 'assistants@openai.com',
    reviewerName: 'OpenAI',
    approvalDate: '2024-01-15T00:00:00Z',
    rejectionReason: '',
    auditTrail: [],
    organizationId: '',
    organizationName: '',
    networkId: '',
    networkName: '',
    icon: '🔬'
  },
  {
    id: 'project-manager',
    name: 'Project Manager',
    description: 'AI project management assistant that helps plan projects, track progress, manage resources, and coordinate team activities.',
    provider: 'anthropic',
    route: '/agents/project-manager',
    metadata: {
      tags: ['project-management', 'planning', 'tracking', 'resources', 'coordination', 'team'],
      category: 'Business',
      tier: 'premium',
      permissionType: 'approval',
      version: '1.0.0'
    },
    visibility: 'global',
    allowedClients: [],
    allowedRoles: ['admin', 'client', 'user'],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    status: 'approved',
    submitterId: 'anthropic-system',
    submitterEmail: 'assistants@openai.com',
    submitterName: 'Anthropic',
    submissionDate: '2024-01-15T00:00:00Z',
    reviewedBy: 'anthropic-system',
    reviewerEmail: 'assistants@openai.com',
    reviewerName: 'Anthropic',
    approvalDate: '2024-01-15T00:00:00Z',
    rejectionReason: '',
    auditTrail: [],
    organizationId: '',
    organizationName: '',
    networkId: '',
    networkName: '',
    icon: '📋'
  },
  {
    id: 'design-helper',
    name: 'Design Helper',
    description: 'Creative design assistant that helps with graphic design, UI/UX concepts, color schemes, and design inspiration for various projects.',
    provider: 'openai',
    route: '/agents/design-helper',
    metadata: {
      tags: ['design', 'graphic-design', 'ui-ux', 'color-schemes', 'inspiration', 'creative'],
      category: 'Creative',
      tier: 'free',
      permissionType: 'free',
      version: '1.0.0'
    },
    visibility: 'global',
    allowedClients: [],
    allowedRoles: ['admin', 'client', 'user'],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    status: 'approved',
    submitterId: 'openai-system',
    submitterEmail: 'assistants@openai.com',
    submitterName: 'OpenAI',
    submissionDate: '2024-01-15T00:00:00Z',
    reviewedBy: 'openai-system',
    reviewerEmail: 'assistants@openai.com',
    reviewerName: 'OpenAI',
    approvalDate: '2024-01-15T00:00:00Z',
    rejectionReason: '',
    auditTrail: [],
    organizationId: '',
    organizationName: '',
    networkId: '',
    networkName: '',
    icon: '🎨'
  },
  {
    id: 'financial-advisor',
    name: 'Financial Advisor',
    description: 'AI financial planning assistant that helps with budgeting, investment analysis, financial modeling, and personal finance advice.',
    provider: 'anthropic',
    route: '/agents/financial-advisor',
    metadata: {
      tags: ['finance', 'budgeting', 'investment', 'modeling', 'planning', 'advice'],
      category: 'Finance',
      tier: 'premium',
      permissionType: 'approval',
      version: '1.0.0'
    },
    visibility: 'global',
    allowedClients: [],
    allowedRoles: ['admin', 'client', 'user'],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    status: 'approved',
    submitterId: 'anthropic-system',
    submitterEmail: 'assistants@anthropic.com',
    submitterName: 'Anthropic',
    submissionDate: '2024-01-15T00:00:00Z',
    reviewedBy: 'anthropic-system',
    reviewerEmail: 'assistants@anthropic.com',
    reviewerName: 'Anthropic',
    approvalDate: '2024-01-15T00:00:00Z',
    rejectionReason: '',
    auditTrail: [],
    organizationId: '',
    organizationName: '',
    networkId: '',
    networkName: '',
    icon: '💹'
  },
  // Coca-Cola Marketing Agents
  {
    id: 'project-harmony',
    name: 'Project Harmony',
    description: 'Coca-Cola\'s AI-powered brand harmony agent that ensures consistent messaging, tone, and visual identity across all marketing campaigns and touchpoints.',
    provider: 'openai',
    route: '/agents/project-harmony',
    metadata: {
      tags: ['brand-harmony', 'messaging', 'tone', 'visual-identity', 'consistency', 'coca-cola'],
      category: 'Brand Marketing',
      tier: 'premium',
      permissionType: 'request',
      version: '1.0.0'
    },
    visibility: 'company',
    allowedClients: ['coca-cola'],
    allowedRoles: ['admin', 'client', 'user'],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    status: 'approved',
    submitterId: 'coca-cola-system',
    submitterEmail: 'ai@coca-cola.com',
    submitterName: 'Coca-Cola AI Team',
    submissionDate: '2024-01-15T00:00:00Z',
    reviewedBy: 'coca-cola-system',
    reviewerEmail: 'ai@coca-cola.com',
    reviewerName: 'Coca-Cola AI Team',
    approvalDate: '2024-01-15T00:00:00Z',
    rejectionReason: '',
    auditTrail: [],
    organizationId: 'coca-cola',
    organizationName: 'Coca-Cola',
    networkId: '',
    networkName: '',
    icon: '🎵'
  },
  {
    id: 'project-symphony',
    name: 'Project Symphony',
    description: 'Coca-Cola\'s AI marketing orchestration agent that coordinates multi-channel campaigns, synchronizes messaging, and optimizes customer journey touchpoints.',
    provider: 'anthropic',
    route: '/agents/project-symphony',
    metadata: {
      tags: ['marketing-orchestration', 'multi-channel', 'customer-journey', 'campaign-coordination', 'synchronization', 'coca-cola'],
      category: 'Marketing Operations',
      tier: 'premium',
      permissionType: 'request',
      version: '1.0.0'
    },
    visibility: 'company',
    allowedClients: ['coca-cola'],
    allowedRoles: ['admin', 'client', 'user'],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    status: 'approved',
    submitterId: 'coca-cola-system',
    submitterEmail: 'ai@coca-cola.com',
    submitterName: 'Coca-Cola AI Team',
    submissionDate: '2024-01-15T00:00:00Z',
    reviewedBy: 'coca-cola-system',
    reviewerEmail: 'ai@coca-cola.com',
    reviewerName: 'Coca-Cola AI Team',
    approvalDate: '2024-01-15T00:00:00Z',
    rejectionReason: '',
    auditTrail: [],
    organizationId: 'coca-cola',
    organizationName: 'Coca-Cola',
    networkId: '',
    networkName: '',
    icon: '🎼'
  },
  {
    id: 'coke-campaign-creator',
    name: 'Coke Campaign Creator',
    description: 'AI-powered campaign development agent that creates engaging Coca-Cola marketing campaigns, social media content, and promotional materials.',
    provider: 'openai',
    route: '/agents/coke-campaign-creator',
    metadata: {
      tags: ['campaign-creation', 'social-media', 'promotional', 'content-generation', 'coca-cola', 'marketing'],
      category: 'Campaign Development',
      tier: 'free',
      permissionType: 'free',
      version: '1.0.0'
    },
    visibility: 'company',
    allowedClients: ['coca-cola'],
    allowedRoles: ['admin', 'client', 'user'],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    status: 'approved',
    submitterId: 'coca-cola-system',
    submitterEmail: 'ai@coca-cola.com',
    submitterName: 'Coca-Cola AI Team',
    submissionDate: '2024-01-15T00:00:00Z',
    reviewedBy: 'coca-cola-system',
    reviewerEmail: 'ai@coca-cola.com',
    reviewerName: 'Coca-Cola AI Team',
    approvalDate: '2024-01-15T00:00:00Z',
    rejectionReason: '',
    auditTrail: [],
    organizationId: 'coca-cola',
    organizationName: 'Coca-Cola',
    networkId: '',
    networkName: '',
    icon: '🥤'
  },
  {
    id: 'coke-brand-analytics',
    name: 'Coke Brand Analytics',
    description: 'Advanced brand performance analytics agent that tracks Coca-Cola brand sentiment, market share, and campaign effectiveness across global markets.',
    provider: 'anthropic',
    route: '/agents/coke-brand-analytics',
    metadata: {
      tags: ['brand-analytics', 'sentiment-analysis', 'market-share', 'campaign-effectiveness', 'global-markets', 'coca-cola'],
      category: 'Brand Intelligence',
      tier: 'premium',
      permissionType: 'request',
      version: '1.0.0'
    },
    visibility: 'company',
    allowedClients: ['coca-cola'],
    allowedRoles: ['admin', 'client', 'user'],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    status: 'approved',
    submitterId: 'coca-cola-system',
    submitterEmail: 'ai@coca-cola.com',
    submitterName: 'Coca-Cola AI Team',
    submissionDate: '2024-01-15T00:00:00Z',
    reviewedBy: 'coca-cola-system',
    reviewerEmail: 'ai@coca-cola.com',
    reviewerName: 'Coca-Cola AI Team',
    approvalDate: '2024-01-15T00:00:00Z',
    rejectionReason: '',
          auditTrail: [],
    organizationId: 'coca-cola',
    organizationName: 'Coca-Cola',
    networkId: '',
    networkName: '',
    icon: '📊'
  },
  {
    id: 'coke-social-media',
    name: 'Coke Social Media',
    description: 'AI social media management agent that creates engaging posts, monitors conversations, and manages Coca-Cola\'s social media presence across platforms.',
    provider: 'openai',
    route: '/agents/coke-social-media',
    metadata: {
      tags: ['social-media', 'content-creation', 'conversation-monitoring', 'platform-management', 'coca-cola', 'engagement'],
      category: 'Social Media',
      tier: 'free',
      permissionType: 'free',
      version: '1.0.0'
    },
    visibility: 'company',
    allowedClients: ['coca-cola'],
    allowedRoles: ['admin', 'client', 'user'],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    status: 'approved',
    submitterId: 'coca-cola-system',
    submitterEmail: 'ai@coca-cola.com',
    submitterName: 'Coca-Cola AI Team',
    submissionDate: '2024-01-15T00:00:00Z',
    reviewedBy: 'coca-cola-system',
    reviewerEmail: 'ai@coca-cola.com',
    reviewerName: 'Coca-Cola AI Team',
    approvalDate: '2024-01-15T00:00:00Z',
    rejectionReason: '',
    auditTrail: [],
    organizationId: 'coca-cola',
    organizationName: 'Coca-Cola',
    networkId: '',
    networkName: '',
    icon: '📱'
  },
  {
    id: 'coke-customer-insights',
    name: 'Coke Customer Insights',
    description: 'AI-powered customer behavior analysis agent that provides deep insights into Coca-Cola consumer preferences, trends, and purchasing patterns.',
    provider: 'anthropic',
    route: '/agents/coke-customer-insights',
    metadata: {
      tags: ['customer-insights', 'behavior-analysis', 'consumer-preferences', 'trends', 'purchasing-patterns', 'coca-cola'],
      category: 'Consumer Intelligence',
      tier: 'premium',
      permissionType: 'request',
      version: '1.0.0'
    },
    visibility: 'company',
    allowedClients: ['coca-cola'],
    allowedRoles: ['admin', 'client', 'user'],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    status: 'approved',
    submitterId: 'coca-cola-system',
    submitterEmail: 'ai@coca-cola.com',
    submitterName: 'Coca-Cola AI Team',
    submissionDate: '2024-01-15T00:00:00Z',
    reviewedBy: 'coca-cola-system',
    reviewerEmail: 'ai@coca-cola.com',
    reviewerName: 'Coca-Cola AI Team',
    approvalDate: '2024-01-15T00:00:00Z',
    rejectionReason: '',
    auditTrail: [],
    organizationId: 'coca-cola',
    organizationName: 'Coca-Cola',
    networkId: '',
    networkName: '',
    icon: '👥'
  },
  {
    id: 'coke-event-planner',
    name: 'Coke Event Planner',
    description: 'AI event planning and coordination agent that helps organize Coca-Cola brand events, product launches, and promotional activities.',
    provider: 'openai',
    route: '/agents/coke-event-planner',
    metadata: {
      tags: ['event-planning', 'product-launches', 'promotional-activities', 'coordination', 'coca-cola', 'brand-events'],
      category: 'Event Management',
      tier: 'free',
      permissionType: 'free',
      version: '1.0.0'
    },
    visibility: 'company',
    allowedClients: ['coca-cola'],
    allowedRoles: ['admin', 'client', 'user'],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    status: 'approved',
    submitterId: 'coca-cola-system',
    submitterEmail: 'ai@coca-cola.com',
    submitterName: 'Coca-Cola AI Team',
    submissionDate: '2024-01-15T00:00:00Z',
    reviewedBy: 'coca-cola-system',
    reviewerEmail: 'ai@coca-cola.com',
    reviewerName: 'Coca-Cola AI Team',
    approvalDate: '2024-01-15T00:00:00Z',
    rejectionReason: '',
    auditTrail: [],
    organizationId: 'coca-cola',
    organizationName: 'Coca-Cola',
    networkId: '',
    networkName: '',
    icon: '🎉'
  }
];

/**
 * Get all local agents
 */
export const getAllLocalAgents = async (): Promise<Agent[]> => {
  console.log('🔧 Loading all local agents:', localAgents.length);
  return localAgents;
};

/**
 * Get agents by tier
 */
export const getAgentsByTier = async (tier: string): Promise<Agent[]> => {
  const agents = localAgents.filter(agent => agent.metadata?.tier === tier);
  console.log(`🔧 Loaded ${agents.length} ${tier} tier agents`);
  return agents;
};

/**
 * Get agents by provider
 */
export const getAgentsByProvider = async (provider: string): Promise<Agent[]> => {
  const agents = localAgents.filter(agent => 
    agent.provider.toLowerCase() === provider.toLowerCase()
  );
  console.log(`🔧 Loaded ${agents.length} ${provider} agents`);
  return agents;
};

/**
 * Get agents by category
 */
export const getAgentsByCategory = async (category: string): Promise<Agent[]> => {
  const agents = localAgents.filter(agent => 
    agent.metadata?.category === category
  );
  console.log(`🔧 Loaded ${agents.length} ${category} agents`);
  return agents;
};

/**
 * Search agents by name, description, or tags
 */
export const searchLocalAgents = async (query: string): Promise<Agent[]> => {
  const searchTerm = query.toLowerCase();
  const agents = localAgents.filter(agent => 
    agent.name.toLowerCase().includes(searchTerm) ||
    agent.description.toLowerCase().includes(searchTerm) ||
    agent.metadata?.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
  );
  console.log(`🔍 Found ${agents.length} agents matching "${query}"`);
  return agents;
};

/**
 * Get agent by ID
 */
export const getLocalAgentById = async (agentId: string): Promise<Agent | null> => {
  const agent = localAgents.find(agent => agent.id === agentId);
  if (agent) {
    console.log(`✅ Found local agent: ${agent.name}`);
  } else {
    console.log(`❌ Local agent not found: ${agentId}`);
  }
  return agent || null;
};

/**
 * Get demo user library (for testing)
 */
export const getDemoUserLibrary = (userId: string): string[] => {
  // Return the important agents for demo purposes
  return ['gemini-chat-agent', 'imagen-agent'];
};

export default {
  getAllLocalAgents,
  getAgentsByTier,
  getAgentsByProvider,
  getAgentsByCategory,
  searchLocalAgents,
  getLocalAgentById,
  getDemoUserLibrary
};
