"use client";

import React, { useState, useEffect, useRef } from "react";
import { BookOpen, Plus, Search, Loader2, Save, Image as ImageIcon, Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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
  onSelect: (id: string, title: string, content: string, mediaUrl?: string) => void;
}

const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1200; 
                const scaleSize = MAX_WIDTH / img.width;
                const width = (scaleSize < 1) ? MAX_WIDTH : img.width;
                const height = (scaleSize < 1) ? img.height * scaleSize : img.height;
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                resolve(compressedBase64);
            };
        };
    });
};

export default function PassageManager({ selectedPassageId, onSelect }: PassageManagerProps) {
  const [mode, setMode] = useState<'SELECT' | 'CREATE'>('SELECT');
  const [passages, setPassages] = useState<Passage[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 🛠️ FIX: Track if the initial background sync has already happened
  const hasSyncedRef = useRef(false);

  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newMediaUrl, setNewMediaUrl] = useState("");
  const [newGenre, setNewGenre] = useState("FICTION");
  const [newLexile, setNewLexile] = useState("");

  useEffect(() => {
    fetchPassages();
  }, []);

  // 🛠️ UPDATED AUTO-SYNC EFFECT: Fires silently to populate preview on load
  useEffect(() => {
    if (selectedPassageId && passages.length > 0 && !hasSyncedRef.current) {
      const p = passages.find(item => item.id === selectedPassageId);
      if (p) {
        // Silently hydrate the parent state without triggering the manual selection logic
        onSelect(p.id, p.title, p.content, p.mediaUrl);
        // Mark as synced so it doesn't trigger again on re-renders
        hasSyncedRef.current = true;
      }
    }
  }, [passages, selectedPassageId, onSelect]);

  const fetchPassages = async () => {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/passages`, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json' 
            }
        });
        if (res.ok) {
            setPassages(await res.json());
        } else if (res.status === 401) {
            toast.error("Session expired. Please log in again.");
        }
    } catch (e) {
        console.error("Failed to load passages");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please upload an image."); return; }
    try {
        const compressedBase64 = await compressImage(file);
        setNewMediaUrl(compressedBase64);
        toast.success("Image uploaded successfully");
    } catch (error) {
        toast.error("Failed to upload image.");
    }
  };

  const handleCreate = async () => {
      if (!newTitle || !newContent || newContent === '<p></p>') {
          toast.error("Title and Content are required");
          return;
      }
      setLoading(true);
      try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_URL}/passages`, {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json', 
                  'Authorization': `Bearer ${token}` 
              },
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
              onSelect(saved.id, saved.title, saved.content, saved.mediaUrl); 
              setMode('SELECT');
              toast.success("Passage created and linked!");
              
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
        <div className="px-4 py-3 bg-indigo-50/50 border-b flex justify-between items-center">
            <div className="flex items-center gap-2 text-indigo-900">
                <BookOpen size={18} />
                <span className="font-bold text-sm">Reading Passage Context</span>
            </div>
            {mode === 'SELECT' && (
                <button 
                  data-passage-trigger
                  onClick={() => setMode('CREATE')} 
                  className="text-xs flex items-center gap-1 text-indigo-600 font-bold hover:underline"
                >
                    <Plus size={14} /> Create New Passage
                </button>
            )}
        </div>

        <div className="p-4">
            {mode === 'SELECT' && (
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        <select 
                            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm appearance-none outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
                            value={selectedPassageId || ""}
                            onChange={(e) => {
                                const p = passages.find(item => item.id === e.target.value);
                                if (p) {
                                  // User manually clicked, so onSelect runs with notification logic
                                  onSelect(p.id, p.title, p.content, p.mediaUrl);
                                  toast.success("Passage linked!");
                                } else {
                                  onSelect("", "", "", "");
                                }
                            }}
                        >
                            <option value="">-- Select a Passage (Optional) --</option>
                            {passages.map(p => (
                                <option key={p.id} value={p.id}>{p.title}</option>
                            ))}
                        </select>
                    </div>

                    {selectedPassage && (
                        <div className="p-5 bg-gray-50/50 rounded-lg border text-sm max-h-[500px] overflow-y-auto">
                            <div className="flex justify-between items-start mb-4 border-b pb-3">
                                <div>
                                    <h4 className="font-black text-slate-900 text-xl tracking-tight leading-none mb-1">{selectedPassage.title}</h4>
                                    <div className="flex gap-2">
                                        {selectedPassage.genre && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded uppercase font-black">{selectedPassage.genre}</span>}
                                        {selectedPassage.lexile && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded uppercase font-black">{selectedPassage.lexile}</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                <div className="flex-1 min-w-0">
                                    <div 
                                        className="prose prose-slate max-w-none font-serif leading-relaxed text-base" 
                                        dangerouslySetInnerHTML={{ __html: selectedPassage.content }} 
                                    />
                                </div>
                                
                                {selectedPassage.mediaUrl && (
                                    <div className="w-full md:w-1/2 flex-shrink-0">
                                        <div className="sticky top-0 bg-white rounded-lg border p-1 shadow-sm">
                                            <img 
                                                src={selectedPassage.mediaUrl} 
                                                alt="Passage Visual" 
                                                className="w-full h-auto rounded object-contain"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {mode === 'CREATE' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-900 uppercase ml-1">Title *</label>
                            <input 
                                className="w-full p-2 border rounded text-sm font-bold bg-white" 
                                placeholder="e.g. The Giggling Stream" 
                                value={newTitle}
                                onChange={e => setNewTitle(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-900 uppercase ml-1">Genre</label>
                                <select 
                                    className="w-full p-2 border rounded text-sm bg-white font-medium"
                                    value={newGenre}
                                    onChange={e => setNewGenre(e.target.value)}
                                >
                                    <option value="FICTION">Fiction</option>
                                    <option value="NON_FICTION">Non-Fiction</option>
                                    <option value="POETRY">Poetry</option>
                                    <option value="DRAMA">Drama</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-900 uppercase ml-1">Lexile</label>
                                <input 
                                    className="w-full p-2 border rounded text-sm font-medium bg-white" 
                                    placeholder="e.g. 450L"
                                    value={newLexile}
                                    onChange={e => setNewLexile(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-900 uppercase ml-1">Passage Image</label>
                        <div className="flex gap-2 items-center">
                            <div className="relative flex-1">
                                <ImageIcon className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                <input 
                                    className="w-full pl-10 p-2 border rounded text-sm bg-white" 
                                    placeholder="Image URL or upload..."
                                    value={newMediaUrl}
                                    onChange={e => setNewMediaUrl(e.target.value)}
                                />
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                            <Button 
                                type="button" 
                                variant="outline" 
                                size="icon" 
                                className="h-10 w-10 border-indigo-200 text-indigo-600"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload size={18} />
                            </Button>
                            {newMediaUrl && (
                                <button 
                                    onClick={() => setNewMediaUrl("")}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>
                        {newMediaUrl && newMediaUrl.startsWith('data:') && (
                            <div className="mt-2 h-20 w-32 rounded border bg-gray-100 overflow-hidden shadow-inner">
                                <img src={newMediaUrl} className="w-full h-full object-cover" alt="Passage thumb" />
                            </div>
                        )}
                    </div>

                    <div className="mb-2">
                        <label className="text-[10px] font-black text-slate-900 uppercase ml-1 mb-1 block">Passage Content *</label>
                        <RichTextEditor 
                            content={newContent} 
                            onChange={setNewContent}
                            placeholder="Write or paste your story here..."
                        />
                    </div>

                    <div className="flex gap-2 justify-end pt-2 border-t mt-4">
                        <button onClick={() => setMode('SELECT')} className="px-4 py-2 text-xs font-black text-slate-500 hover:text-slate-900 rounded uppercase tracking-widest">Cancel</button>
                        <button 
                            onClick={handleCreate} 
                            disabled={loading}
                            className="px-6 py-2 text-xs font-black bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center gap-2 shadow-md uppercase tracking-widest transition-all"
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