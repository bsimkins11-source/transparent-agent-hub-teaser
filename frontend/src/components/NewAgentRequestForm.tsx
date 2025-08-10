import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, PaperAirplaneIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useCompanyBrandingFromRoute } from '../contexts/CompanyBrandingContext';
import { sendAgentRequestEmail, sendRequestConfirmationEmail } from '../services/emailService';
import { createNewAgentRequest } from '../services/newAgentRequestService';
import toast from 'react-hot-toast';

interface NewAgentRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  currentLibrary: 'personal' | 'global' | 'company' | 'network';
  companySlug?: string;
  networkSlug?: string;
}

interface NewAgentRequest {
  agentName: string;
  agentDescription: string;
  useCase: string;
  businessJustification: string;
  expectedUsage: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category: string;
  targetUsers: string;
}

export default function NewAgentRequestForm({
  isOpen,
  onClose,
  currentLibrary,
  companySlug,
  networkSlug
}: NewAgentRequestFormProps) {
  const { currentUser, userProfile } = useAuth();
  const { companyBranding } = useCompanyBrandingFromRoute();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<NewAgentRequest>({
    agentName: '',
    agentDescription: '',
    useCase: '',
    businessJustification: '',
    expectedUsage: '',
    priority: 'normal',
    category: '',
    targetUsers: ''
  });

  const categories = [
    'Productivity',
    'Analytics',
    'Research',
    'Communication',
    'Content Creation',
    'Data Processing',
    'Customer Support',
    'Sales & Marketing',
    'HR & Recruitment',
    'Finance & Accounting',
    'Engineering & Development',
    'Other'
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-gray-600 bg-gray-100' },
    { value: 'normal', label: 'Normal', color: 'text-blue-600 bg-blue-100' },
    { value: 'high', label: 'High', color: 'text-orange-600 bg-orange-100' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-600 bg-red-100' }
  ];

  const handleInputChange = (field: keyof NewAgentRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getAdminContactInfo = () => {
    // Determine which admin to contact based on current library and user's role
    if (currentLibrary === 'company' && companySlug) {
      return {
        email: `admin@${companySlug}.com`, // This would come from company settings
        name: 'Company Administrator',
        title: 'Company Admin'
      };
    } else if (currentLibrary === 'network' && companySlug && networkSlug) {
      return {
        email: `network-admin@${companySlug}.com`, // This would come from network settings
        name: 'Network Administrator',
        title: 'Network Admin'
      };
    } else if (currentLibrary === 'global') {
      return {
        email: 'super-admin@transparent-partners.com', // Super admin for global requests
        name: 'Super Administrator',
        title: 'Super Admin'
      };
    } else {
      return {
        email: 'admin@transparent-partners.com', // Default admin
        name: 'System Administrator',
        title: 'System Admin'
      };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agentName.trim() || !formData.agentDescription.trim() || !formData.useCase.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const adminContact = getAdminContactInfo();
      
      // Prepare email data
      const emailData = {
        agentName: formData.agentName,
        agentDescription: formData.agentDescription,
        useCase: formData.useCase,
        businessJustification: formData.businessJustification,
        expectedUsage: formData.expectedUsage,
        priority: formData.priority,
        category: formData.category,
        targetUsers: formData.targetUsers,
        requesterName: userProfile?.displayName || currentUser?.email || 'Unknown User',
        requesterEmail: currentUser?.email || '',
        libraryType: currentLibrary,
        companySlug,
        networkSlug
      };

      // Create database record first
      const requestId = await createNewAgentRequest({
        userId: currentUser?.uid || '',
        userEmail: currentUser?.email || '',
        userName: userProfile?.displayName || currentUser?.email || 'Unknown User',
        agentName: formData.agentName,
        agentDescription: formData.agentDescription,
        useCase: formData.useCase,
        businessJustification: formData.businessJustification,
        expectedUsage: formData.expectedUsage,
        priority: formData.priority,
        category: formData.category,
        targetUsers: formData.targetUsers,
        libraryType: currentLibrary,
        organizationId: companySlug,
        networkId: networkSlug,
        adminContactEmail: adminContact.email,
        adminContactName: adminContact.name,
        adminContactTitle: adminContact.title
      });

      // Send agent request email to admin
      const adminEmailSuccess = await sendAgentRequestEmail(emailData);
      
      if (adminEmailSuccess) {
        // Send confirmation email to requester
        await sendRequestConfirmationEmail(emailData);
        
        // Show success message
        toast.success(`Agent request submitted successfully! Request ID: ${requestId}. Email sent to ${adminContact.title}.`);
        
        // Reset form and close modal
        setFormData({
          agentName: '',
          agentDescription: '',
          useCase: '',
          businessJustification: '',
          expectedUsage: '',
          priority: 'normal',
          category: '',
          targetUsers: ''
        });
        
        onClose();
      } else {
        throw new Error('Failed to send admin email');
      }
      
    } catch (error) {
      console.error('Error submitting agent request:', error);
      toast.error('Failed to submit agent request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Request New Agent</h2>
                  <p className="text-sm text-gray-600">
                    Describe the AI agent you need for your {currentLibrary} library
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Agent Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agent Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.agentName}
                  onChange={(e) => handleInputChange('agentName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Document Summarizer, Data Analyzer, Customer Support Bot"
                  required
                />
              </div>

              {/* Category and Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {priorities.map(priority => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Agent Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agent Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.agentDescription}
                  onChange={(e) => handleInputChange('agentDescription', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe what this AI agent should do, its capabilities, and how it would help users..."
                  required
                />
              </div>

              {/* Use Case */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Use Case <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.useCase}
                  onChange={(e) => handleInputChange('useCase', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe a specific scenario or workflow where this agent would be used..."
                  required
                />
              </div>

              {/* Business Justification */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Justification
                </label>
                <textarea
                  value={formData.businessJustification}
                  onChange={(e) => handleInputChange('businessJustification', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Explain why this agent is needed and how it will benefit the organization..."
                />
              </div>

              {/* Expected Usage and Target Users */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Usage
                  </label>
                  <input
                    type="text"
                    value={formData.expectedUsage}
                    onChange={(e) => handleInputChange('expectedUsage', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Daily, Weekly, Monthly, On-demand"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Users
                  </label>
                  <input
                    type="text"
                    value={formData.targetUsers}
                    onChange={(e) => handleInputChange('targetUsers', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Sales team, Engineers, All users"
                  />
                </div>
              </div>

              {/* Admin Contact Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="p-1 bg-blue-100 rounded">
                    <ChatBubbleLeftRightIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Request will be sent to:</p>
                    <p><strong>{getAdminContactInfo().title}:</strong> {getAdminContactInfo().name}</p>
                    <p className="text-blue-600">{getAdminContactInfo().email}</p>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  style={{
                    background: companyBranding 
                      ? `linear-gradient(135deg, var(--company-primary), var(--company-secondary))`
                      : undefined
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <PaperAirplaneIcon className="w-4 h-4" />
                      <span>Submit Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
