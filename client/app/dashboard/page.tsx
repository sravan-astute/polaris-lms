'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';   // 👈 New
import QuizCard from '../components/QuizCard'; // 👈 New

export default function Dashboard() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Basic Auth Check + Fetch
    fetch('http://localhost:3000/lti/me', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (!data.authenticated) router.push('/login');
        else {
          fetch('http://localhost:3000/quizzes')
            .then(res => res.json())
            .then(qData => {
              setQuizzes(qData);
              setLoading(false);
            });
        }
      });
  }, []);

  const filteredQuizzes = quizzes.filter(q => 
    q.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      
      {/* 👈 1. The Professional Sidebar */}
      <Sidebar />

      {/* 2. Main Workspace Area */}
      <div className="flex-1 ml-64"> {/* ml-64 matches sidebar width */}
        
        {/* Top Header */}
        <header className="bg-white border-b px-8 py-5 flex justify-between items-center sticky top-0 z-10">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
          <button 
            onClick={() => router.push('/quizzes/new')} 
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg font-bold shadow-md transition flex items-center gap-2"
          >
            + New Project
          </button>
        </header>

        {/* Filters & Grid */}
        <main className="p-8 max-w-7xl mx-auto">
          
          {/* Search Bar */}
          <div className="mb-8 flex gap-4">
            <div className="relative flex-1 max-w-lg">
              <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
              <input 
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            {/* Sort Dropdown (Visual Only for now) */}
            <select className="border border-gray-300 rounded-lg px-4 bg-white text-gray-600">
              <option>Sort by: Newest</option>
              <option>Sort by: Name</option>
            </select>
          </div>

          {/* Loading State */}
          {loading && <div className="p-10 text-gray-500">⏳ Loading Content Library...</div>}

          {/* Grid View */}
          {!loading && filteredQuizzes.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-300">
              <p className="text-gray-400 mb-4">You haven't created any content yet.</p>
              <button onClick={() => router.push('/quizzes/new')} className="text-purple-600 font-bold hover:underline">Start your first project</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQuizzes.map((quiz) => (
                <QuizCard key={quiz.id} quiz={quiz} onNavigate={router.push} />
              ))}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}