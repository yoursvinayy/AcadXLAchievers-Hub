import { NextResponse } from 'next/server';
import { addQuestion, getRandomQuestions } from '@/models/Question';

export async function GET() {
  try {
    console.log('Starting test endpoint...');
    
    // First try to get existing questions
    console.log('Checking existing questions...');
    const existingQuestions = await getRandomQuestions('JEE', 5);
    console.log('Existing questions:', existingQuestions);

    // If no questions exist, add a test question
    if (!existingQuestions || existingQuestions.length === 0) {
      console.log('No questions found, adding test question...');
      const testQuestion = {
        question: 'What is the SI unit of force?',
        options: ['Newton', 'Joule', 'Watt', 'Pascal'],
        correctAnswer: 'Newton',
        explanation: 'Newton (N) is the SI unit of force.',
        exam: 'JEE',
        subject: 'Physics',
        chapter: 'Units and Dimensions',
        difficulty: 'Easy',
        status: 'active'
      };

      const questionId = await addQuestion(testQuestion);
      console.log('Test question added with ID:', questionId);
      
      // Try to fetch questions again
      const newQuestions = await getRandomQuestions('JEE', 5);
      console.log('Questions after adding:', newQuestions);

      return NextResponse.json({ 
        message: 'Test question added successfully',
        questionId,
        existingQuestions: [],
        newQuestions
      });
    }
    
    return NextResponse.json({ 
      message: 'Questions found in database',
      existingQuestions
    });
  } catch (error) {
    console.error('Error in test endpoint:', error);
    return NextResponse.json(
      { 
        error: error.message,
        stack: error.stack 
      },
      { status: 500 }
    );
  }
} 
