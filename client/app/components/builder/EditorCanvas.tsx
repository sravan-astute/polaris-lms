"use client";

import React, { useRef } from "react";
import { 
  Image as ImageIcon, Bold, Italic, Code, Sigma, 
  Trash2, Plus, CheckCircle, HelpCircle, AlertCircle, FileText, Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "../../context/ThemeContext";
import { QuestionData, Option } from "../QuestionBuilder";

interface EditorCanvasProps {
  question: QuestionData;
  onChange: (field: keyof QuestionData, value: any) => void;
  onOptionChange: (id: string, field: keyof Option, value: any) => void;
  onSetCorrect: (id: string) => void;
  onAddOption: () => void;
  onRemoveOption: (id: string) => void;
}

export default function EditorCanvas({ 
  question, onChange, onOptionChange, onSetCorrect, onAddOption, onRemoveOption 
}: EditorCanvasProps) {
  const { theme } = useTheme();
  
  // Refs for Text and File Input
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- MARKDOWN HELPER ---
  const insertMarkdown = (syntax: string) => {
    if (!textAreaRef.current) return;
    const start = textAreaRef.current.selectionStart;
    const end = textAreaRef.current.selectionEnd;
    const text = question.text;
    const before = text.substring(0, start);
    const selected = text.substring(start, end);
    const after = text.substring(end);
    
    onChange("text", `${before}${syntax}${selected}${syntax}${after}`);
    setTimeout(() => textAreaRef.current?.focus(), 0);
  };

  // --- IMAGE UPLOAD LOGIC (Base64) ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Validate Image Type
    if (!file.type.startsWith("image/")) {
        alert("Please upload an image file.");
        return;
    }

    // 2. Convert to Base64
    const reader = new FileReader();
    reader.onloadend = () => {
        const base64String = reader.result as string;
        // Save the actual image data to state
        onChange("mediaUrl", base64String);
        
        // Auto-fill Alt Text if empty
        if (!question.mediaAltText) {
            onChange("mediaAltText", file.name);
        }
    };
    reader.readAsDataURL(file);
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full space-y-6"> 
        
        {/* 1. Prompt Editor */}
        <section className={`rounded-xl shadow-sm border overflow-hidden ${theme.paper} ${theme.border}`}>
            {/* Toolbar */}
            <div className={`px-4 py-2 border-b flex items-center gap-2 bg-black/5 ${theme.border}`}>
                <button onClick={() => insertMarkdown('**')} className="p-1.5 rounded hover:bg-black/10" title="Bold"><Bold size={16}/></button>
                <button onClick={() => insertMarkdown('*')} className="p-1.5 rounded hover:bg-black/10" title="Italic"><Italic size={16}/></button>
                <button onClick={() => insertMarkdown('`')} className="p-1.5 rounded hover:bg-black/10" title="Code"><Code size={16}/></button>
                <div className="w-px h-4 bg-current opacity-20 mx-1"></div>
                <button onClick={() => insertMarkdown('$')} className="p-1.5 rounded hover:bg-black/10 flex items-center gap-1 text-xs font-bold" title="Math"><Sigma size={14}/> Math</button>
                <div className="flex-1"></div>
                <span className={`text-[10px] font-bold opacity-40 uppercase`}>Markdown Supported</span>
            </div>
            
            <div className="p-6 space-y-4">
                <textarea
                    ref={textAreaRef}
                    className={`w-full min-h-[160px] p-4 border rounded-lg outline-none resize-y font-medium leading-relaxed ${theme.input}`}
                    placeholder="Type your question here... (Use $...$ for Math LaTeX)"
                    value={question.text}
                    onChange={(e) => onChange("text", e.target.value)}
                />
                
                {/* Media Input Section */}
                <div className={`flex gap-4 items-start p-4 rounded-lg border ${theme.border}`}>
                     <div className="pt-2 opacity-50">
                        <ImageIcon size={24} />
                     </div>
                     <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="font-bold opacity-70 mb-1 block text-sm">Image / Video URL</label>
                            <div className="flex gap-2">
                                {/* Text Input for URL */}
                                <input 
                                    type="text" 
                                    className={`flex-1 p-2 border rounded outline-none ${theme.input}`}
                                    placeholder="https://..."
                                    value={question.mediaUrl || ""}
                                    onChange={(e) => onChange("mediaUrl", e.target.value)}
                                />
                                
                                {/* Hidden File Input */}
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleFileUpload} 
                                    className="hidden" 
                                    accept="image/*" 
                                />
                                
                                {/* Upload Button */}
                                <Button size="icon" variant="outline" className={theme.text} onClick={triggerUpload} title="Upload from Computer">
                                    <Upload size={16} />
                                </Button>
                            </div>
                            
                            {/* Tiny Preview text if loaded */}
                            {question.mediaUrl && question.mediaUrl.startsWith("data:") && (
                                <div className="mt-1 text-[10px] text-green-600 font-medium flex items-center gap-1">
                                    <CheckCircle size={10} /> Image loaded from computer
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="font-bold opacity-70 mb-1 block text-sm">Alt Text (Required)</label>
                            <input 
                                type="text" 
                                className={`w-full p-2 border rounded outline-none ${theme.input}`}
                                placeholder="Describe image..."
                                value={question.mediaAltText || ""}
                                onChange={(e) => onChange("mediaAltText", e.target.value)}
                            />
                        </div>
                     </div>
                </div>
            </div>
        </section>

        {/* 2. Answers Editor */}
        <section className={`rounded-xl shadow-sm border overflow-hidden ${theme.paper} ${theme.border}`}>
            <div className={`px-6 py-3 border-b opacity-90 ${theme.border} bg-black/5`}>
                <h3 className="font-bold text-sm uppercase tracking-wide opacity-70">
                    {question.type === 'SHORT_ANSWER' ? 'Rubric / Grading' : 'Answer Choices'}
                </h3>
            </div>
            <div className="p-6 space-y-4">
                {question.type === 'SHORT_ANSWER' && (
                     <div className={`p-6 rounded-lg border border-dashed text-center opacity-70 ${theme.border}`}>
                        <FileText className="mx-auto mb-2 opacity-50" />
                        <p className="font-medium mb-2">Student will type their response.</p>
                        <textarea 
                            className={`w-full p-3 border rounded outline-none ${theme.input}`}
                            placeholder="Enter grading keywords (e.g. 'photosynthesis', 'sunlight')..."
                            rows={3}
                        />
                     </div>
                )}
                {(question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE') && (
                    <>
                        {question.options.map((option, index) => (
                            <div key={option.id} className={`flex items-start gap-4 p-4 rounded-lg border transition-all group
                                ${option.isCorrect 
                                    ? `bg-green-500/5 border-green-500 ring-1 ring-green-500` 
                                    : `${theme.border} hover:bg-black/5`}`}>
                                
                                <div className="flex flex-col items-center gap-2 pt-1">
                                    <span className="font-bold opacity-40 text-xs">{String.fromCharCode(65 + index)}</span>
                                    <button
                                        onClick={() => onSetCorrect(option.id)}
                                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all 
                                            ${option.isCorrect ? "bg-green-600 border-green-600 text-white" : "border-gray-300 hover:border-green-400"}`}
                                    >
                                        {option.isCorrect && <CheckCircle size={12} />}
                                    </button>
                                </div>

                                <div className="flex-1 space-y-2">
                                    <input
                                        type="text"
                                        readOnly={question.type === 'TRUE_FALSE'}
                                        value={option.text}
                                        onChange={(e) => onOptionChange(option.id, "text", e.target.value)}
                                        placeholder={`Answer Choice (LaTeX supported)`}
                                        className={`w-full font-medium bg-transparent border-b border-transparent focus:border-indigo-500 outline-none pb-1 placeholder:opacity-40`}
                                    />
                                    <div className="flex items-center gap-2">
                                        <HelpCircle size={12} className="opacity-30" />
                                        <input 
                                            type="text"
                                            value={option.feedback || ""}
                                            onChange={(e) => onOptionChange(option.id, "feedback", e.target.value)}
                                            placeholder={option.isCorrect ? "Why correct?" : "Why incorrect? (Distractor rationale)"}
                                            className={`flex-1 text-xs bg-transparent outline-none opacity-50 focus:opacity-100 placeholder:italic`}
                                        />
                                    </div>
                                </div>

                                {question.type === 'MULTIPLE_CHOICE' && (
                                    <button onClick={() => onRemoveOption(option.id)} className="opacity-0 group-hover:opacity-40 hover:!opacity-100 hover:text-red-500 transition-all">
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        ))}

                        {question.type === 'MULTIPLE_CHOICE' && (
                            <Button variant="outline" size="sm" onClick={onAddOption} className={`w-full border-dashed opacity-50 hover:opacity-100 ${theme.border} ${theme.text}`}>
                                <Plus size={16} className="mr-2" /> Add Option
                            </Button>
                        )}
                    </>
                )}
            </div>
        </section>

        {/* 3. Solution */}
        <section className={`rounded-xl shadow-sm border overflow-hidden ${theme.paper} ${theme.border}`}>
            <div className={`px-6 py-3 border-b opacity-90 ${theme.border} bg-black/5`}>
                <h3 className={`font-bold text-sm uppercase tracking-wide opacity-70 flex items-center gap-2`}>
                    <AlertCircle size={14}/> Teacher Solution
                </h3>
            </div>
            <div className="p-6">
                <textarea
                    className={`w-full min-h-[100px] p-4 border rounded-lg outline-none ${theme.input}`}
                    placeholder="Private notes for other teachers..."
                    value={question.explanation}
                    onChange={(e) => onChange("explanation", e.target.value)}
                />
            </div>
        </section>
    </div>
  );
}