"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  CheckCircle, Loader2, FileText, Search, BookOpen, X, ChevronRight, User, Calendar, Filter
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { toast } from "sonner";
import { QuestionData } from "../../components/QuestionBuilder";
import ReviewDetailView from "./ReviewDetailView";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000';

export default function ReviewQueuePage() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<QuestionData[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  
  const [filters, setFilters] = useState({ 
    search: "", subject: "ALL", grade: "ALL", type: "ALL", difficulty: "ALL" 
  });

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/questions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const rawData = await res.json();
        setReviews(rawData.filter((q: any) => q.status === 'PENDING_REVIEW').map((q: any) => ({
          ...q,
          options: q.data?.options || q.options || [],
          code: q.code || "PENDING"
        })));
      }
    } catch (e) { toast.error("Failed to load queue."); } finally { setLoading(false); }
  };

  useEffect(() => { fetchReviews(); }, []);

  // 🛠️ REMOVAL HANDLER: Updates the list locally when an item is processed in Detail View
  const handleRemoveItem = (id: string) => {
    setReviews(prev => prev.filter(q => q.id !== id));
  };

  // 🛠️ BULK APPROVE: Approves every item in a passage group at once
  const handleBulkApprove = async (passageItems: QuestionData[]) => {
    const token = localStorage.getItem('token');
    const loadingToast = toast.loading(`Approving ${passageItems.length} items...`);
    try {
      const promises = passageItems.map(item => 
        fetch(`${API_URL}/questions/${item.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ ...item, status: 'APPROVED', points: Number(item.points) })
        })
      );
      await Promise.all(promises);
      toast.success(`Successfully approved ${passageItems.length} items!`, { id: loadingToast });
      const approvedIds = passageItems.map(i => i.id);
      setReviews(prev => prev.filter(q => !approvedIds.includes(q.id)));
    } catch (e) {
      toast.error("Bulk approval failed.", { id: loadingToast });
    }
  };

  const filteredItems = useMemo(() => {
    return reviews.filter(item => {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = item.code?.toLowerCase().includes(searchLower) || 
                            item.text?.toLowerCase().includes(searchLower) ||
                            item.passage?.title?.toLowerCase().includes(searchLower);
      const matchesSubject = filters.subject === "ALL" || item.subject === filters.subject;
      const matchesGrade = filters.grade === "ALL" || item.gradeLevels.includes(filters.grade);
      const matchesType = filters.type === "ALL" || item.type === filters.type;
      const matchesDiff = filters.difficulty === "ALL" || item.difficulty === filters.difficulty;
      return matchesSearch && matchesSubject && matchesGrade && matchesType && matchesDiff;
    });
  }, [reviews, filters]);

  const groupedByPassage = useMemo(() => {
    const groups: Record<string, QuestionData[]> = {};
    filteredItems.forEach(item => {
      const title = item.passage?.title || "Standalone Questions";
      if (!groups[title]) groups[title] = [];
      groups[title].push(item);
    });
    return groups;
  }, [filteredItems]);

  if (selectedIdx !== null) {
    return (
      <ReviewDetailView 
        items={filteredItems} 
        initialIndex={selectedIdx}
        onBack={() => setSelectedIdx(null)} 
        onItemProcessed={handleRemoveItem}
        onRefresh={() => { setSelectedIdx(null); fetchReviews(); }} 
      />
    );
  }

  return (
    <div className={`h-full flex flex-col ${theme.bg} ${theme.text} p-8`}>
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Review Queue</h1>
        <p className="text-slate-500 mt-1">Found {filteredItems.length} items waiting for approval.</p>
      </header>

      <div className="bg-white border rounded-xl shadow-sm p-4 mb-8 space-y-4">
        <div className="flex gap-4 items-center">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20" 
                    placeholder="Search Item Code, Passage, or Question Content..." value={filters.search} onChange={(e) => setFilters({...filters, search: e.target.value})} />
            </div>
            <button onClick={() => setFilters({search: "", subject: "ALL", grade: "ALL", type: "ALL", difficulty: "ALL"})} className="text-xs font-black uppercase text-slate-400 hover:text-red-500 flex items-center gap-1 shrink-0"><X size={14} /> Reset Filters</button>
        </div>
        <div className="flex flex-wrap gap-3 pt-2 border-t">
            <select className="flex-1 p-2 border rounded-lg text-xs font-bold bg-white outline-none" value={filters.subject} onChange={(e) => setFilters({...filters, subject: e.target.value})}>
                <option value="ALL">All Subjects</option>
                <option value="ELA">ELA / Reading</option><option value="MATH">Mathematics</option>
            </select>
            <select className="flex-1 p-2 border rounded-lg text-xs font-bold bg-white outline-none" value={filters.grade} onChange={(e) => setFilters({...filters, grade: e.target.value})}>
                <option value="ALL">All Grades</option>
                {["K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"].map(g => (<option key={g} value={g}>Grade {g}</option>))}
            </select>
            <select className="flex-1 p-2 border rounded-lg text-xs font-bold bg-white outline-none" value={filters.type} onChange={(e) => setFilters({...filters, type: e.target.value})}>
                <option value="ALL">All Types</option><option value="MULTIPLE_CHOICE">Multiple Choice</option><option value="SHORT_ANSWER">Short Answer</option>
            </select>
            <select className="flex-1 p-2 border rounded-lg text-xs font-bold bg-white outline-none" value={filters.difficulty} onChange={(e) => setFilters({...filters, difficulty: e.target.value})}>
                <option value="ALL">All Difficulties</option><option value="EASY">Easy</option><option value="MEDIUM">Medium</option><option value="HARD">Hard</option>
            </select>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>
      ) : (
        <div className="space-y-8 overflow-y-auto pb-20">
          {Object.entries(groupedByPassage).map(([title, items]) => (
            <div key={title} className="space-y-3">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2 text-indigo-600">
                    <BookOpen size={16} />
                    <h2 className="text-xs font-black uppercase tracking-widest">{title}</h2>
                    <span className="text-[10px] bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">{items.length} Questions</span>
                </div>
                {title !== "Standalone Questions" && (
                    <button onClick={() => handleBulkApprove(items)} className="flex items-center gap-1 text-[10px] font-black uppercase text-green-600 hover:bg-green-50 px-2 py-1 rounded transition-all">
                        <CheckCircle size={12} /> Bulk Approve Passage Items
                    </button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-3">
                {items.map(item => (
                  <div key={item.id} className="p-5 rounded-xl border bg-white flex justify-between items-center hover:border-indigo-400 transition-all shadow-sm">
                    <div className="flex gap-6 items-center">
                        <div className="p-3 bg-slate-50 rounded-lg text-slate-300"><FileText size={24} /></div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-100 px-1.5 py-0.5 rounded">{item.code}</span>
                                <span className="text-[10px] font-black text-indigo-600 uppercase bg-indigo-50 px-1.5 py-0.5 rounded">{item.type.replace('_', ' ')}</span>
                            </div>
                            <h3 className="font-bold text-slate-800 line-clamp-1 text-lg" dangerouslySetInnerHTML={{ __html: item.text }} />
                        </div>
                    </div>
                    <button onClick={() => setSelectedIdx(filteredItems.indexOf(item))} className="px-8 py-2.5 bg-indigo-600 text-white rounded-lg text-xs font-black uppercase flex items-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                      Begin Review <ChevronRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}