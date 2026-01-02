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
  const { theme, themeKey } = useTheme();
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
            <div key={option.id} className={`flex items-start gap-4 p-4 rounded-xl border transition-all group
                ${option.isCorrect 
                    ? `border-green-500 bg-green-500/10` 
                    : `${theme.border} ${theme.bg}`}`}>
                
                <div className="flex flex-col items-center gap-2 pt-2">
                    {/* Choice Letter visibility fix */}
                    <span className={`font-black text-xs ${theme.text}`}>{String.fromCharCode(65 + index)}</span>
                    <button
                        onClick={() => onSetCorrect(option.id)}
                        className={`w-6 h-6 rounded flex items-center justify-center transition-all border-2
                            ${option.isCorrect ? "bg-green-600 border-green-600 text-white" : `${theme.border} hover:border-green-500`}
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
                            placeholder={`Choice ${String.fromCharCode(65 + index)}`}
                        />
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <HelpCircle size={14} className={themeKey === 'CONTRAST' ? 'text-yellow-400' : 'opacity-60'} />
                        <input 
                            type="text"
                            value={option.feedback || ""}
                            onChange={(e) => onOptionChange(option.id, "feedback", e.target.value)}
                            placeholder={option.isCorrect ? "Add rationale for correct answer..." : "Add rationale for incorrect answer..."}
                            className={`flex-1 text-[11px] bg-transparent outline-none border-b border-transparent focus:border-current transition-all placeholder:italic ${theme.text}`}
                        />
                    </div>
                </div>

                <button onClick={() => onRemoveOption(option.id)} className={`mt-2 transition-all opacity-0 group-hover:opacity-100 ${themeKey === 'CONTRAST' ? 'text-yellow-400' : 'text-red-500'}`}>
                    <Trash2 size={18} />
                </button>
            </div>
        ))}

        {/* 🛠️ ADD OPTION - Large Font, Static Solid Background, Zero Hover Color Change */}
            <Button 
                variant="outline" 
                size="lg" 
                onClick={onAddOption} 
                className={`w-full py-8 rounded-2xl border-none shadow-lg transition-transform active:scale-95
                    ${themeKey === 'CONTRAST' 
                        ? 'bg-yellow-400 text-black hover:bg-yellow-400' 
                        : `${theme.accent} hover:${theme.accent.split(' ')[0]}`}`}
            >
                <Plus size={24} className="mr-2" /> 
                <span className="text-lg font-black">Add option</span>
            </Button>
    </>
  );

  const renderMatching = () => (
    <>
        <div className={`flex justify-between px-4 text-xs font-black uppercase mb-3 tracking-widest ${theme.text}`}>
            <span>Premise (Left)</span>
            <span>Match (Right)</span>
        </div>
        {question.options.map((option, index) => (
            <div key={option.id} className={`grid grid-cols-[1fr_auto_1fr_auto] gap-4 items-start p-4 rounded-xl border ${theme.border} ${theme.bg}`}>
                <div className="flex-1">
                    <RichTextEditor 
                        compact={true} 
                        content={option.text} 
                        onChange={(html) => onOptionChange(option.id, "text", html)}
                        placeholder={`Item ${index + 1}`}
                    />
                </div>
                <div className={`pt-3 ${theme.text} opacity-40`}><ArrowRightLeft size={16}/></div>
                <div className="flex-1">
                    <input 
                        className={`w-full p-2.5 border rounded-lg text-sm transition-all outline-none focus:ring-2 ${theme.input} ${theme.border}`}
                        placeholder={`Matching Pair for ${index + 1}`}
                        value={option.matchText || ""}
                        onChange={(e) => onOptionChange(option.id, "matchText", e.target.value)}
                    />
                </div>
                <button onClick={() => onRemoveOption(option.id)} className={`pt-3 transition-colors ${themeKey === 'CONTRAST' ? 'text-yellow-400' : 'text-red-500 opacity-40 hover:opacity-100'}`}>
                    <Trash2 size={18} />
                </button>
            </div>
        ))}
        <Button variant="outline" size="sm" onClick={onAddOption} className={`w-full py-8 border-2 border-dashed font-black uppercase tracking-widest transition-all hover:opacity-100 ${theme.border} ${theme.text} bg-opacity-5 bg-current`}>
            <Plus size={20} className="mr-2" /> Add Matching Pair
        </Button>
    </>
  );

  const renderOrdering = () => (
    <>
        {question.options.map((option, index) => (
            <div key={option.id} className={`flex items-center gap-4 p-3 rounded-xl border ${theme.border} ${theme.bg}`}>
                <div className={`w-8 h-8 flex items-center justify-center rounded font-black text-sm border ${theme.border} ${theme.text} bg-opacity-10 bg-current`}>
                    {index + 1}
                </div>
                <div className="flex-1">
                    <input 
                        className={`w-full p-2 bg-transparent outline-none font-bold text-sm ${theme.text}`}
                        placeholder={`Sequence Step ${index + 1}`}
                        value={option.text}
                        onChange={(e) => onOptionChange(option.id, "text", e.target.value)}
                    />
                </div>
                <button onClick={() => onRemoveOption(option.id)} className={`transition-colors ${themeKey === 'CONTRAST' ? 'text-yellow-400' : 'text-red-500 opacity-40 hover:opacity-100'}`}>
                    <Trash2 size={18} />
                </button>
            </div>
        ))}
        <Button variant="outline" size="sm" onClick={onAddOption} className={`w-full py-8 border-2 border-dashed font-black uppercase tracking-widest transition-all hover:opacity-100 ${theme.border} ${theme.text} bg-opacity-5 bg-current`}>
            <Plus size={20} className="mr-2" /> Add Sequence Step
        </Button>
    </>
  );

  const renderShortAnswerOrFill = () => (
    <div className={`p-6 rounded-xl border border-dashed text-center transition-all ${theme.bg} ${theme.border}`}>
        <FileText className={`mx-auto mb-3 ${theme.text} opacity-40`} size={28} />
        <p className={`font-black mb-4 text-xs uppercase tracking-tighter ${theme.text}`}>
            {question.type === 'FILL_IN_THE_BLANK' ? 'Enter statement with blanks (e.g. "The sky is [blue].")' : 'Enter expected response or scoring rubric.'}
        </p>
        <textarea 
            className={`w-full p-4 border rounded-xl outline-none min-h-[100px] resize-y text-sm transition-all ${theme.input} ${theme.border}`}
            placeholder="Type correct answer or rubric here..."
            value={question.options[0]?.text || ""}
            onChange={(e) => onOptionChange(question.options[0]?.id || "rubric", "text", e.target.value)}
        />
    </div>
  );

  return (
    <div className={`w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ${theme.text}`}> 
        
        {/* REVIEWER FEEDBACK - Opposing colors enforced */}
        {question.reviewerNotes && (
            <section className={`p-5 rounded-2xl border-2 shadow-md flex gap-4 animate-in slide-in-from-top-2 mb-6 
                ${themeKey === 'CONTRAST' ? 'border-yellow-400 bg-black' : 'border-amber-400 bg-amber-500/10'}`}>
                <div className={`p-2 rounded-xl h-fit ${themeKey === 'CONTRAST' ? 'text-yellow-400' : 'text-amber-600 bg-amber-100'}`}>
                    <AlertCircle size={24} />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                        <h4 className={`text-xs font-black uppercase tracking-widest ${themeKey === 'CONTRAST' ? 'text-yellow-400' : 'text-amber-800'}`}>Reviewer Feedback</h4>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${themeKey === 'CONTRAST' ? 'border-yellow-400 text-yellow-400' : 'bg-white text-amber-600 border-amber-200 shadow-sm'}`}>Action Required</span>
                    </div>
                    <p className={`text-sm font-bold leading-relaxed ${themeKey === 'CONTRAST' ? 'text-yellow-100' : 'text-amber-950'}`}>
                        {question.reviewerNotes}
                    </p>
                </div>
            </section>
        )}

        {/* 📖 PASSAGE LINKING - Visibility fix for Header and Container */}
        {isELA && (
            <section className={`p-6 rounded-2xl border transition-all shadow-sm ${theme.paper} ${theme.border}`}>
                <div className="flex items-center justify-between mb-4 px-1">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${themeKey === 'CONTRAST' ? 'bg-yellow-400 text-black' : theme.accent}`}>
                          <BookOpen size={20} />
                        </div>
                        <h3 className={`font-black text-xs uppercase tracking-widest ${theme.text}`}>Linked Passage Context</h3>
                    </div>
                    
                    <div className={`text-[10px] font-black px-3 py-1 rounded border transition-all
                        ${question.passageId 
                          ? (themeKey === 'CONTRAST' ? 'border-yellow-400 text-yellow-400' : 'bg-green-500 text-white border-green-600 shadow-sm') 
                          : (themeKey === 'CONTRAST' ? 'border-yellow-400 opacity-50' : 'bg-amber-50 text-amber-600 border-amber-200')}`}>
                        {question.passageId ? "STATUS: LINKED" : "STATUS: NOT LINKED"}
                    </div>
                </div>

                <div className={`flex items-center justify-between p-5 rounded-2xl border-2 border-dashed transition-colors ${theme.bg} ${theme.border}`}>
                    <div className="flex flex-col gap-1">
                        <span className={`text-[10px] font-black uppercase tracking-widest opacity-60 ${theme.text}`}>Active Context:</span>
                        <p className={`text-base font-black ${theme.text}`}>
                            {question.passage?.title || "No passage attached to this item."}
                        </p>
                    </div>
                    <button 
                        data-passage-trigger
                        onClick={onOpenPassageManager}
                        className={`px-6 py-2.5 border rounded-xl text-[10px] font-black uppercase shadow-md transition-all hover:scale-[1.03] ${theme.accent}`}
                    >
                        {question.passageId ? "Update Passage Link" : "Select Passage to Link"}
                    </button>
                </div>
            </section>
        )}

        {/* 1. PROMPT EDITOR - Input and Badge Fix */}
        <section className={`p-6 rounded-2xl border shadow-sm ${theme.paper} ${theme.border}`}>
            <div className="flex justify-between items-center mb-4">
                 <label className={`text-xs font-black uppercase tracking-widest ${theme.text}`}>Question Prompt</label>
                 {/* 🛠️ POINTS BADGE - Forced visibility tint */}
                 <div className={`flex items-center px-4 py-1.5 rounded-xl border font-black text-sm tracking-tight transition-all
                    ${theme.border} ${theme.text} bg-current/[0.08]`}>
                    <span>
                        {question.points} {question.points === 1 ? 'point' : 'points'}
                    </span>
                </div>
            </div>
            <RichTextEditor 
                content={question.text}
                onChange={(html) => onChange("text", html)}
                placeholder="Compose your question stem here..."
                compact={false} 
            />
            
            {/* Image Section - Corrected Inputs */}
            <div className={`mt-6 flex flex-col md:flex-row gap-4 p-5 rounded-2xl border transition-colors ${theme.bg} ${theme.border}`}>
                 <ImageIcon size={24} className={`${theme.text} opacity-30`} />
                 <div className="flex-1 flex flex-wrap gap-4 w-full">
                    <div className="flex-1 min-w-[240px] flex gap-2">
                        {/* 🛠️ Media Input Fix */}
                        <input 
                            type="text" 
                            className={`flex-1 p-3 text-xs border rounded-xl outline-none transition-all focus:ring-2 ${theme.input} ${theme.border}`}
                            placeholder="Resource URL (Image/Video)..."
                            value={question.mediaUrl || ""}
                            onChange={(e) => onChange("mediaUrl", e.target.value)}
                        />
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                        <Button size="icon" variant="outline" className={`h-11 w-11 border shadow-md transition-all ${theme.border} ${theme.text} bg-transparent hover:bg-opacity-10 hover:bg-current`} onClick={triggerUpload}>
                            <Upload size={18} />
                        </Button>
                    </div>
                    {/* 🛠️ Alt Text Input Fix */}
                    <input 
                        type="text" 
                        className={`flex-1 min-w-[180px] p-3 text-xs border rounded-xl outline-none transition-all focus:ring-2 ${theme.input} ${theme.border}`}
                        placeholder="Accessibility Alt Text..."
                        value={question.mediaAltText || ""}
                        onChange={(e) => onChange("mediaAltText", e.target.value)}
                    />
                 </div>
                 {question.mediaUrl && (
                    <div className={`h-11 w-16 rounded-xl border overflow-hidden shadow-inner flex-shrink-0 ${theme.border} bg-white`}>
                        <img src={question.mediaUrl} className="h-full w-full object-cover" alt="Preview" />
                    </div>
                 )}
            </div>
        </section>

        {/* 2. CHOICES EDITOR - Header and Row Fix */}
        <section className={`p-6 rounded-2xl border shadow-sm ${theme.paper} ${theme.border}`}>
            <div className={`flex items-center gap-2 mb-5 px-1`}>
                <h3 className={`font-black text-xs uppercase tracking-widest ${theme.text}`}>
                    {['SHORT_ANSWER', 'FILL_IN_THE_BLANK'].includes(question.type) ? 'Assessment Key' : 'Response Selections'}
                </h3>
            </div>
            <div className="space-y-4">
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

        {/* 3. RATIONALE - Header Fix */}
        <section className={`p-6 rounded-2xl border shadow-sm ${theme.paper} ${theme.border}`}>
            <div className={`flex items-center gap-2 mb-4 px-1`}>
                <AlertCircle size={14} className={`${theme.text} opacity-60`}/>
                <h3 className={`font-black text-xs uppercase tracking-widest ${theme.text}`}>Teacher Rationale</h3>
            </div>
            <RichTextEditor 
                content={question.explanation}
                onChange={(html) => onChange("explanation", html)}
                placeholder="Explain why the correct answer is right..."
                compact={true}
            />
        </section>
    </div>
  );
}