'use client';

import { useState } from 'react';

interface QuizCardProps {
  quiz: any;
  onNavigate: (path: string) => void;
}

export default function QuizCard({ quiz, onNavigate }: QuizCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all relative group">
      
      {/* Status Strip */}
      <div className={`h-1.5 w-full rounded-t-xl ${quiz.status === 'PUBLISHED' ? 'bg-green-500' : 'bg-yellow-400'}`} />

      {/* Card Content (Clickable) */}
      <div 
        className="p-5 cursor-pointer"
        onClick={() => onNavigate(`/quizzes/${quiz.id}`)}
      >
        <div className="flex justify-between items-start mb-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
            quiz.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {quiz.status}
          </span>
          <span className="text-gray-400 text-xs">
            {new Date(quiz.createdAt).toLocaleDateString()}
          </span>
        </div>
        
        <h3 className="font-bold text-gray-800 text-lg mb-1 truncate">{quiz.title}</h3>
        <p className="text-gray-500 text-sm line-clamp-2 h-10 mb-2">
          {quiz.description || "No description provided."}
        </p>
      </div>

      {/* Footer Info */}
      <div className="px-5 py-3 border-t bg-gray-50 flex justify-between items-center rounded-b-xl">
        <div className="text-xs text-gray-500 flex items-center gap-2">
          <span>📚 {quiz.questions?.length || 0} Qs</span>
        </div>
        
        {/* The Action Menu Button */}
        <div className="relative">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className="p-1 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-700"
          >
            ⋮
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <>
              {/* Invisible closer */}
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              
              <div className="absolute right-0 bottom-8 w-40 bg-white shadow-xl border rounded-lg z-20 py-1 text-sm animate-fade-in-up">
                <button onClick={() => onNavigate(`/quizzes/${quiz.id}`)} className="w-full text-left px-4 py-2 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2">
                  ✏️ Edit
                </button>
                <button onClick={() => alert('Preview coming soon')} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2">
                  👁️ Preview
                </button>
                <button onClick={() => alert('Settings coming soon')} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2">
                  ⚙️ Settings
                </button>
                <div className="border-t my-1"></div>
                <button onClick={() => alert('Delete coming soon')} className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2">
                  🗑️ Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}