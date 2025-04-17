import { db } from '../config/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

export async function saveQuizAttempt(userId, quizData) {
  try {
    // Basic validation
    if (!userId || !quizData) {
      throw new Error('Missing required data');
    }

    // Create a simplified attempt object
    const attempt = {
      userId,
      quizType: quizData.quizType.toLowerCase(),
      score: quizData.score,
      totalQuestions: quizData.totalQuestions,
      timeSpent: quizData.timeSpent || 0,
      timestamp: Date.now(),
      answers: quizData.answers.map(answer => ({
        selectedOption: answer.selectedOption,
        isCorrect: answer.isCorrect
      }))
    };

    // Save to Firestore
    const quizAttemptsRef = collection(db, 'quizAttempts');
    const docRef = await addDoc(quizAttemptsRef, attempt);
    console.log('Successfully saved quiz attempt:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving quiz attempt:', error);
    throw error;
  }
}

export async function getUserAttempts(userId, limitCount = 10) {
  try {
    console.log('Fetching user attempts for userId:', userId);
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    const attemptsRef = collection(db, 'quizAttempts');
    
    // First try with the indexed query
    try {
      const q = query(
        attemptsRef,
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (indexError) {
      if (indexError.code === 'failed-precondition') {
        // If index doesn't exist, fall back to basic query
        console.warn('Index not found, falling back to basic query');
        const basicQuery = query(
          attemptsRef,
          where('userId', '==', userId),
          limit(limitCount)
        );
        const basicSnapshot = await getDocs(basicQuery);
        const attempts = basicSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        // Sort in memory as fallback
        return attempts.sort((a, b) => b.timestamp - a.timestamp);
      }
      throw indexError;
    }
  } catch (error) {
    console.error('Error in getUserAttempts:', error);
    throw error;
  }
}

export async function getUserStats(userId) {
  try {
    console.log('Calculating user stats for userId:', userId);
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    const attemptsRef = collection(db, 'quizAttempts');
    const q = query(
      attemptsRef,
      where('userId', '==', userId)
    );

    console.log('Executing stats query...');
    const querySnapshot = await getDocs(q);
    console.log('Stats query completed. Found documents:', querySnapshot.size);

    const attempts = querySnapshot.docs.map(doc => doc.data());

    if (attempts.length === 0) {
      console.log('No attempts found for user');
      return {
        totalAttempts: 0,
        averageScore: 0,
        highestScore: 0,
        totalTime: 0,
        jee: { attempts: 0, averageScore: 0, highestScore: 0 },
        neet: { attempts: 0, averageScore: 0, highestScore: 0 }
      };
    }

    // Calculate overall statistics
    const totalAttempts = attempts.length;
    const totalTime = attempts.reduce((sum, attempt) => sum + (attempt.timeSpent || 0), 0);
    
    const scores = attempts.map(attempt => (attempt.score / attempt.totalQuestions) * 100);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / totalAttempts;
    const highestScore = Math.max(...scores);

    // Calculate exam-specific statistics
    const examStats = {
      jee: { attempts: 0, scores: [], highestScore: 0 },
      neet: { attempts: 0, scores: [], highestScore: 0 }
    };

    attempts.forEach(attempt => {
      const type = attempt.quizType.toLowerCase();
      if (type === 'jee' || type === 'neet') {
        examStats[type].attempts++;
        const score = (attempt.score / attempt.totalQuestions) * 100;
        examStats[type].scores.push(score);
        examStats[type].highestScore = Math.max(examStats[type].highestScore, score);
      }
    });

    // Calculate averages for each exam type
    ['jee', 'neet'].forEach(type => {
      if (examStats[type].attempts > 0) {
        examStats[type].averageScore = 
          examStats[type].scores.reduce((sum, score) => sum + score, 0) / examStats[type].attempts;
      } else {
        examStats[type].averageScore = 0;
      }
      delete examStats[type].scores;
    });

    const stats = {
      totalAttempts,
      averageScore,
      highestScore,
      totalTime,
      jee: examStats.jee,
      neet: examStats.neet
    };

    console.log('Successfully calculated user stats:', stats);
    return stats;
  } catch (error) {
    console.error('Error in getUserStats:', error);
    if (error.code === 'permission-denied') {
      throw new Error('Permission denied. Please check if you are properly logged in.');
    }
    throw error;
  }
} 