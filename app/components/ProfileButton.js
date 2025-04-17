'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { isAdmin } from '../models/UserRole';
import styles from './ProfileButton.module.css';

export default function ProfileButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        const adminStatus = await isAdmin(user.uid);
        setIsAdminUser(adminStatus);
      }
    };
    checkAdminStatus();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const DefaultProfileIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 20C6 16.6863 8.68629 14 12 14C15.3137 14 18 16.6863 18 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const AccountIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
      <rect x="4" y="14" width="16" height="8" rx="2" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );

  const LogoutIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const DashboardIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
      <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
      <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
      <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );

  return (
    <div className={styles.profileContainer}>
      <button 
        className={styles.profileButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Profile menu"
      >
        {user?.photoURL && !imageError ? (
          <img 
            src={user.photoURL} 
            alt="Profile" 
            className={styles.profileImage}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className={styles.profileInitial}>
            {user?.email ? (
              user.email.charAt(0).toUpperCase()
            ) : (
              <DefaultProfileIcon />
            )}
          </div>
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.userInfo}>
            {user?.photoURL && !imageError && (
              <img 
                src={user.photoURL} 
                alt="Profile" 
                className={styles.profileImage}
                style={{ width: '48px', height: '48px', marginBottom: '0.5rem' }}
                onError={() => setImageError(true)}
              />
            )}
            <p className={styles.email}>{user?.email}</p>
          </div>
          <div className={styles.menuItems}>
          {isAdminUser && (
    <>
      <button onClick={() => router.push('/admin')} className={styles.menuItem}>
        <span className={styles.icon}><DashboardIcon /></span>
        Dashboard
      </button>
      <button onClick={() => router.push('/questions')} className={styles.menuItem}>
        <span className={styles.icon}>➕</span>
        Add Question
      </button>
    </>
  )}
            <button onClick={() => router.push('/profile')} className={styles.menuItem}>
              <span className={styles.icon}><AccountIcon /></span>
              Account
            </button>
            <button onClick={() => router.push('/rewards')} className={styles.menuItem}>
              <span className={styles.icon}>🏆</span>
              Rewards
            </button>
            <button onClick={() => router.push('/leaderboard')} className={styles.menuItem}>
              <span className={styles.icon}>📊</span>
              Leaderboard
            </button>
            <button onClick={() => router.push('/settings')} className={styles.menuItem}>
              <span className={styles.icon}>⚙️</span>
              Settings
            </button>
            <button onClick={handleLogout} className={styles.menuItem}>
              <span className={styles.icon}><LogoutIcon /></span>
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 