"use client";

import React, { useState, useEffect, Suspense } from "react"; // 👈 Added Suspense
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Save, Plus, ArrowLeft, BookOpen, Layers, 
  Edit2, Trash2, Loader2 
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";

// Import your existing components
import QuestionBuilder, { QuestionData } from "../../../components/QuestionBuilder";
import RichTextEditor from "../../../components/RichTextEditor"; // 👈 Ensure this matches your file name

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000';

// ----------------------------------------------------------------------
// 1. THE MAIN CONTENT COMPONENT (Moves logic here)
// ----------------------------------------------------------------------
function ElaWorkshopContent() {
  const { theme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams(); // 👈 This causes the build error if not suspended
  const passageIdParam = searchParams.get('id');

  // --- STATE ---
  const [loading, setLoading] = useState(false);
  const [passage, setPassage] = useState({
    id: "",
    title: "",
    content: "",
    genre: "FICTION",
    lexile: ""
  });
  
  // The questions linked to this passage
  const [linkedQuestions, setLinkedQuestions] = useState<QuestionData[]>([]);
  
  // Modal State for the Question Builder
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionData | undefined>(undefined);

  // --- LOAD DATA ---
  useEffect(() => {
    if (passageIdParam) {
      fetchPassage(passageIdParam);
    }
  }, [passageIdParam]);

  const fetchPassage = async (id: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/passages/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPassage({
            id: data.id,
            title: data.title,
            content: data.content,
            genre: data.genre || "FICTION",
            lexile: data.lexile || ""
        });
        if (data.questions) {
            const cleanQuestions = data.questions.map((q: any) => ({
                ...q,
                options: q.data?.options || q.options || [],
                tags: q.tags || [],
                code: q.code || "ITEM"
            }));
            setLinkedQuestions(cleanQuestions);
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load passage.");
    } finally {
      setLoading(false);
    }
  };

  // --- SAVE PASSAGE ---
  const handleSavePassage = async () => {
    if (!passage.title || !passage.content || passage.content === '<p></p>') {
        toast.error("Title and Content are required.");
        return;
    }
    
    setLoading(true);
    try {
        const token = localStorage.getItem('token');
        const url = passage.id ? `${API_URL}/passages/${passage.id}` : `${API_URL}/passages`;
        
        // Note: Ideally use PUT/PATCH for updates, but using POST logic for now based on your API
        // If your backend supports PATCH, change method dynamically
        const method = passage.id ? 'PATCH' : 'POST'; 

        const res = await fetch(url, {
            method: method, 
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(passage)
        });

        if (res.ok) {
            const saved = await res.json();
            setPassage(prev => ({ ...prev, id: saved.id }));
            toast.success("Passage saved successfully!");
            if (!passage.id) {
                router.replace(`/dashboard/item-bank/ela?id=${saved.id}`);
            }
        } else {
            toast.error("Failed to save passage.");
        }
    } catch (e) {
        console.error(e);
        toast.error("Network error.");
    } finally {
        setLoading(false);
    }
  };

  // --- SAVE QUESTION ---
  const handleSaveQuestion = async (qData: QuestionData) => {
      if (!passage.id) {
          toast.error("Please save the passage first.");
          return;
      }

      const token = localStorage.getItem('token');
      
      const tagsPayload = typeof qData.tags === 'string' 
        ? (qData.tags as string).split(',').map(t => t.trim()).filter(t => t !== '')
        : qData.tags;

      const payload = {
          ...qData,
          tags: tagsPayload,
          points: Number(qData.points),
          passageId: passage.id
      };

      try {
          const method = qData.id ? 'PATCH' : 'POST';
          const url = qData.id ? `${API_URL}/questions/${qData.id}` : `${API_URL}/questions`;

          const res = await fetch(url, {
              method,
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(payload)
          });

          if (res.ok) {
              toast.success("Question saved to passage!");
              setIsBuilderOpen(false);
              fetchPassage(passage.id);
          } else {
              toast.error("Failed to save question.");
          }
      } catch (e) {
          console.error(e);
      }
  };

  const handleDeleteQuestion = async (id: string) => {
      if(!confirm("Remove this question from the passage?")) return;
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/questions/${id}`, { 
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
      });
      if (passage.id) fetchPassage(passage.id);
  };

  return (
    <div className={`h-full flex flex-col ${theme.bg} ${theme.text}`}>
      
      {/* HEADER */}
      <header className={`px-6 py-3 border-b flex justify-between items-center bg-white ${theme.border}`}>
        <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft size={20} className="opacity-60" />
            </button>
            <div>
                <h1 className="font-bold text-lg flex items-center gap-2">
                    <BookOpen size={18} className="text-indigo-600"/> 
                    ELA Passage Workshop
                </h1>
                <p className="text-xs opacity-50">Create a passage and attach questions.</p>
            </div>
        </div>
        <div className="flex gap-2">
             <button 
                onClick={handleSavePassage}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-sm transition-all disabled:opacity-50"
             >
                {loading ? <Loader2 className="animate-spin" size={16}/> : <Save size={16} />}
                Save Passage
             </button>
        </div>
      </header>

      {/* SPLIT VIEW */}
      <div className="flex-1 flex overflow-hidden">
          
          {/* LEFT: PASSAGE EDITOR */}
          <div className="flex-1 flex flex-col border-r p-8 overflow-y-auto max-w-4xl bg-gray-50/50">
             <div className="max-w-3xl mx-auto w-full space-y-6">
                 
                 <div className="grid grid-cols-2 gap-4">
                     <div>
                         <label className="text-xs font-bold opacity-50 uppercase mb-1 block">Passage Title</label>
                         <input 
                            type="text" 
                            value={passage.title}
                            onChange={(e) => setPassage({...passage, title: e.target.value})}
                            placeholder="e.g. The Tortoise and the Hare"
                            className="w-full text-lg font-bold p-3 border rounded-lg shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                         />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="text-xs font-bold opacity-50 uppercase mb-1 block">Genre</label>
                             <select 
                                value={passage.genre}
                                onChange={(e) => setPassage({...passage, genre: e.target.value})}
                                className="w-full p-3 border rounded-lg text-sm bg-white"
                             >
                                 <option value="FICTION">Fiction</option>
                                 <option value="NON_FICTION">Non-Fiction</option>
                                 <option value="POETRY">Poetry</option>
                                 <option value="DRAMA">Drama</option>
                             </select>
                        </div>
                        <div>
                             <label className="text-xs font-bold opacity-50 uppercase mb-1 block">Lexile / Level</label>
                             <input 
                                type="text" 
                                value={passage.lexile}
                                onChange={(e) => setPassage({...passage, lexile: e.target.value})}
                                placeholder="e.g. 800L"
                                className="w-full p-3 border rounded-lg text-sm bg-white"
                             />
                        </div>
                     </div>
                 </div>

                 {/* Editor Area */}
                 <div className="flex-1 flex flex-col">
                     <label className="text-xs font-bold opacity-50 uppercase mb-2 block flex justify-between">
                        <span>Passage Content</span>
                        <span className="text-[10px] bg-gray-200 px-2 py-0.5 rounded text-gray-600">Rich Text</span>
                     </label>
                     <div className="h-[500px]">
                        <RichTextEditor 
                            content={passage.content}
                            onChange={(html) => setPassage({...passage, content: html})}
                            placeholder="Type or paste the story text here..."
                        />
                     </div>
                 </div>

             </div>
          </div>

          {/* RIGHT: QUESTION LIST */}
          <div className="w-[400px] bg-white border-l flex flex-col shadow-xl z-10">
              <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                  <h3 className="font-bold text-sm flex items-center gap-2">
                      <Layers size={16} className="text-gray-500"/>
                      Questions ({linkedQuestions.length})
                  </h3>
                  <button 
                    onClick={() => {
                        if(!passage.id) { toast.error("Save the passage first!"); return; }
                        setEditingQuestion(undefined);
                        setIsBuilderOpen(true);
                    }}
                    disabled={!passage.id}
                    className="p-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    title="Add Question"
                  >
                      <Plus size={18} />
                  </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30">
                  {!passage.id ? (
                      <div className="text-center p-8 opacity-40 text-sm">
                          <Save size={32} className="mx-auto mb-2" />
                          <p>Save the passage to<br/>start adding questions.</p>
                      </div>
                  ) : linkedQuestions.length === 0 ? (
                      <div className="text-center p-8 opacity-40 text-sm border-2 border-dashed rounded-xl">
                          <p>No questions yet.</p>
                          <p className="text-xs mt-1">Click "+" to add one.</p>
                      </div>
                  ) : (
                      linkedQuestions.map((q, i) => (
                          <div key={q.id} className="bg-white p-3 rounded-lg border shadow-sm hover:shadow-md transition-all group relative">
                              <div className="flex justify-between items-start mb-1">
                                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-100 px-1.5 rounded">
                                      Q{i+1} • {q.type.replace('_',' ')}
                                  </span>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button onClick={() => { setEditingQuestion(q); setIsBuilderOpen(true); }} className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"><Edit2 size={12}/></button>
                                      <button onClick={() => handleDeleteQuestion(q.id!)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={12}/></button>
                                  </div>
                              </div>
                              <p className="text-sm font-medium line-clamp-2 leading-snug" dangerouslySetInnerHTML={{ __html: q.text }} />
                              <div className="mt-2 flex gap-1">
                                  {q.standards?.map(s => (
                                      <span key={s} className="text-[10px] bg-indigo-50 text-indigo-700 px-1 rounded border border-indigo-100">{s}</span>
                                  ))}
                              </div>
                          </div>
                      ))
                  )}
              </div>
          </div>
      </div>

      {/* QUESTION BUILDER MODAL */}
      {isBuilderOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex-1 overflow-hidden relative">
                      <QuestionBuilder 
                          initialData={editingQuestion}
                          onSave={handleSaveQuestion}
                          onCancel={() => setIsBuilderOpen(false)}
                      />
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}

// ----------------------------------------------------------------------
// 2. THE PAGE WRAPPER (Suspense Boundary)
// ----------------------------------------------------------------------
export default function ElaWorkshopPage() {
  return (
    <Suspense fallback={
        <div className="h-full flex items-center justify-center">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
    }>
        <ElaWorkshopContent />
    </Suspense>
  );
}