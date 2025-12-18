'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import QuestionBuilder from '../../components/QuestionBuilder'; // 👈 Import new component

export default function QuizEditor() {
  const params = useParams();
  const router = useRouter();
  
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false); // Toggle the form

  // Fetch Data Function
  const loadQuiz = () => {
    fetch(`http://localhost:3000/quizzes/${params.id}`)
      .then(res => res.json())
      .then(data => {
        setQuiz(data);
        setLoading(false);
      })
      .catch(err => console.error("Failed to load quiz", err));
  };

  // Initial Load
  useEffect(() => {
    loadQuiz();
  }, [params.id]);

  if (loading) return <div className="p-10">⏳ Loading Editor...</div>;
  if (!quiz) return <div className="p-10 text-red-500">❌ Quiz not found</div>;

  return (
    <div className="p-6 font-sans min-h-screen bg-gray-50">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{quiz.title}</h1>
          <p className="text-gray-500 mt-1">{quiz.description}</p>
        </div>
        <button 
             onClick={() => router.push('/dashboard')}
             className="text-gray-600 hover:text-gray-900 font-medium"
        >
             Exit
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto">
        
        {/* 1. List Existing Questions */}
        <div className="space-y-4 mb-8">
          {quiz.questions && quiz.questions.map((q: any, index: number) => (
            <div key={q.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between">
                <h3 className="font-bold text-lg text-gray-800">
                  {index + 1}. {q.text}
                </h3>
                <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded">
                  {q.type}
                </span>
              </div>
              
              {/* Show Image if exists */}
              {q.mediaUrl && (
                <img src={q.mediaUrl} alt="Question Media" className="h-40 mt-3 rounded border" />
              )}

              {/* Show Options (Read Only View) */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                {q.options.map((opt: any) => (
                  <div key={opt.id} className={`p-2 rounded border text-sm ${opt.isCorrect ? 'bg-green-50 border-green-300 font-semibold text-green-800' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
                    {opt.isCorrect ? '✅ ' : '⚪ '} {opt.text}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 2. The Builder Area */}
        {isAdding ? (
          <QuestionBuilder 
            quizId={params.id as string} 
            onCancel={() => setIsAdding(false)}
            onQuestionAdded={() => {
              setIsAdding(false);
              loadQuiz(); // Refresh the list!
            }}
          />
        ) : (
          <button 
            onClick={() => setIsAdding(true)}
            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-bold hover:border-purple-500 hover:text-purple-600 hover:bg-purple-50 transition"
          >
            + Add New Question
          </button>
        )}

      </div>
    </div>
  );
}