import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  UserIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  CodeBracketIcon,
  LinkedinIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface CreatorApplication {
  personalInfo: {
    fullName: string;
    email: string;
    bio: string;
    website?: string;
    github?: string;
    linkedin?: string;
    portfolio?: string;
  };
  experience: {
    aiExperience: string;
    technicalBackground: string;
    previousProjects: string;
    useCase: string;
  };
  business: {
    businessModel: string;
    targetAudience: string;
    revenueExpectations: string;
    marketingPlan: string;
  };
  compliance: {
    dataPrivacy: boolean;
    ethicalAI: boolean;
    securityMeasures: boolean;
    termsAccepted: boolean;
  };
}

export default function CreatorRegistration() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [application, setApplication] = useState<CreatorApplication>({
    personalInfo: {
      fullName: userProfile?.displayName || '',
      email: userProfile?.email || '',
      bio: '',
      website: '',
      github: '',
      linkedin: '',
      portfolio: ''
    },
    experience: {
      aiExperience: '',
      technicalBackground: '',
      previousProjects: '',
      useCase: ''
    },
    business: {
      businessModel: '',
      targetAudience: '',
      revenueExpectations: '',
      marketingPlan: ''
    },
    compliance: {
      dataPrivacy: false,
      ethicalAI: false,
      securityMeasures: false,
      termsAccepted: false
    }
  });

  const steps = [
    { id: 1, title: 'Personal Information', description: 'Tell us about yourself' },
    { id: 2, title: 'Experience & Background', description: 'Share your AI expertise' },
    { id: 3, title: 'Business Plan', description: 'Describe your vision' },
    { id: 4, title: 'Compliance & Terms', description: 'Review and accept terms' }
  ];

  const handleInputChange = (section: keyof CreatorApplication, field: string, value: any) => {
    setApplication(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(application.personalInfo.fullName && application.personalInfo.bio);
      case 2:
        return !!(application.experience.aiExperience && application.experience.useCase);
      case 3:
        return !!(application.business.businessModel && application.business.targetAudience);
      case 4:
        return Object.values(application.compliance).every(Boolean);
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      toast.error('Please complete all required fields');
      return;
    }

    setLoading(true);
    try {
      // TODO: Submit application to backend service
      // await submitCreatorApplication(application);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Application submitted successfully! We\'ll review and get back to you within 3-5 business days.');
      navigate('/creator-dashboard');
    } catch (error) {
      console.error('Failed to submit application:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={application.personalInfo.fullName}
                onChange={(e) => handleInputChange('personalInfo', 'fullName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={application.personalInfo.email}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                placeholder="Your email address"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio <span className="text-red-500">*</span>
              </label>
              <textarea
                value={application.personalInfo.bio}
                onChange={(e) => handleInputChange('personalInfo', 'bio', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tell us about yourself, your background, and why you want to be a creator..."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={application.personalInfo.website}
                  onChange={(e) => handleInputChange('personalInfo', 'website', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://yourwebsite.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Portfolio
                </label>
                <input
                  type="url"
                  value={application.personalInfo.portfolio}
                  onChange={(e) => handleInputChange('personalInfo', 'portfolio', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://yourportfolio.com"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GitHub
                </label>
                <input
                  type="url"
                  value={application.personalInfo.github}
                  onChange={(e) => handleInputChange('personalInfo', 'github', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://github.com/username"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LinkedIn
                </label>
                <input
                  type="url"
                  value={application.personalInfo.linkedin}
                  onChange={(e) => handleInputChange('personalInfo', 'linkedin', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI/ML Experience <span className="text-red-500">*</span>
              </label>
              <textarea
                value={application.experience.aiExperience}
                onChange={(e) => handleInputChange('experience', 'aiExperience', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your experience with AI, machine learning, or related technologies..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Technical Background
              </label>
              <textarea
                value={application.experience.technicalBackground}
                onChange={(e) => handleInputChange('experience', 'technicalBackground', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What's your technical background? (programming, data science, etc.)"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Previous Projects
              </label>
              <textarea
                value={application.experience.previousProjects}
                onChange={(e) => handleInputChange('experience', 'previousProjects', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe any previous AI projects or applications you've built..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Use Case for AI Agent <span className="text-red-500">*</span>
              </label>
              <textarea
                value={application.experience.useCase}
                onChange={(e) => handleInputChange('experience', 'useCase', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What type of AI agent do you want to create? What problem does it solve?"
              />
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Model <span className="text-red-500">*</span>
              </label>
              <textarea
                value={application.business.businessModel}
                onChange={(e) => handleInputChange('business', 'businessModel', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="How do you plan to monetize your AI agent? (subscription, pay-per-use, etc.)"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Audience <span className="text-red-500">*</span>
              </label>
              <textarea
                value={application.business.targetAudience}
                onChange={(e) => handleInputChange('business', 'targetAudience', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Who is your target audience? (developers, businesses, students, etc.)"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Revenue Expectations
              </label>
              <textarea
                value={application.business.revenueExpectations}
                onChange={(e) => handleInputChange('business', 'revenueExpectations', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What are your revenue expectations? (realistic projections)"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marketing Plan
              </label>
              <textarea
                value={application.business.marketingPlan}
                onChange={(e) => handleInputChange('business', 'marketingPlan', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="How do you plan to market and promote your AI agent?"
              />
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-blue-900 mb-2">Creator Program Benefits</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 mr-2 text-blue-600" />
                  Access to premium AI models and infrastructure
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 mr-2 text-blue-600" />
                  Revenue sharing on successful agents
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 mr-2 text-blue-600" />
                  Marketing and promotion support
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 mr-2 text-blue-600" />
                  Analytics and performance insights
                </li>
              </ul>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800">Need Help?</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Review our <a href="/agent-submission-faq" className="text-blue-600 hover:underline font-medium">submission requirements and FAQ</a> for detailed information about the creator program, technical requirements, and approval process.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="dataPrivacy"
                  checked={application.compliance.dataPrivacy}
                  onChange={(e) => handleInputChange('compliance', 'dataPrivacy', e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="dataPrivacy" className="text-sm text-gray-700">
                  I understand and will comply with data privacy regulations and best practices
                </label>
              </div>
              
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="ethicalAI"
                  checked={application.compliance.ethicalAI}
                  onChange={(e) => handleInputChange('compliance', 'ethicalAI', e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="ethicalAI" className="text-sm text-gray-700">
                  I will ensure my AI agents follow ethical AI principles and guidelines
                </label>
              </div>
              
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="securityMeasures"
                  checked={application.compliance.securityMeasures}
                  onChange={(e) => handleInputChange('compliance', 'securityMeasures', e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="securityMeasures" className="text-sm text-gray-700">
                  I will implement appropriate security measures for my AI agents
                </label>
              </div>
              
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="termsAccepted"
                  checked={application.compliance.termsAccepted}
                  onChange={(e) => handleInputChange('compliance', 'termsAccepted', e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="termsAccepted" className="text-sm text-gray-700">
                  I accept the <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
                </label>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Application Review Process</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your application will be reviewed by our team within 3-5 business days. 
                    We'll evaluate your experience, business plan, and compliance with our standards.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Library
          </button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Become a Creator
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              Join our AI agent marketplace and start building the future
            </p>
            <div className="inline-flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700">
              <InformationCircleIcon className="w-4 h-4" />
              <a href="/agent-submission-faq" className="underline hover:no-underline">
                View submission requirements and FAQ
              </a>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.id 
                    ? 'border-blue-600 bg-blue-600 text-white' 
                    : 'border-gray-300 bg-white text-gray-500'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircleIcon className="w-6 h-6" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
                
                <div className="ml-3">
                  <h3 className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </h3>
                  <p className={`text-xs ${
                    currentStep >= step.id ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {step.description}
                  </p>
                </div>
                
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {renderStepContent()}
          
          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Previous
            </button>
            
            <div className="flex items-center space-x-3">
              {currentStep < steps.length ? (
                <button
                  onClick={nextStep}
                  disabled={!validateStep(currentStep)}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    validateStep(currentStep)
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!validateStep(currentStep) || loading}
                  className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                    validateStep(currentStep) && !loading
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
