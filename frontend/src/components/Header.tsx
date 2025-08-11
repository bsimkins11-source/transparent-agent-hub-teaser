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
  XMarkIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

export default function Header() {
  const { currentUser, userProfile, logout } = useAuth();
  const location = useLocation();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLibrariesDropdown, setShowLibrariesDropdown] = useState(false);
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // Refs for dropdown containers
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const librariesDropdownRef = useRef<HTMLDivElement>(null);
  const adminDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
      if (librariesDropdownRef.current && !librariesDropdownRef.current.contains(event.target as Node)) {
        setShowLibrariesDropdown(false);
      }
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(event.target as Node)) {
        setShowAdminDropdown(false);
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
      {/* Logo - FORCE DEBUGGING */}
      <img 
        src="/transparent-partners-logo-white.png" 
        alt="Logo" 
        style={{ 
          height: '40px',
          width: '40px',
          objectFit: 'contain',
          display: 'block',
          marginRight: '12px',
          zIndex: 9999999,
          // NUCLEAR OPTION - Force override EVERYTHING
          background: 'red !important',
          backgroundColor: 'red !important',
          border: '3px solid yellow !important',
          outline: '3px solid green !important',
          boxShadow: '0 0 10px purple !important',
          // Force dimensions
          minWidth: '40px !important',
          maxWidth: '40px !important',
          minHeight: '40px !important',
          maxHeight: '40px !important',
        }} 
        onError={(e) => {
          console.error('Logo failed to load:', e);
        }}
        onLoad={(e) => {
          console.log('Logo loaded successfully');
          // Debug: Log ALL computed styles
          const computedStyle = window.getComputedStyle(e.currentTarget);
          console.log('🔍 LOGO DEBUG - All computed styles:', {
            background: computedStyle.background,
            backgroundColor: computedStyle.backgroundColor,
            border: computedStyle.border,
            outline: computedStyle.outline,
            boxShadow: computedStyle.boxShadow,
            width: computedStyle.width,
            height: computedStyle.height,
            display: computedStyle.display,
            position: computedStyle.position,
            zIndex: computedStyle.zIndex
          });
          
          // Check if there are any CSS rules affecting this element
          const rules = [];
          for (let i = 0; i < document.styleSheets.length; i++) {
            try {
              const sheet = document.styleSheets[i];
              if (sheet.cssRules) {
                for (let j = 0; j < sheet.cssRules.length; j++) {
                  const rule = sheet.cssRules[j];
                  if (rule instanceof CSSStyleRule && rule.selectorText) {
                    if (rule.selectorText.includes('img') || rule.selectorText.includes('header')) {
                      rules.push(rule.selectorText);
                    }
                  }
                }
              }
            } catch (e) {
              // Cross-origin stylesheets will throw errors
            }
          }
          console.log('🔍 CSS rules affecting img/header:', rules);
        }}
      />
      
      {/* Brand Text */}
      <span style={{ 
        color: 'white', 
        fontSize: '18px', 
        fontWeight: 'bold',
        zIndex: 9999999
      }}>
        Transparent Partners
      </span>

      {/* Desktop Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        {/* Libraries Dropdown */}
        <div style={{ position: 'relative' }} ref={librariesDropdownRef}>
          <button
            onClick={() => setShowLibrariesDropdown(!showLibrariesDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              color: 'white',
              backgroundColor: 'transparent',
              border: 'none',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            <span>Libraries</span>
            <ChevronDownIcon style={{ marginLeft: '4px', width: '16px', height: '16px' }} />
          </button>

          {showLibrariesDropdown && (
            <div style={{
              position: 'absolute',
              left: 0,
              top: '100%',
              marginTop: '8px',
              width: '256px',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              border: '1px solid #e5e7eb',
              zIndex: 999999,
              padding: '8px 0'
            }}>
              <Link
                to="/agents"
                onClick={() => setShowLibrariesDropdown(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 16px',
                  color: '#374151',
                  textDecoration: 'none',
                  fontSize: '14px'
                }}
              >
                <GlobeAltIcon style={{ marginRight: '12px', width: '16px', height: '16px' }} />
                Global Library
              </Link>
              {currentUser && userProfile && (
                <>
                  <Link
                    to="/company-admin"
                    onClick={() => setShowLibrariesDropdown(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '8px 16px',
                      color: '#374151',
                      textDecoration: 'none',
                      fontSize: '14px'
                    }}
                  >
                    <BuildingLibraryIcon style={{ marginRight: '12px', width: '16px', height: '16px' }} />
                    Company Library
                  </Link>
                  <Link
                    to="/my-agents"
                    onClick={() => setShowLibrariesDropdown(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '8px 16px',
                      color: '#374151',
                      textDecoration: 'none',
                      fontSize: '14px'
                    }}
                  >
                    <UserIcon style={{ marginRight: '12px', width: '16px', height: '16px' }} />
                    My Library
                  </Link>
                </>
              )}
            </div>
          )}
        </div>

        {/* Admin Dropdown */}
        {currentUser && userProfile && (userProfile.role === 'super_admin' || userProfile.role === 'company_admin' || userProfile.role === 'network_admin') && (
          <div style={{ position: 'relative' }} ref={adminDropdownRef}>
            <button
              onClick={() => setShowAdminDropdown(!showAdminDropdown)}
              style={{
                display: 'flex',
                alignItems: 'center',
                color: 'white',
                backgroundColor: 'transparent',
                border: 'none',
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              <span>Admin</span>
              <ChevronDownIcon style={{ marginLeft: '4px', width: '16px', height: '16px' }} />
            </button>

            {showAdminDropdown && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: '100%',
                marginTop: '8px',
                width: '256px',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                border: '1px solid #e5e7eb',
                zIndex: 999999,
                padding: '8px 0'
              }}>
                <Link
                  to="/super-admin"
                  onClick={() => setShowAdminDropdown(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 16px',
                    color: '#374151',
                    textDecoration: 'none',
                    fontSize: '14px'
                  }}
                >
                  <Cog6ToothIcon style={{ marginRight: '12px', width: '16px', height: '16px' }} />
                  Super Admin
                </Link>
                <Link
                  to="/company-admin"
                  onClick={() => setShowAdminDropdown(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 16px',
                    color: '#374151',
                    textDecoration: 'none',
                    fontSize: '14px'
                  }}
                >
                  <BuildingLibraryIcon style={{ marginRight: '12px', width: '16px', height: '16px' }} />
                  Company Admin
                </Link>
                <Link
                  to="/creator-portal"
                  onClick={() => setShowAdminDropdown(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 16px',
                    color: '#374151',
                    textDecoration: 'none',
                    fontSize: '14px'
                  }}
                >
                  <SparklesIcon style={{ marginRight: '12px', width: '16px', height: '16px' }} />
                  Creator Portal
                </Link>
              </div>
            )}
          </div>
        )}

        {/* User Profile Section */}
        {currentUser && userProfile ? (
          <div style={{ position: 'relative' }} ref={userDropdownRef}>
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              style={{
                display: 'flex',
                alignItems: 'center',
                color: 'white',
                backgroundColor: 'transparent',
                border: 'none',
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '8px'
              }}>
                <UserIcon style={{ width: '20px', height: '20px' }} />
              </div>
              <span>{userProfile.displayName || currentUser.email?.split('@')[0] || 'User'}</span>
              <ChevronDownIcon style={{ marginLeft: '4px', width: '16px', height: '16px' }} />
            </button>

            {showUserDropdown && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: '100%',
                marginTop: '8px',
                width: '192px',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                border: '1px solid #e5e7eb',
                zIndex: 999999,
                padding: '8px 0'
              }}>
                <div style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  color: '#6b7280',
                  borderBottom: '1px solid #f3f4f6'
                }}>
                  Signed in as <span style={{ fontWeight: '500', color: '#111827' }}>{currentUser.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 16px',
                    fontSize: '14px',
                    color: '#374151',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <ArrowRightOnRectangleIcon style={{ marginRight: '12px', width: '16px', height: '16px' }} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            style={{
              color: 'white',
              textDecoration: 'none',
              padding: '8px 16px',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            Sign In
          </Link>
        )}
      </div>

      {/* Mobile menu button */}
      <div style={{ display: 'none' }}>
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          style={{
            color: 'white',
            backgroundColor: 'transparent',
            border: 'none',
            padding: '8px',
            cursor: 'pointer'
          }}
        >
          {showMobileMenu ? (
            <XMarkIcon style={{ width: '24px', height: '24px' }} />
          ) : (
            <Bars3Icon style={{ width: '24px', height: '24px' }} />
          )}
        </button>
      </div>
    </div>
  );
}