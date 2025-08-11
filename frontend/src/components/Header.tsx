import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  ChevronDownIcon, 
  UserIcon, 
  Cog6ToothIcon, 
  BuildingLibraryIcon, 
  GlobeAltIcon, 
  SparklesIcon, 
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function Header() {
  const { currentUser, userProfile, logout } = useAuth();
  const location = useLocation();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  const [showNavDropdown, setShowNavDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Debug logging
  console.log('Header render - currentUser:', currentUser?.email, 'userProfile:', userProfile?.role, 'permissions:', userProfile?.permissions);

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserDropdown(false);
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  // Navigation items based on user role and permissions
  const getNavigationItems = () => {
    if (!currentUser || !userProfile) return [];

    const baseItems = [
      { name: 'Global Library', href: '/agents', icon: GlobeAltIcon, current: location.pathname === '/agents' }
    ];

    const authenticatedItems = [
      { name: 'Dashboard', href: '/my-agents', icon: UserIcon, current: location.pathname === '/my-agents' }
    ];

    const roleBasedItems = [
      {
        name: 'Company Management',
        href: '/company-admin',
        icon: BuildingLibraryIcon,
        current: location.pathname === '/company-admin',
        requiresRole: ['company_admin', 'super_admin'],
        requiresPermission: 'canManageCompany'
      },
      {
        name: 'Network Management',
        href: '/network-admin',
        icon: GlobeAltIcon,
        current: location.pathname === '/network-admin',
        requiresRole: ['network_admin', 'super_admin'],
        requiresPermission: 'canManageNetwork'
      },
      {
        name: 'System Administration',
        href: '/super-admin',
        icon: Cog6ToothIcon,
        current: location.pathname === '/super-admin',
        requiresRole: ['super_admin']
      },
      {
        name: 'Creator Portal',
        href: '/creator-portal',
        icon: SparklesIcon,
        current: location.pathname === '/creator-portal',
        requiresRole: ['creator', 'super_admin'],
        requiresPermission: 'canSubmitAgents'
      },
      {
        name: 'Analytics',
        href: '/analytics',
        icon: ChartBarIcon,
        current: location.pathname === '/analytics',
        requiresRole: ['company_admin', 'network_admin', 'super_admin'],
        requiresPermission: 'canViewAnalytics'
      }
    ];

    let items = [...baseItems, ...authenticatedItems];
    
    roleBasedItems.forEach(item => {
      const hasRole = !item.requiresRole || item.requiresRole.includes(userProfile.role);
      const hasPermission = !item.requiresPermission || (item.requiresPermission && userProfile.permissions[item.requiresPermission as keyof typeof userProfile.permissions]);
      
      if (hasRole && hasPermission) {
        items.push(item);
      }
    });

    return items;
  };

  const navigationItems = getNavigationItems();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '64px',
      backgroundColor: '#043C46',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px'
    }}>
      {/* Logo and Brand */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px' 
      }}>
        <img 
          src="/transparent-partners-logo.png" 
          alt="Transparent Partners Logo" 
          style={{ 
            height: '40px', 
            width: 'auto',
            backgroundColor: 'white',
            padding: '8px',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            border: '2px solid white'
          }} 
          onError={(e) => {
            console.error('Logo failed to load:', e);
            e.currentTarget.style.display = 'none';
          }}
          onLoad={() => {
            console.log('Logo loaded successfully');
          }}
        />
        <span style={{ 
          color: 'white', 
          fontSize: '18px', 
          fontWeight: 'bold' 
        }}>
          Transparent Partners
        </span>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex items-center space-x-6">
        {/* Libraries Menu */}
        <div className="relative">
          <button
            onClick={() => setShowNavDropdown(!showNavDropdown)}
            className="flex items-center text-white hover:text-blue-200 transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium"
          >
            <span>Libraries</span>
            <ChevronDownIcon className={`ml-1 h-4 w-4 transition-transform duration-200 ${showNavDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showNavDropdown && (
            <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[999999]">
              <Link
                to="/agents"
                onClick={() => setShowNavDropdown(false)}
                className={`flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200 ${
                  location.pathname === '/agents' ? 'bg-blue-50 text-blue-700' : ''
                }`}
              >
                <GlobeAltIcon className="mr-3 h-4 w-4" />
                Global Library
              </Link>
              {currentUser && userProfile && (
                <>
                  <Link
                    to="/company-admin"
                    onClick={() => setShowNavDropdown(false)}
                    className={`flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200 ${
                      location.pathname === '/company-admin' ? 'bg-blue-50 text-blue-700' : ''
                    }`}
                  >
                    <BuildingLibraryIcon className="mr-3 h-4 w-4" />
                    Company Library
                  </Link>
                  <Link
                    to="/my-agents"
                    onClick={() => setShowNavDropdown(false)}
                    className={`flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200 ${
                      location.pathname === '/my-agents' ? 'bg-blue-50 text-blue-700' : ''
                    }`}
                  >
                    <UserIcon className="mr-3 h-4 w-4" />
                    My Library
                  </Link>
                </>
              )}
            </div>
          )}
        </div>

        {/* Admin Menu - Only show for admin users */}
        {currentUser && userProfile && (userProfile.role === 'super_admin' || userProfile.role === 'company_admin' || userProfile.role === 'network_admin') && (
          <div className="relative">
            <button
              onClick={() => setShowAdminDropdown(!showAdminDropdown)}
              className="flex items-center text-white hover:text-blue-200 transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium"
            >
              <span>Admin</span>
              <ChevronDownIcon className={`ml-1 h-4 w-4 transition-transform duration-200 ${showAdminDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showAdminDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[999999]">
                <Link
                  to="/super-admin"
                  onClick={() => setShowAdminDropdown(false)}
                  className={`flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200 ${
                    location.pathname === '/super-admin' ? 'bg-blue-50 text-blue-700' : ''
                  }`}
                >
                  <Cog6ToothIcon className="mr-3 h-4 w-4" />
                  Super Admin Page
                </Link>
                <Link
                  to="/company-admin"
                  onClick={() => setShowAdminDropdown(false)}
                  className={`flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200 ${
                    location.pathname === '/company-admin' ? 'bg-blue-50 text-blue-700' : ''
                  }`}
                >
                  <BuildingLibraryIcon className="mr-3 h-4 w-4" />
                  Company Super Admin Page
                </Link>
                <Link
                  to="/creator-portal"
                  onClick={() => setShowAdminDropdown(false)}
                  className={`flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200 ${
                    location.pathname === '/creator-portal' ? 'bg-blue-50 text-blue-700' : ''
                  }`}
                >
                  <SparklesIcon className="mr-3 h-4 w-4" />
                  Agent Submission Page
                </Link>
              </div>
            )}
          </div>
        )}

        {/* User Profile Section */}
        {currentUser && userProfile ? (
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center text-white hover:text-blue-200 transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium"
            >
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-2">
                <UserIcon className="h-5 w-5 text-white" />
              </div>
              <span>{userProfile.displayName || currentUser.email?.split('@')[0] || 'User'}</span>
              <ChevronDownIcon className={`ml-1 h-4 w-4 transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[999999]">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{userProfile.displayName || 'User'}</p>
                  <p className="text-sm text-gray-500">{currentUser.email}</p>
                  <p className="text-xs text-blue-600 font-medium capitalize mt-1">{userProfile.role.replace('_', ' ')}</p>
                </div>
                
                <Link
                  to="/my-agents"
                  onClick={() => setShowUserDropdown(false)}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
                >
                  <UserIcon className="mr-3 h-4 w-4" />
                  Dashboard
                </Link>
                
                <Link
                  to="/settings"
                  onClick={() => setShowUserDropdown(false)}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
                >
                  <Cog6ToothIcon className="mr-3 h-4 w-4" />
                  Settings
                </Link>
                
                <div className="border-t border-gray-200 my-1"></div>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
                >
                  <ArrowRightOnRectangleIcon className="mr-3 h-4 w-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login">
            <button style={{
              backgroundColor: 'white',
              color: '#043C46',
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textDecoration: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f8f9fa';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              Sign In
            </button>
          </Link>
        )}
      </div>

      {/* Mobile Menu Button */}
      <div className="lg:hidden">
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="text-white hover:text-blue-200 transition-colors duration-200 p-2"
        >
          {showMobileMenu ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="lg:hidden fixed inset-0 top-16 bg-black bg-opacity-50 z-[999999]">
          <div className="bg-white shadow-xl">
            <div className="px-4 py-6 space-y-4">
              {currentUser && userProfile ? (
                <>
                  {/* User Info */}
                  <div className="border-b border-gray-200 pb-4">
                    <p className="text-lg font-medium text-gray-900">{userProfile.displayName || 'User'}</p>
                    <p className="text-sm text-gray-500">{currentUser.email}</p>
                    <p className="text-xs text-blue-600 font-medium capitalize mt-1">{userProfile.role.replace('_', ' ')}</p>
                  </div>

                  {/* Navigation Items */}
                  <div className="space-y-2">
                    {navigationItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setShowMobileMenu(false)}
                          className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                            item.current
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          <Icon className="mr-3 h-5 w-5" />
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-200 pt-4">
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowMobileMenu(false);
                      }}
                      className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200 rounded-md"
                    >
                      <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">Sign in to access your dashboard</p>
                  <Link to="/login">
                    <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200">
                      Sign In
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close dropdowns */}
      {(showUserDropdown || showAdminDropdown || showNavDropdown) && (
        <div
          className="fixed inset-0 z-[999998]"
          onClick={() => {
            setShowUserDropdown(false);
            setShowAdminDropdown(false);
            setShowNavDropdown(false);
          }}
        />
      )}
    </div>
  );
}