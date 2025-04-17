import QuizClient from '../../components/QuizClient.jsx';
import { headers } from 'next/headers';

async function getQuizQuestions(type) {
  console.log('Fetching quiz questions for type:', type);
  try {
    // Get the protocol and host from headers
    const headersList = headers();
    const host = headersList.get('host');
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    
    // Add cache-busting timestamp to ensure fresh questions each time
    const timestamp = Date.now();
    const params = new URLSearchParams({
      exam: type.toUpperCase(),
      count: '15'
    });
    
    const url = `${protocol}://${host}/api/quiz?${params.toString()}&t=${timestamp}`;
    console.log('Fetching from URL:', url);
    
    const response = await fetch(url, { 
      cache: 'no-store',  // Disable caching to get fresh questions
      next: { revalidate: 0 } // Disable Next.js cache
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to fetch questions:', errorData);
      throw new Error(errorData.message || 'Failed to fetch quiz questions');
    }
    
    const data = await response.json();
    console.log(`Successfully fetched ${data.questions.length} questions`);
    return data.questions;
  } catch (error) {
    console.error('Error in getQuizQuestions:', error);
    throw error;
  }
}

export default async function QuizPage({ params }) {
  try {
    const { type } = params;
    
    // Validate quiz type
    if (!['jee', 'neet'].includes(type.toLowerCase())) {
      throw new Error('Invalid quiz type. Must be either JEE or NEET');
    }
    
    const questions = await getQuizQuestions(type);
    
    if (!questions || questions.length === 0) {
      throw new Error('No questions available for this quiz type');
    }

  return (
      <div className="container mx-auto px-4 py-8">
        <QuizClient questions={questions} quizType={type} />
      </div>
    );
  } catch (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error.message}</span>
        </div>
    </div>
  );
  }
} 