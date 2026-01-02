"use client";

import React, { useState, useEffect } from "react";
import QuestionBuilder, { QuestionData } from "../../components/QuestionBuilder";
import { 
  Search, Plus, Trash2, Edit, AlertCircle, Copy, 
  ChevronLeft, ChevronRight, Loader2, Filter, AlertTriangle
} from "lucide-react"; 
import { useTheme } from "../../context/ThemeContext";

const SUBJECT_LABELS: Record<string, string> = {
  MATH: "Mathematics",
  ELA: "English Language Arts",
  SCIENCE: "Science",
  SOCIAL_STUDIES: "Social Studies",
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000';

export default function ItemBankPage() {
  const { theme, themeKey } = useTheme(); // 🛠️ Added themeKey for specific logic if needed

  const [viewMode, setViewMode] = useState<'LIST' | 'EDITOR'>('LIST');
  const [loading, setLoading] = useState(true);
  
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<QuestionData[]>([]);
  
  const [editingQuestion, setEditingQuestion] = useState<QuestionData | undefined>(undefined);
  const [filters, setFilters] = useState({ subject: "ALL", status: "ALL", search: "" });
  
  const [page, setPage] = useState(1);
  const LIMIT = 10; 

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token'); 
      const res = await fetch(`${API_URL}/questions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const rawData = await res.json();
        if (Array.isArray(rawData)) {
            const cleanData = rawData.map((q: any) => ({
                ...q,
                options: q.data?.options || q.options || [],
                code: q.code || "PENDING",
                reviewerNotes: q.reviewerNotes || q.data?.reviewerNotes || "",
                passage: q.passage || null,
                passageId: q.passageId || q.passage?.id || null
            }));
            setQuestions(cleanData);
        } else {
            setQuestions([]); 
        }
      } else {
        setQuestions([]); 
      }
    } catch (e) {
      console.error("Error loading questions", e);
      setQuestions([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    let result = Array.isArray(questions) ? questions : [];

    if (filters.subject !== "ALL") {
        result = result.filter(q => q.subject === filters.subject);
    }

    if (filters.status !== "ALL") {
        result = result.filter(q => q.status === filters.status);
    }

    if (filters.search.trim()) {
        const term = filters.search.toLowerCase();
        result = result.filter(q => 
            q.text.toLowerCase().includes(term) || 
            q.code?.toLowerCase().includes(term) || 
            q.standards?.some(s => s.toLowerCase().includes(term))
        );
    }

    result = [...result].reverse();
    setFilteredQuestions(result);
    setPage(1); 
  }, [questions, filters]);

  const totalPages = Math.ceil(filteredQuestions.length / LIMIT);
  const paginatedQuestions = filteredQuestions.slice((page - 1) * LIMIT, page * LIMIT);

  const getStatusStyle = (status: string) => {
    // 🛠️ Modified to ensure high contrast even in custom themes
    switch (status) {
        case 'PUBLISHED': return themeKey === 'CONTRAST' ? 'border-green-400 text-green-400' : 'bg-green-100 text-green-700 border-green-200';
        case 'APPROVED': return themeKey === 'CONTRAST' ? 'border-teal-400 text-teal-400' : 'bg-teal-100 text-teal-700 border-teal-200';
        case 'PENDING_REVIEW': return themeKey === 'CONTRAST' ? 'border-blue-400 text-blue-400' : 'bg-blue-100 text-blue-700 border-blue-200';
        case 'CHANGES_REQUESTED': return themeKey === 'CONTRAST' ? 'border-orange-400 text-orange-400' : 'bg-orange-100 text-orange-800 border-orange-200';
        default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
        case 'PUBLISHED': return 'bg-green-500';
        case 'APPROVED': return 'bg-teal-500';
        case 'PENDING_REVIEW': return 'bg-blue-500';
        case 'CHANGES_REQUESTED': return 'bg-orange-500';
        default: return 'bg-gray-400';
    }
  };

  const handleSave = async (data: QuestionData) => {
    const rawToken = localStorage.getItem('token');
    const token = rawToken 
        ? rawToken.replace('Bearer ', '').replace('bearer ', '').trim() 
        : null;

    if (!token) {
        alert("⛔ AUTH ERROR: You are not logged in.\nPlease go to the Login page and sign in again.");
        return;
    }

    const payload = {
        ...data,
        tags: typeof data.tags === 'string' 
            ? data.tags.split(',').map(t => t.trim()).filter(t => t !== '') 
            : data.tags, 
        points: Number(data.points),
        passageId: data.passageId || (data as any).passage?.id || null
    };

    try {
        const method = data.id ? 'PATCH' : 'POST';
        const url = data.id ? `${API_URL}/questions/${data.id}` : `${API_URL}/questions`;

        const res = await fetch(url, {
            method,
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            await fetchQuestions(); 
            setViewMode("LIST");
            setEditingQuestion(undefined);
        } else {
            const errorText = await res.text();
            alert(`Failed to save item.\nServer says: ${errorText}`);
        }
    } catch (error) {
        alert("Network Error: Could not reach the server.");
    }
  };

  const handleDelete = async (ids: string[]) => {
      if (!confirm(`Are you sure you want to delete ${ids.length} item(s)?`)) return;
      const token = localStorage.getItem('token');
      try {
          for (const id of ids) {
             await fetch(`${API_URL}/questions/${id}`, {
                 method: 'DELETE',
                 headers: { Authorization: `Bearer ${token}` }
             });
          }
          await fetchQuestions();
          setSelectedIds(new Set());
      } catch (error) {
          console.error("Delete error", error);
      }
  };

  const handleDuplicate = (q: QuestionData) => {
      const copy = { ...q };
      delete copy.id; 
      delete (copy as any).code; 
      copy.text = `${copy.text} (Copy)`;
      copy.status = "DRAFT"; 
      setEditingQuestion(copy);
      setViewMode("EDITOR");
  };

  const handleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(paginatedQuestions.map(q => q.id!)));
    } else {
      setSelectedIds(new Set());
    }
  };

  if (loading && questions.length === 0) {
      return <div className="h-full flex items-center justify-center opacity-50"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className={`space-y-6 ${theme.text}`}>
        {/* HEADER SECTION */}
        <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Item Bank</h1>
              <p className="text-sm opacity-60">
                  {questions.length === 0 ? "Your bank is empty." : `Found ${filteredQuestions.length} assets.`}
              </p>
            </div>
            {viewMode === 'LIST' && (
              <button 
                  onClick={() => { setEditingQuestion(undefined); setViewMode('EDITOR'); }} 
                  className={`flex items-center gap-2 px-5 py-2 text-white text-sm font-medium rounded-lg shadow-sm transition-all ${theme.accent}`}
              >
                  <Plus size={18} /> Create New
              </button>
            )}
        </div>

        {/* CONTENT SECTION */}
        {viewMode === 'LIST' ? (
          <div className="space-y-6">
            {/* 🔍 FILTERS - Fixed with theme.input for visibility */}
            <div className={`p-4 rounded-xl shadow-sm border flex flex-wrap gap-4 items-end transition-colors duration-300 ${theme.paper} ${theme.border}`}>
              <div className="flex-1 min-w-[240px]">
                  <label className="text-xs font-bold opacity-50 uppercase mb-1 block">Keywords or Code</label>
                  <div className="relative">
                   <Search className="absolute left-3 top-2.5 opacity-40" size={16} />
                   <input 
                       type="text" 
                       placeholder="Search text or ITEM-ID..." 
                       className={`w-full pl-10 pr-4 py-2 border rounded-lg outline-none text-sm transition-all focus:ring-2 ${theme.input} ${theme.border}`}
                       value={filters.search} 
                       onChange={(e) => setFilters({...filters, search: e.target.value})} 
                   />
                  </div>
              </div>

              <div className="w-40">
                  <label className="text-xs font-bold opacity-50 uppercase mb-1 block">Subject</label>
                  <select 
                      className={`w-full p-2 border rounded-lg text-sm outline-none transition-all ${theme.input} ${theme.border}`}
                      value={filters.subject}
                      onChange={(e) => setFilters({...filters, subject: e.target.value})}
                  >
                      <option value="ALL">All Subjects</option>
                      <option value="MATH">Math</option>
                      <option value="ELA">ELA</option>
                      <option value="SCIENCE">Science</option>
                      <option value="SOCIAL_STUDIES">Social Studies</option>
                  </select>
              </div>

              <div className="w-48">
                  <label className="text-xs font-bold opacity-50 uppercase mb-1 block">Status</label>
                  <div className="relative">
                      <Filter className="absolute left-2.5 top-2.5 opacity-40" size={14} />
                      <select 
                          className={`w-full pl-8 p-2 border rounded-lg text-sm outline-none transition-all ${theme.input} ${theme.border}`}
                          value={filters.status}
                          onChange={(e) => setFilters({...filters, status: e.target.value})}
                      >
                          <option value="ALL">All Statuses</option>
                          <option value="DRAFT">Drafts</option>
                          <option value="PENDING_REVIEW">Pending Review</option>
                          <option value="CHANGES_REQUESTED">Changes Requested</option>
                          <option value="APPROVED">Approved</option>
                          <option value="PUBLISHED">Published</option>
                      </select>
                  </div>
              </div>
            </div>

            {/* 📊 TABLE - Fixed backgrounds and header borders */}
            <div className={`border rounded-xl shadow-sm overflow-hidden transition-colors duration-300 ${theme.paper} ${theme.border}`}>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b text-xs font-bold opacity-60 uppercase ${theme.bg} ${theme.border}`}>
                    <th className="py-4 px-6 w-12">
                        <input 
                          type="checkbox" 
                          onChange={handleSelectAll} 
                          checked={paginatedQuestions.length > 0 && selectedIds.size === paginatedQuestions.length}
                          className={`rounded ${theme.border}`}
                        />
                    </th>
                    <th className="py-4 px-6 w-32">Item Code</th>
                    <th className="py-4 px-6">Question</th>
                    <th className="py-4 px-6 w-44">Status</th>
                    <th className="py-4 px-6 w-32">Subject</th>
                    <th className="py-4 px-6 w-24 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${theme.border}`}>
                  {filteredQuestions.length === 0 ? ( 
                      <tr><td colSpan={6} className="p-12 text-center opacity-50">
                          <div className="flex flex-col items-center">
                              <AlertCircle className="mb-2 opacity-30" />
                              {questions.length === 0 ? "No items yet. Create one!" : "No items match your filters."}
                          </div>
                      </td></tr> 
                  ) 
                  : ( paginatedQuestions.map((q) => (
                      <tr key={q.id} className={`transition-colors group hover:opacity-90 ${selectedIds.has(q.id!) ? 'bg-indigo-50/10' : ''}`}>
                        <td className="py-4 px-6">
                            <input 
                              type="checkbox" 
                              checked={selectedIds.has(q.id!)}
                              onChange={() => handleSelectOne(q.id!)}
                              className={`rounded ${theme.border}`}
                            />
                        </td>
                        <td className="py-4 px-6 font-mono text-xs opacity-70">
                            {(q as any).code || "---"}
                        </td>
                        <td className="py-4 px-6">
                          <div className={`font-medium truncate max-w-md cursor-pointer hover:underline flex items-center gap-2 ${theme.text}`} onClick={() => { setEditingQuestion(q); setViewMode("EDITOR"); }}>
                              {q.status === 'CHANGES_REQUESTED' && (
                                  <AlertTriangle size={14} className="text-orange-500 shrink-0" />
                              )}
                              {q.text.replace(/<[^>]*>/g, '')} 
                          </div>
                          <div className="text-xs opacity-60 mt-1 flex gap-2 uppercase tracking-tight">
                              <span>{q.type.replace('_',' ')}</span>
                              <span className="opacity-30">•</span>
                              <span>Grade {q.gradeLevels?.join(', ') || "?"}</span> 
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide border shadow-sm ${getStatusStyle(q.status)}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${getStatusDot(q.status)}`} />
                              {q.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                            <span 
                              className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border transition-colors
                                ${themeKey === 'CONTRAST' 
                                  ? 'border-yellow-400 text-yellow-400 bg-black' 
                                  : `${theme.border} ${theme.text} bg-transparent` 
                                }`}
                            >
                              {/* Enforce a clean, non-split accent color for the indicator dot */}
                              <div className={`w-1.5 h-1.5 rounded-full mr-2 ${themeKey === 'CONTRAST' ? 'bg-yellow-400' : theme.accent.includes('indigo') ? 'bg-indigo-500' : 'bg-current opacity-60'}`} />
                              {SUBJECT_LABELS[q.subject] || q.subject}
                            </span>
                          </td>
                        <td className="py-4 px-6 text-right relative">
                           <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleDuplicate(q)} title="Duplicate" className="p-1.5 transition-colors opacity-60 hover:opacity-100 hover:text-indigo-500">
                                  <Copy size={16} />
                              </button>
                              <button onClick={() => { setEditingQuestion(q); setViewMode("EDITOR"); }} title="Edit" className="p-1.5 transition-colors opacity-60 hover:opacity-100 hover:text-indigo-500">
                                  <Edit size={16} />
                              </button>
                              <button onClick={() => handleDelete([q.id!])} title="Delete" className="p-1.5 transition-colors opacity-60 hover:opacity-100 hover:text-red-500">
                                  <Trash2 size={16} />
                              </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 📄 PAGINATION */}
            <div className="flex justify-between items-center py-4">
                <div className="text-sm opacity-50 italic">
                    Showing {paginatedQuestions.length} of {filteredQuestions.length} results
                </div>
                <div className="flex items-center gap-2">
                    <button 
                      disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}
                      className={`p-2 border rounded-lg transition-colors hover:bg-black/5 disabled:opacity-20 ${theme.border}`}
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-sm font-bold px-4">Page {page} of {totalPages || 1}</span>
                    <button 
                        disabled={page >= totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className={`p-2 border rounded-lg transition-colors hover:bg-black/5 disabled:opacity-20 ${theme.border}`}
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
          </div>
        ) : (
          <QuestionBuilder 
            initialData={editingQuestion}
            onSave={handleSave} 
            onCancel={() => { setViewMode('LIST'); setEditingQuestion(undefined); }}
          />
        )}
    </div>
  );
}