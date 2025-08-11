import React from 'react';

export default function Header() {
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
      <div style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
        🚀 Transparent Partners
      </div>
      <button style={{
        backgroundColor: 'white',
        color: '#043C46',
        padding: '8px 16px',
        borderRadius: '6px',
        border: 'none',
        fontWeight: '500'
      }}>
        Sign In
      </button>
    </div>
  );
}