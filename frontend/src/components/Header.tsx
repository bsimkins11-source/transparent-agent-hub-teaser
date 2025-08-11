import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
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
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // Ref for user dropdown container
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Debug logging
  console.log('Header render - currentUser:', currentUser?.email, 'userProfile:', userProfile?.role, 'permissions:', userProfile?.permissions);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
        <div style={{
          height: '48px',
          width: '48px',
          backgroundColor: 'white',
          padding: '6px',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          border: '2px solid white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          <img 
            src="/transparent-partners-logo.png" 
            alt="Transparent Partners Logo" 
            style={{ 
              height: '100%',
              width: '100%',
              objectFit: 'contain',
              display: 'block'
            }} 
            onError={(e) => {
              console.error('Logo failed to load, trying fallback:', e);
              // Try the white logo as fallback
              e.currentTarget.src = '/transparent-partners-logo-white.png';
              e.currentTarget.onerror = () => {
                console.error('Fallback logo also failed to load');
                e.currentTarget.style.display = 'none';
                // Show fallback text logo
                const fallbackText = document.createElement('div');
                fallbackText.textContent = 'TP';
                fallbackText.style.cssText = 'height: 100%; width: 100%; background-color: white; color: #043C46; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 16px; border-radius: 4px;';
                e.currentTarget.parentNode?.insertBefore(fallbackText, e.currentTarget);
              };
            }}
            onLoad={() => {
              console.log('Logo loaded successfully');
            }}
          />
        </div>
        <span style={{ 
          color: 'white', 
          fontSize: '18px', 
          fontWeight: 'bold' 
        }}>
          Transparent Partners
        </span>
      </div>

      {/* Desktop Navigation - Simplified */}
      <div className="hidden lg:flex items-center space-x-6">
        {/* Quick Links */}
        <Link 
          to="/agents"
          className="text-white hover:text-blue-200 transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium"
        >
          Global Library
        </Link>
        
        {currentUser && userProfile && (
          <Link 
            to="/my-agents"
            className="text-white hover:text-blue-200 transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium"
          >
            Dashboard
          </Link>
        )}

        {/* Admin Hint for Admin Users */}
        {currentUser && userProfile && (userProfile.role === 'super_admin' || userProfile.role === 'company_admin' || userProfile.role === 'network_admin') && (
          <div className="flex items-center text-blue-200 text-xs px-3 py-1 bg-blue-900/20 rounded-full">
            <span>Admin features available in sidebar →</span>
          </div>
        )}

        {/* User Profile Section */}
        {currentUser && userProfile ? (
          <div className="relative" ref={userDropdownRef}>
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center text-white hover:text-blue-200 transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium"
            >
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-2">
                <UserIcon className="h-5 w-5 text-white" />
              </div>
              <span>{userProfile.displayName || currentUser.email?.split('@')[0] || 'User'}</span>
            </button>

            {showUserDropdown && (
              <div 
                className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[999999]"
                style={{ position: 'absolute', zIndex: 999999 }}
              >
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
          <Link to="/login" className="inline-block">
            <button 
              className="bg-white text-[#043C46] px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors duration-200 border-none cursor-pointer"
            >
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
    </div>
  );
}