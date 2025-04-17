import { NextResponse } from 'next/server';
import { db, auth } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function GET() {
  try {
    console.log('Testing Firebase connection...');
    
    // Test Firestore connection
    console.log('Testing Firestore query...');
    const questionsRef = collection(db, 'questions');
    const snapshot = await getDocs(questionsRef);
    
    console.log('Query successful, documents found:', snapshot.size);

    // Log some document data for verification
    const documents = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log('Document data:', { id: doc.id, ...data });
      documents.push({
        id: doc.id,
        exam: data.exam,
        hasQuestion: !!data.question,
        hasOptions: Array.isArray(data.options),
        optionsCount: data.options?.length
      });
    });

    return NextResponse.json({
      status: 'success',
      message: 'Firebase connection successful',
      documentCount: snapshot.size,
      sampleDocuments: documents.slice(0, 3), // Show first 3 documents
      config: {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        hasAuth: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        hasProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        hasAuthDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
      }
    });
  } catch (error) {
    console.error('Firebase test error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    return NextResponse.json({
      status: 'error',
      message: error.message,
      stack: error.stack,
      code: error.code,
      type: error.constructor.name
    }, { status: 500 });
  }
} 