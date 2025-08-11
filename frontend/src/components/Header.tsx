import React from 'react';

export default function Header() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '80px',
      backgroundColor: '#FF0000',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      zIndex: 999999,
      fontSize: '32px',
      fontWeight: 'bold',
      border: '5px solid #000000'
    }}>
      <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
        🔥 BRIGHT RED HEADER 🔥
      </div>
      <button style={{
        backgroundColor: 'yellow',
        color: 'black',
        border: '3px solid #000000',
        padding: '15px 30px',
        borderRadius: '10px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '24px'
      }}>
        🚨 SIGN IN 🚨
      </button>
    </div>
  );
}
