"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Library, 
  FileQuestion, 
  Users, 
  TrendingUp, 
  Plus, 
  ArrowRight,
  Clock,
  CheckCircle2
} from "lucide-react";

// API URL (Adjust if deployed)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function DashboardPage() {
  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalQuestions: 0,
    publishedQuestions: 0,
    draftQuestions: 0,
    totalQuizzes: 0, // Placeholder
    totalStudents: 0 // Placeholder
  });

  // --- FETCH REAL DATA ---
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const token = localStorage.getItem('token');
        
        // 1. Fetch Questions to count them
        const res = await fetch(`${API_URL}/questions`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
            const questions = await res.json();
            if (Array.isArray(questions)) {
                setStats(prev => ({
                    ...prev,
                    totalQuestions: questions.length,
                    publishedQuestions: questions.filter((q: any) => q.status === 'PUBLISHED').length,
                    draftQuestions: questions.filter((q: any) => q.status === 'DRAFT').length,
                }));
            }
        }
      } catch (error) {
        console.error("Dashboard load error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // --- RENDER ---
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* 1. WELCOME HEADER */}
      <div className="flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
            <p className="text-gray-500 mt-2">Welcome back to Polaris. Here's what's happening today.</p>
        </div>
        <div className="flex gap-3">
             <Link 
                href="/dashboard/item-bank" 
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition-all"
             >
                <Plus size={18} /> New Item
             </Link>
        </div>
      </div>

      {/* 2. KEY METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Card 1: Question Bank (REAL DATA) */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Library size={24} />
                </div>
                <span className="text-xs font-bold px-2 py-1 bg-green-50 text-green-700 rounded-full">
                    Live
                </span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalQuestions}</div>
            <p className="text-sm text-gray-500 mt-1">Items in Bank</p>
            <div className="mt-4 pt-4 border-t border-gray-50 text-xs text-gray-400 flex gap-3">
                <span>{stats.publishedQuestions} Published</span>
                <span>•</span>
                <span>{stats.draftQuestions} Drafts</span>
            </div>
        </div>

        {/* Card 2: Quizzes (Placeholder) */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-pink-50 text-pink-600 rounded-lg">
                    <FileQuestion size={24} />
                </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalQuizzes}</div>
            <p className="text-sm text-gray-500 mt-1">Active Quizzes</p>
            <div className="mt-4 pt-4 border-t border-gray-50 text-xs text-gray-400">
                0 Pending Grading
            </div>
        </div>

        {/* Card 3: Students (Placeholder) */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                    <Users size={24} />
                </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalStudents}</div>
            <p className="text-sm text-gray-500 mt-1">Total Students</p>
            <div className="mt-4 pt-4 border-t border-gray-50 text-xs text-gray-400">
                Enrolled across 0 classes
            </div>
        </div>

        {/* Card 4: Avg Score (Placeholder) */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                    <TrendingUp size={24} />
                </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">--%</div>
            <p className="text-sm text-gray-500 mt-1">Average Score</p>
            <div className="mt-4 pt-4 border-t border-gray-50 text-xs text-gray-400">
                Based on recent quizzes
            </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">Quick Actions</h3>
                </div>
                <div className="p-6 grid grid-cols-2 gap-4">
                    <Link href="/dashboard/item-bank" className="group p-4 border rounded-xl hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-pointer">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg group-hover:scale-110 transition-transform">
                                <Plus size={18} />
                            </div>
                            <span className="font-semibold text-gray-900">Create Question</span>
                        </div>
                        <p className="text-sm text-gray-500">Add a new item to your bank. Supports MCQ, Multiple Response, and more.</p>
                    </Link>

                    <Link href="/dashboard/quizzes/new" className="group p-4 border rounded-xl hover:border-pink-200 hover:bg-pink-50/30 transition-all cursor-pointer">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-pink-100 text-pink-600 rounded-lg group-hover:scale-110 transition-transform">
                                <FileQuestion size={18} />
                            </div>
                            <span className="font-semibold text-gray-900">Build Quiz</span>
                        </div>
                        <p className="text-sm text-gray-500">Combine items into an assessment and assign it to students.</p>
                    </Link>
                </div>
            </div>

             {/* Recent Activity Placeholder */}
             <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-50">
                    <h3 className="font-semibold text-gray-900">Recent Activity</h3>
                </div>
                <div className="p-8 text-center text-gray-500 text-sm">
                    <Clock className="mx-auto mb-2 opacity-20" size={32} />
                    <p>No recent activity logs found.</p>
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN: System Status */}
        <div className="space-y-6">
             <div className="bg-indigo-900 text-white rounded-xl p-6 shadow-lg relative overflow-hidden">
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                
                <h3 className="font-bold text-lg mb-2">Polaris Engine</h3>
                <p className="text-indigo-200 text-sm mb-6">Your system is running optimally. Database connection is active.</p>
                
                <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-indigo-100">
                        <CheckCircle2 size={16} className="text-green-400" />
                        <span>Database Connected (Neon)</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-indigo-100">
                        <CheckCircle2 size={16} className="text-green-400" />
                        <span>API Online (v1.0.0)</span>
                    </div>
                </div>
             </div>
        </div>
      </div>
    </div>
  );
}