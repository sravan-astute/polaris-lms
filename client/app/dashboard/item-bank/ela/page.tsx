"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Save, Plus, ArrowLeft, BookOpen, Layers, 
  Edit2, Trash2, Loader2 
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "../../../context/ThemeContext";

import QuestionBuilder, { QuestionData } from "../../../components/QuestionBuilder";
import RichTextEditor from "../../../components/RichTextEditor";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000';

function ElaWorkshopContent() {
  const { theme, themeKey } = useTheme(); // 🛠️ Added themeKey for specific contrast logic
  const router = useRouter();
  const searchParams = useSearchParams();
  const passageIdParam = searchParams.get('id');

  const [loading, setLoading] = useState(false);
  const [passage, setPassage] = useState({
    id: "",
    title: "",
    content: "",
    genre: "FICTION",
    lexile: ""
  });
  
  const [linkedQuestions, setLinkedQuestions] = useState<QuestionData[]>([]);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionData | undefined>(undefined);

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
      toast.error("Failed to load passage.");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePassage = async () => {
    if (!passage.title || !passage.content || passage.content === '<p></p>') {
        toast.error("Title and Content are required.");
        return;
    }
    
    setLoading(true);
    try {
        const token = localStorage.getItem('token');
        const url = passage.id ? `${API_URL}/passages/${passage.id}` : `${API_URL}/passages`;
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
        toast.error("Network error.");
    } finally {
        setLoading(false);
    }
  };

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
    <div className={`h-full flex flex-col transition-colors duration-300 ${theme.bg} ${theme.text}`}>
      
      {/* HEADER */}
      <header className={`px-6 py-3 border-b flex justify-between items-center transition-colors shadow-sm ${theme.paper} ${theme.border}`}>
        <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className={`p-2 rounded-full transition-all hover:bg-black/5`}>
                <ArrowLeft size={20} className="opacity-60" />
            </button>
            <div>
                <h1 className="font-bold text-lg flex items-center gap-2">
                    <BookOpen size={18} className={themeKey === 'CONTRAST' ? 'text-yellow-400' : 'text-indigo-600'}/> 
                    Passage Workshop
                </h1>
                <p className="text-xs opacity-50 italic">Craft passages and attach linked assessment items.</p>
            </div>
        </div>
        <div className="flex gap-2">
             <button 
                onClick={handleSavePassage}
                disabled={loading}
                className={`flex items-center gap-2 px-6 py-2 text-sm font-bold rounded-xl shadow-md transition-all disabled:opacity-50 ${theme.accent}`}
             >
                {loading ? <Loader2 className="animate-spin" size={16}/> : <Save size={16} />}
                Save Passage
             </button>
        </div>
      </header>

      {/* SPLIT VIEW */}
      <div className="flex-1 flex overflow-hidden">
          
          {/* LEFT: PASSAGE EDITOR - Updated background logic */}
          <div className={`flex-1 flex flex-col border-r p-8 overflow-y-auto max-w-4xl transition-colors ${theme.bg}`}>
             <div className="max-w-3xl mx-auto w-full space-y-8">
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                         <label className="text-xs font-bold opacity-50 uppercase tracking-widest block ml-1">Title</label>
                         <input 
                            type="text" 
                            value={passage.title}
                            onChange={(e) => setPassage({...passage, title: e.target.value})}
                            placeholder="Enter passage title..."
                            className={`w-full text-lg font-bold p-3 border rounded-xl outline-none transition-all focus:ring-2 focus:ring-indigo-500/20 ${theme.input} ${theme.border}`}
                         />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                             <label className="text-xs font-bold opacity-50 uppercase tracking-widest block ml-1">Genre</label>
                             <select 
                                value={passage.genre}
                                onChange={(e) => setPassage({...passage, genre: e.target.value})}
                                className={`w-full p-3 border rounded-xl text-sm outline-none transition-all ${theme.input} ${theme.border}`}
                             >
                                 <option value="FICTION">Fiction</option>
                                 <option value="NON_FICTION">Non-Fiction</option>
                                 <option value="POETRY">Poetry</option>
                                 <option value="DRAMA">Drama</option>
                             </select>
                        </div>
                        <div className="space-y-2">
                             <label className="text-xs font-bold opacity-50 uppercase tracking-widest block ml-1">Lexile</label>
                             <input 
                                type="text" 
                                value={passage.lexile}
                                onChange={(e) => setPassage({...passage, lexile: e.target.value})}
                                placeholder="800L"
                                className={`w-full p-3 border rounded-xl text-sm outline-none transition-all ${theme.input} ${theme.border}`}
                             />
                        </div>
                     </div>
                 </div>

                 {/* Editor Area Wrapper */}
                 <div className="space-y-3">
                     <label className="text-xs font-bold opacity-50 uppercase tracking-widest block ml-1 flex justify-between">
                        <span>Content</span>
                        <span className="text-[10px] opacity-40">Rich Text Interface</span>
                     </label>
                     <div className={`h-[500px] rounded-2xl overflow-hidden border transition-all ${theme.border}`}>
                        <RichTextEditor 
                            content={passage.content}
                            onChange={(html) => setPassage({...passage, content: html})}
                            placeholder="Type or paste the story text here..."
                        />
                     </div>
                 </div>
             </div>
          </div>

          {/* RIGHT: QUESTION LIST - Updated for theme consistency */}
          <div className={`w-[400px] border-l flex flex-col shadow-2xl z-10 transition-colors ${theme.paper} ${theme.border}`}>
              <div className={`p-4 border-b flex justify-between items-center ${theme.bg} bg-opacity-50`}>
                  <h3 className="font-bold text-sm flex items-center gap-2">
                      <Layers size={16} className="opacity-40"/>
                      Items ({linkedQuestions.length})
                  </h3>
                  <button 
                    onClick={() => {
                        if(!passage.id) { toast.error("Save passage first!"); return; }
                        setEditingQuestion(undefined);
                        setIsBuilderOpen(true);
                    }}
                    disabled={!passage.id}
                    className={`p-2 rounded-xl shadow-md transition-all disabled:opacity-30 ${theme.accent}`}
                    title="Add Question"
                  >
                      <Plus size={20} />
                  </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {!passage.id ? (
                      <div className="text-center p-12 opacity-30 italic text-sm space-y-3">
                          <Save size={40} className="mx-auto" />
                          <p>Save your passage to<br/>begin adding items.</p>
                      </div>
                  ) : linkedQuestions.length === 0 ? (
                      <div className={`text-center p-12 opacity-30 text-sm border-2 border-dashed rounded-2xl ${theme.border}`}>
                          <p>No items linked yet.</p>
                          <p className="text-xs mt-1">Tap "+" to create an item.</p>
                      </div>
                  ) : (
                      linkedQuestions.map((q, i) => (
                          <div key={q.id} className={`p-4 rounded-2xl border shadow-sm transition-all group relative ${theme.bg} ${theme.border} hover:shadow-lg`}>
                              <div className="flex justify-between items-start mb-2">
                                  <span className={`text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-lg border ${theme.border} opacity-60`}>
                                      Q{i+1} • {q.type.replace('_',' ')}
                                  </span>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button onClick={() => { setEditingQuestion(q); setIsBuilderOpen(true); }} className="p-1.5 hover:bg-black/5 rounded-lg transition-colors"><Edit2 size={12}/></button>
                                      <button onClick={() => handleDeleteQuestion(q.id!)} className="p-1.5 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"><Trash2 size={12}/></button>
                                  </div>
                              </div>
                              <p className="text-sm font-medium line-clamp-3 opacity-90 leading-relaxed" dangerouslySetInnerHTML={{ __html: q.text }} />
                              <div className="mt-3 flex flex-wrap gap-1">
                                  {q.standards?.map(s => (
                                      <span key={s} className={`text-[10px] px-2 py-0.5 rounded-md font-bold border transition-colors bg-opacity-10 bg-current ${theme.border}`}>
                                        {s}
                                      </span>
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
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className={`w-full max-w-6xl h-[92vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 border ${theme.border} ${theme.paper}`}>
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

export default function ElaWorkshopPage() {
  return (
    <Suspense fallback={
        <div className="h-full flex items-center justify-center opacity-50">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
    }>
        <ElaWorkshopContent />
    </Suspense>
  );
}