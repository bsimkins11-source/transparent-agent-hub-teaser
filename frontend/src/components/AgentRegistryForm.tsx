import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  XMarkIcon, 
  PlusIcon, 
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { serviceFactory } from '../services/ServiceFactory';
import { CreateRegistryEntryRequest, AgentStatus } from '../types/agentRegistry';
import toast from 'react-hot-toast';

interface AgentRegistryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AgentRegistryForm: React.FC<AgentRegistryFormProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateRegistryEntryRequest>({
    agentId: '',
    version: '1.0.0',
    agentType: 'ai_agent', // Default to AI agent type
    metadata: {
      name: '',
      description: '',
      category: '',
      tags: [],
      // Updated provider and model structure
      providers: [{
        name: 'OpenAI',
        type: 'ai_model',
        provider: 'openai',
        region: 'us-east-1',
        credentials: {
          type: 'api_key',
          config: {}
        },
        features: ['chat', 'completion', 'embedding']
      }],
      models: [{
        name: 'gpt-4',
        provider: 'openai',
        version: 'latest',
                  capabilities: {
            maxTokens: 8192,
            supportsVision: false,
            supportsAudio: false,
            supportsFunctionCalling: true,
            supportsStreaming: true,
            supportsFineTuning: false,
            supportsEmbeddings: false
          },
                  performance: {
            latency: 100,
            accuracy: 0.95,
            costPerToken: 0.00003,
            throughput: 10,
            availability: 0.99
          },
        contextWindow: 8192
      }],
      // New API integrations
      apiIntegrations: {
        aiServices: [],
        externalAPIs: [],
        webhooks: [],
        databases: []
      },
      capabilities: [],
      limitations: [],
      useCases: [],
      examples: [],
      documentation: {
        userGuide: '',
        apiReference: '',
        tutorials: [],
        faq: '',
        changelog: ''
      },
      estimatedCost: { perRequest: 0, currency: 'USD' },
      performanceMetrics: { 
        averageLatency: 0, 
        p95Latency: 0, 
        p99Latency: 0, 
        successRate: 0, 
        errorRate: 0, 
        throughput: 0, 
        availability: 0, 
        lastUpdated: new Date().toISOString() 
      },
      marketplace: {
        isPublic: false,
        pricing: {
          model: 'free',
          basePrice: 0,
          pricePerRequest: 0,
          pricePerToken: 0,
          currency: 'USD'
        },
        categories: [],
        featured: false
      }
    },
    ownerId: '',
    governance: {
      owner: '',
      reviewers: [],
      approvalWorkflow: {
        requiresApproval: true,
        approvalLevels: [{
          level: 1,
          role: 'admin',
          required: true,
          autoApprove: false
        }],
        autoApprovalThreshold: 1
      },
      accessControls: {
        allowedRoles: [],
        allowedOrganizations: [],
        allowedNetworks: [],
        featureFlags: {}
      },
      compliance: {
        gdpr: 'not_applicable',
        hipaa: 'not_applicable',
        sox: 'not_applicable',
        iso27001: 'not_applicable',
        soc2: 'not_applicable',
        lastAudit: new Date().toISOString(),
        nextAudit: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        complianceNotes: []
      },
      riskLevel: 'low',
      dataClassification: 'public'
    },
    tenant: {
      tenantId: 'current-tenant',
      tenantName: 'Current Company',
      accessLevel: 'full',
      customizations: {
        branding: false,
        customPrompts: false,
        rateLimiting: false,
        dataIsolation: false
      }
    },
    deployment: {
      infrastructure: {
        primary: {
          provider: 'aws',
          region: 'us-east-1'
        }
      },
      runtime: {
        type: 'serverless',
        language: 'python'
      }
    }
  });

  const [newTag, setNewTag] = useState('');
  const [newCapability, setNewCapability] = useState('');
  const [newLimitation, setNewLimitation] = useState('');
  const [newUseCase, setNewUseCase] = useState('');
  const [newReviewer, setNewReviewer] = useState('');
  const [newRole, setNewRole] = useState('');

  const agentRegistryService = serviceFactory.getPOCAgentRegistryService();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.metadata.name || !formData.metadata.description || !formData.metadata.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      await agentRegistryService.createEntry(formData);
      toast.success('Agent added to registry successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to add agent to registry:', error);
      toast.error('Failed to add agent to registry');
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.metadata.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          tags: [...prev.metadata.tags, newTag.trim()]
        }
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        tags: prev.metadata.tags.filter(tag => tag !== tagToRemove)
      }
    }));
  };

  const addCapability = () => {
    if (newCapability.trim() && !formData.metadata.capabilities.includes(newCapability.trim())) {
      setFormData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          capabilities: [...prev.metadata.capabilities, newCapability.trim()]
        }
      }));
      setNewCapability('');
    }
  };

  const removeCapability = (capabilityToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        capabilities: prev.metadata.capabilities.filter(cap => cap !== capabilityToRemove)
      }
    }));
  };

  const addLimitation = () => {
    if (newLimitation.trim() && !formData.metadata.limitations.includes(newLimitation.trim())) {
      setFormData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          limitations: [...prev.metadata.limitations, newLimitation.trim()]
        }
      }));
      setNewLimitation('');
    }
  };

  const removeLimitation = (limitationToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        limitations: prev.metadata.limitations.filter(lim => lim !== limitationToRemove)
      }
    }));
  };

  const addUseCase = () => {
    if (newUseCase.trim() && !formData.metadata.useCases.includes(newUseCase.trim())) {
      setFormData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          useCases: [...prev.metadata.useCases, newUseCase.trim()]
        }
      }));
      setNewUseCase('');
    }
  };

  const removeUseCase = (useCaseToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        useCases: prev.metadata.useCases.filter(uc => uc !== useCaseToRemove)
      }
    }));
  };

  const addReviewer = () => {
    if (newReviewer.trim() && !formData.governance.reviewers.includes(newReviewer.trim())) {
      setFormData(prev => ({
        ...prev,
        governance: {
          ...prev.governance,
          reviewers: [...prev.governance.reviewers, newReviewer.trim()]
        }
      }));
      setNewReviewer('');
    }
  };

  const removeReviewer = (reviewerToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      governance: {
        ...prev.governance,
        reviewers: prev.governance.reviewers.filter(r => r !== reviewerToRemove)
      }
    }));
  };

  const addRole = () => {
    if (newRole.trim() && !formData.governance.accessControl.allowedRoles.includes(newRole.trim())) {
      setFormData(prev => ({
        ...prev,
        governance: {
          ...prev.governance,
          accessControl: {
            ...prev.governance.accessControl,
            allowedRoles: [...prev.governance.accessControl.allowedRoles, newRole.trim()]
          }
        }
      }));
      setNewRole('');
    }
  };

  const removeRole = (roleToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      governance: {
        ...prev.governance,
        accessControl: {
          ...prev.governance.accessControl,
          allowedRoles: prev.governance.accessControl.allowedRoles.filter(r => r !== roleToRemove)
        }
      }
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Add Agent to Registry</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agent Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.metadata.name}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      metadata: { ...prev.metadata, name: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter agent name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agent ID
                  </label>
                  <input
                    type="text"
                    value={formData.agentId}
                    onChange={(e) => setFormData(prev => ({ ...prev, agentId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter agent ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Version
                  </label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1.0.0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agent Type *
                  </label>
                  <select
                    required
                    value={formData.agentType}
                    onChange={(e) => setFormData(prev => ({ ...prev, agentType: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="internal_transparent">Internal Transparent Agents</option>
                    <option value="client_marketplace">Client Marketplace Agents</option>
                    <option value="third_party_marketplace">Third-Party Marketplace Agents</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.metadata.category}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      metadata: { ...prev.metadata, category: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select category</option>
                    <option value="Customer Service">Customer Service</option>
                    <option value="Analytics">Analytics</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                    <option value="Operations">Operations</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary AI Model
                  </label>
                  <input
                    type="text"
                    value={formData.metadata.models.primary.name}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      metadata: { 
                        ...prev.metadata, 
                        models: { 
                          ...prev.metadata.models, 
                          primary: { ...prev.metadata.models.primary, name: e.target.value } 
                        } 
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., gpt-4, claude-3, gemini-pro"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model
                  </label>
                  <input
                    type="text"
                    value={formData.metadata.model}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      metadata: { ...prev.metadata, model: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., gpt-4, gemini-pro"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.metadata.description}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    metadata: { ...prev.metadata, description: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe what this agent does..."
                />
              </div>
            </div>

            {/* Tags */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add a tag"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.metadata.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Capabilities */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Capabilities</h3>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newCapability}
                  onChange={(e) => setNewCapability(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCapability())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add a capability"
                />
                <button
                  type="button"
                  onClick={addCapability}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                {formData.metadata.capabilities.map((capability, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                    <span>{capability}</span>
                    <button
                      type="button"
                      onClick={() => removeCapability(capability)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Limitations */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Limitations</h3>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newLimitation}
                  onChange={(e) => setNewLimitation(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLimitation())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add a limitation"
                />
                <button
                  type="button"
                  onClick={addLimitation}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                {formData.metadata.limitations.map((limitation, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                    <span>{limitation}</span>
                    <button
                      type="button"
                      onClick={() => removeLimitation(limitation)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Use Cases */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Use Cases</h3>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newUseCase}
                  onChange={(e) => setNewUseCase(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addUseCase())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add a use case"
                />
                <button
                  type="button"
                  onClick={addUseCase}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                {formData.metadata.useCases.map((useCase, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                    <span>{useCase}</span>
                    <button
                      type="button"
                      onClick={() => removeUseCase(useCase)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Infrastructure Configuration */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Infrastructure & AI Models</h3>
              
              {/* Primary AI Model Configuration */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-800 mb-3">Primary AI Model</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Model Provider
                    </label>
                    <select
                      value={formData.metadata.models.primary.provider}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          models: {
                            ...prev.metadata.models,
                            primary: { ...prev.metadata.models.primary, provider: e.target.value }
                          }
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="openai">OpenAI</option>
                      <option value="anthropic">Anthropic</option>
                      <option value="google">Google</option>
                      <option value="meta">Meta</option>
                      <option value="stability">Stability AI</option>
                      <option value="runway">Runway</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Model Version
                    </label>
                    <input
                      type="text"
                      value={formData.metadata.models.primary.version}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          models: {
                            ...prev.metadata.models,
                            primary: { ...prev.metadata.models.primary, version: e.target.value }
                          }
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., latest, 3.5, 4.0"
                    />
                  </div>
                </div>
              </div>

              {/* Cloud Infrastructure */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-800 mb-3">Cloud Infrastructure</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Cloud Provider
                    </label>
                    <select
                      value={formData.deployment?.infrastructure?.primary?.provider || 'aws'}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        deployment: {
                          ...prev.deployment,
                          infrastructure: {
                            ...prev.deployment?.infrastructure,
                            primary: {
                              ...prev.deployment?.infrastructure?.primary,
                              provider: e.target.value as any
                            }
                          }
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="aws">AWS</option>
                      <option value="azure">Azure</option>
                      <option value="gcp">Google Cloud</option>
                      <option value="databricks">Databricks</option>
                      <option value="snowflake">Snowflake</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Region
                    </label>
                    <input
                      type="text"
                      value={formData.deployment?.infrastructure?.primary?.region || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        deployment: {
                          ...prev.deployment,
                          infrastructure: {
                            ...prev.deployment?.infrastructure,
                            primary: {
                              ...prev.deployment?.infrastructure?.primary,
                              region: e.target.value
                            }
                          }
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., us-east-1, westus2, europe-west1"
                    />
                  </div>
                </div>
              </div>

              {/* Runtime Configuration */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-800 mb-3">Runtime Configuration</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Runtime Type
                    </label>
                    <select
                      value={formData.deployment?.runtime?.type || 'serverless'}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        deployment: {
                          ...prev.deployment,
                          runtime: {
                            ...prev.deployment?.runtime,
                            type: e.target.value as any
                          }
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="serverless">Serverless</option>
                      <option value="container">Container</option>
                      <option value="vm">Virtual Machine</option>
                      <option value="kubernetes">Kubernetes</option>
                      <option value="edge">Edge Computing</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Programming Language
                    </label>
                    <input
                      type="text"
                      value={formData.deployment?.runtime?.language || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        deployment: {
                          ...prev.deployment,
                          runtime: {
                            ...prev.deployment?.runtime,
                            language: e.target.value
                          }
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., python, nodejs, java, go"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Performance & Cost */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance & Cost</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Avg Latency (ms)
                  </label>
                  <input
                    type="number"
                    value={formData.metadata.performanceMetrics.avgLatency}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        performanceMetrics: {
                          ...prev.metadata.performanceMetrics,
                          avgLatency: parseInt(e.target.value) || 0
                        }
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Success Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.metadata.performanceMetrics.successRate}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        performanceMetrics: {
                          ...prev.metadata.performanceMetrics,
                          successRate: parseFloat(e.target.value) || 0
                        }
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Tokens
                  </label>
                  <input
                    type="number"
                    value={formData.metadata.performanceMetrics.maxTokens}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        performanceMetrics: {
                          ...prev.metadata.performanceMetrics,
                          maxTokens: parseInt(e.target.value) || 0
                        }
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cost per Request
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.metadata.estimatedCost.perRequest}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        estimatedCost: {
                          ...prev.metadata.estimatedCost,
                          perRequest: parseFloat(e.target.value) || 0
                        }
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={formData.metadata.estimatedCost.currency}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        estimatedCost: {
                          ...prev.metadata.estimatedCost,
                          currency: e.target.value
                        }
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Marketplace Configuration - Only show for client and third-party agents */}
            {formData.agentType !== 'internal_transparent' && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Marketplace Configuration</h3>
                
                {/* Public Visibility */}
                <div className="mb-6">
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={formData.metadata.marketplace?.isPublic || false}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          marketplace: {
                            ...prev.metadata.marketplace,
                            isPublic: e.target.checked
                          }
                        }
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isPublic" className="ml-2 block text-sm font-medium text-gray-700">
                      Make this agent visible in the public marketplace
                    </label>
                  </div>
                </div>

                {/* Pricing Configuration */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-800 mb-3">Pricing</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pricing Model
                      </label>
                      <select
                        value={formData.metadata.marketplace?.pricing?.model || 'per_request'}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          metadata: {
                            ...prev.metadata,
                            marketplace: {
                              ...prev.metadata.marketplace,
                              pricing: {
                                ...prev.metadata.marketplace?.pricing,
                                model: e.target.value as any
                              }
                            }
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="per_request">Per Request</option>
                        <option value="subscription">Subscription</option>
                        <option value="usage_based">Usage Based</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.metadata.marketplace?.pricing?.price || 0}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          metadata: {
                            ...prev.metadata,
                            marketplace: {
                              ...prev.metadata.marketplace,
                              pricing: {
                                ...prev.metadata.marketplace?.pricing,
                                price: parseFloat(e.target.value) || 0
                              }
                            }
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Currency
                      </label>
                      <select
                        value={formData.metadata.marketplace?.pricing?.currency || 'USD'}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          metadata: {
                            ...prev.metadata,
                            marketplace: {
                              ...prev.metadata.marketplace,
                              pricing: {
                                ...prev.metadata.marketplace?.pricing,
                                currency: e.target.value
                              }
                            }
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Revenue Sharing - Only for third-party agents */}
                {formData.agentType === 'third_party_marketplace' && (
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-800 mb-3">Revenue Sharing</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Revenue Share Percentage
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.metadata.marketplace?.revenueSharing?.percentage || 0}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            metadata: {
                              ...prev.metadata,
                              marketplace: {
                                ...prev.metadata.marketplace,
                                revenueSharing: {
                                  ...prev.metadata.marketplace?.revenueSharing,
                                  percentage: parseFloat(e.target.value) || 0
                                }
                              }
                            }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0.0"
                        />
                        <p className="text-xs text-gray-500 mt-1">Percentage of revenue you'll receive</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Minimum Payout
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.metadata.marketplace?.revenueSharing?.minimumPayout || 0}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            metadata: {
                              ...prev.metadata,
                              marketplace: {
                                ...prev.metadata.marketplace,
                                revenueSharing: {
                                  ...prev.metadata.marketplace?.revenueSharing,
                                  minimumPayout: parseFloat(e.target.value) || 0
                                }
                              }
                            }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0.00"
                        />
                        <p className="text-xs text-gray-500 mt-1">Minimum amount before payout</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Marketplace Features */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-800 mb-3">Marketplace Features</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Featured Agent
                      </label>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="featured"
                          checked={formData.metadata.marketplace?.marketplaceFeatures?.featured || false}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            metadata: {
                              ...prev.metadata,
                              marketplace: {
                                ...prev.metadata.marketplace,
                                marketplaceFeatures: {
                                  ...prev.metadata.marketplace?.marketplaceFeatures,
                                  featured: e.target.checked
                                }
                              }
                            }
                          }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                          Feature this agent in marketplace
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Demo URL
                      </label>
                      <input
                        type="url"
                        value={formData.metadata.marketplace?.marketplaceFeatures?.demoUrl || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          metadata: {
                            ...prev.metadata,
                            marketplace: {
                              ...prev.metadata.marketplace,
                              marketplaceFeatures: {
                                ...prev.metadata.marketplace?.marketplaceFeatures,
                                demoUrl: e.target.value
                              }
                            }
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://demo.example.com"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Governance */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Governance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Owner *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.governance.owner}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      governance: { ...prev.governance, owner: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="owner@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Risk Level
                  </label>
                  <select
                    value={formData.governance.riskLevel}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      governance: { ...prev.governance, riskLevel: e.target.value as any }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Classification
                  </label>
                  <select
                    value={formData.governance.dataClassification}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      governance: { ...prev.governance, dataClassification: e.target.value as any }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="public">Public</option>
                    <option value="internal">Internal</option>
                    <option value="confidential">Confidential</option>
                    <option value="restricted">Restricted</option>
                  </select>
                </div>
              </div>

              {/* Reviewers */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reviewers
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="email"
                    value={newReviewer}
                    onChange={(e) => setNewReviewer(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addReviewer())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="reviewer@company.com"
                  />
                  <button
                    type="button"
                    onClick={addReviewer}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.governance.reviewers.map((reviewer, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                      <span>{reviewer}</span>
                      <button
                        type="button"
                        onClick={() => removeReviewer(reviewer)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Allowed Roles */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allowed Roles
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRole())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., admin, user, manager"
                  />
                  <button
                    type="button"
                    onClick={addRole}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.governance.accessControl.allowedRoles.map((role, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                      <span>{role}</span>
                      <button
                        type="button"
                        onClick={() => removeRole(role)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Adding...' : 'Add to Registry'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AgentRegistryForm;
