import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HomeIcon,
  BookOpenIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  PlusIcon,
  UserIcon,
  GlobeAltIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import NewAgentRequestForm from './NewAgentRequestForm';

interface LibrarySidebarProps {
  currentLibrary: 'personal' | 'global' | 'company' | 'network';
  companySlug?: string;
  networkSlug?: string;
}

export default function LibrarySidebar({ 
  currentLibrary, 
  companySlug, 
  networkSlug 
}: LibrarySidebarProps) {
  const { currentUser, userProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [sidebarTimeout, setSidebarTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isNewAgentRequestModalOpen, setIsNewAgentRequestModalOpen] = useState(false);

  const handleSidebarMouseEnter = () => {
    if (sidebarTimeout) {
      clearTimeout(sidebarTimeout);
      setSidebarTimeout(null);
    }
    setSidebarHovered(true);
  };

  const handleSidebarMouseLeave = () => {
    const timeout = setTimeout(() => {
      setSidebarHovered(false);
    }, 150); // Small delay to prevent flickering
    setSidebarTimeout(timeout);
  };

  // Cleanup sidebar timeout on unmount
  useEffect(() => {
    return () => {
      if (sidebarTimeout) {
        clearTimeout(sidebarTimeout);
      }
    };
  }, [sidebarTimeout]);

  const navigationItems = [
    {
      name: 'My Library',
      href: '/my-agents',
      icon: UserIcon,
      current: currentLibrary === 'personal',
      description: 'Your personal agent collection'
    },
    {
      name: 'Global Agent Library',
      href: '/agents',
      icon: GlobeAltIcon,
      current: currentLibrary === 'global',
      description: 'Public marketplace of AI agents'
    }
  ];

  // Add company or network library based on user's organization
  if (userProfile?.organizationId) {
    navigationItems.push({
      name: 'Company Library',
      href: `/company/${companySlug || userProfile.organizationId}/agents`,
      icon: BuildingOfficeIcon,
      current: currentLibrary === 'company',
      description: 'Organization-specific agents'
    });
  } else if (userProfile?.networkId) {
    navigationItems.push({
      name: 'Network Library',
      href: `/network/${networkSlug || userProfile.networkId}/agents`,
      icon: UserGroupIcon,
      current: currentLibrary === 'network',
      description: 'Network-specific agents'
    });
  }

  return (
    <div 
      className="fixed left-0 top-0 h-full z-50"
      onMouseEnter={handleSidebarMouseEnter}
      onMouseLeave={handleSidebarMouseLeave}
    >
      {/* Hover Indicator */}
      <div className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-2 h-16 bg-blue-500 rounded-r-full transition-opacity duration-300 z-50 pointer-events-none ${
        sidebarHovered ? 'opacity-100' : 'opacity-0'
      }`}></div>
      
      <div 
        className={`h-full bg-white border-r border-gray-200 shadow-lg transition-all duration-300 ease-in-out transform flex flex-col pointer-events-auto ${
          sidebarHovered ? 'translate-x-0 shadow-2xl scale-100' : '-translate-x-full scale-95'
        }`}
        style={{ width: '280px' }}
      >
        <div className="p-6 pt-12 flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1d5db #f3f4f6' }}>
          {/* Navigation Header */}
          <div className="mb-16 mt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Agent Libraries</h3>
            <p className="text-sm text-gray-600">Navigate between different agent collections</p>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-3 mb-12">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-all duration-200 group ${
                    item.current
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:border hover:border-blue-200'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${
                    item.current ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'
                  } transition-colors`} />
                  <div className="flex-1">
                    <span className="font-medium">{item.name}</span>
                    <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Submit Agent Section */}
          <div className="pt-8 border-t border-gray-200">
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Contribute</h4>
              <p className="text-xs text-gray-600">Share your AI agents with the community</p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => navigate('/agent-submission')}
                className="w-full flex items-center space-x-3 px-4 py-3 text-left text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-all duration-200 group border border-green-200"
              >
                <PlusIcon className="w-5 h-5 text-green-600" />
                <span className="font-medium">Submit Agent</span>
              </button>
              
              <button
                onClick={() => setIsNewAgentRequestModalOpen(true)}
                className="w-full flex items-center space-x-3 px-4 py-3 text-left text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all duration-200 group border border-blue-200"
              >
                <ChatBubbleLeftRightIcon className="w-5 h-6 text-blue-600" />
                <span className="font-medium">Request New Agent</span>
              </button>
            </div>
          </div>

          {/* Current Library Info */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="text-sm text-gray-500 mb-3">Currently viewing:</div>
            <div className="text-sm font-medium text-gray-900">
              {currentLibrary === 'personal' && 'My Library'}
              {currentLibrary === 'global' && 'Global Agent Library'}
              {currentLibrary === 'company' && 'Company Library'}
              {currentLibrary === 'network' && 'Network Library'}
            </div>
          </div>
        </div>
      </div>

      {/* New Agent Request Modal */}
      {isNewAgentRequestModalOpen && (
        <NewAgentRequestForm
          isOpen={isNewAgentRequestModalOpen}
          onClose={() => setIsNewAgentRequestModalOpen(false)}
          currentLibrary={currentLibrary}
          companySlug={companySlug}
          networkSlug={networkSlug}
        />
      )}
    </div>
  );
}
