"use client";

import React, { useState, useEffect, useRef } from "react";
import { BookOpen, Plus, Search, Loader2, Save, Image as ImageIcon, Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import RichTextEditor from "../RichTextEditor";
// 🛠️ Hook into global theme
import { useTheme } from "../../context/ThemeContext";

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
  // 🛠️ Hook into global theme
  const { theme, themeKey } = useTheme();
  
  const [mode, setMode] = useState<'SELECT' | 'CREATE'>('SELECT');
  const [passages, setPassages] = useState<Passage[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasSyncedRef = useRef(false);

  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newMediaUrl, setNewMediaUrl] = useState("");
  const [newGenre, setNewGenre] = useState("FICTION");
  const [newLexile, setNewLexile] = useState("");

  useEffect(() => {
    fetchPassages();
  }, []);

  useEffect(() => {
    if (selectedPassageId && passages.length > 0 && !hasSyncedRef.current) {
      const p = passages.find(item => item.id === selectedPassageId);
      if (p) {
        onSelect(p.id, p.title, p.content, p.mediaUrl);
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
              setNewTitle(""); setNewContent(""); setNewMediaUrl(""); setNewLexile("");
          }
      } catch (e) {
          toast.error("Failed to create passage");
      } finally {
          setLoading(false);
      }
  };

  const selectedPassage = passages.find(p => p.id === selectedPassageId);

  return (
    // 🛠️ Main Container: Forced theme.paper for high contrast visibility
    <div className={`mb-6 border rounded-2xl overflow-hidden transition-all shadow-md ${theme.paper} ${theme.border}`}>
        
        {/* 📖 READING CONTEXT HEADER - Preserved Background, Fixed Spacing & Contrast */}
            <div className={`px-5 py-3 border-b flex justify-between items-center bg-current/[0.08] transition-colors ${theme.border}`}>
                <div className="flex items-center gap-3">
                    {/* The icon now strictly follows theme.text at 100% visibility */}
                    <BookOpen size={20} className={theme.text} />
                    
                    {/* Proper case, standard tracking to prevent congestion, and high-contrast theme text */}
                    <span className={`font-black text-lg tracking-normal leading-none ${theme.text}`}>
                        Reading passage context
                    </span>
                </div>
                
                {mode === 'SELECT' && (
                    <button 
                        data-passage-trigger
                        onClick={() => setMode('CREATE')} 
                        /* Fixed padding for a slim profile and clean, readable text */
                        className={`px-5 py-2 rounded-xl border font-black text-sm transition-all active:scale-95 
                            ${theme.border} ${theme.text} bg-current/[0.05] hover:bg-current/[0.1]`}
                    >
                        <Plus size={16} className="inline mr-2" /> 
                        Create new passage
                    </button>
                )}
            </div>

        <div className="p-6">
            {mode === 'SELECT' && (
                <div className="space-y-6">
                    <div className="relative">
                        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.text} opacity-40`} size={18} />
                        {/* 🛠️ Dropdown: Forced theme.input for opposite font visibility */}
                        <select 
                            className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm appearance-none outline-none transition-all focus:ring-2 ${theme.input} ${theme.border}`}
                            value={selectedPassageId || ""}
                            onChange={(e) => {
                                const p = passages.find(item => item.id === e.target.value);
                                if (p) {
                                  onSelect(p.id, p.title, p.content, p.mediaUrl);
                                  toast.success("Passage linked!");
                                } else {
                                  onSelect("", "", "", "");
                                }
                            }}
                        >
                            <option value="">-- Link an Existing Passage (Optional) --</option>
                            {passages.map(p => (
                                <option key={p.id} value={p.id}>{p.title}</option>
                            ))}
                        </select>
                    </div>

                    {selectedPassage && (
                        // 🛠️ Preview Area: bg-opacity-10 bg-current prevents shadowing
                        <div className={`p-8 rounded-2xl border text-xl max-h-[600px] overflow-y-auto transition-colors ${theme.bg} ${theme.border}`}>
                            <div className={`flex justify-between items-start mb-8 border-b pb-6 ${theme.border}`}>
                                <div>
                                    {/* 🛠️ UPGRADED TITLE: text-2xl -> text-4xl for readability */}
                                    <h4 className={`font-black text-4xl tracking-tight mb-4 ${theme.text}`}>
                                        {selectedPassage.title}
                                    </h4>
                                    <div className="flex gap-2">
                                        {selectedPassage.genre && (
                                            <span className={`text-xs font-black px-3 py-1 rounded-lg border transition-all tracking-tight
                                                ${theme.border} ${theme.text} bg-current/[0.08]`}>
                                                {selectedPassage.genre.charAt(0) + selectedPassage.genre.slice(1).toLowerCase()}
                                            </span>
                                        )}
                                        {selectedPassage.lexile && (
                                            <span className={`text-xs font-black px-3 py-1 rounded-lg border transition-all tracking-tight
                                                ${theme.border} ${theme.text} bg-current/[0.08]`}>
                                                {selectedPassage.lexile}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* 🛠️ Layout Grid: Ensures large text flows properly next to images */}
                            <div className="flex flex-col md:flex-row gap-10 items-start">
                                <div className="flex-1 min-w-0">
                                    <div 
                                        className={`prose max-w-none font-serif transition-colors ${theme.text}`} 
                                        style={{ fontSize: '20px', lineHeight: '1.75' }}
                                        dangerouslySetInnerHTML={{ __html: selectedPassage.content }} 
                                    />
                                </div>
                                
                                {selectedPassage.mediaUrl && (
                                    <div className="w-full md:w-[45%] flex-shrink-0">
                                        <div className={`rounded-2xl border p-2 shadow-md transition-colors ${theme.paper} ${theme.border}`}>
                                            <img 
                                                src={selectedPassage.mediaUrl} 
                                                alt="Passage Visual" 
                                                className="w-full h-auto rounded-xl object-contain shadow-sm"
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
                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${theme.text} opacity-70`}>Title *</label>
                            <input 
                                className={`w-full p-3 border rounded-xl text-sm font-black transition-all ${theme.input} ${theme.border}`} 
                                placeholder="e.g. The Whispering Winds" 
                                value={newTitle}
                                onChange={e => setNewTitle(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${theme.text} opacity-70`}>Genre</label>
                                <select 
                                    className={`w-full p-3 border rounded-xl text-sm font-black transition-all ${theme.input} ${theme.border}`}
                                    value={newGenre}
                                    onChange={e => setNewGenre(e.target.value)}
                                >
                                    <option value="FICTION">Fiction</option>
                                    <option value="NON_FICTION">Non-Fiction</option>
                                    <option value="POETRY">Poetry</option>
                                    <option value="DRAMA">Drama</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${theme.text} opacity-70`}>Lexile</label>
                                <input 
                                    className={`w-full p-3 border rounded-xl text-sm font-black transition-all ${theme.input} ${theme.border}`} 
                                    placeholder="e.g. 950L"
                                    value={newLexile}
                                    onChange={e => setNewLexile(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${theme.text} opacity-70`}>Header Image</label>
                        <div className="flex gap-3 items-center">
                            <div className="relative flex-1">
                                <ImageIcon className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.text} opacity-40`} size={18} />
                                <input 
                                    className={`w-full pl-10 p-3 border rounded-xl text-sm transition-all ${theme.input} ${theme.border}`} 
                                    placeholder="Paste URL or select file..."
                                    value={newMediaUrl}
                                    onChange={e => setNewMediaUrl(e.target.value)}
                                />
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                            <Button 
                                type="button" 
                                variant="outline" 
                                className={`h-12 w-12 border shadow-sm transition-all ${theme.border} ${theme.text} bg-opacity-5 bg-current hover:bg-opacity-20`}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload size={20} />
                            </Button>
                            {newMediaUrl && (
                                <button 
                                    onClick={() => setNewMediaUrl("")}
                                    className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                >
                                    <Trash2 size={20} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className={`text-[10px] font-black uppercase tracking-widest ml-1 mb-1 block ${theme.text} opacity-70`}>Passage Content *</label>
                        <RichTextEditor 
                            content={newContent} 
                            onChange={setNewContent}
                            placeholder="Type or paste your story text here..."
                        />
                    </div>

                    <div className={`flex gap-3 justify-end pt-6 border-t mt-6 ${theme.border}`}>
                        <button onClick={() => setMode('SELECT')} className={`px-6 py-2.5 text-xs font-black uppercase tracking-widest opacity-60 hover:opacity-100 transition-all ${theme.text}`}>Cancel</button>
                        <button 
                            onClick={handleCreate} 
                            disabled={loading}
                            className={`px-8 py-2.5 text-xs font-black rounded-xl flex items-center gap-2 shadow-lg uppercase tracking-widest transition-all ${theme.accent}`}
                        >
                            {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                            Save & Attach
                        </button>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
}