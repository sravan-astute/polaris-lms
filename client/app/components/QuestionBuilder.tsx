"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation"; 
import { Save, Eye, Edit3, Loader2, Send, CheckCircle } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { useTheme } from "../context/ThemeContext";
import { toast } from "sonner"; 

import EditorSidebar from "./builder/EditorSidebar";
import EditorCanvas from "./builder/EditorCanvas";
import StudentPreview from "./builder/StudentPreview";
// 👇 NEW: Import the Passage Manager
import PassageManager from "./builder/PassageManager";

// --- TYPES ---
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
  tags: string; 
  points: number;
  passageId?: string; // 👈 ADDED: Optional link to a parent passage
}

interface QuestionBuilderProps {
  quizId?: string; initialData?: QuestionData;
  onCancel: () => void; onQuestionAdded?: () => void; 
  onSave?: (data: QuestionData) => Promise<void> | void;
}

export default function QuestionBuilder({ 
  quizId, initialData, onCancel, onQuestionAdded, onSave
}: QuestionBuilderProps) {
  const { theme } = useTheme();
  const router = useRouter(); 
  const [mode, setMode] = useState<'EDIT' | 'PREVIEW'>('EDIT');
  const [isSaving, setIsSaving] = useState(false); 

  const defaultQuestion: QuestionData = {
      subject: "MATH", gradeLevels: ["3"], standards: [], difficulty: "MEDIUM",
      type: "MULTIPLE_CHOICE", status: "DRAFT", bloomsTaxonomy: "REMEMBER",
      dokLevel: "LEVEL_1", calculator: false, text: "", mediaUrl: "",
      mediaType: "IMAGE", mediaAltText: "", tags: "", explanation: "", points: 1,
      options: [{ id: "1", text: "", isCorrect: false }, { id: "2", text: "", isCorrect: false }]
  };

  // --- HELPER: Safely convert tags ---
  const formatTagsOnLoad = (tags: any): string => {
      if (Array.isArray(tags)) return tags.join(', ');
      if (typeof tags === 'string') return tags;      
      return "";
  };

  const [question, setQuestion] = useState<QuestionData>({
      ...defaultQuestion, 
      ...initialData,
      standards: initialData?.standards ?? [],
      gradeLevels: initialData?.gradeLevels ?? ["3"],
      options: initialData?.options ?? defaultQuestion.options,
      code: initialData?.code || "",
      tags: formatTagsOnLoad(initialData?.tags), 
      passageId: initialData?.passageId || undefined, // 👈 Initialize Passage ID
  });

  // --- SMART TYPE SWITCHING ---
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

  // --- VALIDATION ---
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

  // --- SAVE LOGIC ---
  const handleFinalSave = async (targetStatus: ContentStatus) => { 
    // 1. Validate
    if ((targetStatus === 'PUBLISHED' || targetStatus === 'PENDING_REVIEW') && !validate()) return;
    
    // 2. Draft Check
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
                points: Number(question.points) 
            });
        } else {
            console.warn("No onSave prop provided to QuestionBuilder");
        }
    } catch (error) {
        console.error("Save failed", error);
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className={`flex flex-col h-full transition-colors duration-300`}>
      {/* Header */}
      <header className={`flex items-center justify-between px-8 py-4 border-b shadow-sm ${theme.paper} ${theme.border}`}>
        <div>
          <div className="flex items-center gap-3">
             <h1 className="font-bold">{initialData ? "Edit Item" : "Create New Item"}</h1>
             <div className="text-xs font-mono bg-gray-100 border border-gray-300 rounded px-2 py-1 text-gray-600">
                {question.code || "NEW"}
             </div>
          </div>
          <p className={`opacity-70 text-sm`}>{question.type.replace(/_/g, " ")}</p>
        </div>
        
        {/* Toggle Mode */}
        <div className="flex items-center gap-4">
           <div className={`flex p-1 rounded-lg border ml-8 ${theme.border} bg-black/5`}>
             <button onClick={() => setMode('EDIT')} className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${mode === 'EDIT' ? 'bg-white shadow-sm text-indigo-600' : 'opacity-60 hover:opacity-100'}`}><Edit3 size={14} /> Edit</button>
             <button onClick={() => setMode('PREVIEW')} className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${mode === 'PREVIEW' ? 'bg-white shadow-sm text-indigo-600' : 'opacity-60 hover:opacity-100'}`}><Eye size={14} /> Preview</button>
           </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
           <Button variant="ghost" onClick={onCancel} disabled={isSaving} className={`hover:bg-current hover:bg-opacity-10 ${theme.text}`}>Cancel</Button>
           
           {/* 1. SAVE DRAFT */}
           <Button variant="secondary" onClick={() => handleFinalSave("DRAFT")} disabled={isSaving} className={`border ${theme.border} hover:opacity-80`}>
             {isSaving ? <Loader2 className="animate-spin h-4 w-4" /> : "Save Draft"}
           </Button>
           
           {/* 2. SUBMIT FOR REVIEW */}
           {(question.status === 'DRAFT' || question.status === 'CHANGES_REQUESTED') && (
               <Button onClick={() => handleFinalSave("PENDING_REVIEW")} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white border-none">
                 {isSaving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Send size={16} className="mr-2" />}
                 Submit for Review
               </Button>
           )}

           {/* 3. PUBLISH */}
           {(question.status === 'APPROVED' || question.status === 'PUBLISHED') && (
               <Button onClick={() => handleFinalSave("PUBLISHED")} disabled={isSaving} className="bg-green-600 hover:bg-green-700 text-white border-none">
                 {isSaving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <CheckCircle size={16} className="mr-2" />} 
                 {question.status === 'PUBLISHED' ? 'Update Live' : 'Publish Now'}
               </Button>
           )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex">
        {mode === 'EDIT' ? (
            <>
                <EditorSidebar question={question} onChange={handleChange} onToggleGrade={toggleGrade} />
                <main className={`flex-1 overflow-y-auto p-8`}>
                    
                    {/* 🌟 NEW: ELA PASSAGE MANAGER */}
                    {question.subject === 'ELA' && (
                        <PassageManager 
                            selectedPassageId={question.passageId}
                            onSelect={(id, title, content) => {
                                setQuestion(prev => ({ ...prev, passageId: id }));
                                toast.success("Passage linked!");
                            }}
                        />
                    )}

                    <EditorCanvas 
                        question={question} 
                        onChange={handleChange} 
                        onOptionChange={handleOptionChange} 
                        onSetCorrect={handleSetCorrect} 
                        onAddOption={handleAddOption} 
                        onRemoveOption={handleRemoveOption} 
                    />
                </main>
            </>
        ) : (
            <main className={`flex-1 overflow-y-auto p-8`}>
                <StudentPreview question={question} onBack={() => setMode('EDIT')} />
            </main>
        )}
      </div>
    </div>
  );
}