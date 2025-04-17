import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Navigation.module.css';
import { FaTrophy } from 'react-icons/fa';
import ThemeToggle from './ThemeToggle';

const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.leftSection}>
        <Link href="/" className={styles.logo}>
          <FaTrophy className={styles.icon} />
          <span className={styles.logoText}>QUIZ BATTLE</span>
        </Link>
      </div>

      <div className={styles.centerSection}>
        <Link href="/about" className={styles.navLink}>
          About
        </Link>
        <Link href="/contact" className={styles.navLink}>
          Contact
        </Link>
      </div>

      <div className={styles.rightSection}>
        <ThemeToggle />
        <Link href="/login" className={styles.loginButton}>
          Login
        </Link>
      </div>
    </nav>
  );
};

export default Navigation; 