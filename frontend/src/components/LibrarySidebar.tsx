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

  const handleTriggerStripMouseEnter = () => {
    if (sidebarTimeout) {
      clearTimeout(sidebarTimeout);
      setSidebarTimeout(null);
    }
    setSidebarHovered(true);
  };

  const handleSidebarMouseEnter = () => {
    if (sidebarTimeout) {
      clearTimeout(sidebarTimeout);
      setSidebarTimeout(null);
    }
    // Don't set sidebarHovered here - only the trigger strip can initiate
  };

  const handleSidebarMouseLeave = () => {
    const timeout = setTimeout(() => {
      setSidebarHovered(false);
    }, 300); // Longer delay for smoother exit since we have unified hover area
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
      className={`fixed left-0 top-0 h-full z-50 transition-all duration-300 ${
        sidebarHovered ? 'bg-blue-50/5 border-r border-blue-200/20' : ''
      }`}
      onMouseLeave={handleSidebarMouseLeave}
    >
      {/* Hover Trigger Strip */}
      <div 
        className={`absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-blue-500/20 to-blue-500/10 border-r border-blue-200/30 flex flex-col items-center justify-center space-y-4 py-6 transition-all duration-200 ${
          sidebarHovered ? 'from-blue-500/30 to-blue-500/20' : 'from-blue-500/20 to-blue-500/10'
        }`}
        onMouseEnter={handleTriggerStripMouseEnter}
        style={{ zIndex: 60 }}
      >
        {/* Library Icons */}
        <div className="flex flex-col items-center space-y-3">
          <div className={`w-6 h-6 bg-white/80 rounded-lg flex items-center justify-center shadow-sm transition-all duration-300 ${
            sidebarHovered ? 'scale-110 shadow-md' : 'scale-100 shadow-sm'
          }`}>
            <HomeIcon className="w-4 h-4 text-blue-600" />
          </div>
          <div className={`w-6 h-6 bg-white/80 rounded-lg flex items-center justify-center shadow-sm transition-all duration-300 ${
            sidebarHovered ? 'scale-110 shadow-md' : 'scale-100 shadow-sm'
          }`}>
            <GlobeAltIcon className="w-4 h-4 text-blue-600" />
          </div>
          <div className={`w-6 h-6 bg-white/80 rounded-lg flex items-center justify-center shadow-sm transition-all duration-300 ${
            sidebarHovered ? 'scale-110 shadow-md' : 'scale-100 shadow-sm'
          }`}>
            <BuildingOfficeIcon className="w-4 h-4 text-blue-600" />
          </div>
          <div className={`w-6 h-6 bg-white/80 rounded-lg flex items-center justify-center shadow-sm transition-all duration-300 ${
            sidebarHovered ? 'scale-110 shadow-md' : 'scale-100 shadow-sm'
          }`}>
            <UserGroupIcon className="w-4 h-4 text-blue-600" />
          </div>
        </div>
        
        {/* Hover Indicator */}
        <div className={`w-1 h-8 bg-blue-500 rounded-full transition-all duration-300 ${
          sidebarHovered ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-75'
        }`}></div>
      </div>
      
      <div 
        className={`h-full bg-white border-r border-gray-200 shadow-lg transition-all duration-300 ease-in-out transform flex flex-col pointer-events-auto ${
          sidebarHovered ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-95'
        }`}
        onMouseEnter={handleSidebarMouseEnter}
        style={{ 
          width: '280px',
          transformOrigin: 'left center'
        }}
      >
        <div className="p-6 pt-12 flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1d5db #f3f4f6' }}>
          {/* Navigation Header */}
          <div className={`mb-16 mt-8 transition-all duration-500 delay-100 ${
            sidebarHovered ? 'translate-x-0 opacity-100' : 'translate-x-2 opacity-0'
          }`}>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Agent Libraries</h3>
            <p className="text-sm text-gray-600">Navigate between different agent collections</p>
          </div>

          {/* Navigation Items */}
          <nav className={`space-y-3 mb-12 transition-all duration-500 delay-200 ${
            sidebarHovered ? 'translate-x-0 opacity-100' : 'translate-x-2 opacity-0'
          }`}>
            {navigationItems.map((item, index) => {
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
                  style={{
                    transitionDelay: `${300 + (index * 50)}ms`
                  }}
                >
                  <Icon className={`w-5 h-5 transition-all duration-200 ${
                    item.current ? 'text-blue-600 scale-110' : 'text-gray-400 group-hover:text-blue-600 group-hover:scale-110'
                  }`} />
                  <div className="flex-1">
                    <span className="font-medium">{item.name}</span>
                    <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Submit Agent Section */}
          <div className={`pt-8 border-t border-gray-200 transition-all duration-500 delay-300 ${
            sidebarHovered ? 'translate-x-0 opacity-100' : 'translate-x-2 opacity-0'
          }`}>
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Contribute</h4>
              <p className="text-xs text-gray-600">Share your AI agents with the community</p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => navigate('/agent-submission')}
                className="w-full flex items-center space-x-3 px-4 py-3 text-left text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-all duration-200 group border border-green-200 hover:scale-[1.02] hover:shadow-sm"
              >
                <PlusIcon className="w-5 h-5 text-green-600" />
                <span className="font-medium">Submit Agent</span>
              </button>
              
              <button
                onClick={() => setIsNewAgentRequestModalOpen(true)}
                className="w-full flex items-center space-x-3 px-4 py-3 text-left text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all duration-200 group border border-blue-200 hover:scale-[1.02] hover:shadow-sm"
              >
                <ChatBubbleLeftRightIcon className="w-5 h-6 text-blue-600" />
                <span className="font-medium">Request New Agent</span>
              </button>
            </div>
          </div>

          {/* Current Library Info */}
          <div className={`mt-12 pt-8 border-t border-gray-200 transition-all duration-500 delay-400 ${
            sidebarHovered ? 'translate-x-0 opacity-100' : 'translate-x-2 opacity-0'
          }`}>
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
