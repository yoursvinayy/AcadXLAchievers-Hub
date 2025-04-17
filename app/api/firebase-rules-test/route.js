import { NextResponse } from 'next/server';
import { db } from '../../lib/firebase';
import { collection, getDocs, limit } from 'firebase/firestore';

export async function GET() {
  try {
    console.log('Testing Firestore permissions...');
    
    // Test read access to questions collection
    const questionsRef = collection(db, 'questions');
    const snapshot = await getDocs(questionsRef);
    
    return NextResponse.json({
      status: 'success',
      message: 'Successfully accessed questions collection',
      documentCount: snapshot.size,
      permissions: {
        canRead: true,
        collection: 'questions'
      }
    });
  } catch (error) {
    console.error('Firestore permissions test error:', error);
    
    // Check for specific error types
    if (error.code === 'permission-denied') {
      return NextResponse.json({
        status: 'error',
        error: 'Permission denied',
        message: 'Missing or insufficient permissions to access questions collection',
        details: 'Please update Firestore security rules to allow read access',
        code: error.code
      }, { status: 403 });
    }
    
    return NextResponse.json({
      status: 'error',
      message: error.message,
      code: error.code,
      type: error.constructor.name
    }, { status: 500 });
  }
} 