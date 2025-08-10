import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DocumentTextIcon,
  CurrencyDollarIcon,
  CogIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { CreatorAgentSubmission } from '../types/permissions';

interface AgentSubmissionProps {
  className?: string;
}

export default function AgentSubmission({ className = '' }: AgentSubmissionProps) {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const [formData, setFormData] = useState<Partial<CreatorAgentSubmission>>({
    agentName: '',
    agentDescription: '',
    agentCategory: '',
    agentSubcategory: '',
    agentTags: [],
    model: '',
    provider: 'openai',
    apiEndpoint: '',
    apiKeyRequired: false,
    pricingModel: 'free',
    basePrice: 0,
    pricePerCall: 0,
    pricePerUser: 0,
    monthlyPrice: 0,
    maxCallsPerDay: undefined,
    maxCallsPerMonth: undefined,
    maxConcurrentUsers: undefined,
    promptTemplate: '',
    exampleInputs: [''],
    exampleOutputs: [''],
    safetyMeasures: [''],
    contentFilters: [''],
    ageRestriction: 'all'
  });

  const [newTag, setNewTag] = useState('');
  const [newExampleInput, setNewExampleInput] = useState('');
  const [newExampleOutput, setNewExampleOutput] = useState('');
  const [newSafetyMeasure, setNewSafetyMeasure] = useState('');
  const [newContentFilter, setNewContentFilter] = useState('');

  const categories = [
    'AI Assistant',
    'Code & Development',
    'Content Creation',
    'Data Analysis',
    'Education',
    'Finance',
    'Healthcare',
    'Marketing',
    'Productivity',
    'Research',
    'Sales',
    'Support',
    'Other'
  ];

  const providers = [
    { value: 'openai', label: 'OpenAI (GPT-4, GPT-3.5)' },
    { value: 'google', label: 'Google (PaLM, Gemini)' },
    { value: 'anthropic', label: 'Anthropic (Claude)' },
    { value: 'custom', label: 'Custom/Other' }
  ];

  const pricingModels = [
    { value: 'free', label: 'Free' },
    { value: 'per_call', label: 'Per Call' },
    { value: 'per_user', label: 'Per User' },
    { value: 'subscription', label: 'Subscription' },
    { value: 'custom', label: 'Custom' }
  ];

  const handleInputChange = (field: keyof CreatorAgentSubmission, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.agentTags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        agentTags: [...(prev.agentTags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      agentTags: prev.agentTags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const addExample = () => {
    if (newExampleInput.trim() && newExampleOutput.trim()) {
      setFormData(prev => ({
        ...prev,
        exampleInputs: [...(prev.exampleInputs || []), newExampleInput.trim()],
        exampleOutputs: [...(prev.exampleOutputs || []), newExampleOutput.trim()]
      }));
      setNewExampleInput('');
      setNewExampleOutput('');
    }
  };

  const removeExample = (index: number) => {
    setFormData(prev => ({
      ...prev,
      exampleInputs: prev.exampleInputs?.filter((_, i) => i !== index) || [],
      exampleOutputs: prev.exampleOutputs?.filter((_, i) => i !== index) || []
    }));
  };

  const addSafetyMeasure = () => {
    if (newSafetyMeasure.trim() && !formData.safetyMeasures?.includes(newSafetyMeasure.trim())) {
      setFormData(prev => ({
        ...prev,
        safetyMeasures: [...(prev.safetyMeasures || []), newSafetyMeasure.trim()]
      }));
      setNewSafetyMeasure('');
    }
  };

  const removeSafetyMeasure = (measureToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      safetyMeasures: prev.safetyMeasures?.filter(measure => measure !== measureToRemove) || []
    }));
  };

  const addContentFilter = () => {
    if (newContentFilter.trim() && !formData.contentFilters?.includes(newContentFilter.trim())) {
      setFormData(prev => ({
        ...prev,
        contentFilters: [...(prev.contentFilters || []), newContentFilter.trim()]
      }));
      setNewContentFilter('');
    }
  };

  const removeContentFilter = (filterToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      contentFilters: prev.contentFilters?.filter(filter => filter !== filterToRemove) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // TODO: Submit agent to backend service
      console.log('Submitting agent:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // TODO: Handle success - redirect to creator dashboard or show success message
      alert('Agent submitted successfully! It will be reviewed by our team.');
      
    } catch (error) {
      console.error('Failed to submit agent:', error);
      alert('Failed to submit agent. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    
    try {
      // TODO: Save draft to backend service
      console.log('Saving draft:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Draft saved successfully!');
      
    } catch (error) {
      console.error('Failed to save draft:', error);
      alert('Failed to save draft. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Submit New Agent</h1>
        <p className="text-gray-600 mt-2">
          Create and submit your AI agent for review and publication
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Agent Name *
              </label>
              <input
                type="text"
                required
                value={formData.agentName}
                onChange={(e) => handleInputChange('agentName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., AI Code Assistant"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                required
                value={formData.agentCategory}
                onChange={(e) => handleInputChange('agentCategory', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subcategory
              </label>
              <input
                type="text"
                value={formData.agentSubcategory}
                onChange={(e) => handleInputChange('agentSubcategory', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Python, JavaScript"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model *
              </label>
              <input
                type="text"
                required
                value={formData.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., GPT-4, Claude-3"
              />
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              required
              rows={4}
              value={formData.agentDescription}
              onChange={(e) => handleInputChange('agentDescription', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe what your agent does, its capabilities, and use cases..."
            />
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.agentTags?.map((tag, index) => (
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
                    <TrashIcon className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a tag..."
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Technical Configuration */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <CogIcon className="h-5 w-5 mr-2" />
            Technical Configuration
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Provider *
              </label>
              <select
                required
                value={formData.provider}
                onChange={(e) => handleInputChange('provider', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {providers.map(provider => (
                  <option key={provider.value} value={provider.value}>
                    {provider.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Endpoint
              </label>
              <input
                type="url"
                value={formData.apiEndpoint}
                onChange={(e) => handleInputChange('apiEndpoint', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://api.example.com/v1"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="apiKeyRequired"
                checked={formData.apiKeyRequired}
                onChange={(e) => handleInputChange('apiKeyRequired', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="apiKeyRequired" className="ml-2 block text-sm text-gray-900">
                API Key Required
              </label>
            </div>
          </div>
        </div>

        {/* Pricing Structure */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <CurrencyDollarIcon className="h-5 w-5 mr-2" />
            Pricing Structure
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pricing Model *
              </label>
              <select
                required
                value={formData.pricingModel}
                onChange={(e) => handleInputChange('pricingModel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {pricingModels.map(model => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base Price (USD)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.basePrice}
                onChange={(e) => handleInputChange('basePrice', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
            
            {formData.pricingModel === 'per_call' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price per Call (USD)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.pricePerCall}
                  onChange={(e) => handleInputChange('pricePerCall', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.01"
                />
              </div>
            )}
            
            {formData.pricingModel === 'subscription' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Price (USD)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.monthlyPrice}
                  onChange={(e) => handleInputChange('monthlyPrice', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="9.99"
                />
              </div>
            )}
          </div>
        </div>

        {/* Usage Limits */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Usage Limits</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Calls per Day
              </label>
              <input
                type="number"
                min="1"
                value={formData.maxCallsPerDay || ''}
                onChange={(e) => handleInputChange('maxCallsPerDay', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Calls per Month
              </label>
              <input
                type="number"
                min="1"
                value={formData.maxCallsPerMonth || ''}
                onChange={(e) => handleInputChange('maxCallsPerMonth', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="30000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Concurrent Users
              </label>
              <input
                type="number"
                min="1"
                value={formData.maxConcurrentUsers || ''}
                onChange={(e) => handleInputChange('maxConcurrentUsers', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="100"
              />
            </div>
          </div>
        </div>

        {/* Content and Examples */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Content and Examples</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prompt Template *
            </label>
            <textarea
              required
              rows={6}
              value={formData.promptTemplate}
              onChange={(e) => handleInputChange('promptTemplate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="Enter your agent's prompt template..."
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Example Inputs and Outputs
            </label>
            {formData.exampleInputs?.map((input, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Input {index + 1}</label>
                  <textarea
                    rows={2}
                    value={input}
                    onChange={(e) => {
                      const newInputs = [...(formData.exampleInputs || [])];
                      newInputs[index] = e.target.value;
                      handleInputChange('exampleInputs', newInputs);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Output {index + 1}</label>
                  <textarea
                    rows={2}
                    value={formData.exampleOutputs?.[index] || ''}
                    onChange={(e) => {
                      const newOutputs = [...(formData.exampleOutputs || [])];
                      newOutputs[index] = e.target.value;
                      handleInputChange('exampleOutputs', newOutputs);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeExample(index)}
                    className="px-3 py-1 text-red-600 hover:text-red-800 text-sm"
                  >
                    <TrashIcon className="h-4 w-4 mr-1 inline" />
                    Remove
                  </button>
                </div>
              </div>
            ))}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Input</label>
                <textarea
                  rows={2}
                  value={newExampleInput}
                  onChange={(e) => setNewExampleInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Example input..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Output</label>
                <textarea
                  rows={2}
                  value={newExampleOutput}
                  onChange={(e) => setNewExampleOutput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Expected output..."
                />
              </div>
            </div>
            
            <button
              type="button"
              onClick={addExample}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2 inline" />
              Add Example
            </button>
          </div>
        </div>

        {/* Safety and Compliance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <ShieldCheckIcon className="h-5 w-5 mr-2" />
            Safety and Compliance
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age Restriction
              </label>
              <select
                value={formData.ageRestriction}
                onChange={(e) => handleInputChange('ageRestriction', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Ages</option>
                <option value="13+">13+</option>
                <option value="18+">18+</option>
                <option value="21+">21+</option>
              </select>
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Safety Measures
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.safetyMeasures?.map((measure, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                >
                  {measure}
                  <button
                    type="button"
                    onClick={() => removeSafetyMeasure(measure)}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    <TrashIcon className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSafetyMeasure}
                onChange={(e) => setNewSafetyMeasure(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add safety measure..."
              />
              <button
                type="button"
                onClick={addSafetyMeasure}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Filters
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.contentFilters?.map((filter, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800"
                >
                  {filter}
                  <button
                    type="button"
                    onClick={() => removeContentFilter(filter)}
                    className="ml-2 text-yellow-600 hover:text-yellow-800"
                  >
                    <TrashIcon className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newContentFilter}
                onChange={(e) => setNewContentFilter(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add content filter..."
              />
              <button
                type="button"
                onClick={addContentFilter}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-6">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={loading}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
          >
            Save Draft
          </button>
          
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              {showPreview ? <EyeSlashIcon className="h-4 w-4 mr-2 inline" /> : <EyeIcon className="h-4 w-4 mr-2 inline" />}
              {showPreview ? 'Hide Preview' : 'Preview'}
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit for Review'}
            </button>
          </div>
        </div>
      </form>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Agent Preview</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">{formData.agentName}</h4>
                  <p className="text-gray-600">{formData.agentDescription}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Category:</span> {formData.agentCategory}
                  </div>
                  <div>
                    <span className="font-medium">Provider:</span> {formData.provider}
                  </div>
                  <div>
                    <span className="font-medium">Model:</span> {formData.model}
                  </div>
                  <div>
                    <span className="font-medium">Pricing:</span> {formData.pricingModel}
                  </div>
                </div>
                
                {formData.agentTags && formData.agentTags.length > 0 && (
                  <div>
                    <span className="font-medium text-sm">Tags:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {formData.agentTags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
