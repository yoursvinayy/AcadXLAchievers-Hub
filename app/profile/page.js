'use client';

import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { isAdmin } from '../models/UserRole';
import Link from 'next/link';
import styles from './page.module.css';
import AdminSetup from '../components/AdminSetup';

export default function Profile() {
  const { user, logout } = useAuth();
  const [isAdminUser, setIsAdminUser] = useState(false);

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
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.profile}>
        <div className={styles.profileHeader}>
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profile" className={styles.avatar} />
          ) : (
            <div className={styles.avatarPlaceholder}>
              {user?.email?.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className={styles.name}>{user?.displayName || 'User'}</h1>
          <p className={styles.email}>{user?.email}</p>
          
          <div className={styles.points}>
            <span>1,250 points</span>
          </div>
        </div>

        <div className={styles.menu}>
          {isAdminUser && (
            <Link href="/admin" className={styles.menuItem}>
              <span className={styles.icon}>📊</span>
              <span>Dashboard</span>
              <span className={styles.arrow}>›</span>
            </Link>
          )}
          <Link href="/profile" className={styles.menuItem}>
            <span className={styles.icon}>👤</span>
            <span>Account</span>
            <span className={styles.arrow}>›</span>
          </Link>

          <Link href="/rewards" className={styles.menuItem}>
            <span className={styles.icon}>🏆</span>
            <span>Rewards</span>
            <span className={styles.arrow}>›</span>
          </Link>

          <Link href="/leaderboard" className={styles.menuItem}>
            <span className={styles.icon}>📊</span>
            <span>Leaderboard</span>
            <span className={styles.arrow}>›</span>
          </Link>

          <Link href="/settings" className={styles.menuItem}>
            <span className={styles.icon}>⚙️</span>
            <span>Settings</span>
            <span className={styles.arrow}>›</span>
          </Link>
        </div>

        <button onClick={handleLogout} className={styles.logoutButton}>
          Log out
        </button>
      </div>
      <AdminSetup />
    </div>
  );
} 