import { NextResponse } from 'next/server';
import { adminDb } from '../../config/firebase-admin';

export async function GET(request) {
  try {
    console.log('Quiz API: Starting request, checking Firebase Admin...');
    
    if (!adminDb) {
      console.error('Quiz API: Firebase Admin SDK not initialized');
      return NextResponse.json(
        { 
          error: 'Service configuration error',
          message: 'The quiz service is not properly configured. Please try again in a few moments.'
        },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const exam = searchParams.get('exam')?.toUpperCase();
    const count = parseInt(searchParams.get('count') || '15', 10);

    console.log('Quiz API: Processing request for', { exam, count });

    if (!exam) {
      console.warn('Quiz API: Missing exam parameter');
      return NextResponse.json(
        { error: 'Exam type is required' },
        { status: 400 }
      );
    }

    const validExams = ['JEE', 'NEET'];
    if (!validExams.includes(exam)) {
      console.warn('Quiz API: Invalid exam type:', exam);
      return NextResponse.json(
        { error: `Invalid exam type. Must be one of: ${validExams.join(', ')}` },
        { status: 400 }
      );
    }

    console.log('Quiz API: Fetching questions from Firestore...');
    
    // Get questions from Firestore
    const questionsRef = adminDb.collection('questions');
    const snapshot = await questionsRef
      .where('exam', '==', exam)
      .limit(count)
      .get()
      .catch(error => {
        console.error('Quiz API: Firestore query error:', error);
        throw error;
      });

    if (!snapshot || snapshot.empty) {
      console.warn('Quiz API: No questions found for', exam);
      return NextResponse.json(
        { error: 'No questions available for this exam type' },
        { status: 404 }
      );
    }

    console.log('Quiz API: Processing', snapshot.size, 'questions...');

    // Process questions
    const questions = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        question: data.question || 'Question text missing',
        options: Array.isArray(data.options) ? data.options : [],
        correctAnswer: data.correctAnswer || '',
        explanation: data.explanation || '',
        subject: data.subject || '',
        chapter: data.chapter || ''
      };
    });

    // Shuffle questions
    const shuffledQuestions = questions.sort(() => Math.random() - 0.5);

    console.log('Quiz API: Successfully returning', shuffledQuestions.length, 'questions');
    return NextResponse.json({
      questions: shuffledQuestions,
      count: shuffledQuestions.length
    });

  } catch (error) {
    console.error('Quiz API Error:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    // Handle specific errors
    if (error.code === 'permission-denied') {
      return NextResponse.json(
        { 
          error: 'Permission denied',
          message: 'The application does not have permission to access the questions database'
        },
        { status: 403 }
      );
    }

    if (error.code === 'unavailable' || error.code === 'resource-exhausted') {
      return NextResponse.json(
        { 
          error: 'Service temporarily unavailable',
          message: 'The quiz service is temporarily unavailable. Please try again in a few moments.'
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'An unexpected error occurred while fetching questions'
      },
      { status: 500 }
    );
  }
} 