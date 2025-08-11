import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpenIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  UserIcon,
  CogIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  GlobeAltIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const { currentUser, userProfile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isLibrariesDropdownOpen, setIsLibrariesDropdownOpen] = useState(false);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const librariesDropdownRef = useRef<HTMLDivElement>(null);
  const adminDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (librariesDropdownRef.current && !librariesDropdownRef.current.contains(event.target as Node)) {
        setIsLibrariesDropdownOpen(false);
      }
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(event.target as Node)) {
        setIsAdminDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[99999] bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          
          {/* Logo/Brand */}
          <div className="flex items-center cursor-pointer p-2 flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-600 to-brand-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">TP</span>
              </div>
              <span className="text-gray-900 font-bold text-lg truncate max-w-[200px] sm:max-w-none">
                Transparent Partners
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6 flex-shrink-0">
            {/* Global Library - Always visible */}
            <Link
              to="/agents"
              className="text-gray-600 hover:text-brand-600 font-medium transition-colors whitespace-nowrap"
            >
              Browse Agents
            </Link>

            {currentUser && userProfile && (
              <>
                {/* Libraries Dropdown */}
                <div className="relative" ref={librariesDropdownRef}>
                  <button
                    onClick={() => setIsLibrariesDropdownOpen(!isLibrariesDropdownOpen)}
                    className="flex items-center gap-2 text-gray-600 hover:text-brand-600 font-medium transition-colors whitespace-nowrap group"
                    onMouseEnter={() => setIsLibrariesDropdownOpen(true)}
                  >
                    <BookOpenIcon className="w-4 h-4" />
                    <span>Libraries</span>
                    <ChevronDownIcon className="w-4 h-4 transition-transform group-hover:rotate-180" />
                  </button>
                  
                  {isLibrariesDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                    >
                      <Link
                        to="/my-agents"
                        onClick={() => setIsLibrariesDropdownOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors ${
                          location.pathname === '/my-agents' ? 'bg-brand-50 text-brand-700' : ''
                        }`}
                      >
                        <UserIcon className="w-4 h-4" />
                        <span>My Library</span>
                      </Link>
                      
                      {userProfile.organizationId && userProfile.organizationId !== 'pending-assignment' && userProfile.organizationId !== 'unassigned' && (
                        <Link
                          to={`/company/${userProfile.organizationId}`}
                          onClick={() => setIsLibrariesDropdownOpen(false)}
                          className={`flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors ${
                            location.pathname.startsWith('/company/') ? 'bg-brand-50 text-brand-700' : ''
                          }`}
                        >
                          <BuildingOfficeIcon className="w-4 h-4" />
                          <span>{userProfile.organizationName || 'Company Library'}</span>
                        </Link>
                      )}
                      
                      {userProfile.role === 'creator' && (
                        <Link
                          to="/creator-portal"
                          onClick={() => setIsLibrariesDropdownOpen(false)}
                          className={`flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors ${
                            location.pathname === '/creator-portal' ? 'bg-brand-50 text-brand-700' : ''
                          }`}
                        >
                          <SparklesIcon className="w-4 h-4" />
                          <span>Creator Portal</span>
                        </Link>
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Admin Dropdown */}
                {(userProfile.role === 'super_admin' || userProfile.role === 'company_admin' || userProfile.role === 'network_admin') && (
                  <div className="relative" ref={adminDropdownRef}>
                    <button
                      onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}
                      className="flex items-center gap-2 text-gray-600 hover:text-brand-600 font-medium transition-colors whitespace-nowrap group"
                      onMouseEnter={() => setIsAdminDropdownOpen(true)}
                    >
                      <CogIcon className="w-4 h-4" />
                      <span>Admin</span>
                      <ChevronDownIcon className="w-4 h-4 transition-transform group-hover:rotate-180" />
                    </button>
                    
                    {isAdminDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                      >
                        {userProfile.role === 'super_admin' && (
                          <Link
                            to="/super-admin"
                            onClick={() => setIsAdminDropdownOpen(false)}
                            className={`flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors ${
                              location.pathname === '/super-admin' ? 'bg-brand-50 text-brand-700' : ''
                            }`}
                          >
                            <span className="text-lg">👑</span>
                            <div>
                              <div className="font-medium">Super Admin</div>
                              <div className="text-xs text-gray-500">Global management</div>
                            </div>
                          </Link>
                        )}
                        
                        {(userProfile.role === 'super_admin' || userProfile.role === 'company_admin') && (
                          <Link
                            to="/company-admin"
                            onClick={() => setIsAdminDropdownOpen(false)}
                            className={`flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors ${
                              location.pathname === '/company-admin' ? 'bg-brand-50 text-brand-700' : ''
                            }`}
                          >
                            <BuildingOfficeIcon className="w-4 h-4" />
                            <div>
                              <div className="font-medium">Company Admin</div>
                              <div className="text-xs text-gray-500">{userProfile.organizationName || 'Company management'}</div>
                            </div>
                          </Link>
                        )}
                        
                        {(userProfile.role === 'super_admin' || userProfile.role === 'network_admin') && (
                          <Link
                            to="/network-admin"
                            onClick={() => setIsAdminDropdownOpen(false)}
                            className={`flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors ${
                              location.pathname === '/network-admin' ? 'bg-brand-50 text-brand-700' : ''
                            }`}
                          >
                            <UserGroupIcon className="w-4 h-4" />
                            <div>
                              <div className="font-medium">Network Admin</div>
                              <div className="text-xs text-gray-500">Network management</div>
                            </div>
                          </Link>
                        )}
                        
                        {(userProfile.role === 'super_admin' || userProfile.role === 'company_admin' || userProfile.role === 'network_admin') && (
                          <Link
                            to="/admin/users"
                            onClick={() => setIsAdminDropdownOpen(false)}
                            className={`flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors ${
                              location.pathname === '/admin/users' ? 'bg-brand-50 text-brand-700' : ''
                            }`}
                          >
                            <UserIcon className="w-4 h-4" />
                            <span>User Management</span>
                          </Link>
                        )}
                      </motion.div>
                    )}
                  </div>
                )}
              </>
            )}
          </nav>

          {/* User Section */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 hidden sm:block truncate max-w-[120px]">
                  {currentUser.displayName || currentUser.email?.split('@')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors whitespace-nowrap"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-6 py-2 text-sm font-medium rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors whitespace-nowrap"
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