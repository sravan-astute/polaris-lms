"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, Plus, Search, Loader2, Save, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
// 👇 IMPORT YOUR TIPTAP EDITOR
import RichTextEditor from "../RichTextEditor";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000';

interface Passage {
  id: string;
  title: string;
  content: string;
  mediaUrl?: string;
  genre?: string;
  lexile?: string;
}

interface PassageManagerProps {
  selectedPassageId?: string;
  onSelect: (passageId: string, passageTitle: string, passageContent: string) => void;
}

export default function PassageManager({ selectedPassageId, onSelect }: PassageManagerProps) {
  const [mode, setMode] = useState<'SELECT' | 'CREATE'>('SELECT');
  const [passages, setPassages] = useState<Passage[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Create Form State
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newMediaUrl, setNewMediaUrl] = useState("");
  const [newGenre, setNewGenre] = useState("FICTION");
  const [newLexile, setNewLexile] = useState("");

  useEffect(() => {
    fetchPassages();
  }, []);

  const fetchPassages = async () => {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/passages`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) setPassages(await res.json());
    } catch (e) {
        console.error("Failed to load passages");
    }
  };

  const handleCreate = async () => {
      // Validation: Check for empty content (Tiptap defaults to <p></p> when empty)
      if (!newTitle || !newContent || newContent === '<p></p>') {
          toast.error("Title and Content are required");
          return;
      }
      setLoading(true);
      try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_URL}/passages`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ 
                  title: newTitle, 
                  content: newContent,
                  mediaUrl: newMediaUrl,
                  genre: newGenre,
                  lexile: newLexile
              })
          });
          
          if (res.ok) {
              const saved = await res.json();
              setPassages([...passages, saved]); 
              onSelect(saved.id, saved.title, saved.content);
              setMode('SELECT');
              toast.success("Passage created!");
              
              // Reset Form
              setNewTitle(""); 
              setNewContent(""); 
              setNewMediaUrl("");
              setNewLexile("");
          }
      } catch (e) {
          toast.error("Failed to create passage");
      } finally {
          setLoading(false);
      }
  };

  const selectedPassage = passages.find(p => p.id === selectedPassageId);

  return (
    <div className="mb-6 border rounded-xl overflow-hidden bg-white shadow-sm transition-all">
        {/* Header Bar */}
        <div className="px-4 py-3 bg-indigo-50/50 border-b flex justify-between items-center">
            <div className="flex items-center gap-2 text-indigo-900">
                <BookOpen size={18} />
                <span className="font-bold text-sm">Reading Passage Context</span>
            </div>
            {mode === 'SELECT' && (
                <button onClick={() => setMode('CREATE')} className="text-xs flex items-center gap-1 text-indigo-600 font-bold hover:underline">
                    <Plus size={14} /> Create New Passage
                </button>
            )}
        </div>

        <div className="p-4">
            
            {/* --- MODE: SELECT EXISTING --- */}
            {mode === 'SELECT' && (
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        <select 
                            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm appearance-none outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
                            value={selectedPassageId || ""}
                            onChange={(e) => {
                                const p = passages.find(item => item.id === e.target.value);
                                if (p) onSelect(p.id, p.title, p.content);
                                else onSelect("", "", "");
                            }}
                        >
                            <option value="">-- Select a Passage (Optional) --</option>
                            {passages.map(p => (
                                <option key={p.id} value={p.id}>{p.title}</option>
                            ))}
                        </select>
                    </div>

                    {selectedPassage && (
                        <div className="p-4 bg-gray-50 rounded-lg border text-sm max-h-96 overflow-y-auto">
                            <div className="flex justify-between items-start mb-3">
                                <h4 className="font-bold text-gray-800 text-lg">{selectedPassage.title}</h4>
                                <div className="flex gap-2">
                                    {selectedPassage.genre && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">{selectedPassage.genre}</span>}
                                    {selectedPassage.lexile && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">{selectedPassage.lexile}</span>}
                                </div>
                            </div>

                            {selectedPassage.mediaUrl && (
                                <div className="mb-4 text-center bg-gray-100 rounded-lg p-2 border">
                                    <img 
                                        src={selectedPassage.mediaUrl} 
                                        alt="Passage visual" 
                                        className="max-h-64 mx-auto rounded-md object-contain"
                                    />
                                </div>
                            )}

                            {/* Render HTML Content using Tailwind Prose */}
                            <div className="prose prose-sm max-w-none font-serif leading-relaxed" dangerouslySetInnerHTML={{ __html: selectedPassage.content }} />
                        </div>
                    )}
                </div>
            )}

            {/* --- MODE: CREATE NEW --- */}
            {mode === 'CREATE' && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input 
                            className="w-full p-2 border rounded text-sm font-bold" 
                            placeholder="Passage Title *"
                            value={newTitle}
                            onChange={e => setNewTitle(e.target.value)}
                        />
                        <div className="flex gap-2">
                            <select 
                                className="p-2 border rounded text-sm bg-white flex-1"
                                value={newGenre}
                                onChange={e => setNewGenre(e.target.value)}
                            >
                                <option value="FICTION">Fiction</option>
                                <option value="NON_FICTION">Non-Fiction</option>
                                <option value="POETRY">Poetry</option>
                                <option value="DRAMA">Drama</option>
                            </select>
                            <input 
                                className="w-24 p-2 border rounded text-sm" 
                                placeholder="Lexile"
                                value={newLexile}
                                onChange={e => setNewLexile(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <ImageIcon className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        <input 
                            className="w-full pl-10 p-2 border rounded text-sm" 
                            placeholder="Passage Image URL (e.g. https://...)"
                            value={newMediaUrl}
                            onChange={e => setNewMediaUrl(e.target.value)}
                        />
                    </div>

                    {/* 🌟 TIPTAP EDITOR CONNECTED HERE */}
                    <div className="mb-2">
                        <RichTextEditor 
                            content={newContent} 
                            onChange={setNewContent}
                            placeholder="Write or paste story content here..."
                        />
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                        <button onClick={() => setMode('SELECT')} className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded">Cancel</button>
                        <button 
                            onClick={handleCreate} 
                            disabled={loading}
                            className="px-4 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center gap-2 shadow-sm"
                        >
                            {loading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                            Save & Attach
                        </button>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
}