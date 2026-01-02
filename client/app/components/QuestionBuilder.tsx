"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation"; 
import { Save, Eye, Edit3, Loader2, Send, CheckCircle, PlusSquare } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { useTheme } from "../context/ThemeContext";
import { toast } from "sonner"; 

import EditorSidebar from "./builder/EditorSidebar";
import EditorCanvas from "./builder/EditorCanvas";
import StudentPreview from "./builder/StudentPreview";
import PassageManager from "./builder/PassageManager";

// --- TYPES (Unchanged) ---
export type QuestionType = 
  | "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER" | "MULTIPLE_SELECT"    
  | "FILL_IN_THE_BLANK" | "MATCHING" | "MATH_RESPONSE" | "ORDERING";          

export type Subject = "MATH" | "ELA" | "SCIENCE" | "SOCIAL_STUDIES";

export type ContentStatus = "DRAFT" | "PENDING_REVIEW" | "CHANGES_REQUESTED" | "APPROVED" | "PUBLISHED" | "ARCHIVED";

export interface Option {
  id: string; 
  text: string; 
  isCorrect: boolean; 
  feedback?: string;
  matchText?: string; 
  sortOrder?: number; 
}

export interface QuestionData {
  id?: string; 
  code?: string; 
  type: QuestionType; 
  subject: Subject; 
  status: ContentStatus; 
  gradeLevels: string[]; 
  standards: string[]; 
  difficulty: string;
  bloomsTaxonomy: string; 
  dokLevel: string; 
  calculator: boolean; 
  mediaUrl?: string; 
  mediaType?: "IMAGE" | "VIDEO" | "AUDIO"; 
  mediaAltText?: string;
  text: string; 
  options: Option[]; 
  explanation: string; 
  reviewerNotes?: string; 
  tags: string; 
  points: number;
  passageId?: string;
  passage?: {
    id: string;
    title: string;
    content: string;
    mediaUrl?: string; 
  };
}

interface QuestionBuilderProps {
  quizId?: string; initialData?: QuestionData;
  onCancel: () => void; onQuestionAdded?: () => void; 
  onSave?: (data: QuestionData) => Promise<void> | void;
}

