"use client";

import React, { useState, useEffect } from "react";
import QuestionBuilder, { QuestionData } from "../components/QuestionBuilder";
import { 
  Search, Plus, Download, Upload, Trash2, Edit, AlertCircle, Copy, 
  ChevronLeft, ChevronRight
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

// --- CONSTANTS ---
const SUBJECT_LABELS: Record<string, string> = {
  MATH: "Mathematics",
  ELA: "English Language Arts",
  SCIENCE: "Science",
  SOCIAL_STUDIES: "Social Studies",
};

export default function ItemBankPage() {
  const { theme } = useTheme();

  // --- STATE ---
  const [viewMode, setViewMode] = useState<'LIST' | 'EDITOR'>('LIST');
  
  // The "Database" (Loaded from LocalStorage)
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  // The "View" (Filtered List)
  const [filteredQuestions, setFilteredQuestions] = useState<QuestionData[]>([]);
  
  const [editingQuestion, setEditingQuestion] = useState<QuestionData | undefined>(undefined);
  const [filters, setFilters] = useState({ subject: "ALL", status: "ALL", search: "" });
  
  // Pagination
  const [page, setPage] = useState(1);
  const LIMIT = 10; 

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // --- 1. LOAD DATA (Persistence) ---
  useEffect(() => {
    const saved = localStorage.getItem("polaris-items");
    if (saved) {
        try {
            setQuestions(JSON.parse(saved));
        } catch (e) {
            console.error("Failed to load items", e);
        }
    }
  }, []);

  // --- 2. FILTER & SEARCH LOGIC ---
  useEffect(() => {
    let result = questions;

    // Filter by Subject
    if (filters.subject !== "ALL") {
        result = result.filter(q => q.subject === filters.subject);
    }

    // Filter by Status
    if (filters.status !== "ALL") {
        result = result.filter(q => q.status === filters.status);
    }

    // Filter by Search Text
    if (filters.search.trim()) {
        const term = filters.search.toLowerCase();
        result = result.filter(q => 
            q.text.toLowerCase().includes(term) || 
            q.standards?.some(s => s.toLowerCase().includes(term))
        );
    }

    // Sort by Newest First (assuming we want LIFO)
    result = [...result].reverse();

    setFilteredQuestions(result);
    setPage(1); // Reset to page 1 on filter change
  }, [questions, filters]);

  // --- PAGINATION CALCULATION ---
  const totalPages = Math.ceil(filteredQuestions.length / LIMIT);
  const paginatedQuestions = filteredQuestions.slice((page - 1) * LIMIT, page * LIMIT);

  // --- HANDLERS ---

  // SAVE: Create or Update Item
  const handleSave = (data: QuestionData) => {
    let updatedList: QuestionData[];

    if (data.id) {
        // UPDATE existing
        updatedList = questions.map(q => q.id === data.id ? { ...q, ...data } : q);
    } else {
        // CREATE new
        const newItem: QuestionData = {
            ...data,
            id: crypto.randomUUID(), // Generate Real ID
            // Ensure arrays exist
            gradeLevels: data.gradeLevels || [],
            standards: data.standards || [],
            options: data.options || [],
        };
        updatedList = [...questions, newItem];
    }

    // Update State & LocalStorage
    setQuestions(updatedList);
    localStorage.setItem("polaris-items", JSON.stringify(updatedList));
    
    // Reset View
    setViewMode("LIST");
    setEditingQuestion(undefined);
  };

  // DELETE: Remove Item(s)
  const handleDelete = (ids: string[]) => {
      if (!confirm(`Are you sure you want to delete ${ids.length} item(s)?`)) return;

      const updatedList = questions.filter(q => !ids.includes(q.id!));
      
      setQuestions(updatedList);
      localStorage.setItem("polaris-items", JSON.stringify(updatedList));
      setSelectedIds(new Set());
  };

  // DUPLICATE
  const handleDuplicate = (q: QuestionData) => {
      const copy = { ...q };
      delete copy.id; // Remove ID so it saves as new
      copy.text = `${copy.text} (Copy)`;
      copy.status = "DRAFT"; 
      setEditingQuestion(copy);
      setViewMode("EDITOR");
  };

  // SELECTION
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(paginatedQuestions.map(q => q.id!)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  // --- RENDER ---
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
                <>
                    <button className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-lg transition-all shadow-sm hover:opacity-80 ${theme.paper} ${theme.border} ${theme.text}`}>
                        <Upload size={16}/> Import
                    </button>
                    <button className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-lg transition-all shadow-sm hover:opacity-80 ${theme.paper} ${theme.border} ${theme.text}`}>
                        <Download size={16}/> Export
                    </button>
                    
                    <div className="w-px h-8 bg-current opacity-10 mx-1"></div>
                    
                    <button 
                        onClick={() => { setEditingQuestion(undefined); setViewMode('EDITOR'); }} 
                        className={`flex items-center gap-2 px-5 py-2 text-white text-sm font-medium rounded-lg shadow-sm transition-all ${theme.accent}`}
                    >
                        <Plus size={18} /> Create New
                    </button>
                </>
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
                   <label className="text-xs font-bold opacity-50 uppercase mb-1 block">Keywords</label>
                   <div className="relative">
                    <Search className="absolute left-3 top-2.5 opacity-40" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search questions..." 
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

                {/* Status */}
                <div className="w-40">
                    <label className="text-xs font-bold opacity-50 uppercase mb-1 block">Status</label>
                    <select 
                        className={`w-full p-2 border rounded-lg text-sm outline-none ${theme.input}`}
                        value={filters.status}
                        onChange={(e) => setFilters({...filters, status: e.target.value})}
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="PUBLISHED">Published</option>
                        <option value="DRAFT">Drafts</option>
                    </select>
                </div>
              </div>

              {/* BULK ACTIONS */}
              {selectedIds.size > 0 && (
                  <div className={`flex items-center justify-between p-3 rounded-lg border bg-indigo-50 border-indigo-100 text-indigo-900 animate-in fade-in slide-in-from-top-2`}>
                      <span className="text-sm font-bold px-2">{selectedIds.size} items selected</span>
                      <div className="flex gap-2">
                          <button 
                            onClick={() => handleDelete(Array.from(selectedIds))}
                            className="px-3 py-1.5 text-xs font-bold bg-white border border-red-200 text-red-600 rounded shadow-sm hover:bg-red-50"
                          >
                              Delete Selected
                          </button>
                      </div>
                  </div>
              )}

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
                      <th className="py-4 px-6">Question</th>
                      <th className="py-4 px-6 w-32">Status</th>
                      <th className="py-4 px-6 w-40">Subject</th>
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
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide border
                                ${q.status === 'PUBLISHED' 
                                    ? 'bg-green-100 text-green-700 border-green-200' 
                                    : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                }`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${q.status === 'PUBLISHED' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                {q.status}
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