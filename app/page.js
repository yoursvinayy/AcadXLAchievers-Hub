'use client';

import Link from 'next/link';
import { useAuth } from './context/AuthContext';
import ProfileButton from './components/ProfileButton';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  const handleStartBattle = () => {
    if (user) {
      router.push('/quiz/select');
    } else {
      router.push('/login');
    }
  };

  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
    
      <div className={styles.logo}>
  <svg className={styles.trophy} viewBox="0 0 24 24" width="32" height="32">
    <path fill="#F7931E" d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/>
  </svg>
  <span>
    <span style={{ color: '#F7931E', fontWeight: 'bold', fontSize: '1.2em' }}>AcadXL</span>
    <span style={{ marginLeft: 6, letterSpacing: 1 }}>Achievers Hub</span>
  </span>
</div>


        <div className={styles.menu}>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          {user ? (
            <ProfileButton />
          ) : (
            <Link href="/login" className={styles.loginBtn}>Login</Link>
          )}
        </div>
      </nav>

      <main className={styles.main}>
        <h1 className={styles.title}>
        EARN SCHOLARSHIPS.<br />
        ACHIEVE YOUR DREAMS.
        </h1>
        <p className={styles.subtitle}>
        Participate in quizzes, showcase your knowledge,<br />
        and win scholarships for your education!
        </p>
        <button className={styles.ctaButton} onClick={handleStartBattle}>
        APPLY FOR SCHOLARSHIP
    </button>
        <div className={styles.features}>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>
              <svg viewBox="0 0 24 24" width="40" height="40">
                <path fill="#F7931E" d="M20 18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/>
              </svg>
            </div>
            <h3>Get Recognized</h3>
            <p>Stand out with<br />your achievements</p>
          </div>

          <div className={styles.feature}>
            <div className={styles.featureIcon}>
              <svg viewBox="0 0 24 24" width="40" height="40">
                <path fill="#FFD700" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"/>
              </svg>
            </div>
            <h3>Compete</h3>
            <p>Join scholarship quizzes<br />and prove your skills</p>
          </div>

          <div className={styles.feature}>
            <div className={styles.featureIcon}>
              <svg viewBox="0 0 24 24" width="40" height="40">
                <path fill="#00BFA5" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
              </svg>
            </div>
            <h3>Win Scholarships</h3>
      <p>Secure financial support<br />for your studies</p>
          </div>
        </div>
      </main>
    </div>
  );
} 