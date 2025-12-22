"use client";

import React from "react";
import Link from "next/link";
import { FileQuestion, Plus, Search, MoreVertical, Calendar } from "lucide-react";

export default function AssessmentsPage() {
  // Placeholder Data (We will connect this to DB later)
  const assessments = []; 

  return (
    <div className="p-8 h-full flex flex-col">
      
      {/* HEADER */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Assessments</h1>
          <p className="text-gray-500 mt-1">Manage your quizzes, tests, and exams.</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition-all opacity-50 cursor-not-allowed" title="Coming Soon">
           <Plus size={18} /> Create Assessment
        </button>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col items-center justify-center text-center p-12">
        
        {assessments.length > 0 ? (
           /* LIST VIEW (Future) */
           <div className="w-full">List goes here...</div>
        ) : (
           /* EMPTY STATE (Current) */
           <div className="max-w-md">
             <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FileQuestion size={40} />
             </div>
             <h2 className="text-lg font-semibold text-gray-900 mb-2">No assessments yet</h2>
             <p className="text-gray-500 mb-8">
               You haven't created any assessments. Once you create them, you can assign them to students and track progress here.
             </p>
             <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-sm text-left">
                <h4 className="font-semibold text-gray-900 mb-1">Development Roadmap:</h4>
                <ul className="list-disc pl-4 space-y-1 text-gray-500">
                    <li>Select questions from Item Bank</li>
                    <li>Set time limits and passing scores</li>
                    <li>Publish for students</li>
                </ul>
             </div>
           </div>
        )}

      </div>
    </div>
  );
}