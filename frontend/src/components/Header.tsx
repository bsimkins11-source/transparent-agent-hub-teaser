import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  ChevronDownIcon,
  UserCircleIcon,
  CogIcon,
  ShieldCheckIcon,
  BuildingLibraryIcon,
  ChartBarIcon,
  GlobeAltIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  CubeIcon
} from '@heroicons/react/24/outline';

export default function Header() {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isAgentLibraryDropdownOpen, setIsAgentLibraryDropdownOpen] = useState(false);
  
  // Add timeout refs for hover delay
  const adminDropdownTimeout = useRef<NodeJS.Timeout | null>(null);
  const agentLibraryDropdownTimeout = useRef<NodeJS.Timeout | null>(null);
  const userDropdownTimeout = useRef<NodeJS.Timeout | null>(null);
  
  const adminDropdownRef = useRef<HTMLDivElement>(null);
  const agentLibraryDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await logout();
      setIsUserDropdownOpen(false);
      // Redirect to home page after logout
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const closeAllDropdowns = () => {
    setIsAdminDropdownOpen(false);
    setIsUserDropdownOpen(false);
    setIsAgentLibraryDropdownOpen(false);
  };

  // Clear all timeouts
  const clearAllTimeouts = () => {
    if (adminDropdownTimeout.current) {
      clearTimeout(adminDropdownTimeout.current);
      adminDropdownTimeout.current = null;
    }
    if (agentLibraryDropdownTimeout.current) {
      clearTimeout(agentLibraryDropdownTimeout.current);
      agentLibraryDropdownTimeout.current = null;
    }
    if (userDropdownTimeout.current) {
      clearTimeout(userDropdownTimeout.current);
      userDropdownTimeout.current = null;
    }
  };

  // Agent Library dropdown hover handlers
  // Uses a 200ms delay to prevent dropdown from closing too quickly
  // when moving mouse from trigger button to dropdown content
  const handleAgentLibraryMouseEnter = () => {
    if (agentLibraryDropdownTimeout.current) {
      clearTimeout(agentLibraryDropdownTimeout.current);
      agentLibraryDropdownTimeout.current = null;
    }
    setIsAgentLibraryDropdownOpen(true);
  };

  const handleAgentLibraryMouseLeave = () => {
    agentLibraryDropdownTimeout.current = setTimeout(() => {
      setIsAgentLibraryDropdownOpen(false);
    }, 200); // 200ms delay to allow moving mouse to dropdown content
  };

  // Admin dropdown hover handlers
  // Uses a 200ms delay to prevent dropdown from closing too quickly
  // when moving mouse from trigger button to dropdown content
  const handleAdminMouseEnter = () => {
    if (adminDropdownTimeout.current) {
      clearTimeout(adminDropdownTimeout.current);
      adminDropdownTimeout.current = null;
    }
    setIsAdminDropdownOpen(true);
  };

  const handleAdminMouseLeave = () => {
    adminDropdownTimeout.current = setTimeout(() => {
      setIsAdminDropdownOpen(false);
    }, 200); // 200ms delay to allow moving mouse to dropdown content
  };

  // User dropdown hover handlers
  // Uses a 200ms delay to prevent dropdown from closing too quickly
  // when moving mouse from trigger button to dropdown content
  const handleUserMouseEnter = () => {
    if (userDropdownTimeout.current) {
      clearTimeout(userDropdownTimeout.current);
      userDropdownTimeout.current = null;
    }
    setIsUserDropdownOpen(true);
  };

  const handleUserMouseLeave = () => {
    userDropdownTimeout.current = setTimeout(() => {
      setIsUserDropdownOpen(false);
    }, 200); // 200ms delay to allow moving mouse to dropdown content
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        adminDropdownRef.current && !adminDropdownRef.current.contains(event.target as Node) &&
        agentLibraryDropdownRef.current && !agentLibraryDropdownRef.current.contains(event.target as Node) &&
        userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)
      ) {
        closeAllDropdowns();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#043C46] via-[#043C46] to-teal-700 shadow-lg border-b-4 border-teal-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-3 group" onClick={closeAllDropdowns}>
              <img 
                src="/transparent-partners-logo-white.png" 
                alt="Transparent Partners" 
                className="h-12 w-auto transition-transform duration-200 group-hover:scale-105"
              />
              <div className="hidden md:block">
                <h1 className="text-2xl font-bold text-white">Transparent AI Agent Hub</h1>
                <p className="text-teal-100 text-sm">Intelligent Agents for Business Success</p>
              </div>
            </Link>
          </div>

          {/* Navigation - Only show for signed-in users */}
          {currentUser && (
            <nav className="hidden md:flex items-center space-x-8">
              {/* Agent Library Dropdown */}
              <div 
                className="relative" 
                ref={agentLibraryDropdownRef}
                onMouseEnter={handleAgentLibraryMouseEnter}
                onMouseLeave={handleAgentLibraryMouseLeave}
              >
                <button className="flex items-center space-x-2 text-teal-100 hover:text-white transition-all duration-200 font-medium hover:bg-white/10 px-3 py-2 rounded-lg">
                  <BuildingLibraryIcon className="w-5 h-5" />
                  <span>Agent Library</span>
                  <ChevronDownIcon className="w-4 h-4" />
                </button>
                
                {isAgentLibraryDropdownOpen && (
                  <div 
                    className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 transition-all duration-200 ease-in-out"
                    onMouseEnter={handleAgentLibraryMouseEnter}
                    onMouseLeave={handleAgentLibraryMouseLeave}
                  >
                    <Link
                      to="/agents"
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors duration-200"
                      onClick={closeAllDropdowns}
                    >
                      <GlobeAltIcon className="w-5 h-5" />
                      <span>Global Library</span>
                    </Link>
                    <Link
                      to="/company/transparent-partners"
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors duration-200"
                      onClick={closeAllDropdowns}
                    >
                      <BuildingOfficeIcon className="w-5 h-5" />
                      <span>Company Library</span>
                    </Link>
                    <Link
                      to="/my-agents"
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors duration-200"
                      onClick={closeAllDropdowns}
                    >
                      <UserGroupIcon className="w-5 h-5" />
                      <span>My Library</span>
                    </Link>
                  </div>
                )}
              </div>
              
              {/* Admin Dropdown */}
              {(userProfile?.role === 'company_admin' || 
                userProfile?.role === 'network_admin' || 
                userProfile?.role === 'super_admin') && (
                <div 
                  className="relative" 
                  ref={adminDropdownRef}
                  onMouseEnter={handleAdminMouseEnter}
                  onMouseLeave={handleAdminMouseLeave}
                >
                  <button className="flex items-center space-x-2 text-teal-100 hover:text-white transition-all duration-200 font-medium hover:bg-white/10 px-3 py-2 rounded-lg">
                    <ShieldCheckIcon className="w-5 h-5" />
                    <span>Admin</span>
                    <ChevronDownIcon className="w-4 h-4" />
                  </button>
                  
                  {isAdminDropdownOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 transition-all duration-200 ease-in-out"
                      onMouseEnter={handleAdminMouseEnter}
                      onMouseLeave={handleAdminMouseLeave}
                    >
                      {/* Super Admin */}
                      {userProfile?.role === 'super_admin' && (
                        <Link
                          to="/super-admin"
                          className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors duration-200"
                          onClick={closeAllDropdowns}
                        >
                          <CogIcon className="w-5 h-5" />
                          <span>Super Admin</span>
                        </Link>
                      )}
                      
                      {/* Company Admin */}
                      {userProfile?.permissions.canManageCompany && (
                        <Link
                          to="/company-admin/transparent-partners"
                          className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors duration-200"
                          onClick={closeAllDropdowns}
                        >
                          <BuildingOfficeIcon className="w-5 h-5" />
                          <span>Company Admin</span>
                        </Link>
                      )}
                      
                      {/* Agent Admin */}
                      {userProfile?.permissions.canManageUsers && (
                        <Link
                          to="/agent-admin"
                          className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors duration-200"
                          onClick={closeAllDropdowns}
                        >
                          <CubeIcon className="w-5 h-5" />
                          <span>Agent Admin</span>
                        </Link>
                      )}
                      
                      {/* Analytics */}
                      {userProfile?.permissions.canViewAnalytics && (
                        <Link
                          to="/analytics"
                          className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors duration-200"
                          onClick={closeAllDropdowns}
                        >
                          <ChartBarIcon className="w-5 h-5" />
                          <span>Analytics Dashboard</span>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )}
            </nav>
          )}

          {/* Right side - Sign In or User Menu */}
          <div className="flex items-center space-x-4">
            {currentUser ? (
              /* User is signed in - show user menu */
              <div className="relative" ref={userDropdownRef} onMouseEnter={handleUserMouseEnter} onMouseLeave={handleUserMouseLeave}>
                <button
                  onClick={() => {
                    setIsUserDropdownOpen(!isUserDropdownOpen);
                    setIsAdminDropdownOpen(false);
                    setIsAgentLibraryDropdownOpen(false);
                  }}
                  className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  <UserCircleIcon className="w-5 h-5" />
                  <span className="hidden sm:block">{userProfile?.displayName || currentUser.email}</span>
                  <ChevronDownIcon className="w-4 h-4" />
                </button>
                
                {isUserDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 transition-all duration-200 ease-in-out"
                    onMouseEnter={handleUserMouseEnter}
                    onMouseLeave={handleUserMouseLeave}
                  >
                    <Link
                      to="/profile"
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors duration-200"
                      onClick={closeAllDropdowns}
                    >
                      <UserCircleIcon className="w-5 h-5" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors duration-200"
                      onClick={closeAllDropdowns}
                    >
                      <CogIcon className="w-5 h-5" />
                      <span>Settings</span>
                    </Link>
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 w-full text-left transition-colors duration-200"
                    >
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* User is not signed in - show sign in button */
              <Link
                to="/login"
                className="bg-white text-teal-700 hover:bg-teal-50 px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg border-2 border-transparent hover:border-teal-200"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
