'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import styles from './page.module.css';

export default function Login() {
  const router = useRouter();
  const { login, googleLogin, error: authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      router.push('/');
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    try {
      await googleLogin();
      router.push('/');
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError(error.message || 'Failed to sign in with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.logo}>
        <svg viewBox="0 0 24 24" width="64" height="64">
          <path
            fill="#FFB800"
            d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
          />
        </svg>
        <span>
    <span style={{ color: '#F7931E', fontWeight: 'bold', fontSize: '2.2em' }}>AcadXL</span>
    <span style={{ marginLeft: 6, letterSpacing: 1 , fontSize: '2.2em' }}>ScholarQuest</span>
  </span>
      </div>

      <h2 className={styles.title}>Login</h2>

      {(error || authError) && (
        <div className={styles.error}>
          {error || authError}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div className={styles.inputGroup}>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
          <button
            type="button"
            className={styles.togglePassword}
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          >
            {showPassword ? '👁️' : '🔑'}
          </button>
        </div>

        <Link href="/forgot-password" className={styles.forgotPassword}>
          Forgot password?
        </Link>

       <button 
  type="submit" 
  className={styles.loginButton}
  disabled={isLoading}
>
  {isLoading ? 'Logging in...' : 'LOGIN'}
</button>

        <div className={styles.divider}>
          <span>OR</span>
        </div>

        <button
          type="button"
          className={styles.googleButton}
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          <img src="/google-icon.svg" alt="Google" width="24" height="24" />
          {isLoading ? 'Signing in...' : 'Sign in with Google'}
        </button>

        <p className={styles.signupPrompt}>
          Don't have an account?{' '}
          <Link href="/signup" className={styles.signupLink}>
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
} 