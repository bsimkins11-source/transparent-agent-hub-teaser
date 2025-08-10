import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  XMarkIcon,
  DocumentTextIcon,
  CogIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  UserIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { serviceFactory } from '../services/ServiceFactory';
import { CreateRegistryEntryRequest } from '../types/agentRegistry';

interface AgentSubmissionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess?: () => void;
  className?: string;
}

const AgentSubmissionForm: React.FC<AgentSubmissionFormProps> = ({ 
  isOpen, 
  onClose, 
  onSubmitSuccess,
  className = '' 
}) => {
  const [formData, setFormData] = useState<Partial<CreateRegistryEntryRequest>>({
    agentId: '',
    version: '1.0.0',
    metadata: {
      name: '',
      description: '',
      category: '',
      tags: [],
      provider: 'custom',
      capabilities: [],
      inputSchema: {},
      outputSchema: {},
      examples: []
    },
    governance: {
      ownerId: '',
      ownerName: '',
      companyId: '',
      companyName: '',
      reviewRequired: true,
      approvalWorkflow: 'admin_review',
      complianceNotes: '',
      riskLevel: 'low'
    },
    deployment: {
      environment: 'development',
      region: 'us-central1',
      resourceRequirements: {},
      healthCheckEndpoint: '',
      monitoringConfig: {}
    }
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState('');
  const [capabilityInput, setCapabilityInput] = useState('');

  const totalSteps = 4;

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1: // Basic Information
        if (!formData.metadata?.name?.trim()) {
          newErrors.name = 'Agent name is required';
        }
        if (!formData.metadata?.description?.trim()) {
          newErrors.description = 'Description is required';
        }
        if (!formData.metadata?.category) {
          newErrors.category = 'Category is required';
        }
        if (!formData.governance?.ownerName?.trim()) {
          newErrors.ownerName = 'Owner name is required';
        }
        if (!formData.governance?.companyName?.trim()) {
          newErrors.companyName = 'Company name is required';
        }
        break;

      case 2: // Technical Details
        if (!formData.metadata?.provider) {
          newErrors.provider = 'Provider is required';
        }
        if (formData.metadata?.capabilities?.length === 0) {
          newErrors.capabilities = 'At least one capability is required';
        }
        break;

      case 3: // Governance & Compliance
        if (!formData.governance?.riskLevel) {
          newErrors.riskLevel = 'Risk level is required';
        }
        break;

      case 4: // Review & Submit
        // Final validation
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.metadata?.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata!,
          tags: [...(prev.metadata?.tags || []), tagInput.trim()]
        }
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata!,
        tags: prev.metadata?.tags?.filter(tag => tag !== tagToRemove) || []
      }
    }));
  };

  const addCapability = () => {
    if (capabilityInput.trim() && !formData.metadata?.capabilities?.includes(capabilityInput.trim())) {
      setFormData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata!,
          capabilities: [...(prev.metadata?.capabilities || []), capabilityInput.trim()]
        }
      }));
      setCapabilityInput('');
    }
  };

  const removeCapability = (capabilityToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata!,
        capabilities: prev.metadata?.capabilities?.filter(cap => cap !== capabilityToRemove) || []
      }
    }));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setLoading(true);
    try {
      const registryService = serviceFactory.getPOCAgentRegistryService();
      
      // Generate a unique agent ID if not provided
      const finalData: CreateRegistryEntryRequest = {
        ...formData as CreateRegistryEntryRequest,
        agentId: formData.agentId || `agent-${Date.now()}`,
        metadata: {
          ...formData.metadata!,
          tags: formData.metadata?.tags || [],
          capabilities: formData.metadata?.capabilities || [],
          inputSchema: formData.metadata?.inputSchema || {},
          outputSchema: formData.metadata?.outputSchema || {},
          examples: formData.metadata?.examples || []
        }
      };

      await registryService.createEntry(finalData);
      
      // Reset form and close
      setFormData({
        agentId: '',
        version: '1.0.0',
        metadata: {
          name: '',
          description: '',
          category: '',
          tags: [],
          provider: 'custom',
          capabilities: [],
          inputSchema: {},
          outputSchema: {},
          examples: []
        },
        governance: {
          ownerId: '',
          ownerName: '',
          companyId: '',
          companyName: '',
          reviewRequired: true,
          approvalWorkflow: 'admin_review',
          complianceNotes: '',
          riskLevel: 'low'
        },
        deployment: {
          environment: 'development',
          region: 'us-central1',
          resourceRequirements: {},
          healthCheckEndpoint: '',
          monitoringConfig: {}
        }
      });
      setCurrentStep(1);
      setErrors({});
      onSubmitSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error submitting agent:', error);
      setErrors({ submit: 'Failed to submit agent. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Submit Agent for Review</h2>
              <p className="text-gray-600 mt-1">Submit your agent to the marketplace for super admin review</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round((currentStep / totalSteps) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Agent Name *
                    </label>
                    <input
                      type="text"
                      value={formData.metadata?.name || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        metadata: { ...prev.metadata!, name: e.target.value }
                      }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter agent name"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.metadata?.category || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        metadata: { ...prev.metadata!, category: e.target.value }
                      }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.category ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select category</option>
                      <option value="customer_service">Customer Service</option>
                      <option value="analytics">Analytics</option>
                      <option value="automation">Automation</option>
                      <option value="content">Content</option>
                      <option value="research">Research</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.metadata?.description || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        metadata: { ...prev.metadata!, description: e.target.value }
                      }))}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.description ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Describe what your agent does..."
                    />
                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Owner Name *
                    </label>
                    <input
                      type="text"
                      value={formData.governance?.ownerName || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        governance: { ...prev.governance!, ownerName: e.target.value }
                      }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.ownerName ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Your name"
                    />
                    {errors.ownerName && <p className="text-red-500 text-sm mt-1">{errors.ownerName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      value={formData.governance?.companyName || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        governance: { ...prev.governance!, companyName: e.target.value }
                      }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.companyName ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Your company name"
                    />
                    {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Technical Details */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <CogIcon className="w-5 h-5 text-blue-600" />
                  Technical Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      AI Provider *
                    </label>
                    <select
                      value={formData.metadata?.provider || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        metadata: { ...prev.metadata!, provider: e.target.value }
                      }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.provider ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select provider</option>
                      <option value="openai">OpenAI (GPT)</option>
                      <option value="anthropic">Anthropic (Claude)</option>
                      <option value="google">Google (Gemini)</option>
                      <option value="custom">Custom/Other</option>
                    </select>
                    {errors.provider && <p className="text-red-500 text-sm mt-1">{errors.provider}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Version
                    </label>
                    <input
                      type="text"
                      value={formData.version || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1.0.0"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Capabilities *
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={capabilityInput}
                        onChange={(e) => setCapabilityInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addCapability()}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Add a capability (e.g., text_generation)"
                      />
                      <button
                        type="button"
                        onClick={addCapability}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.metadata?.capabilities?.map((capability, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center gap-2"
                        >
                          {capability}
                          <button
                            type="button"
                            onClick={() => removeCapability(capability)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    {errors.capabilities && <p className="text-red-500 text-sm mt-1">{errors.capabilities}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Add a tag"
                      />
                      <button
                        type="button"
                        onClick={addTag}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.metadata?.tags?.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full flex items-center gap-2"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Governance & Compliance */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <ShieldCheckIcon className="w-5 h-5 text-blue-600" />
                  Governance & Compliance
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Risk Level *
                    </label>
                    <select
                      value={formData.governance?.riskLevel || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        governance: { ...prev.governance!, riskLevel: e.target.value as any }
                      }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.riskLevel ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select risk level</option>
                      <option value="low">Low - Basic text processing, no sensitive data</option>
                      <option value="medium">Medium - Data analysis, some business logic</option>
                      <option value="high">High - Financial calculations, personal data</option>
                      <option value="critical">Critical - Healthcare, legal, financial advice</option>
                    </select>
                    {errors.riskLevel && <p className="text-red-500 text-sm mt-1">{errors.riskLevel}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Environment
                    </label>
                    <select
                      value={formData.deployment?.environment || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        deployment: { ...prev.deployment!, environment: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="development">Development</option>
                      <option value="staging">Staging</option>
                      <option value="production">Production</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Compliance Notes
                    </label>
                    <textarea
                      value={formData.governance?.complianceNotes || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        governance: { ...prev.governance!, complianceNotes: e.target.value }
                      }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Any compliance considerations, data handling notes, or special requirements..."
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-blue-600" />
                  Review & Submit
                </h3>
                
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900">Agent Details</h4>
                      <p className="text-sm text-gray-600"><strong>Name:</strong> {formData.metadata?.name}</p>
                      <p className="text-sm text-gray-600"><strong>Category:</strong> {formData.metadata?.category}</p>
                      <p className="text-sm text-gray-600"><strong>Provider:</strong> {formData.metadata?.provider}</p>
                      <p className="text-sm text-gray-600"><strong>Version:</strong> {formData.version}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900">Owner Information</h4>
                      <p className="text-sm text-gray-600"><strong>Owner:</strong> {formData.governance?.ownerName}</p>
                      <p className="text-sm text-gray-600"><strong>Company:</strong> {formData.governance?.companyName}</p>
                      <p className="text-sm text-gray-600"><strong>Risk Level:</strong> {formData.governance?.riskLevel}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">Description</h4>
                    <p className="text-sm text-gray-600">{formData.metadata?.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">Capabilities</h4>
                    <div className="flex flex-wrap gap-2">
                      {formData.metadata?.capabilities?.map((capability, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {capability}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {formData.metadata?.tags && formData.metadata.tags.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {formData.metadata.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
                      <p className="text-red-700">{errors.submit}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex items-center gap-2">
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-5 h-5" />
                      Submit Agent
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AgentSubmissionForm;
