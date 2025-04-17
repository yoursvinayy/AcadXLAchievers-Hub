import { NextResponse } from 'next/server';
import { addQuestion } from '@app/models/Question';

export async function POST(request) {
  try {
    const { questions, examType, classLevel, subject, chapter } = await request.json();

    // Process each question
    for (const questionData of questions) {
      const question = {
        ...questionData,
        examType,
        classLevel,
        subject,
        chapter,
        source: 'Bulk Upload',
        difficulty: 'Medium'
      };

      await addQuestion(question);
    }

    return NextResponse.json({ success: true, message: 'Questions added successfully' });
  } catch (error) {
    console.error('Error in bulk upload:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 
