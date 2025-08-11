import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpenIcon,
  BuildingOfficeIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const { currentUser, userProfile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAgentsDropdownOpen, setIsAgentsDropdownOpen] = useState(false);
  const [isLibraryDropdownOpen, setIsLibraryDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActiveRoute = (path: string) => {
    if (path === '/') return location.pathname === '/';
    if (path.startsWith('/company/')) return location.pathname.startsWith('/company/');
    return location.pathname === path;
  };

  const navLinkClass = (path: string) => {
    const baseClasses = "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap";
    return isActiveRoute(path) 
      ? `${baseClasses} bg-white/15 text-white` 
      : `${baseClasses} text-white/90 hover:bg-white/10 hover:text-white`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-100 bg-gradient-to-r from-[#043C46] via-[#043C46] to-[#0F5F6B] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16 gap-4">
          
          {/* Logo/Brand */}
          <div 
            onClick={() => {
              console.log('Logo clicked - navigating to home page');
              window.location.href = '/';
            }}
            className="flex items-center cursor-pointer p-2 min-h-16 flex-shrink-0"
            title="Click to go to Home Page"
          >
            <img 
              src="/transparent-partners-logo-white.png" 
              alt="Transparent Partners Logo" 
              className="h-15 max-w-64 object-contain block pointer-events-none"
            />
          </div>

          {/* Navigation - Agents and Library Dropdowns */}
          <nav className="hidden lg:flex items-center gap-6 flex-1 justify-center">
            {currentUser && userProfile && (
              <>
                {/* Agents Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsAgentsDropdownOpen(!isAgentsDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 text-white/90 hover:bg-white/10 hover:text-white"
                  >
                    <BookOpenIcon className="w-4 h-4" />
                    <span>Agents</span>
                    <ChevronDownIcon className="w-4 h-4" />
                  </button>
                  
                  {isAgentsDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <Link 
                        to="/agents" 
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsAgentsDropdownOpen(false)}
                      >
                        <BookOpenIcon className="w-4 h-4" />
                        All Agents
                      </Link>
                      <Link 
                        to="/my-agents" 
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsAgentsDropdownOpen(false)}
                      >
                        <UserIcon className="w-4 h-4" />
                        My Library
                      </Link>
                    </div>
                  )}
                </div>

                {/* Library Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsLibraryDropdownOpen(!isLibraryDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 text-white/90 hover:bg-white/10 hover:text-white"
                  >
                    <BuildingOfficeIcon className="w-4 h-4" />
                    <span>Library</span>
                    <ChevronDownIcon className="w-4 h-4" />
                  </button>
                  
                  {isLibraryDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      {userProfile.organizationId !== 'pending-assignment' && 
                       userProfile.organizationId !== 'unassigned' && (
                        <Link 
                          to={`/company/${userProfile.organizationId}`} 
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsLibraryDropdownOpen(false)}
                        >
                          <BuildingOfficeIcon className="w-4 h-4" />
                          Company Library
                        </Link>
                      )}
                      <Link 
                        to="/my-agents" 
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsLibraryDropdownOpen(false)}
                      >
                        <UserIcon className="w-4 h-4" />
                        Personal Library
                      </Link>
                    </div>
                  )}
                </div>
              </>
            )}
          </nav>

          {/* User Section */}
          <div className="flex items-center gap-4 text-white flex-shrink-0">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <UserIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">{currentUser.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 px-3 py-2 text-sm rounded-lg transition-all duration-200 hover:bg-white/10 hover:opacity-80"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <Link 
                to="/login"
                className="px-6 py-2 text-sm font-medium rounded-lg border border-white/20 transition-all duration-200 hover:bg-white/10"
              >
                Sign In
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6 text-white" />
              ) : (
                <Bars3Icon className="h-6 w-6 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && currentUser && userProfile && (
          <div className="lg:hidden border-t border-white/10 py-4">
            <nav className="flex flex-col gap-2">
              <div className="border-b border-white/10 pb-2 mb-2">
                <h3 className="text-white/70 text-xs font-medium uppercase tracking-wider mb-2 px-3">Agents</h3>
                <Link 
                  to="/agents" 
                  className={navLinkClass('/agents')}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <BookOpenIcon className="w-4 h-4" />
                  <span>All Agents</span>
                </Link>
                <Link 
                  to="/my-agents" 
                  className={navLinkClass('/my-agents')}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <UserIcon className="w-4 h-4" />
                  <span>My Library</span>
                </Link>
              </div>
              
              <div>
                <h3 className="text-white/70 text-xs font-medium uppercase tracking-wider mb-2 px-3">Library</h3>
                {userProfile.organizationId !== 'pending-assignment' && 
                 userProfile.organizationId !== 'unassigned' && (
                  <Link 
                    to={`/company/${userProfile.organizationId}`} 
                    className={navLinkClass('/company/')}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <BuildingOfficeIcon className="w-4 h-4" />
                    <span>Company Library</span>
                  </Link>
                )}
                <Link 
                  to="/my-agents" 
                  className={navLinkClass('/my-agents')}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Personal Library</span>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}