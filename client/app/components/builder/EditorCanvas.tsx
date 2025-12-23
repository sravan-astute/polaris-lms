"use client";

import React, { useRef } from "react";
import { 
  Image as ImageIcon, CheckCircle, AlertCircle, FileText, Upload, Trash2, Plus, HelpCircle, 
  ArrowRightLeft, BookOpen, Link as LinkIcon, X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "../../context/ThemeContext";
import { QuestionData, Option } from "../QuestionBuilder";
import RichTextEditor from "../RichTextEditor"; 

interface EditorCanvasProps {
  question: QuestionData;
  onChange: (field: keyof QuestionData, value: any) => void;
  onOptionChange: (id: string, field: keyof Option, value: any) => void;
  onSetCorrect: (id: string) => void;
  onAddOption: () => void;
  onRemoveOption: (id: string) => void;
  onOpenPassageManager?: () => void; 
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

export default function EditorCanvas({ 
  question, onChange, onOptionChange, onSetCorrect, onAddOption, onRemoveOption, onOpenPassageManager 
}: EditorCanvasProps) {
  const { theme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Please upload an image."); return; }
    try {
        const compressedBase64 = await compressImage(file);
        onChange("mediaUrl", compressedBase64);
        if (!question.mediaAltText) onChange("mediaAltText", file.name.split('.')[0]);
    } catch (error) {
        console.error("Upload failed", error);
        alert("Failed to upload image.");
    }
  };

  const triggerUpload = () => fileInputRef.current?.click();

  const isELA = question.subject?.toUpperCase().includes('ELA') || 
                question.subject?.toUpperCase().includes('READING') || 
                question.subject?.toUpperCase().includes('ENGLISH');

  const renderMultipleChoiceOrSelect = (isMulti: boolean) => (
    <>
        {question.options.map((option, index) => (
            <div key={option.id} className={`flex items-start gap-4 p-3 rounded-lg border transition-all group
                ${option.isCorrect 
                    ? `bg-green-500/5 border-green-500 ring-1 ring-green-500` 
                    : `${theme.border} hover:bg-black/5`}`}>
                
                <div className="flex flex-col items-center gap-2 pt-3">
                    <span className="font-bold opacity-40 text-xs">{String.fromCharCode(65 + index)}</span>
                    <button
                        onClick={() => onSetCorrect(option.id)}
                        className={`w-6 h-6 rounded flex items-center justify-center transition-all 
                            ${option.isCorrect ? "bg-green-600 border-green-600 text-white" : "border border-gray-300 hover:border-green-400"}
                            ${isMulti ? "rounded-md" : "rounded-full"}`}
                    >
                        {option.isCorrect && <CheckCircle size={14} />}
                    </button>
                </div>

                <div className="flex-1 space-y-2">
                    <div className="min-h-[38px]">
                        <RichTextEditor 
                            compact={true} 
                            content={option.text}
                            onChange={(html) => onOptionChange(option.id, "text", html)}
                            placeholder={`Option ${String.fromCharCode(65 + index)}`}
                        />
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <HelpCircle size={12} className="opacity-30" />
                        <input 
                            type="text"
                            value={option.feedback || ""}
                            onChange={(e) => onOptionChange(option.id, "feedback", e.target.value)}
                            placeholder={option.isCorrect ? "Why correct?" : "Why incorrect?"}
                            className={`flex-1 text-[11px] bg-transparent outline-none opacity-50 focus:opacity-100 placeholder:italic ${theme.text}`}
                        />
                    </div>
                </div>

                <button onClick={() => onRemoveOption(option.id)} className="mt-3 opacity-0 group-hover:opacity-40 hover:!opacity-100 hover:text-red-500 transition-all">
                    <Trash2 size={16} />
                </button>
            </div>
        ))}

        <Button variant="outline" size="sm" onClick={onAddOption} className={`w-full border-dashed opacity-50 hover:opacity-100 ${theme.border} ${theme.text}`}>
            <Plus size={16} className="mr-2" /> Add Option
        </Button>
    </>
  );

  const renderMatching = () => (
    <>
        <div className="flex justify-between px-4 text-xs font-bold opacity-50 uppercase mb-2">
            <span>Premise (Left)</span>
            <span>Match (Right)</span>
        </div>
        {question.options.map((option, index) => (
            <div key={option.id} className={`grid grid-cols-[1fr_auto_1fr_auto] gap-4 items-start p-3 rounded-lg border ${theme.border}`}>
                <div className="flex-1">
                    <RichTextEditor 
                        compact={true} 
                        content={option.text} 
                        onChange={(html) => onOptionChange(option.id, "text", html)}
                        placeholder={`Item ${index + 1}`}
                    />
                </div>
                <div className="pt-3 opacity-30"><ArrowRightLeft size={16}/></div>
                <div className="flex-1">
                    <input 
                        className={`w-full p-2 border rounded ${theme.input} text-sm`}
                        placeholder={`Match for Item ${index + 1}`}
                        value={option.matchText || ""}
                        onChange={(e) => onOptionChange(option.id, "matchText", e.target.value)}
                    />
                </div>
                <button onClick={() => onRemoveOption(option.id)} className="pt-3 opacity-30 hover:text-red-500 hover:opacity-100">
                    <Trash2 size={16} />
                </button>
            </div>
        ))}
        <Button variant="outline" size="sm" onClick={onAddOption} className={`w-full border-dashed opacity-50 hover:opacity-100 ${theme.border} ${theme.text}`}>
            <Plus size={16} className="mr-2" /> Add Matching Pair
        </Button>
    </>
  );

  const renderOrdering = () => (
    <>
        {question.options.map((option, index) => (
            <div key={option.id} className={`flex items-center gap-4 p-2 rounded-lg border ${theme.border}`}>
                <div className="bg-gray-100 w-8 h-8 flex items-center justify-center rounded font-bold text-gray-500 text-sm">
                    {index + 1}
                </div>
                <div className="flex-1">
                    <input 
                        className={`w-full p-2 bg-transparent outline-none font-medium text-sm ${theme.text}`}
                        placeholder={`Step ${index + 1}`}
                        value={option.text}
                        onChange={(e) => onOptionChange(option.id, "text", e.target.value)}
                    />
                </div>
                <button onClick={() => onRemoveOption(option.id)} className="opacity-30 hover:text-red-500 hover:opacity-100">
                    <Trash2 size={16} />
                </button>
            </div>
        ))}
        {/* 🛠️ SYNTAX FIX: Changed </button> to </Button> on the next line */}
        <Button variant="outline" size="sm" onClick={onAddOption} className={`w-full border-dashed opacity-50 hover:opacity-100 ${theme.border} ${theme.text}`}>
            <Plus size={16} className="mr-2" /> Add Step
        </Button>
    </>
  );

  const renderShortAnswerOrFill = () => (
    <div className={`p-4 rounded-lg border border-dashed text-center opacity-70 ${theme.border}`}>
        <FileText className="mx-auto mb-2 opacity-50" size={20} />
        <p className="font-medium mb-2 text-xs">
            {question.type === 'FILL_IN_THE_BLANK' ? 'Enter the sentence with blanks (e.g. "2 + [2] = 4")' : 'Enter rubric or keywords for grading.'}
        </p>
        <textarea 
            className={`w-full p-2 border rounded outline-none min-h-[38px] resize-y text-sm ${theme.input}`}
            placeholder="Type response key here..."
            rows={1}
            value={question.options[0]?.text || ""}
            onChange={(e) => onOptionChange(question.options[0]?.id || "rubric", "text", e.target.value)}
        />
    </div>
  );

  return (
    <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500"> 
        
        {/* 🛠️ REVIEWER FEEDBACK BOX (Placed at top for visibility) */}
        {question.reviewerNotes && (
            <section className="p-5 rounded-xl border-2 border-amber-200 bg-amber-50 shadow-sm flex gap-4 animate-in slide-in-from-top-2 mb-6">
                <div className="p-2 bg-amber-100 rounded-lg h-fit text-amber-600">
                    <AlertCircle size={20} />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                        <h4 className="text-[10px] font-black uppercase text-amber-700 tracking-widest">Reviewer Feedback</h4>
                        <span className="text-[9px] font-bold text-amber-500 bg-white px-2 py-0.5 rounded-full border border-amber-100">Action Required</span>
                    </div>
                    <p className="text-sm text-amber-900 font-medium leading-relaxed">
                        {question.reviewerNotes}
                    </p>
                </div>
            </section>
        )}

        {/* 📖 PASSAGE LINKING SECTION */}
        {isELA && (
            <section className={`p-4 rounded-xl border bg-white border-indigo-100 shadow-sm`}>
                <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2 text-indigo-900">
                        <BookOpen size={18} />
                        <h3 className="font-black text-[10px] uppercase tracking-widest">Linked Passage Context</h3>
                    </div>
                    
                    {question.passageId ? (
                        <div className="flex items-center gap-2">
                             <div className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded uppercase border border-green-100 animate-in zoom-in-95">
                                Linked
                            </div>
                            <button onClick={() => onChange('passageId', null)} className="text-slate-300 hover:text-red-500 transition-all"><X size={14}/></button>
                        </div>
                    ) : (
                        <div className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase border border-amber-100">
                            Not Linked
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border-2 border-dashed border-slate-100 bg-slate-50/50">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Current Passage:</span>
                        <p className="text-sm font-bold text-slate-700 leading-tight">
                            {question.passage?.title || "None selected"}
                        </p>
                    </div>
                    <button 
                        data-passage-trigger
                        onClick={onOpenPassageManager}
                        className="px-4 py-2 bg-white border border-indigo-200 text-indigo-600 rounded-lg text-[10px] font-black uppercase hover:bg-indigo-50 transition-all shadow-sm"
                    >
                        {question.passageId ? "Change Passage" : "Link Passage"}
                    </button>
                </div>
            </section>
        )}

        {/* 1. Prompt Editor */}
        <section className={`rounded-xl shadow-sm border overflow-hidden ${theme.paper} ${theme.border}`}>
            <div className="p-5 space-y-4">
                <div className="flex justify-between items-center mb-1">
                     <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Question Stem</label>
                     <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        {question.points} PT{question.points !== 1 && 'S'}
                     </span>
                </div>
                <RichTextEditor 
                    content={question.text}
                    onChange={(html) => onChange("text", html)}
                    placeholder="Type your question here..."
                    compact={true} 
                />
                
                <div className={`flex gap-4 items-center p-3 rounded-lg border bg-gray-50/50 ${theme.border}`}>
                     <ImageIcon size={20} className="opacity-30" />
                     <div className="flex-1 flex flex-wrap gap-3">
                        <div className="flex-1 min-w-[200px] flex gap-2">
                            <input 
                                type="text" 
                                className={`flex-1 p-2 text-xs border rounded outline-none bg-white ${theme.input}`}
                                placeholder="Image URL..."
                                value={question.mediaUrl || ""}
                                onChange={(e) => onChange("mediaUrl", e.target.value)}
                            />
                            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                            <Button size="icon" variant="outline" className={`h-8 w-8 ${theme.text}`} onClick={triggerUpload}>
                                <Upload size={14} />
                            </Button>
                        </div>
                        <input 
                            type="text" 
                            className={`flex-1 min-w-[150px] p-2 text-xs border rounded outline-none bg-white ${theme.input}`}
                            placeholder="Alt text..."
                            value={question.mediaAltText || ""}
                            onChange={(e) => onChange("mediaAltText", e.target.value)}
                        />
                     </div>
                     {question.mediaUrl && (
                        <div className="h-8 w-12 rounded border overflow-hidden bg-white shadow-sm">
                            <img src={question.mediaUrl} className="h-full w-full object-cover" alt="Preview" />
                        </div>
                     )}
                </div>
            </div>
        </section>

        {/* 2. Answers Editor */}
        <section className={`rounded-xl shadow-sm border overflow-hidden ${theme.paper} ${theme.border}`}>
            <div className={`px-5 py-2 border-b bg-gray-50/50 flex items-center gap-2 ${theme.border}`}>
                <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-900">
                    {['SHORT_ANSWER', 'FILL_IN_THE_BLANK'].includes(question.type) ? 'Key' : 'Choices'}
                </h3>
            </div>
            <div className="p-4 space-y-3">
                {question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE' 
                    ? renderMultipleChoiceOrSelect(false) 
                    : question.type === 'MULTIPLE_SELECT' 
                    ? renderMultipleChoiceOrSelect(true)
                    : question.type === 'MATCHING'
                    ? renderMatching()
                    : question.type === 'ORDERING'
                    ? renderOrdering()
                    : renderShortAnswerOrFill()
                }
            </div>
        </section>

        {/* 3. Teacher Notes */}
        <section className={`rounded-xl shadow-sm border overflow-hidden ${theme.paper} ${theme.border}`}>
            <div className={`px-5 py-2 border-b bg-gray-50/50 ${theme.border}`}>
                <h3 className={`font-black text-[10px] uppercase tracking-widest text-slate-900 flex items-center gap-2`}>
                    <AlertCircle size={12}/> Teacher Notes
                </h3>
            </div>
            <div className="p-4">
                <RichTextEditor 
                    content={question.explanation}
                    onChange={(html) => onChange("explanation", html)}
                    placeholder="Rationale..."
                    compact={true}
                />
            </div>
        </section>
    </div>
  );
}