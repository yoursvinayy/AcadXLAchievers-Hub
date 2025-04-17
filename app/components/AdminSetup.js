'use client';

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { setupAdminUser } from '../models/UserRole';
import { db } from '../config/firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function AdminSetup() {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSetupAdmin = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setMessage('');

    if (!user?.uid) {
      setMessage('❌ Please log in first');
      setIsLoading(false);
      return;
    }

    try {
      // Use the regular db instance with security rules
      await setDoc(doc(db, 'users', user.uid), {
        role: 'admin',
        email: user.email,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setMessage('✅ Admin access granted! Please refresh the page.');
      // Force reload after 2 seconds
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      console.error('Admin setup error:', error);
      
      if (error.code === 'permission-denied') {
        setMessage('❌ Permission denied. Please make sure you are logged in.');
      } else {
        setMessage(`❌ Error: ${error.message || 'Failed to set up admin access'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '20px', 
      right: '20px', 
      background: '#1a1a1a', 
      padding: '15px', 
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
      zIndex: 1000
    }}>
      <button
        onClick={handleSetupAdmin}
        disabled={isLoading}
        style={{
          background: isLoading ? '#2a2a2a' : '#4a4a4a',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          minWidth: '180px',
          justifyContent: 'center'
        }}
      >
        {isLoading ? '⏳ Setting up...' : '🔑 Set Up Admin Access'}
      </button>
      {message && (
        <p style={{ 
          marginTop: '10px', 
          color: message.includes('✅') ? '#44ff44' : '#ff4444', 
          fontSize: '14px',
          textAlign: 'center',
          maxWidth: '250px',
          wordBreak: 'break-word'
        }}>
          {message}
        </p>
      )}
    </div>
  );
} 