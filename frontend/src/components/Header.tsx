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
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
          <div 
            onClick={() => {
              console.log('Logo clicked - navigating to home page');
              // Force navigation to home page
              window.location.href = '/';
            }}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              padding: '8px 0',
              minHeight: '64px',
              zIndex: 10,
              position: 'relative'
            }}
            title="Click to go to Home Page"
          >
            <img 
              src="/transparent-partners-logo-white.png" 
              alt="Transparent Partners Logo" 
              style={{ 
                height: '60px',
                maxWidth: '250px',
                objectFit: 'contain',
                display: 'block',
                pointerEvents: 'none' // Ensure clicks go to the Link, not the image
              }} 
            />
          </div>

          {/* Navigation - Simplified without dropdowns */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            {currentUser && userProfile && (
              <>
                {/* Direct navigation links instead of dropdowns */}
                <Link
                  to="/agents"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'white',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    padding: '0.5rem',
                    borderRadius: '0.375rem',
                    backgroundColor: location.pathname === '/agents' ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = location.pathname === '/agents' ? 'rgba(255, 255, 255, 0.1)' : 'transparent';
                  }}
                >
                  <BookOpenIcon style={{ width: '1rem', height: '1rem', color: 'white' }} />
                  <span>All Agents</span>
                </Link>
                
                <Link
                  to="/my-agents"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'white',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    padding: '0.5rem',
                    borderRadius: '0.375rem',
                    backgroundColor: location.pathname === '/my-agents' ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = location.pathname === '/my-agents' ? 'rgba(255, 255, 255, 0.1)' : 'transparent';
                  }}
                >
                  <UserIcon style={{ width: '1rem', height: '1rem', color: 'white' }} />
                  <span>My Library</span>
                </Link>
                
                {/* Company link if user has organization */}
                {userProfile.organizationId !== 'pending-assignment' && userProfile.organizationId !== 'unassigned' && (
                  <Link
                    to={`/company/${userProfile.organizationId}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: 'white',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      padding: '0.5rem',
                      borderRadius: '0.375rem',
                      backgroundColor: location.pathname.startsWith('/company/') ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = location.pathname.startsWith('/company/') ? 'rgba(255, 255, 255, 0.1)' : 'transparent';
                    }}
                  >
                    <BuildingOfficeIcon style={{ width: '1rem', height: '1rem', color: 'white' }} />
                    <span>{userProfile.organizationName || 'Company'}</span>
                  </Link>
                )}
                
                {/* Creator links */}
                {userProfile.role === 'creator' && (
                  <>
                    <Link
                      to="/creator-dashboard"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'white',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        padding: '0.5rem',
                        borderRadius: '0.375rem',
                        backgroundColor: location.pathname === '/creator-dashboard' ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = location.pathname === '/creator-dashboard' ? 'rgba(255, 255, 255, 0.1)' : 'transparent';
                      }}
                    >
                      <span style={{ fontSize: '1rem' }}>📊</span>
                      <span>Creator Dashboard</span>
                    </Link>
                    
                    <Link
                      to="/agent-submission"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'white',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        padding: '0.5rem',
                        borderRadius: '0.375rem',
                        backgroundColor: location.pathname === '/agent-submission' ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = location.pathname === '/agent-submission' ? 'rgba(255, 255, 255, 0.1)' : 'transparent';
                      }}
                    >
                      <span style={{ fontSize: '1rem' }}>➕</span>
                      <span>Submit Agent</span>
                    </Link>
                  </>
                )}
                
                {/* Admin links */}
                {(userProfile.role === 'super_admin' || userProfile.role === 'company_admin' || userProfile.role === 'network_admin') && (
                  <>
                    {userProfile.role === 'super_admin' && (
                      <>
                        <Link
                          to="/super-admin"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: 'white',
                            textDecoration: 'none',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            padding: '0.5rem',
                            borderRadius: '0.375rem',
                            backgroundColor: location.pathname === '/super-admin' ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = location.pathname === '/super-admin' ? 'rgba(255, 255, 255, 0.1)' : 'transparent';
                          }}
                        >
                          <span style={{ fontSize: '1rem' }}>👑</span>
                          <span>Super Admin</span>
                        </Link>
                        
                        <Link
                          to="/creator-portal"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: 'white',
                            textDecoration: 'none',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            padding: '0.5rem',
                            borderRadius: '0.375rem',
                            backgroundColor: location.pathname === '/creator-portal' ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = location.pathname === '/creator-portal' ? 'rgba(255, 255, 255, 0.1)' : 'transparent';
                          }}
                        >
                          <span style={{ fontSize: '1rem' }}>🚀</span>
                          <span>Creator Portal</span>
                        </Link>
                      </>
                    )}
                    
                    {(userProfile.role === 'super_admin' || userProfile.role === 'company_admin') && 
                     userProfile.organizationId !== 'pending-assignment' && userProfile.organizationId !== 'unassigned' && (
                      <Link
                        to="/admin"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          color: 'white',
                          textDecoration: 'none',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          padding: '0.5rem',
                          borderRadius: '0.375rem',
                          backgroundColor: location.pathname === '/admin' ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = location.pathname === '/admin' ? 'rgba(255, 255, 255, 0.1)' : 'transparent';
                        }}
                      >
                        <BuildingOfficeIcon style={{ width: '1rem', height: '1rem', color: 'white' }} />
                        <span>Company Admin</span>
                      </Link>
                    )}
                  </>
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