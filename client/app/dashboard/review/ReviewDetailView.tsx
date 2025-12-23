"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; 
import { 
  ArrowLeft, CheckCircle, XCircle, Send, Loader2, 
  ChevronRight, ChevronLeft, AlertCircle, Info, Target, BarChart3 
} from "lucide-react";
import StudentPreview from "../../components/builder/StudentPreview";
import { QuestionData } from "../../components/QuestionBuilder";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000';

export default function ReviewDetailView({ items, initialIndex, onBack, onRefresh, onItemProcessed }: { items: QuestionData[], initialIndex: number, onBack: () => void, onRefresh: () => void, onItemProcessed: (id: string) => void }) {
  const router = useRouter(); 
  
  const safeInitialIndex = (initialIndex >= 0 && initialIndex < items.length) ? initialIndex : 0;
  
  const [idx, setIdx] = useState(safeInitialIndex);
  const [item, setItem] = useState<QuestionData>(items[safeInitialIndex] || {} as QuestionData);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingPassage, setLoadingPassage] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleAuthError = () => {
    toast.error("Session expired. Please log in again.");
    localStorage.removeItem('token');
    router.push('/login'); 
  };

  useEffect(() => {
    const current = items[idx];
    if (current) {
      setItem(current);
      if (current.passageId && !current.passage?.content) {
        fetchPassage(current.passageId);
      }
    }
  }, [idx, items]);

  const fetchPassage = async (id: string) => {
    setLoadingPassage(true);
    try {
      const res = await fetch(`${API_URL}/passages/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (res.status === 401) {
        handleAuthError();
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setItem(prev => ({ 
          ...prev, 
          passage: { id: data.id, title: data.title, content: data.content, mediaUrl: data.mediaUrl } 
        }));
      }
    } catch (e) {
      console.error("Passage fetch failed", e);
    } finally {
      setLoadingPassage(false);
    }
  };

  const handleAction = async (decision: 'APPROVE' | 'REJECT') => {
    if (decision === 'REJECT' && feedback.trim().length < 10) return toast.error("Please provide detailed feedback.");
    
    setIsProcessing(true);
    const token = localStorage.getItem('token');
    const newStatus = decision === 'APPROVE' ? 'APPROVED' : 'CHANGES_REQUESTED';

    try {
      const res = await fetch(`${API_URL}/questions/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          ...item, 
          status: newStatus,
          // 🛠️ DATA INTEGRITY FIX: Send feedback in dedicated field, keep explanation clean
          reviewerNotes: decision === 'REJECT' ? feedback : null,
          explanation: item.explanation, 
          points: Number(item.points)
        })
      });

      if (res.status === 401) { handleAuthError(); return; }

      if (res.ok) {
        toast.success(decision === 'APPROVE' ? "Item Approved!" : "Sent for changes.");
        
        // 🛠️ FIX: Tell the parent to remove the item from the local array
        const processedId = item.id!;
        onItemProcessed(processedId);

        // 🛠️ WORKFLOW FIX: Handle movement to the next item
        if (items.length > 1) {
            setShowRejectModal(false);
            setFeedback("");
            
            // If we processed the last item in the list, move the index back by one
            if (idx >= items.length - 1) {
                setIdx(Math.max(0, idx - 1));
            }
            // Note: If we weren't at the end, the parent list update (removal) 
            // naturally shifts the next item into the current index position, 
            // so the useEffect will trigger a refresh of the current view automatically.
        } else {
            onRefresh(); // Last item in queue processed, return to dashboard
        }
      }
    } catch (error) {
       toast.error("An error occurred during update.");
    } finally { setIsProcessing(false); }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      <header className="border-b px-8 py-3 bg-white flex items-center justify-between shadow-sm z-50">
        <div className="flex items-center gap-6">
            <button onClick={onBack} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-indigo-600 transition-colors">
                <ArrowLeft size={16} /> Exit Review
            </button>
            <div className="flex items-center gap-2 bg-slate-100 px-4 py-1.5 rounded-full border shadow-inner">
                <button disabled={idx === 0} onClick={() => setIdx(idx - 1)} className="disabled:opacity-20 hover:text-indigo-600 transition-colors"><ChevronLeft size={18}/></button>
                {/* 🛠️ COUNTER FIX: items.length now dynamically updates via onItemProcessed */}
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-tighter w-24 text-center">Item {idx + 1} of {items.length}</span>
                <button disabled={idx === items.length - 1} onClick={() => setIdx(idx + 1)} className="disabled:opacity-20 hover:text-indigo-600 transition-colors"><ChevronRight size={18}/></button>
            </div>
        </div>
        <div className="flex items-center gap-3">
            <button onClick={() => setShowRejectModal(true)} className="flex items-center gap-2 px-5 py-2 rounded-lg border border-red-200 text-red-700 text-[10px] font-black uppercase hover:bg-red-50 transition-all">
                <XCircle size={14} /> Request Changes
            </button>
            <button onClick={() => handleAction('APPROVE')} disabled={isProcessing} className="flex items-center gap-2 px-8 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 text-[10px] font-black uppercase shadow-lg shadow-green-100 transition-all border-none">
                {isProcessing ? <Loader2 className="animate-spin h-4 w-4" /> : <CheckCircle size={14} />} Approve Item
            </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-[3] overflow-y-auto p-10 bg-slate-50/50">
            {loadingPassage ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pulse max-w-7xl mx-auto">
                    <div className="h-[700px] bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-4">
                        <div className="h-6 w-1/3 bg-slate-100 rounded" />
                        <div className="h-40 w-full bg-slate-50 rounded-xl" />
                        <div className="space-y-2">
                            <div className="h-4 w-full bg-slate-100 rounded" />
                            <div className="h-4 w-5/6 bg-slate-100 rounded" />
                        </div>
                    </div>
                    <div className="h-[700px] bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-4">
                        <div className="h-6 w-1/4 bg-slate-100 rounded" />
                        <div className="h-4 w-full bg-slate-100 rounded" />
                        <div className="space-y-3 pt-8">
                            {[1,2,3,4].map(i => <div key={i} className="h-12 w-full bg-slate-50 rounded-lg border" />)}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="animate-in fade-in duration-500">
                    <StudentPreview question={item} onBack={onBack} />
                </div>
            )}
        </div>

        <aside className="w-96 bg-white border-l overflow-y-auto p-8 space-y-10 shadow-[-4px_0_24px_rgba(0,0,0,0.02)]">
            <section>
                <div className="flex items-center gap-2 mb-4 text-slate-900">
                    <Target size={18} className="text-indigo-600" />
                    <h3 className="text-[10px] font-black uppercase tracking-widest">Alignment Standards</h3>
                </div>
                <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 shadow-sm">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Standard Codes</p>
                        <p className="font-bold text-slate-700 text-sm leading-relaxed">{item.standards?.join(', ') || 'No standards linked'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 rounded-xl bg-indigo-50/30 border border-indigo-100 text-center">
                            <p className="text-[9px] font-black text-indigo-400 uppercase mb-1">Depth of Knowledge</p>
                            <p className="font-black text-indigo-600 text-lg">{item.dokLevel?.split('_')[1] || item.dokLevel}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-indigo-50/30 border border-indigo-100 text-center">
                            <p className="text-[9px] font-black text-indigo-400 uppercase mb-1">Point Value</p>
                            <p className="font-black text-indigo-600 text-lg">{item.points}</p>
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <div className="flex items-center gap-2 mb-4 text-slate-900">
                    <BarChart3 size={18} className="text-indigo-600" />
                    <h3 className="text-[10px] font-black uppercase tracking-widest">Pedagogical Framework</h3>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 shadow-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Bloom's Taxonomy</p>
                    <p className="font-bold text-slate-700 text-sm uppercase tracking-tight">{item.bloomsTaxonomy}</p>
                </div>
            </section>

            <section>
                <div className="flex items-center gap-2 mb-4 text-slate-900">
                    <Info size={18} className="text-indigo-600" />
                    <h3 className="text-[10px] font-black uppercase tracking-widest">Teacher Rationale</h3>
                </div>
                <div 
                    className="p-5 rounded-xl border border-slate-100 bg-slate-50/50 prose prose-sm font-medium text-slate-600 leading-relaxed italic shadow-inner" 
                    dangerouslySetInnerHTML={{ __html: item.explanation || "No rationale provided." }} 
                />
            </section>
        </aside>
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-8 border-b bg-red-50/50 flex items-center gap-4">
                    <div className="p-3 bg-red-100 rounded-2xl text-red-600 shadow-sm"><AlertCircle size={24}/></div>
                    <div>
                        <h3 className="text-xl font-black text-red-900 uppercase tracking-tight">Reviewer Comments</h3>
                        <p className="text-sm text-red-700/60 font-medium italic leading-tight">Detail the fixes required for the author.</p>
                    </div>
                </div>
                <div className="p-8">
                    <textarea 
                        className="w-full p-6 border border-slate-200 rounded-2xl bg-slate-50 h-56 outline-none focus:ring-4 focus:ring-red-500/10 text-sm font-medium transition-all shadow-inner"
                        placeholder="Detail the changes here..."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        maxLength={1000}
                    />
                    <div className="flex justify-end mt-3"><span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{feedback.length} / 1000 Characters</span></div>
                </div>
                <div className="p-8 bg-slate-50 border-t flex justify-end gap-4">
                    <button onClick={() => setShowRejectModal(false)} className="px-6 py-2 text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 transition-colors">Cancel</button>
                    <button onClick={() => handleAction('REJECT')} className="px-8 py-2.5 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2 shadow-lg shadow-red-100 hover:bg-red-700 hover:-translate-y-0.5 active:translate-y-0 transition-all border-none">
                        <Send size={14} /> Send & Return to Creator
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}