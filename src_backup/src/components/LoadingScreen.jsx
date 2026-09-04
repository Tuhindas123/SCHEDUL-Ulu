import React from 'react';
import logoImg from './620cfe84-e13e-42a2-8f15-72d6c68f0e53.png';

export default function LoadingScreen() {
  return (
    <div style={styles.container}>
      <div style={styles.logoContainer}>
        <img 
          src={logoImg} 
          alt="App Logo" 
          style={styles.logo} 
        />
      </div>

      <div style={styles.footer}>
        <span style={styles.fromText}>from</span>
        <span style={styles.brandText}>SMART SCHEDULER</span>
      </div>

      <style>{`
        @keyframes logoPulse {
          0% { transform: scale(0.98); opacity: 0.85; }
          50% { transform: scale(1.02); opacity: 1; }
          100% { transform: scale(0.98); opacity: 0.85; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100vh',
    width: '100vw',
    backgroundColor: '#ffffff',
    padding: '40px 0',
    boxSizing: 'border-box',
  },
  logoContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: '110px',
    height: '110px',
    objectFit: 'contain',
    animation: 'logoPulse 2s ease-in-out infinite',
  },
  footer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },
  fromText: {
    fontSize: '0.75rem',
    color: '#8e8e8e',
    textTransform: 'lowercase',
  },
  brandText: {
    fontSize: '0.85rem',
    fontWeight: '600',
    letterSpacing: '1.5px',
    color: '#000000',
  },
};