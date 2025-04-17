'use client';

import { useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { saveQuizAttempt } from '../models/QuizAttempt';
import { useRouter } from 'next/navigation';
import TestSecurityWrapper from './TestSecurityWrapper';
import styles from './QuizClient.module.css';

export default function QuizClient({ questions, quizType }) {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeSpent, setTimeSpent] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [markedQuestions, setMarkedQuestions] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Debug log questions on mount
  useEffect(() => {
    console.log('Questions received:', questions);
  }, [questions]);

  // Timer effect
  useEffect(() => {
    if (!quizCompleted) {
      const timer = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [quizCompleted]);

  // Format time for display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionIndex, selectedOption) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: {
        selectedOption,
        isCorrect: selectedOption === questions[questionIndex].correctAnswer
      }
    }));
  };

  const handleQuestionClick = (index) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  const toggleMarkQuestion = () => {
    setMarkedQuestions(prev => {
      const newMarked = new Set(prev);
      if (newMarked.has(currentQuestionIndex)) {
        newMarked.delete(currentQuestionIndex);
      } else {
        newMarked.add(currentQuestionIndex);
      }
      return newMarked;
    });
  };

  // Calculate completion percentage
  const calculateProgress = () => {
    const answeredCount = Object.keys(answers).length;
    return Math.round((answeredCount / questions.length) * 100);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const user = auth.currentUser;
      if (!user) {
        throw new Error('Please log in to submit your quiz');
      }

      // Calculate score
      const totalCorrect = Object.values(answers).filter(a => a.isCorrect).length;

      // Prepare quiz data
      const quizData = {
        quizType,
        score: totalCorrect,
        totalQuestions: questions.length,
        timeSpent,
        answers: Object.entries(answers).map(([index, data]) => ({
          selectedOption: data.selectedOption,
          isCorrect: data.isCorrect
        }))
      };

      // Save attempt
      await saveQuizAttempt(user.uid, quizData);
      
      setScore(totalCorrect);
      setQuizCompleted(true);
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError(err.message || 'Failed to save quiz attempt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewReports = () => {
    console.log('Navigating to reports page...');
    try {
      router.push('/reports');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  if (error) {
    return (
      <div className="p-4 bg-[#1C1B3A] text-red-400 rounded-md border border-red-500">
        <p className="font-bold mb-2">Error Submitting Quiz</p>
        <p>{error}</p>
        <button
          onClick={() => setError(null)}
          className="mt-4 px-4 py-2 bg-[#FF8303] text-white rounded hover:bg-[#FF9124]"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (quizCompleted) {
    const scorePercentage = ((score / questions.length) * 100).toFixed(1);
    return (
      <TestSecurityWrapper>
        <div className={styles.container}>
          <div className={styles.completionCard}>
            <h2 className={styles.completionTitle}>Quiz Complete!</h2>
            <div className={styles.scoreContainer}>
              <div className={styles.scoreLabel}>Your Score</div>
              <div className={styles.scoreValue}>{scorePercentage}%</div>
            </div>
            <div className={styles.buttonContainer}>
              <button
                onClick={handleViewReports}
                className={`${styles.completionButton} ${styles.viewReports}`}
              >
                View Reports
              </button>
              <button
                onClick={() => router.push('/quiz/select')}
                className={`${styles.completionButton} ${styles.takeAnother}`}
              >
                Take Another Quiz
              </button>
            </div>
          </div>
        </div>
      </TestSecurityWrapper>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <TestSecurityWrapper>
      <div className={styles.container}>
        <div className={styles.mainContent}>
          <div className={styles.header}>
            <h1 className={styles.title}>{quizType.toUpperCase()} Quiz</h1>
            <div className={styles.timer}>Time: {formatTime(timeSpent)}</div>
          </div>

          <div className={styles.quizCard}>
            <div className={styles.progressBar}>
              <div className={styles.progressText}>
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
              <div className={styles.progressBarOuter}>
                <div 
                  className={styles.progressBarInner} 
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className={styles.progressPercentage}>
                {progress.toFixed(0)}% Complete
              </div>
            </div>

            <div className={styles.questionSection}>
              <div className={styles.questionText}>{currentQuestion.question}</div>
              <div className={styles.options}>
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    className={`${styles.optionButton} ${
                      answers[currentQuestionIndex]?.selectedOption === option ? styles.selected : ''
                    }`}
                    onClick={() => handleAnswer(currentQuestionIndex, option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.navigation}>
              <button
                className={styles.navButton}
                onClick={() => handleQuestionClick(currentQuestionIndex - 1)}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </button>
              <button
                className={styles.navButton}
                onClick={toggleMarkQuestion}
              >
                {markedQuestions.has(currentQuestionIndex) ? 'Unmark' : 'Mark for Review'}
              </button>
              {currentQuestionIndex === questions.length - 1 ? (
                <button
                  className={`${styles.navButton} ${styles.nextButton}`}
                  onClick={handleSubmit}
                >
                  Submit Quiz
                </button>
              ) : (
                <button
                  className={`${styles.navButton} ${styles.nextButton}`}
                  onClick={() => handleQuestionClick(currentQuestionIndex + 1)}
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>

        <div className={styles.questionTracker}>
          <div className={styles.trackerTitle}>Question Navigator</div>
          <div className={styles.questionGrid}>
            {questions.map((_, index) => (
              <button
                key={index}
                className={`${styles.questionNumber} ${
                  index === currentQuestionIndex ? styles.current : ''
                } ${
                  answers[index] ? styles.answered : ''
                } ${
                  markedQuestions.has(index) ? styles.marked : ''
                }`}
                onClick={() => handleQuestionClick(index)}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <div className={styles.trackerLegend}>
            <div className={styles.legendItem}>
              <div className={styles.legendDot} style={{ background: 'white' }} />
              Current Question
            </div>
            <div className={styles.legendItem}>
              <div className={styles.legendDot} style={{ background: 'rgba(255, 255, 255, 0.2)' }} />
              Answered
            </div>
            <div className={styles.legendItem}>
              <div className={styles.legendDot} style={{ borderColor: 'rgba(255, 255, 255, 0.5)', border: '2px solid' }} />
              Marked for Review
            </div>
          </div>
        </div>
      </div>
    </TestSecurityWrapper>
  );
} 