export default function QuestionBuilder({ 
  quizId, initialData, onCancel, onQuestionAdded, onSave
}: QuestionBuilderProps) {
  const { theme, themeKey } = useTheme(); 
  const [mode, setMode] = useState<'EDIT' | 'PREVIEW'>('EDIT');
  const [isSaving, setIsSaving] = useState(false); 

  const defaultQuestion: QuestionData = {
      subject: "MATH", gradeLevels: ["3"], standards: [], difficulty: "MEDIUM",
      type: "MULTIPLE_CHOICE", status: "DRAFT", bloomsTaxonomy: "REMEMBER",
      dokLevel: "LEVEL_1", calculator: false, text: "", mediaUrl: "",
      mediaType: "IMAGE", mediaAltText: "", tags: "", explanation: "", 
      reviewerNotes: "", 
      points: 1,
      options: [{ id: "1", text: "", isCorrect: false }, { id: "2", text: "", isCorrect: false }]
  };

  const formatTagsOnLoad = (tags: any): string => {
      if (Array.isArray(tags)) return tags.join(', ');
      if (typeof tags === 'string') return tags;      
      return "";
  };

  const [question, setQuestion] = useState<QuestionData>(() => {
      const notesFromData = (initialData as any)?.data?.reviewerNotes;

      return {
          ...defaultQuestion, 
          ...initialData,
          standards: initialData?.standards ?? [],
          gradeLevels: initialData?.gradeLevels ?? ["3"],
          options: initialData?.options ?? defaultQuestion.options,
          code: initialData?.code || "",
          tags: formatTagsOnLoad(initialData?.tags), 
          reviewerNotes: initialData?.reviewerNotes || notesFromData || "",
          passageId: initialData?.passageId || undefined,
          passage: initialData?.passage || undefined, 
      };
  });

  const isELASubject = (subj: string) => {
    if (!subj) return false;
    const s = subj.toUpperCase();
    return s.includes('ELA') || s.includes('ENGLISH') || s.includes('READING') || s.includes('LITERATURE');
  };

  const handleChange = (field: keyof QuestionData, value: any) => {
    if (field === 'type' && value !== question.type) {
        if (value === 'TRUE_FALSE') {
            setQuestion(prev => ({ ...prev, type: value, options: [
                { id: "opt-1", text: "True", isCorrect: true },
                { id: "opt-2", text: "False", isCorrect: false }
            ]}));
            return;
        }
        if (value === 'SHORT_ANSWER' || value === 'MATH_RESPONSE') {
            setQuestion(prev => ({ ...prev, type: value, options: [{ id: "rubric", text: "", isCorrect: true }] }));
            return;
        }
        if (value === 'MATCHING') {
            setQuestion(prev => ({ ...prev, type: value, options: [
                { id: crypto.randomUUID(), text: "Premise A", matchText: "Answer A", isCorrect: true },
                { id: crypto.randomUUID(), text: "Premise B", matchText: "Answer B", isCorrect: true }
            ]}));
            return;
        }
        if (value === 'ORDERING') {
            setQuestion(prev => ({ ...prev, type: value, options: [
                { id: crypto.randomUUID(), text: "Step 1", sortOrder: 1, isCorrect: true },
                { id: crypto.randomUUID(), text: "Step 2", sortOrder: 2, isCorrect: true }
            ]}));
            return;
        }
        if (value === 'FILL_IN_THE_BLANK') {
            setQuestion(prev => ({ ...prev, type: value, options: [{ id: "template", text: "2 + [2] = 4", isCorrect: true }] }));
            return;
        }
        setQuestion(prev => ({ ...prev, type: value, options: [
            { id: crypto.randomUUID(), text: "", isCorrect: false },
            { id: crypto.randomUUID(), text: "", isCorrect: false }
        ]}));
        return;
    }
    setQuestion((prev) => ({ ...prev, [field]: value }));
  };

  const handleOptionChange = (id: string, field: keyof Option, value: any) => {
    setQuestion(prev => ({ ...prev, options: prev.options.map(opt => opt.id === id ? { ...opt, [field]: value } : opt) }));
  };

  const handleSetCorrect = (id: string) => {
    if (question.type === 'MULTIPLE_SELECT') {
        setQuestion(prev => ({ ...prev, options: prev.options.map(opt => opt.id === id ? { ...opt, isCorrect: !opt.isCorrect } : opt) }));
    } else {
        setQuestion(prev => ({ ...prev, options: prev.options.map(opt => ({ ...opt, isCorrect: opt.id === id })) }));
    }
  };

  const handleAddOption = () => {
    const newId = crypto.randomUUID();
    let newOption: Option = { id: newId, text: "", isCorrect: false };
    if (question.type === 'MATCHING') newOption = { ...newOption, matchText: "" };
    if (question.type === 'ORDERING') newOption = { ...newOption, sortOrder: question.options.length + 1 };
    setQuestion(prev => ({ ...prev, options: [...prev.options, newOption] }));
  };

  const handleRemoveOption = (id: string) => {
     if (question.options.length > 1) { 
        setQuestion(prev => ({...prev, options: prev.options.filter(o => o.id !== id)}));
     }
  };

  const toggleGrade = (grade: string) => {
    setQuestion(prev => {
      const current = prev.gradeLevels || [];
      return current.includes(grade) ? { ...prev, gradeLevels: current.filter(g => g !== grade) } : { ...prev, gradeLevels: [...current, grade] };
    });
  };

  const validate = (): boolean => {
      if (!question.text || question.text.trim() === '<p></p>' || question.text.trim() === '') {
          toast.error("Please enter a question stem."); 
          return false;
      }
      if (['MULTIPLE_CHOICE', 'TRUE_FALSE', 'MULTIPLE_SELECT'].includes(question.type)) {
          if (!question.options.some(o => o.isCorrect)) {
              toast.error("Please mark at least one correct answer."); 
              return false;
          }
          if (question.options.some(o => !o.text || o.text.trim() === '')) {
              toast.error("One or more answer choices are empty."); 
              return false;
          }
      }
      return true;
  };

  const handleFinalSave = async (targetStatus: ContentStatus, resetAfter: boolean = false) => { 
    if ((targetStatus === 'PUBLISHED' || targetStatus === 'PENDING_REVIEW') && !validate()) return;
    if (targetStatus === 'DRAFT' && (!question.text || question.text === '<p></p>')) {
          toast.error("Question text is required.");
          return;
    }
    setIsSaving(true);
    try {
        if (onSave) {
            await onSave({ 
                ...question, 
                status: targetStatus,
                points: Number(question.points),
                reviewerNotes: question.reviewerNotes 
            });

            if (resetAfter) {
                setQuestion(prev => ({
                    ...defaultQuestion,
                    subject: prev.subject,
                    gradeLevels: prev.gradeLevels,
                    passageId: prev.passageId,
                    passage: prev.passage,
                    status: "DRAFT"
                }));
                toast.success("Question saved! Context preserved.");
            }
        }
    } catch (error) {
        console.error("Save failed", error);
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className={`flex flex-col h-full transition-colors duration-300 ${theme.bg} ${theme.text}`}>
      {/* 🛠️ SLIM HEADER: text-sm (14px), 8% Tint, and Proper Case */}
        <header className={`flex items-center justify-between px-8 py-3 border-b shadow-sm ${theme.paper} ${theme.border}`}>
          <div>
            <div className="flex items-center gap-3">
                <h1 className={`font-black text-base ${theme.text}`}>{initialData ? "Edit item" : "Create new item"}</h1>
                <div className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border transition-colors ${theme.input} ${theme.border}`}>
                  {question.code || "NEW ITEM"}
                </div>
            </div>
            <p className={`opacity-60 text-[10px] font-black tracking-tight`}>
              {question.type.charAt(0) + question.type.slice(1).toLowerCase().replace(/_/g, " ")}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
              {/* Edit/Preview Toggle - Downsized to text-sm */}
              <div className={`flex p-1 rounded-xl border transition-all ${theme.border} bg-black/5`}>
                  <button 
                    onClick={() => setMode('EDIT')} 
                    className={`flex items-center gap-2 px-5 py-1.5 text-sm font-black rounded-lg transition-all duration-200
                      ${mode === 'EDIT' 
                        ? `${themeKey === 'CONTRAST' ? 'bg-yellow-400 text-black' : 'bg-indigo-600 text-white'} shadow-md` 
                        : `${theme.text} hover:bg-current hover:bg-opacity-10`}`}
                  >
                    <Edit3 size={14} /> <span>Edit</span>
                  </button>

                  <button 
                    onClick={() => setMode('PREVIEW')} 
                    className={`flex items-center gap-2 px-5 py-1.5 text-sm font-black rounded-lg transition-all duration-200
                      ${mode === 'PREVIEW' 
                        ? `${themeKey === 'CONTRAST' ? 'bg-yellow-400 text-black' : 'bg-indigo-600 text-white'} shadow-md` 
                        : `${theme.text} hover:bg-current hover:bg-opacity-10`}`}
                  >
                    <Eye size={14} /> <span>Preview</span>
                  </button>
              </div>
          </div>

          <div className="flex items-center gap-2">
              {/* Cancel */}
              <Button 
                variant="ghost" 
                onClick={onCancel} 
                disabled={isSaving} 
                className={`px-4 py-2 rounded-xl border font-black text-sm tracking-normal transition-all active:scale-95 ${theme.border} ${theme.text} bg-current/[0.08] hover:bg-current/[0.08]`}
              >
                Cancel
              </Button>
              
              {/* Save and repeat */}
              {!initialData && (
                  <Button 
                    variant="outline" 
                    onClick={() => handleFinalSave("DRAFT", true)} 
                    disabled={isSaving} 
                    className={`px-4 py-2 rounded-xl border font-black text-sm tracking-normal transition-all active:scale-95 ${theme.border} ${theme.text} bg-current/[0.08] hover:bg-current/[0.08]`}
                  >
                    <PlusSquare size={16} className="mr-2" /> Save and repeat
                  </Button>
              )}

              {/* Save draft */}
              <Button 
                  variant="secondary" 
                  onClick={() => handleFinalSave("DRAFT")} 
                  disabled={isSaving} 
                  className={`px-4 py-2 rounded-xl border font-black text-sm tracking-normal transition-all active:scale-95 ${theme.border} ${theme.text} bg-current/[0.08] hover:bg-current/[0.08]`}
              >
                  {isSaving ? <Loader2 className="animate-spin h-4 w-4" /> : "Save draft"}
              </Button>
              
              {/* Submit / Publish (Highlighted) */}
              {(question.status === 'DRAFT' || question.status === 'CHANGES_REQUESTED') && (
                  <Button 
                    onClick={() => handleFinalSave("PENDING_REVIEW")} 
                    disabled={isSaving} 
                    className={`px-5 py-2 rounded-xl border-none font-black text-sm tracking-normal transition-all shadow-md active:scale-95
                      ${themeKey === 'CONTRAST' ? 'bg-yellow-400 text-black' : 'bg-blue-600 text-white'}`}
                  >
                    {isSaving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Send size={16} className="mr-2" />}
                    Submit review
                  </Button>
              )}

              {(question.status === 'APPROVED' || question.status === 'PUBLISHED') && (
                  <Button 
                    onClick={() => handleFinalSave("PUBLISHED")} 
                    disabled={isSaving} 
                    className={`px-5 py-2 rounded-xl border-none font-black text-sm tracking-normal transition-all shadow-md active:scale-95
                      ${themeKey === 'CONTRAST' ? 'bg-yellow-400 text-black' : 'bg-green-600 text-white'}`}
                  >
                    {isSaving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <CheckCircle size={16} className="mr-2" />} 
                    {question.status === 'PUBLISHED' ? 'Update live' : 'Publish item'}
                  </Button>
              )}
          </div>
        </header>

      {/* Main Content Area */}
      <div className={`flex-1 overflow-hidden flex ${theme.bg}`}>
        {mode === 'EDIT' ? (
            <>
                <aside className={`border-r ${theme.paper} ${theme.border} h-full overflow-hidden flex flex-col`}>
                   <EditorSidebar question={question} onChange={handleChange} onToggleGrade={toggleGrade} />
                </aside>

                <main className={`flex-1 overflow-y-auto p-8 transition-colors ${theme.bg}`}>
                    {isELASubject(question.subject) && (
                        /* 🛠️ Reading Passage Context - Fixed Container visibility */
                        <div className={`mb-8 p-6 rounded-2xl border transition-all duration-300 shadow-sm ${theme.paper} ${theme.border}`}>
                            <PassageManager 
                                selectedPassageId={question.passageId}
                                onSelect={(id, title, content, mediaUrl) => {
                                    setQuestion(prev => ({ 
                                        ...prev, 
                                        passageId: id || undefined, 
                                        passage: id ? { id, title, content, mediaUrl } : undefined 
                                    }));
                                }}
                            />
                        </div>
                    )}

                    <EditorCanvas 
                        question={question} 
                        onChange={handleChange} 
                        onOptionChange={handleOptionChange} 
                        onSetCorrect={handleSetCorrect} 
                        onAddOption={handleAddOption} 
                        onRemoveOption={handleRemoveOption} 
                        onOpenPassageManager={() => {
                            const passageEl = document.querySelector('[data-passage-trigger]');
                            if (passageEl instanceof HTMLElement) passageEl.click();
                        }}
                    />
                </main>
            </>
        ) : (
            <main className={`flex-1 overflow-y-auto p-8 transition-colors ${theme.bg}`}>
                <StudentPreview question={question} onBack={() => setMode('EDIT')} />
            </main>
        )}
      </div>
    </div>
  );
}