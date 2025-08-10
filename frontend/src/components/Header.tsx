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
  XMarkIcon
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

  // Simple header with inline styles only
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      background: 'linear-gradient(90deg, #043C46 0%, #043C46 66%, #0F5F6B 100%)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          height: '64px' 
        }}>
          
          {/* Logo/Brand - Top Left */}
          <Link to="/" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            textDecoration: 'none',
            color: 'white',
            marginLeft: '0',
            flexShrink: 0,
            padding: '8px 0',
            minHeight: '64px'
          }}>
            <img 
              src="/transparent-partners-logo-white.png" 
              alt="Transparent Partners Logo" 
              style={{ 
                height: '60px',
                maxWidth: '250px',
                objectFit: 'contain',
                display: 'block'
              }} 
            />
          </Link>

          {/* Navigation */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            {currentUser && userProfile && (
              <>
                {/* Libraries Dropdown */}
                <div style={{ position: 'relative' }} ref={librariesDropdownRef}>
                  <button
                    onClick={() => setIsLibrariesDropdownOpen(!isLibrariesDropdownOpen)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: 'transparent',
                      border: 'none',
                      color: 'white',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      padding: '0.5rem',
                      borderRadius: '0.375rem'
                    }}
                    onMouseEnter={() => setIsLibrariesDropdownOpen(true)}
                  >
                    <BookOpenIcon style={{ width: '1rem', height: '1rem', color: 'white' }} />
                    <span>Libraries</span>
                    <ChevronDownIcon style={{ width: '1rem', height: '1rem', color: 'white' }} />
                  </button>
                  
                  {isLibrariesDropdownOpen && (
                    <div 
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        marginTop: '0.5rem',
                        width: '14rem',
                        background: '#1f2937',
                        border: '1px solid #4b5563',
                        borderRadius: '0.375rem',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        zIndex: 50,
                        padding: '0.25rem'
                      }}
                      onMouseLeave={() => setIsLibrariesDropdownOpen(false)}
                    >
                      <Link
                        to="/agents"
                        onClick={() => setIsLibrariesDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem',
                          color: 'white',
                          textDecoration: 'none',
                          fontSize: '0.875rem',
                          borderRadius: '0.25rem',
                          backgroundColor: location.pathname === '/agents' ? '#2563eb' : 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#374151';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = location.pathname === '/agents' ? '#2563eb' : 'transparent';
                        }}
                      >
                        <BookOpenIcon style={{ width: '1rem', height: '1rem', color: '#d1d5db' }} />
                        <span>All Agents</span>
                      </Link>
                      
                      {userProfile.organizationId !== 'pending-assignment' && userProfile.organizationId !== 'unassigned' && (
                        <Link
                          to={`/company/${userProfile.organizationId}`}
                          onClick={() => setIsLibrariesDropdownOpen(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem',
                            color: 'white',
                            textDecoration: 'none',
                            fontSize: '0.875rem',
                            borderRadius: '0.25rem',
                            backgroundColor: location.pathname.startsWith('/company/') ? '#2563eb' : 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#374151';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = location.pathname.startsWith('/company/') ? '#2563eb' : 'transparent';
                          }}
                        >
                          <BuildingOfficeIcon style={{ width: '1rem', height: '1rem', color: '#d1d5db' }} />
                          <span>{userProfile.organizationName || 'Company'}</span>
                        </Link>
                      )}
                      
                      <Link
                        to="/my-agents"
                        onClick={() => setIsLibrariesDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem',
                          color: 'white',
                          textDecoration: 'none',
                          fontSize: '0.875rem',
                          borderRadius: '0.25rem',
                          backgroundColor: location.pathname === '/my-agents' ? '#2563eb' : 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#374151';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = location.pathname === '/my-agents' ? '#2563eb' : 'transparent';
                        }}
                      >
                        <UserIcon style={{ width: '1rem', height: '1rem', color: '#d1d5db' }} />
                        <span>My Library</span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Admin Dropdown */}
                {(userProfile.role === 'super_admin' || userProfile.role === 'company_admin' || userProfile.role === 'network_admin') && (
                  <div style={{ position: 'relative' }} ref={adminDropdownRef}>
                    <button
                      onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        background: 'transparent',
                        border: 'none',
                        color: 'white',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        borderRadius: '0.375rem'
                      }}
                      onMouseEnter={() => setIsAdminDropdownOpen(true)}
                    >
                      <CogIcon style={{ width: '1rem', height: '1rem', color: 'white' }} />
                      <span>Admin</span>
                      <ChevronDownIcon style={{ width: '1rem', height: '1rem', color: 'white' }} />
                    </button>
                    
                    {isAdminDropdownOpen && (
                      <div 
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          marginTop: '0.5rem',
                          width: '13rem',
                          background: '#1f2937',
                          border: '1px solid #4b5563',
                          borderRadius: '0.375rem',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                          zIndex: 50,
                          padding: '0.25rem'
                        }}
                        onMouseLeave={() => setIsAdminDropdownOpen(false)}
                      >
                        {userProfile.role === 'super_admin' && (
                          <Link
                            to="/super-admin"
                            onClick={() => setIsAdminDropdownOpen(false)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              padding: '0.5rem',
                              color: 'white',
                              textDecoration: 'none',
                              fontSize: '0.875rem',
                              borderRadius: '0.25rem',
                              backgroundColor: location.pathname === '/super-admin' ? '#2563eb' : 'transparent'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#374151';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = location.pathname === '/super-admin' ? '#2563eb' : 'transparent';
                            }}
                          >
                            <span style={{ fontSize: '1rem' }}>👑</span>
                            <div>
                              <div style={{ fontWeight: '500' }}>Super Admin</div>
                              <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Global management</div>
                            </div>
                          </Link>
                        )}
                        
                        {(userProfile.role === 'super_admin' || userProfile.role === 'company_admin') && 
                         userProfile.organizationId !== 'pending-assignment' && userProfile.organizationId !== 'unassigned' && (
                          <Link
                            to="/admin"
                            onClick={() => setIsAdminDropdownOpen(false)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              padding: '0.5rem',
                              color: 'white',
                              textDecoration: 'none',
                              fontSize: '0.875rem',
                              borderRadius: '0.25rem',
                              backgroundColor: location.pathname === '/admin' ? '#2563eb' : 'transparent'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#374151';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = location.pathname === '/admin' ? '#2563eb' : 'transparent';
                            }}
                          >
                            <BuildingOfficeIcon style={{ width: '1rem', height: '1rem', color: '#9ca3af' }} />
                            <div>
                              <div style={{ fontWeight: '500' }}>Company Admin</div>
                              <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{userProfile.organizationName}</div>
                            </div>
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </nav>

          {/* User Menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'white' }}>
            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'white' }}>
                  <UserIcon style={{ width: '1rem', height: '1rem', color: 'white' }} />
                  <span>{currentUser.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    borderRadius: '0.375rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  <ArrowRightOnRectangleIcon style={{ width: '1rem', height: '1rem', color: 'white' }} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link 
                to="/login"
                style={{
                  background: 'transparent',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div style={{ display: 'none' }}>
            {currentUser && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                style={{
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  color: 'white',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon style={{ height: '1.5rem', width: '1.5rem', color: 'white' }} />
                ) : (
                  <Bars3Icon style={{ height: '1.5rem', width: '1.5rem', color: 'white' }} />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}