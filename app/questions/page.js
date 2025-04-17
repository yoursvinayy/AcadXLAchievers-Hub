'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { addQuestion, getQuestions, scrapeQuestions } from '@/models/Question';

const QuestionManagement = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [formData, setFormData] = useState({
    exam: 'JEE',
    classLevel: 'Class 12',
    subject: 'Physics',
    chapter: '',
    bulkQuestions: ''
  });

  const router = useRouter();

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getQuestions();
      setQuestions(data);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess('');

    try {
      const questionText = formData.bulkQuestions.trim();
      if (!questionText) {
        throw new Error('Please enter question text');
      }

      await addQuestion(questionText);
      setSuccess('Question added successfully!');
      setFormData(prev => ({ ...prev, bulkQuestions: '' }));
      await fetchQuestions();
    } catch (error) {
      console.error('Error adding question:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBulkUpload = async () => {
    try {
      setLoading(true);
      setError(null);

      // Split the text into individual questions
      const questionBlocks = formData.bulkQuestions.split('\n\n');
      const questionsToAdd = [];
      
      for (const block of questionBlocks) {
        if (!block.trim()) continue;
        
        const lines = block.split('\n');
        if (lines.length < 6) {
          throw new Error('Each question must have at least 6 lines (question, 4 options, and answer)');
        }

        const question = lines[0].trim();
        const options = lines.slice(1, 5).map(opt => opt.trim());
        const answer = lines[5].trim();
        const explanation = lines[6] ? lines[6].trim() : '';

        // Validate answer
        if (!options.includes(answer)) {
          throw new Error(`Answer "${answer}" must be one of the options`);
        }

        questionsToAdd.push({
          question,
          options,
          correctAnswer: answer,
          explanation
        });
      }

      // Send questions to the API
      const response = await fetch('/api/questions/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questions: questionsToAdd,
          examType: formData.exam,
          classLevel: formData.classLevel,
          subject: formData.subject,
          chapter: formData.chapter
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload questions');
      }

      setFormData(prev => ({ ...prev, bulkQuestions: '' }));
      await fetchQuestions();
    } catch (error) {
      console.error('Error in bulk upload:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleScrapeQuestions = async (source) => {
    try {
      setLoading(true);
      setError(null);
      const count = await scrapeQuestions(source);
      alert(`Successfully scraped ${count} questions from ${source}`);
      await fetchQuestions();
    } catch (error) {
      console.error('Error scraping questions:', error);
      setError(error.message || 'Failed to scrape questions');
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <div className="container mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-12 text-white text-center bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
          Question Management
        </h1>
        
        {error && (
          <div className="bg-red-900/50 backdrop-blur-sm border border-red-500/50 text-red-200 px-6 py-4 rounded-xl mb-6 shadow-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-900/50 backdrop-blur-sm border border-green-500/50 text-green-200 px-6 py-4 rounded-xl mb-6 shadow-lg">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Add Questions Form */}
          <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-slate-700/50">
            <h2 className="text-2xl font-semibold mb-6 text-white bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Add Questions
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Exam Type</label>
                <select
                  name="exam"
                  value={formData.exam}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="JEE">JEE</option>
                  <option value="NEET">NEET</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Class Level</label>
                <select
                  name="classLevel"
                  value={formData.classLevel}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="Class 11">Class 11</option>
                  <option value="Class 12">Class 12</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Biology">Biology</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Chapter</label>
                <input
                  type="text"
                  name="chapter"
                  value={formData.chapter}
                  onChange={handleInputChange}
                  placeholder="Enter chapter name"
                  className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Bulk Upload Questions</label>
                <textarea
                  name="bulkQuestions"
                  value={formData.bulkQuestions}
                  onChange={handleInputChange}
                  rows="12"
                  placeholder="Enter your question exactly in this format (copy this as template):

The sum of the interior angles of a polygon with n sides is:
A) (n - 2) × 180°
B) n × 180°
C) (n + 2) × 180°
D) (n - 1) × 180°
(n - 2) × 180°

Important:
1. Use simple hyphens (-) not en-dashes (–)
2. Copy symbols (×, °) exactly as shown
3. The last line must match an option exactly"
                  className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 transition-all duration-200 shadow-lg shadow-blue-500/25"
              >
                {loading ? 'Adding...' : 'Add Question'}
              </button>
            </form>
          </div>

          {/* Existing Questions */}
          <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-slate-700/50">
            <h2 className="text-2xl font-semibold mb-6 text-white bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Existing Questions
            </h2>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : questions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>No questions found. Add some questions or scrape them from sources.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                      currentQuestionIndex === 0
                        ? 'bg-slate-700/50 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 hover:text-blue-300'
                    }`}
                  >
                    ← Previous
                  </button>
                  <span className="text-gray-300 bg-slate-700/50 px-4 py-2 rounded-lg">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                  <button
                    onClick={handleNextQuestion}
                    disabled={currentQuestionIndex === questions.length - 1}
                    className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                      currentQuestionIndex === questions.length - 1
                        ? 'bg-slate-700/50 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 hover:text-blue-300'
                    }`}
                  >
                    Next →
                  </button>
                </div>

                <div className="bg-slate-700/50 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-slate-600/50">
                  <p className="font-medium text-xl mb-6 text-white leading-relaxed">
                    {questions[currentQuestionIndex].question}
                  </p>
                  <ul className="space-y-4">
                    {questions[currentQuestionIndex].options.map((option, index) => (
                      <li
                        key={index}
                        className={`p-4 rounded-xl transition-all duration-200 ${
                          option === questions[currentQuestionIndex].correctAnswer
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : 'bg-slate-600/30 text-gray-200 hover:bg-slate-600/40'
                        }`}
                      >
                        <span className="inline-flex items-center justify-center w-8 h-8 mr-3 rounded-lg bg-slate-700/50 text-gray-300">
                          {String.fromCharCode(65 + index)}
                        </span>
                        {option}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 pt-6 border-t border-slate-600/50">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-slate-600/20 p-3 rounded-lg">
                        <span className="text-blue-400 font-medium">Exam:</span>
                        <span className="ml-2 text-gray-300">{questions[currentQuestionIndex].exam}</span>
                      </div>
                      <div className="bg-slate-600/20 p-3 rounded-lg">
                        <span className="text-blue-400 font-medium">Class:</span>
                        <span className="ml-2 text-gray-300">{questions[currentQuestionIndex].classLevel}</span>
                      </div>
                      <div className="bg-slate-600/20 p-3 rounded-lg">
                        <span className="text-blue-400 font-medium">Subject:</span>
                        <span className="ml-2 text-gray-300">{questions[currentQuestionIndex].subject}</span>
                      </div>
                      <div className="bg-slate-600/20 p-3 rounded-lg">
                        <span className="text-blue-400 font-medium">Chapter:</span>
                        <span className="ml-2 text-gray-300">{questions[currentQuestionIndex].chapter}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionManagement; 
