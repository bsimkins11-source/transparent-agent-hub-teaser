import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useParams } from 'react-router-dom';

interface CompanyBranding {
  id: string;
  name: string;
  domain: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  status: 'active' | 'suspended';
}

interface CompanyBrandingContextType {
  companyBranding: CompanyBranding | null;
  loading: boolean;
  error: string | null;
  updateCompanyBranding: (branding: Partial<CompanyBranding>) => void;
}

const CompanyBrandingContext = createContext<CompanyBrandingContextType | undefined>(undefined);

interface CompanyBrandingProviderProps {
  children: ReactNode;
  companyId?: string;
}

export function CompanyBrandingProvider({ children, companyId }: CompanyBrandingProviderProps) {
  const [companyBranding, setCompanyBranding] = useState<CompanyBranding | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (companyId) {
      loadCompanyBranding(companyId);
    } else {
      setLoading(false);
    }
  }, [companyId]);

  const loadCompanyBranding = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 CompanyBrandingContext: Loading branding for company ID:', id);

      // Try to load from localStorage first (saved branding)
      const savedBranding = localStorage.getItem(`company-branding-${id}`);
      if (savedBranding) {
        const company = JSON.parse(savedBranding);
        console.log('🔍 CompanyBrandingContext: Found saved branding:', company);
        setCompanyBranding(company);
        applyCompanyBranding(company);
        setLoading(false);
        return;
      }

      // Company branding based on actual companyId
      console.log('🔍 CompanyBrandingContext: Loading branding for company:', id);
      const mockCompanies: { [key: string]: CompanyBranding } = {
        'transparent-partners': {
          id: 'transparent-partners',
          name: 'Transparent Partners',
          domain: 'transparent.partners',
          logo: '/transparent-partners-logo.png',
          primaryColor: '#043C46', // Transparent Partners teal primary
          secondaryColor: '#0f766e', // Transparent Partners teal secondary
          status: 'active'
        },
        'coca-cola': {
          id: 'coca-cola',
          name: 'Coca-Cola',
          domain: 'coca-cola.com',
          logo: '/coca-cola-logo.png',
          primaryColor: '#E61A27', // Coca-Cola signature red
          secondaryColor: '#D4141A', // Coca-Cola secondary red
          status: 'active'
        }
      };

      // Get the company based on the actual companyId parameter
      const company = mockCompanies[id];
      if (company) {
        console.log('🔍 CompanyBrandingContext: Using company:', company);
        setCompanyBranding(company);
        applyCompanyBranding(company);
        
        // Save to localStorage for future use
        localStorage.setItem(`company-branding-${id}`, JSON.stringify(company));
      } else {
        setError('Company not found');
      }
    } catch (err) {
      console.error('Failed to load company branding:', err);
      setError('Failed to load company branding');
    } finally {
      setLoading(false);
    }
  };

  const applyCompanyBranding = (branding: CompanyBranding) => {
    console.log('🔍 CompanyBrandingContext: Applying branding:', branding);
    
    // Apply company branding to CSS custom properties
    document.documentElement.style.setProperty('--company-primary', branding.primaryColor);
    document.documentElement.style.setProperty('--company-secondary', branding.secondaryColor);
    
    console.log('🔍 CompanyBrandingContext: CSS variables set:', {
      '--company-primary': branding.primaryColor,
      '--company-secondary': branding.secondaryColor
    });
    
    // Apply company branding to CSS custom properties with opacity variants
    document.documentElement.style.setProperty('--company-primary-50', branding.primaryColor + '0D');
    document.documentElement.style.setProperty('--company-primary-100', branding.primaryColor + '1A');
    document.documentElement.style.setProperty('--company-primary-200', branding.primaryColor + '33');
    document.documentElement.style.setProperty('--company-primary-300', branding.primaryColor + '4D');
    document.documentElement.style.setProperty('--company-primary-400', branding.primaryColor + '66');
    document.documentElement.style.setProperty('--company-primary-500', branding.primaryColor);
    document.documentElement.style.setProperty('--company-primary-600', branding.primaryColor + 'CC');
    document.documentElement.style.setProperty('--company-primary-700', branding.primaryColor + 'E6');
    document.documentElement.style.setProperty('--company-primary-800', branding.primaryColor + 'F0');
    document.documentElement.style.setProperty('--company-primary-900', branding.primaryColor + 'FA');
    
    document.documentElement.style.setProperty('--company-secondary-50', branding.secondaryColor + '0D');
    document.documentElement.style.setProperty('--company-secondary-100', branding.secondaryColor + '1A');
    document.documentElement.style.setProperty('--company-secondary-200', branding.secondaryColor + '33');
    document.documentElement.style.setProperty('--company-secondary-300', branding.secondaryColor + '4D');
    document.documentElement.style.setProperty('--company-secondary-400', branding.secondaryColor + '66');
    document.documentElement.style.setProperty('--company-secondary-500', branding.secondaryColor);
    document.documentElement.style.setProperty('--company-secondary-600', branding.secondaryColor + 'CC');
    document.documentElement.style.setProperty('--company-secondary-700', branding.secondaryColor + 'E6');
    document.documentElement.style.setProperty('--company-secondary-800', branding.secondaryColor + 'F0');
    document.documentElement.style.setProperty('--company-secondary-900', branding.secondaryColor + 'FA');
  };

  const updateCompanyBranding = (branding: Partial<CompanyBranding>) => {
    if (companyBranding) {
      const updated = { ...companyBranding, ...branding };
      setCompanyBranding(updated);
      applyCompanyBranding(updated);
      
      // Update localStorage
      if (companyBranding.id) {
        localStorage.setItem(`company-branding-${companyBranding.id}`, JSON.stringify(updated));
      }
    }
  };

  const value: CompanyBrandingContextType = {
    companyBranding,
    loading,
    error,
    updateCompanyBranding
  };

  return (
    <CompanyBrandingContext.Provider value={value}>
      {children}
    </CompanyBrandingContext.Provider>
  );
}

export function useCompanyBranding() {
  const context = useContext(CompanyBrandingContext);
  if (context === undefined) {
    throw new Error('useCompanyBranding must be used within a CompanyBrandingProvider');
  }
  return context;
}

// Hook for components that need company branding but don't have direct access to companyId
export function useCompanyBrandingFromRoute() {
  const params = useParams<{ companyId?: string; companySlug?: string }>();
  const companyId = params.companyId || params.companySlug;
  
  if (!companyId) {
    return { companyBranding: null, loading: false, error: 'No company ID in route' };
  }

  return useCompanyBranding();
}
