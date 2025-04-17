import { NextResponse } from 'next/server';
import { scrapeNCERTQuestions, scrapePreviousYearQuestions, scrapeTopprQuestions } from '../../utils/scraper';
import { getQuestions, addQuestion } from '../../models/Question';

export async function GET() {
  try {
    const questions = await getQuestions();
    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    // If type is present, it's a scraping request
    if (data.type) {
      let questions;
      switch (data.type) {
        case 'NCERT':
          questions = await scrapeNCERTQuestions(data.subject, data.classLevel);
          break;
        case 'PreviousYear':
          questions = await scrapePreviousYearQuestions(data.exam, data.year);
          break;
        case 'Toppr':
          questions = await scrapeTopprQuestions(data.subject, data.classLevel);
          break;
        default:
          return NextResponse.json(
            { error: 'Invalid scraping type' },
            { status: 400 }
          );
      }
      return NextResponse.json({ message: 'Questions scraped successfully', questions });
    }
    
    // Otherwise, it's a manual question addition
    const questionId = await addQuestion(data);
    return NextResponse.json({ message: 'Question added successfully', id: questionId });
  } catch (error) {
    console.error('Error in POST /api/questions:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error.message },
      { status: 500 }
    );
  }
} 