'use client';

import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function ResultsPage() {
  const router = useRouter();

  // This would come from your state management or API
  const results = {
    status: 'lost', // or 'won'
    answered: 8,
    correct: 6,
    points: -5,
    bonusPoints: 20
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.result}>
          <div className={styles.emoji}>
            {results.status === 'won' ? '😊' : '☹️'}
          </div>
          <h1 className={styles.title}>
            YOU {results.status.toUpperCase()}
          </h1>
        </div>

        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>
              <span className={styles.dot} /> Answered
            </span>
            <span className={styles.statValue}>{results.answered}</span>
          </div>

          <div className={styles.statItem}>
            <span className={styles.statLabel}>
              <span className={styles.checkmark} /> Correct
            </span>
            <span className={styles.statValue}>{results.correct}</span>
          </div>

          <div className={styles.statItem}>
            <span className={styles.statLabel}>
              <span className={styles.minus} /> Points
            </span>
            <span className={styles.statValue}>
              {results.points > 0 ? '+' : ''}{results.points} Pts
            </span>
          </div>
        </div>

        {results.bonusPoints > 0 && (
          <div className={styles.bonus}>
            +{results.bonusPoints} points!
          </div>
        )}

        <div className={styles.actions}>
          <button 
            className={styles.newBattleButton}
            onClick={() => router.push('/quiz/select')}
          >
            NEW BATTLE
          </button>
          <button 
            className={styles.redeemButton}
            onClick={() => router.push('/redeem')}
          >
            REDEEM
          </button>
        </div>

        <div className={styles.navigation}>
          <button className={styles.navButton}>
            <span className={styles.navIcon}>📊</span>
            LEADERBOARD
          </button>
          <button className={`${styles.navButton} ${styles.active}`}>
            <span className={styles.navIcon}>⚔️</span>
            BATTLES
          </button>
          <button className={styles.navButton}>
            <span className={styles.navIcon}>🎁</span>
            REWARDS
          </button>
        </div>
      </div>
    </div>
  );
} 