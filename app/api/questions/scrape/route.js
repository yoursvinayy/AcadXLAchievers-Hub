import { NextResponse } from 'next/server';
import scrapeQuestions from '@/models/Question'; // 👈 Default import kiya

export async function POST(request) {
  try {
    const body = await request.json();
    const { source } = body;

    if (!source || typeof source !== 'string') {
      return NextResponse.json(
        { error: 'Valid source is required' },
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
    console.error('❌ Error in scrape route:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to scrape questions' },
      { status: 500 }
    );
  }
}
