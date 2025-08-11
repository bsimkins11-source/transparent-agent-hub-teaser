import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const { currentUser } = useAuth();

  console.log('🚨🚨🚨 THIS IS THE NEW HEADER COMPONENT! 🚨🚨🚨');
  console.log('🚨🚨🚨 IF YOU SEE THIS, THE NEW CODE IS RUNNING! 🚨🚨🚨');

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '64px',
      backgroundColor: '#FF0000', // BRIGHT RED - IMPOSSIBLE TO MISS
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      border: '10px solid yellow' // HUGE YELLOW BORDER
    }}>
      {/* Logo */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px'
      }}>
        <img 
          src="/transparent-partners-logo-white.png" 
          alt="Logo" 
          style={{ 
            height: '40px',
            width: '40px',
            objectFit: 'contain'
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

      {/* Sign In Button */}
      {!currentUser && (
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
  );
}