'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function QuizPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const startQuiz = async (type) => {
    try {
      setLoading(true);
      router.push(`/quiz/${type}`);
    } catch (error) {
      console.error('Error starting quiz:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-white mb-4">Select a quiz</h1>
      <p className="text-gray-400 mb-12">Pick the exam level you want to challenge.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        <button
          onClick={() => startQuiz('NEET')}
          className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl flex items-center space-x-4 border border-slate-700/50 hover:border-orange-500/50 hover:bg-slate-800/70 transition-all duration-300 group"
        >
          <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center group-hover:bg-orange-500/30 transition-all duration-300">
            <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <span className="text-xl font-semibold text-white">NEET</span>
        </button>

        <button
          onClick={() => startQuiz('JEE')}
          className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl flex items-center space-x-4 border border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-800/70 transition-all duration-300 group"
        >
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-all duration-300">
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-xl font-semibold text-white">JEE</span>
        </button>

        <button
          onClick={() => startQuiz('10th')}
          className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl flex items-center space-x-4 border border-slate-700/50 hover:border-purple-500/50 hover:bg-slate-800/70 transition-all duration-300 group"
        >
          <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-all duration-300">
            <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="text-xl font-semibold text-white">10th</span>
        </button>

        <button
          onClick={() => startQuiz('11th')}
          className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl flex items-center space-x-4 border border-slate-700/50 hover:border-green-500/50 hover:bg-slate-800/70 transition-all duration-300 group"
        >
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center group-hover:bg-green-500/30 transition-all duration-300">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
          <span className="text-xl font-semibold text-white">11th</span>
        </button>
      </div>
    </div>
  );
} 