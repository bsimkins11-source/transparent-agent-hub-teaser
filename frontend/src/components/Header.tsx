import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  UserIcon, 
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
            src={`/transparent-partners-logo.png?v=${Date.now()}`}
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
              e.currentTarget.src = `/transparent-partners-logo-white.png?v=${Date.now()}`;
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
                <UserIcon className="h-5 w-5" />
              </div>
              <span>{userProfile.displayName || currentUser.email?.split('@')[0] || 'User'}</span>
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[999999]">
                <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                  Signed in as <span className="font-medium text-gray-900">{currentUser.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200 flex items-center"
                >
                  <ArrowRightOnRectangleIcon className="mr-3 h-4 w-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="text-white hover:text-blue-200 transition-colors duration-200 px-4 py-2 rounded-md text-sm font-medium border border-white/20 hover:border-white/40"
          >
            Sign In
          </Link>
        )}
      </div>

      {/* Mobile menu button */}
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

      {/* Mobile Navigation Menu */}
      {showMobileMenu && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 py-4 z-[999999]">
          <div className="px-4 space-y-2">
            <Link
              to="/agents"
              onClick={() => setShowMobileMenu(false)}
              className="block px-3 py-2 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200 rounded-md"
            >
              Global Library
            </Link>
            
            {currentUser && userProfile && (
              <Link
                to="/my-agents"
                onClick={() => setShowMobileMenu(false)}
                className="block px-3 py-2 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200 rounded-md"
              >
                Dashboard
              </Link>
            )}

            {currentUser && userProfile ? (
              <button
                onClick={() => {
                  handleLogout();
                  setShowMobileMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200 rounded-md flex items-center"
              >
                <ArrowRightOnRectangleIcon className="mr-3 h-4 w-4" />
                Sign out
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setShowMobileMenu(false)}
                className="block px-3 py-2 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200 rounded-md"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}