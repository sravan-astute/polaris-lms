"use client";

import React, { useState } from "react";
import { Save, Eye, Edit3 } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { useTheme } from "../context/ThemeContext";

// 👇 Imports from your BUILDER folder
import EditorSidebar from "./builder/EditorSidebar";
import EditorCanvas from "./builder/EditorCanvas";
import StudentPreview from "./builder/StudentPreview";

export type QuestionType = "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
export type Subject = "MATH" | "ELA" | "SCIENCE" | "SOCIAL_STUDIES";

export interface Option {
  id: string; text: string; isCorrect: boolean; feedback?: string; 
}

export interface QuestionData {
  id?: string; type: QuestionType; subject: Subject; status: "DRAFT" | "PUBLISHED";
  gradeLevels: string[]; standards: string[]; difficulty: string;
  bloomsTaxonomy: string; dokLevel: string; calculator: boolean; 
  mediaUrl?: string; mediaType?: "IMAGE" | "VIDEO" | "AUDIO"; mediaAltText?: string;
  text: string; options: Option[]; explanation: string; tags: string; points: number;
}

interface QuestionBuilderProps {
  quizId?: string;
  initialData?: QuestionData;
  onCancel: () => void;              // Required (Both pages use this)
  onQuestionAdded?: () => void;      // Optional (Used by Quiz Page)
  onSave?: (question: QuestionData) => void; // Optional (Used by Bank Page)
}

// ⚠️ ALSO UPDATE THE FUNCTION COMPONENT LINE BELOW IT:
export default function QuestionBuilder({ 
  quizId, 
  initialData, 
  onSave, 
  onCancel, 
  onQuestionAdded 
}: QuestionBuilderProps) {
  const { theme } = useTheme();
  const [mode, setMode] = useState<'EDIT' | 'PREVIEW'>('EDIT');
  
  // Robust Initialization
  const defaultQuestion: QuestionData = {
      subject: "MATH", gradeLevels: ["3"], standards: [], difficulty: "MEDIUM",
      type: "MULTIPLE_CHOICE", status: "DRAFT", bloomsTaxonomy: "REMEMBER",
      dokLevel: "LEVEL_1", calculator: false, text: "", mediaUrl: "",
      mediaType: "IMAGE", mediaAltText: "", tags: "", explanation: "", points: 1,
      options: [{ id: "1", text: "", isCorrect: false }, { id: "2", text: "", isCorrect: false }]
  };

  const [question, setQuestion] = useState<QuestionData>({
      ...defaultQuestion, ...initialData,
      standards: initialData?.standards ?? [],
      gradeLevels: initialData?.gradeLevels ?? ["3"],
      options: initialData?.options ?? defaultQuestion.options,
  });

  const handleChange = (field: keyof QuestionData, value: any) => {
    if (field === 'type' && value !== question.type) {
       // Reset logic for type change can go here if needed
    }
    setQuestion((prev) => ({ ...prev, [field]: value }));
  };

  const handleOptionChange = (id: string, field: keyof Option, value: any) => {
    setQuestion(prev => ({ ...prev, options: prev.options.map(opt => opt.id === id ? { ...opt, [field]: value } : opt) }));
  };

  const handleSetCorrect = (id: string) => {
    setQuestion(prev => ({ ...prev, options: prev.options.map(opt => ({ ...opt, isCorrect: opt.id === id })) }));
  };

  const handleAddOption = () => {
    setQuestion(prev => ({ ...prev, options: [...prev.options, { id: crypto.randomUUID(), text: "", isCorrect: false }] }));
  };

  const handleRemoveOption = (id: string) => {
     if (question.options.length > 2) {
        setQuestion(prev => ({...prev, options: prev.options.filter(o => o.id !== id)}));
     }
  };

  const toggleGrade = (grade: string) => {
    setQuestion(prev => {
      const current = prev.gradeLevels || [];
      return current.includes(grade) ? { ...prev, gradeLevels: current.filter(g => g !== grade) } : { ...prev, gradeLevels: [...current, grade] };
    });
  };

  const handleFinalSave = (status: "DRAFT" | "PUBLISHED") => {
    if (!question.text.trim()) return alert("Question text is required.");
    if (onSave) {
    onSave({ ...question, status });
    }
  };

  return (
    <div className={`flex flex-col h-full transition-colors duration-300`}>
      <header className={`flex items-center justify-between px-8 py-4 border-b shadow-sm ${theme.paper} ${theme.border}`}>
        <div>
          <h1 className="font-bold flex items-center gap-2">{initialData ? "Edit Item" : "Create New Item"}</h1>
          <p className={`opacity-70 text-sm`}>{question.type.replace("_", " ")} Editor</p>
        </div>
        <div className="flex items-center gap-4">
           <div className={`flex p-1 rounded-lg border ml-8 ${theme.border} bg-black/5`}>
             <button onClick={() => setMode('EDIT')} className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${mode === 'EDIT' ? 'bg-white shadow-sm text-indigo-600' : 'opacity-60 hover:opacity-100'}`}><Edit3 size={14} /> Edit</button>
             <button onClick={() => setMode('PREVIEW')} className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${mode === 'PREVIEW' ? 'bg-white shadow-sm text-indigo-600' : 'opacity-60 hover:opacity-100'}`}><Eye size={14} /> Preview</button>
           </div>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="ghost" onClick={onCancel} className={`hover:bg-current hover:bg-opacity-10 ${theme.text}`}>Cancel</Button>
           <Button variant="secondary" onClick={() => handleFinalSave("DRAFT")} className={`border ${theme.border} hover:opacity-80`}>Save Draft</Button>
           <Button onClick={() => handleFinalSave("PUBLISHED")} className={`${theme.accent} border-none`}><Save size={18} className="mr-2" /> Publish</Button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex">
        {mode === 'EDIT' ? (
            <>
                <EditorSidebar question={question} onChange={handleChange} onToggleGrade={toggleGrade} />
                <main className={`flex-1 overflow-y-auto p-8`}>
                    <EditorCanvas question={question} onChange={handleChange} onOptionChange={handleOptionChange} onSetCorrect={handleSetCorrect} onAddOption={handleAddOption} onRemoveOption={handleRemoveOption} />
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