import React from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  console.log('Header component rendering...');
  
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
            // Enhanced styling for better visibility
            backgroundColor: 'white',
            padding: '6px',
            borderRadius: '6px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.2)'
          }} 
          onError={(e) => {
            console.error('Logo failed to load:', e);
            // Fallback to text if image fails
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
    </div>
  );
}