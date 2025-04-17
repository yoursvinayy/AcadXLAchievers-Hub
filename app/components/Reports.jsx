'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '../config/firebase';
import { getUserAttempts, getUserStats } from '../models/QuizAttempt';
import { useRouter } from 'next/navigation';
import { collection, getDocs } from 'firebase/firestore';

export default function Reports() {
  const [attempts, setAttempts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    console.log('Reports component mounted');
    let isMounted = true;

    const loadData = async (user) => {
      try {
        if (!isMounted) return;
        setLoading(true);
        setError(null);
        console.log('Starting data fetch for user:', user.uid);

        // Verify database connection first
        if (!db) {
          throw new Error('Database connection not initialized');
        }

        // Fetch attempts and stats
        const [userAttempts, userStats] = await Promise.all([
          getUserAttempts(user.uid),
          getUserStats(user.uid)
        ]);

        if (!isMounted) return;

        console.log('Data fetched successfully:', {
          attempts: userAttempts.length,
          stats: userStats
        });

        setAttempts(userAttempts);
        setStats(userStats);
      } catch (err) {
        console.error('Error loading reports:', err);
        if (isMounted) {
          if (err.code === 'permission-denied') {
            setError('You do not have permission to view these reports. Please log in again.');
          } else if (err.message.includes('database')) {
            setError('Unable to connect to the database. Please check your internet connection and try again.');
          } else {
            setError(err.message || 'Failed to load your quiz reports. Please try again later.');
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log('Auth state changed:', user ? `User logged in: ${user.uid}` : 'No user');
      
      if (!user) {
        console.log('No user found, redirecting to login');
        if (isMounted) {
          router.push('/login');
        }
        return;
      }

      await loadData(user);
    });

    return () => {
      isMounted = false;
      unsubscribe();
      console.log('Reports component cleanup');
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D0C1D]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-400">Loading your quiz reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D0C1D]">
        <div className="bg-[#1C1B3A] p-6 rounded-lg max-w-md w-full mx-4">
          <h2 className="text-xl font-semibold text-red-400 mb-4">Error Loading Reports</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <div className="flex justify-end">
            <button
              onClick={() => window.location.reload()}
              className="bg-[#FF8303] text-white px-4 py-2 rounded hover:bg-[#FF9124] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-white">Quiz Performance Reports</h1>
      
      {/* Overall Statistics */}
      <div className="bg-[#1C1B3A] rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-white">Overall Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#252447] p-4 rounded-lg">
            <p className="text-sm text-gray-400">Total Attempts</p>
            <p className="text-2xl font-bold text-white">{stats?.totalAttempts || 0}</p>
          </div>
          <div className="bg-[#252447] p-4 rounded-lg">
            <p className="text-sm text-gray-400">Average Score</p>
            <p className="text-2xl font-bold text-white">{stats?.averageScore?.toFixed(1) || 0}%</p>
          </div>
          <div className="bg-[#252447] p-4 rounded-lg">
            <p className="text-sm text-gray-400">Highest Score</p>
            <p className="text-2xl font-bold text-white">{stats?.highestScore || 0}%</p>
          </div>
          <div className="bg-[#252447] p-4 rounded-lg">
            <p className="text-sm text-gray-400">Total Time</p>
            <p className="text-2xl font-bold text-white">{Math.round((stats?.totalTime || 0) / 60)} mins</p>
          </div>
        </div>
      </div>

      {/* Exam-specific Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {['JEE', 'NEET'].map((examType) => (
          <div key={examType} className="bg-[#1C1B3A] rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-white">{examType} Statistics</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-400">Attempts</p>
                <p className="text-xl font-bold text-white">{stats?.[examType.toLowerCase()]?.attempts || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Avg. Score</p>
                <p className="text-xl font-bold text-white">
                  {stats?.[examType.toLowerCase()]?.averageScore?.toFixed(1) || 0}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Best Score</p>
                <p className="text-xl font-bold text-white">
                  {stats?.[examType.toLowerCase()]?.highestScore || 0}%
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Attempts */}
      <div className="bg-[#1C1B3A] rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">Recent Attempts</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-[#252447]">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Quiz Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Time (mins)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#252447]">
              {attempts.map((attempt, index) => (
                <tr key={index} className="hover:bg-[#252447] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatDate(attempt.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 uppercase">
                    {attempt.quizType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {attempt.score}/{attempt.totalQuestions} ({((attempt.score / attempt.totalQuestions) * 100).toFixed(1)}%)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {Math.round(attempt.timeSpent / 60)}
                  </td>
                </tr>
              ))}
              {attempts.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-400">
                    No attempts yet. Take a quiz to see your performance!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 