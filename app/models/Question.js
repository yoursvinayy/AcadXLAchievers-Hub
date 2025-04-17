import { db, auth } from '../lib/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp, doc, limit } from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

// Initialize Firebase and ensure persistence is enabled
const initializeFirebase = async () => {
  try {
    // Check if user is already signed in
    if (auth.currentUser) {
      console.log('User already signed in:', auth.currentUser.uid);
      return auth.currentUser;
    }

    // Wait for auth state to be ready
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        unsubscribe(); // Stop listening immediately
        
        if (user) {
          console.log('User already authenticated:', user.uid);
          resolve(user);
        } else {
          try {
            console.log('No user found, attempting anonymous sign-in...');
            const userCredential = await signInAnonymously(auth);
            console.log('Anonymous sign-in successful:', userCredential.user.uid);
            resolve(userCredential.user);
          } catch (error) {
            console.error('Anonymous sign-in failed:', error);
            reject(error);
          }
        }
      });
    });
  } catch (error) {
    console.error('Authentication failed:', error);
    throw error;
  }
};

// Ensure Firebase is initialized before any operations
const ensureFirebase = async () => {
  try {
    const user = await initializeFirebase();
    if (!user) {
      throw new Error('Failed to initialize Firebase: No user available');
    }
    console.log('Firebase initialized with user:', user.uid);
    return true;
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    throw error;
  }
};

export const addQuestion = async (questionData) => {
  try {
    await ensureFirebase();
    
    let parsedQuestion;
    
    // Handle string input (legacy support)
    if (typeof questionData === 'string') {
      const lines = questionData.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      if (lines.length < 6) {
        throw new Error('Question data must have at least 6 lines (question, 4 options, and answer)');
      }

      // Find the question text (first line that doesn't start with A), B), C), D) or Answer:)
      const questionText = lines.find(line => !line.match(/^([A-D]\)|Answer:)/));
      
      // Find all options
      const options = [];
      let correctAnswer = '';
      
      lines.forEach(line => {
        // Match options in format "A) something" or "A. something" or "A. something" or just "A) something"
        const optionMatch = line.match(/^([A-D][\).:])\s*(.+)$/);
        if (optionMatch) {
          options.push(optionMatch[2].trim());
        }
        
        // Match answer in various formats
        const answerMatch = line.match(/^(Answer\s*[:.-]\s*|)([A-D])\)?$/i);
        if (answerMatch) {
          const answerLetter = answerMatch[2].toUpperCase();
          const answerIndex = answerLetter.charCodeAt(0) - 65; // Convert A,B,C,D to 0,1,2,3
          if (options[answerIndex]) {
            correctAnswer = options[answerIndex];
          }
        }
      });

      // If no answer was found in A,B,C,D format, use the last line as the exact answer
      if (!correctAnswer && lines.length >= 6) {
        correctAnswer = lines[lines.length - 1].replace(/^Answer\s*[:.-]\s*/i, '').trim();
      }

      parsedQuestion = {
        question: questionText,
        options,
        correctAnswer,
        explanation: lines[6] || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'active',
        exam: 'JEE'
      };
    } else {
      // If questionData is an object, ensure it has all required fields
      if (!questionData || typeof questionData !== 'object') {
        throw new Error('Invalid question data format');
      }

      parsedQuestion = {
        ...questionData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'active',
        exam: questionData.exam?.toUpperCase() || 'JEE'
      };
    }

    // Validate the question
    if (!parsedQuestion.question || typeof parsedQuestion.question !== 'string') {
      throw new Error('Question text is required and must be a string');
    }
    if (!Array.isArray(parsedQuestion.options) || parsedQuestion.options.length !== 4) {
      throw new Error('Exactly 4 options are required');
    }
    if (!parsedQuestion.options.every(opt => typeof opt === 'string' && opt.trim())) {
      throw new Error('All options must be non-empty strings');
    }
    if (!parsedQuestion.correctAnswer || typeof parsedQuestion.correctAnswer !== 'string') {
      throw new Error('Correct answer is required and must be a string');
    }
    if (!parsedQuestion.options.includes(parsedQuestion.correctAnswer)) {
      throw new Error('Correct answer must be one of the options');
    }

    // Add to Firebase
    console.log('Adding question to Firebase:', parsedQuestion);
    const questionsRef = collection(db, 'questions');
    const docRef = await addDoc(questionsRef, parsedQuestion);
    console.log('Question added successfully with ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding question:', error);
    throw new Error(`Failed to add question: ${error.message}`);
  }
};

export const getQuestions = async ({ exam, subject, chapter, difficulty } = {}) => {
  try {
    // Ensure authentication
    await ensureFirebase();

    // Build query with filters
    let q = collection(db, 'questions');
    let constraints = [];
    
    if (exam) {
      constraints.push(where('exam', '==', exam));
    }
    
    if (subject) {
      constraints.push(where('subject', '==', subject));
    }
    
    if (chapter) {
      constraints.push(where('chapter', '==', chapter));
    }
    
    if (difficulty) {
      constraints.push(where('difficulty', '==', difficulty));
    }

    constraints.push(orderBy('createdAt', 'desc'));
    q = query(q, ...constraints);
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('No questions found matching the criteria');
      return [];
    }

    const questions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt
    }));
    
    console.log(`Successfully fetched ${questions.length} questions`);
    return questions;

  } catch (error) {
    console.error('Error fetching questions:', error);
    throw new Error(`Failed to fetch questions: ${error.message}`);
  }
};

export const getRandomQuestions = async (exam, count = 15) => {
  try {
    console.log('Starting getRandomQuestions...', { exam, count });
    
    // Skip Firebase initialization for now to test direct query
    // await ensureFirebase();
    
    if (!exam) {
      throw new Error('Exam type is required');
    }

    const validExams = ['JEE', 'NEET'];
    if (!validExams.includes(exam.toUpperCase())) {
      throw new Error(`Invalid exam type. Must be one of: ${validExams.join(', ')}`);
    }

    console.log('Creating Firestore query...');
    const questionsRef = collection(db, 'questions');
    
    // Simplified query - only filter by exam type
    const q = query(
      questionsRef,
      where('exam', '==', exam.toUpperCase())
    );

    console.log('Executing Firestore query...');
    const snapshot = await getDocs(q);
    console.log('Query completed. Documents found:', snapshot.size);

    if (snapshot.empty) {
      console.log('No questions found in database');
      return [];
    }

    // Convert to array with full data logging
    console.log('Converting documents to questions array...');
    const questions = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log('Question data:', {
        id: doc.id,
        exam: data.exam,
        question: data.question?.substring(0, 50) + '...',
        hasOptions: Array.isArray(data.options),
        optionsCount: data.options?.length
      });
      
      questions.push({
        id: doc.id,
        ...data
      });
    });
    
    console.log(`Found ${questions.length} questions before shuffle`);

    // Shuffle array
    for (let i = questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questions[i], questions[j]] = [questions[j], questions[i]];
    }

    // Return requested number of questions
    const selectedQuestions = questions.slice(0, Math.min(count, questions.length));
    console.log(`Returning ${selectedQuestions.length} questions`);
    
    return selectedQuestions;
  } catch (error) {
    console.error('Error getting random questions:', error);
    console.error('Error details:', error.stack);
    throw new Error(`Failed to get questions: ${error.message}`);
  }
};

// Helper function to shuffle array using Fisher-Yates algorithm
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
} 