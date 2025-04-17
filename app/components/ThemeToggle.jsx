import { useState, useEffect } from 'react';
import styles from './ThemeToggle.module.css';
import { FiSun, FiMoon } from 'react-icons/fi';

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check if user has a theme preference in localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', !isDark ? 'dark' : 'light');
  };

  return (
    <div 
      className={`${styles.themeToggle} ${isDark ? styles.dark : ''}`}
      onClick={toggleTheme}
      role="button"
      aria-label="Toggle theme"
      tabIndex={0}
    >
      <div className={styles.toggleThumb}>
        {isDark ? (
          <FiMoon className={styles.icon} />
        ) : (
          <FiSun className={styles.icon} />
        )}
      </div>
    </div>
  );
};

export default ThemeToggle; 