import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpenIcon,
  BuildingOfficeIcon,
  UserIcon,
  CogIcon,
  ChevronDownIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const { currentUser, userProfile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isLibrariesDropdownOpen, setIsLibrariesDropdownOpen] = useState(false);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  
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

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[99999] shadow-lg">
      {/* Logo-matching background: solid #043C46 extending 1/3 across, then gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#043C46] from-33% via-[#043C46] via-33% to-teal-700"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          
          {/* Logo/Brand - Always visible */}
          <div className="flex items-center cursor-pointer p-2 flex-shrink-0">
            <Link to="/" className="flex items-center space-x-3">
              <img 
                src="/transparent-partners-logo-white.png" 
                alt="Transparent Partners" 
                className="h-8 w-auto"
              />
              <span className="text-white font-bold text-lg truncate max-w-[200px] sm:max-w-none">
                Transparent Partners
              </span>
            </Link>
          </div>

          {/* Navigation - Only visible when logged in */}
          {currentUser && userProfile && (
            <nav className="flex items-center gap-6 flex-shrink-0">
              {/* Libraries Dropdown - On hover */}
              <div 
                className="relative" 
                ref={librariesDropdownRef}
                onMouseEnter={() => setIsLibrariesDropdownOpen(true)}
                onMouseLeave={() => setIsLibrariesDropdownOpen(false)}
              >
                <button
                  className="flex items-center gap-2 text-teal-100 hover:text-white font-medium transition-colors whitespace-nowrap group px-3 py-2 rounded-md"
                >
                  <BookOpenIcon className="w-4 h-4" />
                  <span>Libraries</span>
                  <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isLibrariesDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isLibrariesDropdownOpen && (
                  <div 
                    className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[999999]"
                  >
                    <Link
                      to="/agents"
                      className={`flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors ${
                        location.pathname === '/agents' ? 'bg-teal-50 text-teal-700' : ''
                      }`}
                      onClick={() => setIsLibrariesDropdownOpen(false)}
                    >
                      <BookOpenIcon className="w-4 h-4" />
                      <span>Global Agent Library</span>
                    </Link>
                    
                    {userProfile.organizationId && userProfile.organizationId !== 'pending-assignment' && userProfile.organizationId !== 'unassigned' && (
                      <Link
                        to={`/company/${userProfile.organizationId}`}
                        className={`flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors ${
                          location.pathname.startsWith('/company/') ? 'bg-teal-50 text-teal-700' : ''
                        }`}
                        onClick={() => setIsLibrariesDropdownOpen(false)}
                      >
                        <BuildingOfficeIcon className="w-4 h-4" />
                        <span>{userProfile.organizationName || 'Company Library'}</span>
                      </Link>
                    )}
                    
                    <Link
                      to="/my-agents"
                      className={`flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors ${
                        location.pathname === '/my-agents' ? 'bg-teal-50 text-teal-700' : ''
                      }`}
                      onClick={() => setIsLibrariesDropdownOpen(false)}
                    >
                      <UserIcon className="w-4 h-4" />
                      <span>My Library</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Admin Dropdown - On hover, only for admin roles */}
              {(userProfile.role === 'super_admin' || userProfile.role === 'company_admin' || userProfile.role === 'network_admin' || userProfile.role === 'creator') && (
                <div 
                  className="relative" 
                  ref={adminDropdownRef}
                  onMouseEnter={() => setIsAdminDropdownOpen(true)}
                  onMouseLeave={() => setIsAdminDropdownOpen(false)}
                >
                  <button
                    className="flex items-center gap-2 text-teal-100 hover:text-white font-medium transition-colors whitespace-nowrap group px-3 py-2 rounded-md"
                  >
                    <CogIcon className="w-4 h-4" />
                    <span>Admin</span>
                    <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isAdminDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isAdminDropdownOpen && (
                    <div 
                      className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[999999]"
                    >
                      {userProfile.role === 'super_admin' && (
                        <Link
                          to="/super-admin"
                          className={`flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors ${
                            location.pathname === '/super-admin' ? 'bg-teal-50 text-teal-700' : ''
                          }`}
                          onClick={() => setIsAdminDropdownOpen(false)}
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
                          className={`flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors ${
                            location.pathname === '/company-admin' ? 'bg-teal-50 text-teal-700' : ''
                          }`}
                          onClick={() => setIsAdminDropdownOpen(false)}
                        >
                          <BuildingOfficeIcon className="w-4 h-4" />
                          <div>
                            <div className="font-medium">Company Admin</div>
                            <div className="text-xs text-gray-500">{userProfile.organizationName || 'Company management'}</div>
                          </div>
                        </Link>
                      )}
                      
                      {(userProfile.role === 'creator' || userProfile.role === 'super_admin') && (
                        <Link
                          to="/creator-portal"
                          className={`flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors ${
                            location.pathname === '/creator-portal' ? 'bg-teal-50 text-teal-700' : ''
                          }`}
                          onClick={() => setIsAdminDropdownOpen(false)}
                        >
                          <SparklesIcon className="w-4 h-4" />
                          <div>
                            <div className="font-medium">Agent Admin</div>
                            <div className="text-xs text-gray-500">Agent submission portal</div>
                          </div>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )}
            </nav>
          )}

          {/* Right Side - Login button or User info */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-teal-100 hidden sm:block truncate max-w-[120px]">
                  {currentUser.displayName || currentUser.email?.split('@')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-teal-700 text-white hover:bg-teal-600 transition-colors whitespace-nowrap"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-6 py-2 text-sm font-medium rounded-lg bg-teal-600 text-white hover:bg-teal-500 transition-colors whitespace-nowrap"
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