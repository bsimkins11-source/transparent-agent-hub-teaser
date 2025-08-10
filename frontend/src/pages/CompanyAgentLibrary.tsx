import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import LibrarySidebar from '../components/LibrarySidebar';
import HierarchicalAgentLibrary from '../components/HierarchicalAgentLibrary';

interface CompanyBranding {
  name: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  domain: string;
}

export default function CompanyAgentLibrary() {
  const { companySlug } = useParams<{ companySlug: string }>();
  const { currentUser, userProfile } = useAuth();
  const [companyBranding, setCompanyBranding] = useState<CompanyBranding | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompanyData();
  }, [companySlug]);

  const loadCompanyData = async () => {
    if (!companySlug) return;
    
    // Try to load from localStorage first (saved branding)
    const savedBranding = localStorage.getItem(`company-branding-${companySlug}`);
    if (savedBranding) {
      const company = JSON.parse(savedBranding);
      setCompanyBranding(company);
      
      // Apply company branding to CSS custom properties
      document.documentElement.style.setProperty('--company-primary', company.primaryColor);
      document.documentElement.style.setProperty('--company-secondary', company.secondaryColor);
    } else {
      // Fallback to mock companies for demo
      const mockCompanies = {
        'transparent-partners': {
          name: 'Transparent Partners',
          logo: '/transparent-partners-logo.png',
          primaryColor: '#3B82F6',
          secondaryColor: '#1E40AF',
          domain: 'transparent.partners'
        },
        'test-company-inc': {
          name: 'Test Company Inc.',
          logo: '',
          primaryColor: '#10B981',
          secondaryColor: '#047857',
          domain: 'testcompany.com'
        }
      };

      const company = mockCompanies[companySlug as keyof typeof mockCompanies];
      if (company) {
        setCompanyBranding(company);
        
        // Apply company branding to CSS custom properties
        document.documentElement.style.setProperty('--company-primary', company.primaryColor);
        document.documentElement.style.setProperty('--company-secondary', company.secondaryColor);
      }
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading company library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Company Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {companyBranding?.logo && (
                <img 
                  src={companyBranding.logo} 
                  alt={`${companyBranding.name} logo`}
                  className="h-8 w-auto"
                />
              )}
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {companyBranding?.name || 'Company'} Agent Library
                </h1>
                <p className="text-sm text-gray-500">
                  Browse and manage agents available to your organization
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <LibrarySidebar 
          currentLibrary="company" 
          companySlug={companySlug}
        />
        
        {/* Agent Library */}
        <div className="flex-1 ml-0 lg:ml-0">
          <HierarchicalAgentLibrary 
            initialLibrary="company"
            showTabs={false}
          />
        </div>
      </div>
    </div>
  );
}
