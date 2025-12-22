"use client";

import React, { useState, useEffect } from "react";
import { 
  CheckCircle, XCircle, Eye, AlertCircle, 
  Loader2, Calendar, User, FileText, ArrowRight
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { toast } from "sonner";
// Reusing types from your builder
import { QuestionData } from "../../components/QuestionBuilder";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000';

export default function ReviewQueuePage() {
  const { theme } = useTheme();
  
  // State
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<QuestionData[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // --- 1. FETCH DATA ---
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // We fetch all, then filter for PENDING_REVIEW
      const res = await fetch(`${API_URL}/questions`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const rawData = await res.json();
        if (Array.isArray(rawData)) {
          // Filter ONLY items waiting for review
          const pendingItems = rawData.filter((q: any) => q.status === 'PENDING_REVIEW');
          
          // Map to ensure clean data structure (Same logic as ItemBank)
          const cleanData = pendingItems.map((q: any) => ({
            ...q,
            options: q.data?.options || q.options || [],
            code: q.code || "PENDING"
          }));
          
          setReviews(cleanData);
        }
      }
    } catch (e) {
      console.error("Failed to load reviews", e);
      toast.error("Could not load review queue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // --- 2. ACTION HANDLERS ---
  const handleDecision = async (question: QuestionData, decision: 'APPROVE' | 'REJECT') => {
    const token = localStorage.getItem('token');
    if (!token) { 
        toast.error("You are logged out."); 
        return; 
    }

    setProcessingId(question.id!);
    
    // Determine new status
    const newStatus = decision === 'APPROVE' ? 'APPROVED' : 'CHANGES_REQUESTED';

    // 🛠️ CRITICAL: Prepare Full Payload (Backend requires all fields)
    // We reuse the exact same transformation logic that fixed the "Save" bug.
    const payload = {
        ...question,
        status: newStatus,
        tags: typeof question.tags === 'string' 
            ? (question.tags as string).split(',').map(t => t.trim()).filter(t => t !== '') 
            : (question.tags || []),
        points: Number(question.points)
    };

    try {
        const res = await fetch(`${API_URL}/questions/${question.id}`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            toast.success(decision === 'APPROVE' ? "Item Approved!" : "Returned for changes.");
            // Remove the item from the local list immediately (UI Optimism)
            setReviews(prev => prev.filter(q => q.id !== question.id));
        } else {
            const err = await res.text();
            console.error(err);
            toast.error("Failed to update status.");
        }
    } catch (error) {
        console.error(error);
        toast.error("Network error.");
    } finally {
        setProcessingId(null);
    }
  };

  // --- RENDER ---
  if (loading && reviews.length === 0) {
      return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>;
  }

  return (
    <div className={`h-full flex flex-col ${theme.bg} ${theme.text} p-8`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Review Queue</h1>
        <p className="opacity-60 mt-2">
          {reviews.length === 0 
            ? "You're all caught up! No items pending review." 
            : `You have ${reviews.length} items waiting for approval.`}
        </p>
      </div>

      {/* List */}
      <div className="space-y-4 max-w-5xl">
        {reviews.length === 0 ? (
            <div className={`p-12 rounded-2xl border border-dashed text-center opacity-50 ${theme.border}`}>
                <CheckCircle className="mx-auto mb-4 w-12 h-12 text-green-500 opacity-50" />
                <h3 className="text-lg font-medium">All Clear</h3>
                <p>No pending items found.</p>
            </div>
        ) : (
            reviews.map((item) => (
                <div key={item.id} className={`p-6 rounded-xl border shadow-sm transition-all hover:shadow-md ${theme.paper} ${theme.border}`}>
                    
                    {/* Item Top Row */}
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                                    {item.type.replace('_', ' ')}
                                </span>
                                <span className="text-xs font-mono opacity-50 bg-gray-100 px-1.5 rounded">
                                    {item.code}
                                </span>
                            </div>
                            <h3 className="text-lg font-medium line-clamp-2" dangerouslySetInnerHTML={{ __html: item.text }} />
                        </div>
                        
                        {/* Meta Badge */}
                        <div className="text-right text-xs opacity-60 space-y-1">
                            <div className="flex items-center justify-end gap-1">
                                <User size={12} /> <span>Author ID: ...{/* Assuming we add author name later */}</span>
                            </div>
                            <div className="flex items-center justify-end gap-1">
                                <Calendar size={12} /> <span>Today</span>
                            </div>
                        </div>
                    </div>

                    {/* Content Preview Snippet */}
                    <div className="bg-black/5 rounded-lg p-4 mb-6 text-sm opacity-80">
                        <div className="flex gap-2 items-center mb-2">
                            <FileText size={14} /> <strong>Answer Key:</strong>
                        </div>
                        <ul className="list-disc pl-5 space-y-1">
                            {item.options?.filter((o:any) => o.isCorrect).map((o:any, i:number) => (
                                <li key={i} className="text-green-700 font-medium">
                                    {o.text || "(Correct Answer)"}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Actions Toolbar */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100/10">
                        <button className="text-sm font-medium flex items-center gap-2 opacity-60 hover:opacity-100 hover:text-indigo-600 transition-colors">
                            <Eye size={16} /> Preview Full Item
                        </button>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => handleDecision(item, 'REJECT')}
                                disabled={!!processingId}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 text-sm font-bold transition-all disabled:opacity-50"
                            >
                                {processingId === item.id ? <Loader2 className="animate-spin" size={16} /> : <XCircle size={16} />}
                                Request Changes
                            </button>
                            
                            <button 
                                onClick={() => handleDecision(item, 'APPROVE')}
                                disabled={!!processingId}
                                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 shadow-sm shadow-green-200 text-sm font-bold transition-all disabled:opacity-50"
                            >
                                {processingId === item.id ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                                Approve & Publish
                            </button>
                        </div>
                    </div>

                </div>
            ))
        )}
      </div>
    </div>
  );
}