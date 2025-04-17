import { NextResponse } from 'next/server';
import { scrapeQuestions } from '../../models/Question';

export async function POST(request) {
  try {
    const { source } = await request.json();
    
    if (!source) {
      return NextResponse.json(
        { error: 'Source is required' },
        { status: 400 }
      );
    }

    const count = await scrapeQuestions(source);
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully scraped ${count} questions from ${source}`,
      count 
    });
  } catch (error) {
    console.error('Error in scrape route:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to scrape questions' },
      { status: 500 }
    );
  }
} 
