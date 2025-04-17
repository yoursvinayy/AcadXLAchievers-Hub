'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { FaFlask, FaLaptopCode, FaBook, FaGraduationCap } from 'react-icons/fa';
import { CardSpotlight } from '../../components/CardSpotlight';

export default function QuizSelect() {
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const router = useRouter();

  const quizTypes = [
    { id: 'neet', title: 'NEET', icon: FaFlask, description: 'Medical entrance exam preparation' },
    { id: 'jee', title: 'JEE', icon: FaLaptopCode, description: 'Engineering entrance exam preparation' },
    { id: '10th', title: '10th', icon: FaBook, description: 'Class 10 board exam preparation' },
    { id: '11th', title: '11th', icon: FaGraduationCap, description: 'Class 11 exam preparation' },
  ];

  const handleSelect = (quizId) => {
    setSelectedQuiz(quizId);
    router.push(`/quiz/${quizId}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Start Your Scholarship Journey</h1>
        <p className={styles.subtitle}>Select a quiz to unlock scholarship opportunities.</p>
      </div>
      
      <div className={styles.grid}>
        {quizTypes.map((quiz) => {
          const Icon = quiz.icon;
          return (
            <CardSpotlight
              key={quiz.id}
              className={styles.card}
              onClick={() => handleSelect(quiz.id)}
            >
              <div className={styles.cardContent}>
                <div className={styles.iconWrapper}>
                  <Icon size={32} />
                </div>
                <h2 className={styles.cardTitle}>{quiz.title}</h2>
                <p className={styles.cardDescription}>{quiz.description}</p>
              </div>
            </CardSpotlight>
          );
        })}
      </div>
      
      <div className={styles.footer}>
        Select your preferred quiz type to begin
      </div>
    </div>
  );
} 