'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function QuizClient({ questions, quizType }) {
  const router = useRouter();
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  const handleSubmit = () => {
    // Calculate score
    let correctCount = 0;
    questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctCount++;
      }
    });
    setScore((correctCount / questions.length) * 100);
    setSubmitted(true);
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(null);
    router.refresh(); // This will fetch new questions
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{quizType.toUpperCase()} Quiz</h1>
      
      {submitted ? (
        <div className="text-center">
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-bold mb-4">Quiz Complete!</h2>
            <p className="text-xl mb-4">Your Score: {score.toFixed(1)}%</p>
            <button
              onClick={handleRetry}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Try Another Quiz
            </button>
          </div>
          
          <div className="space-y-8">
            {questions.map((question, index) => (
              <div key={index} className={`bg-white p-6 rounded-lg shadow-md ${
                answers[index] === question.correctAnswer ? 'border-2 border-green-500' : 'border-2 border-red-500'
              }`}>
                <p className="text-lg font-semibold mb-4">Q{index + 1}: {question.questionText}</p>
                <div className="space-y-2">
                  {question.options.map((option, optIndex) => (
                    <div key={optIndex} className={`flex items-center p-2 rounded ${
                      optIndex === question.correctAnswer ? 'bg-green-100' :
                      optIndex === answers[index] ? 'bg-red-100' : ''
                    }`}>
                      <input
                        type="radio"
                        name={`question-${index}`}
                        id={`q${index}-opt${optIndex}`}
                        checked={answers[index] === optIndex}
                        disabled
                        className="mr-2"
                      />
                      <label htmlFor={`q${index}-opt${optIndex}`}>{option}</label>
                    </div>
                  ))}
                </div>
                {answers[index] !== question.correctAnswer && (
                  <p className="mt-4 text-sm text-gray-600">
                    Correct answer: {question.options[question.correctAnswer]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {questions.map((question, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-lg font-semibold mb-4">Q{index + 1}: {question.questionText}</p>
              <div className="space-y-2">
                {question.options.map((option, optIndex) => (
                  <div key={optIndex} className="flex items-center">
                    <input
                      type="radio"
                      name={`question-${index}`}
                      id={`q${index}-opt${optIndex}`}
                      checked={answers[index] === optIndex}
                      onChange={() => handleAnswerSelect(index, optIndex)}
                      className="mr-2"
                    />
                    <label htmlFor={`q${index}-opt${optIndex}`}>{option}</label>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          <div className="text-center">
            <button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length !== questions.length}
              className={`px-6 py-2 rounded transition-colors ${
                Object.keys(answers).length === questions.length
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Submit Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 