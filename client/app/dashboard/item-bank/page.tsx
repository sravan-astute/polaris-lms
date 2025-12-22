"use client";

import React, { useState, useEffect } from "react";
// Import from the component we just updated
import QuestionBuilder, { QuestionData } from "../../components/QuestionBuilder";
import { 
  Search, Plus, Trash2, Edit, AlertCircle, Copy, 
  ChevronLeft, ChevronRight, Loader2, Filter
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

// --- CONSTANTS ---
const SUBJECT_LABELS: Record<string, string> = {
  MATH: "Mathematics",
  ELA: "English Language Arts",
  SCIENCE: "Science",
  SOCIAL_STUDIES: "Social Studies",
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000';

export default function ItemBankPage() {
  const { theme } = useTheme();

  // --- STATE ---
  const [viewMode, setViewMode] = useState<'LIST' | 'EDITOR'>('LIST');
  const [loading, setLoading] = useState(true);
  
  // Data
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<QuestionData[]>([]);
  
  const [editingQuestion, setEditingQuestion] = useState<QuestionData | undefined>(undefined);
  const [filters, setFilters] = useState({ subject: "ALL", status: "ALL", search: "" });
  
  // Pagination
  const [page, setPage] = useState(1);
  const LIMIT = 10; 

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // --- 1. LOAD DATA ---
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
            // 🛠️ MAPPING FIX: Unwrap 'options' from 'data' container
            const cleanData = rawData.map((q: any) => ({
                ...q,
                // Pull options from JSON column or fallback
                options: q.data?.options || q.options || [],
                // Ensure code exists
                code: q.code || "PENDING"
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

  // --- 2. FILTER LOGIC ---
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
            q.code?.toLowerCase().includes(term) || // Allow searching by Item Code
            q.standards?.some(s => s.toLowerCase().includes(term))
        );
    }

    // Sort by Newest First
    result = [...result].reverse();

    setFilteredQuestions(result);
    setPage(1); 
  }, [questions, filters]);

  // --- PAGINATION ---
  const totalPages = Math.ceil(filteredQuestions.length / LIMIT);
  const paginatedQuestions = filteredQuestions.slice((page - 1) * LIMIT, page * LIMIT);

  // --- HELPERS: STATUS COLORS ---
  const getStatusStyle = (status: string) => {
    switch (status) {
        case 'PUBLISHED': return 'bg-green-100 text-green-700 border-green-200';
        case 'APPROVED': return 'bg-teal-100 text-teal-700 border-teal-200';
        case 'PENDING_REVIEW': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'CHANGES_REQUESTED': return 'bg-orange-100 text-orange-800 border-orange-200';
        default: return 'bg-gray-100 text-gray-600 border-gray-200'; // DRAFT
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

  // --- HANDLERS ---
  const handleSave = async (data: QuestionData) => {
    // 1. Token Logic (with sanitizer)
    const rawToken = localStorage.getItem('token');
    const token = rawToken 
        ? rawToken.replace('Bearer ', '').replace('bearer ', '').trim() 
        : null;

    console.log("🔍 Attempting to save...");
    
    // 2. Client-side Auth Check
    if (!token) {
        alert("⛔ AUTH ERROR: You are not logged in.\nPlease go to the Login page and sign in again.");
        return;
    }

    // ---------------------------------------------------------
    // 🛠️ THE FIX: DATA TRANSFORMATION
    // ---------------------------------------------------------
    // Convert 'tags' string to Array ["tag1", "tag2"]
    const payload = {
        ...data,
        tags: typeof data.tags === 'string' 
            ? data.tags.split(',').map(t => t.trim()).filter(t => t !== '') 
            : [], 
        points: Number(data.points) // Ensure points is a Number
    };
    // ---------------------------------------------------------

    try {
        const method = data.id ? 'PATCH' : 'POST';
        const url = data.id ? `${API_URL}/questions/${data.id}` : `${API_URL}/questions`;

        const res = await fetch(url, {
            method,
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload) // 👈 SEND 'payload', NOT 'data'
        });

        if (res.ok) {
            console.log("✅ Save Successful!");
            await fetchQuestions(); // Reload list
            setViewMode("LIST");
            setEditingQuestion(undefined);
        } else {
            if (res.status === 401) {
                alert("⏳ SESSION EXPIRED: Your login token is no longer valid.\nPlease refresh the page and log in again.");
            } else {
                const errorText = await res.text();
                console.error("❌ Server Error:", errorText);
                alert(`Failed to save item.\nServer says: ${errorText}`);
            }
        }
    } catch (error) {
        console.error("🔥 Network/Save error", error);
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
      delete copy.code; // Let backend generate new code
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

  // --- RENDER ---
  if (loading && questions.length === 0) {
      return <div className="h-full flex items-center justify-center opacity-50"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className={`h-full flex flex-col ${theme.bg} ${theme.text}`}>
        
        {/* HEADER */}
        <header className={`px-8 py-4 flex justify-between items-center shadow-sm z-20 border-b ${theme.paper} ${theme.border}`}>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Item Bank</h1>
            <p className="text-sm opacity-60 mt-1">
                {questions.length === 0 ? "Your bank is empty." : `Found ${filteredQuestions.length} assets.`}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             {viewMode === 'LIST' && (
                <button 
                    onClick={() => { setEditingQuestion(undefined); setViewMode('EDITOR'); }} 
                    className={`flex items-center gap-2 px-5 py-2 text-white text-sm font-medium rounded-lg shadow-sm transition-all ${theme.accent}`}
                >
                    <Plus size={18} /> Create New
                </button>
             )}
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 overflow-auto p-8">
          {viewMode === 'LIST' ? (
            <div className="space-y-6">
              
              {/* FILTERS */}
              <div className={`p-4 rounded-xl shadow-sm border flex flex-wrap gap-4 items-end ${theme.paper} ${theme.border}`}>
                
                {/* Search */}
                <div className="flex-1 min-w-[240px]">
                   <label className="text-xs font-bold opacity-50 uppercase mb-1 block">Keywords or Code</label>
                   <div className="relative">
                    <Search className="absolute left-3 top-2.5 opacity-40" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search text or ITEM-ID..." 
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg outline-none text-sm focus:ring-2 ${theme.input}`}
                        value={filters.search} 
                        onChange={(e) => setFilters({...filters, search: e.target.value})} 
                    />
                   </div>
                </div>

                {/* Subject */}
                <div className="w-40">
                    <label className="text-xs font-bold opacity-50 uppercase mb-1 block">Subject</label>
                    <select 
                        className={`w-full p-2 border rounded-lg text-sm outline-none ${theme.input}`}
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

                {/* Status (UPDATED) */}
                <div className="w-48">
                    <label className="text-xs font-bold opacity-50 uppercase mb-1 block">Status</label>
                    <div className="relative">
                        <Filter className="absolute left-2.5 top-2.5 opacity-40" size={14} />
                        <select 
                            className={`w-full pl-8 p-2 border rounded-lg text-sm outline-none ${theme.input}`}
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

              {/* TABLE */}
              <div className={`border rounded-xl shadow-sm overflow-hidden ${theme.paper} ${theme.border}`}>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`border-b text-xs font-bold opacity-50 uppercase ${theme.bg} ${theme.border}`}>
                      <th className="py-4 px-6 w-12">
                          <input 
                            type="checkbox" 
                            onChange={handleSelectAll} 
                            checked={paginatedQuestions.length > 0 && selectedIds.size === paginatedQuestions.length}
                            className="rounded border-gray-300"
                          />
                      </th>
                      <th className="py-4 px-6 w-32">Item Code</th>
                      <th className="py-4 px-6">Question</th>
                      <th className="py-4 px-6 w-40">Status</th>
                      <th className="py-4 px-6 w-32">Subject</th>
                      <th className="py-4 px-6 w-24 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${theme.border === 'border-slate-200' ? 'divide-slate-100' : 'divide-slate-800'}`}>
                    {filteredQuestions.length === 0 ? ( 
                        <tr><td colSpan={6} className="p-12 text-center opacity-50">
                            <div className="flex flex-col items-center">
                                <AlertCircle className="mb-2 opacity-30" />
                                {questions.length === 0 ? "No items yet. Create one!" : "No items match your filters."}
                            </div>
                        </td></tr> 
                    ) 
                    : ( paginatedQuestions.map((q) => (
                        <tr key={q.id} className={`hover:opacity-80 transition-colors group ${selectedIds.has(q.id!) ? 'bg-indigo-50/50' : ''}`}>
                          <td className="py-4 px-6">
                              <input 
                                type="checkbox" 
                                checked={selectedIds.has(q.id!)}
                                onChange={() => handleSelectOne(q.id!)}
                                className="rounded border-gray-300"
                              />
                          </td>
                          <td className="py-4 px-6 font-mono text-xs opacity-70">
                              {(q as any).code || "---"}
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-medium truncate max-w-md cursor-pointer hover:underline" onClick={() => { setEditingQuestion(q); setViewMode("EDITOR"); }}>
                                {q.text}
                            </div>
                            <div className="text-xs opacity-60 mt-1 flex gap-2">
                                <span className="uppercase">{q.type.replace('_',' ')}</span>
                                <span>•</span>
                                <span>G{q.gradeLevels?.join(', ') || "?"}</span> 
                            </div>
                          </td>
                          {/* UPDATED STATUS BADGE */}
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide border ${getStatusStyle(q.status)}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${getStatusDot(q.status)}`} />
                                {q.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border bg-black/5 ${theme.border}`}>
                              {SUBJECT_LABELS[q.subject] || q.subject}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right relative">
                             <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleDuplicate(q)} title="Duplicate" className="p-1.5 opacity-50 hover:opacity-100 hover:text-indigo-600 rounded">
                                    <Copy size={16} />
                                </button>
                                <button onClick={() => { setEditingQuestion(q); setViewMode("EDITOR"); }} title="Edit" className="p-1.5 opacity-50 hover:opacity-100 hover:text-indigo-600 rounded">
                                    <Edit size={16} />
                                </button>
                                <button onClick={() => handleDelete([q.id!])} title="Delete" className="p-1.5 opacity-50 hover:opacity-100 hover:text-red-600 rounded">
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

              {/* PAGINATION */}
              <div className="flex justify-between items-center py-4">
                  <div className="text-sm opacity-50">
                      Showing {paginatedQuestions.length} of {filteredQuestions.length} results
                  </div>
                  <div className="flex items-center gap-2">
                      <button 
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className={`p-2 border rounded-lg hover:bg-black/5 disabled:opacity-30 ${theme.border}`}
                      >
                          <ChevronLeft size={16} />
                      </button>
                      <span className="text-sm font-bold px-2">Page {page} of {totalPages || 1}</span>
                      <button 
                          disabled={page >= totalPages}
                          onClick={() => setPage(p => p + 1)}
                          className={`p-2 border rounded-lg hover:bg-black/5 disabled:opacity-30 ${theme.border}`}
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
    </div>
  );
}