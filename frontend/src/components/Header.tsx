import React from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  console.log('🔥 NEW HEADER CREATED FROM SCRATCH! 🔥');

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '80px',
      backgroundColor: '#FF1493', // DEEP PINK
      zIndex: 999999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      border: '8px solid #00CED1', // DARK TURQUOISE
      fontSize: '28px',
      fontWeight: 'bold'
    }}>
      {/* Logo and Brand */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '15px'
      }}>
        <img 
          src="/transparent-partners-logo-white.png" 
          alt="Logo" 
          style={{ 
            height: '50px',
            width: '50px',
            objectFit: 'contain'
          }} 
        />
        <span style={{ 
          color: 'white', 
          fontSize: '28px', 
          fontWeight: 'bold',
          textShadow: '2px 2px 4px black'
        }}>
          🚀 NEW HEADER 🚀
        </span>
      </div>

      {/* Sign In Button */}
      <Link
        to="/login"
        style={{
          color: 'black',
          textDecoration: 'none',
          padding: '12px 24px',
          backgroundColor: '#FFD700', // GOLD
          border: '4px solid #000000',
          borderRadius: '8px',
          fontSize: '20px',
          fontWeight: 'bold'
        }}
      >
        🔑 SIGN IN 🔑
      </Link>
    </div>
  );
}
