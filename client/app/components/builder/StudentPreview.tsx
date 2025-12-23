"use client";

import React, { useState } from "react";
import { Eye, ArrowLeft, Check, Smartphone, Monitor, Tablet, BookOpen, Info, Calculator, AlertCircle } from "lucide-react"; 
import { useTheme } from "../../context/ThemeContext";
import { QuestionData } from "../QuestionBuilder";

interface StudentPreviewProps {
  question: QuestionData;
  onBack: () => void; 
}

export default function StudentPreview({ question, onBack }: StudentPreviewProps) {
  const { theme } = useTheme();
  
  // Preview State
  const [showAnswerKey, setShowAnswerKey] = useState(true);
  const [showRationales, setShowRationales] = useState(true); 
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [deviceMode, setDeviceMode] = useState<'DESKTOP' | 'TABLET' | 'MOBILE'>('DESKTOP');

  // Robust Subject Match for ELA / Reading strings
  const isELA = (
    question.subject?.toUpperCase().includes('ELA') || 
    question.subject?.toUpperCase().includes('READING') ||
    question.subject?.toUpperCase().includes('ENGLISH')
  ) && question.passage;

  const getContainerWidth = () => {
      switch (deviceMode) {
          case 'MOBILE': return 'max-w-[375px]';
          case 'TABLET': return 'max-w-[768px]';
          default: return isELA ? 'max-w-7xl' : 'max-w-4xl'; 
      }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in zoom-in-95">
        
        {/* PREVIEW TOOLBAR */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-dashed border-gray-300">
            <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold opacity-60 hover:opacity-100 transition-opacity">
                <ArrowLeft size={16} /> Back to Editor
            </button>

            <div className="flex items-center gap-6">
                {/* Device Simulators */}
                <div className="flex bg-black/5 p-1 rounded-lg">
                    <button onClick={() => setDeviceMode('DESKTOP')} className={`p-1.5 rounded ${deviceMode === 'DESKTOP' ? 'bg-white shadow text-indigo-600' : 'opacity-50'}`} title="Desktop View"><Monitor size={14}/></button>
                    <button onClick={() => setDeviceMode('TABLET')} className={`p-1.5 rounded ${deviceMode === 'TABLET' ? 'bg-white shadow text-indigo-600' : 'opacity-50'}`} title="Tablet View"><Tablet size={14}/></button>
                    <button onClick={() => setDeviceMode('MOBILE')} className={`p-1.5 rounded ${deviceMode === 'MOBILE' ? 'bg-white shadow text-indigo-600' : 'opacity-50'}`} title="Mobile View"><Smartphone size={14}/></button>
                </div>

                <div className="w-px h-4 bg-gray-300"></div>

                {/* Visibility Controls */}
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase cursor-pointer select-none text-slate-500 hover:text-indigo-600 transition-colors">
                        <input 
                            type="checkbox" 
                            checked={showAnswerKey} 
                            onChange={(e) => setShowAnswerKey(e.target.checked)}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        Show Answer Key
                    </label>

                    <label className="flex items-center gap-2 text-[10px] font-black uppercase cursor-pointer select-none text-slate-500 hover:text-indigo-600 transition-colors">
                        <input 
                            type="checkbox" 
                            checked={showRationales} 
                            onChange={(e) => setShowRationales(e.target.checked)}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        Show Rationales
                    </label>
                </div>
            </div>
        </div>

        {/* 🛠️ UPDATED: REVIEWER FEEDBACK ALERT (Visible if notes exist, regardless of status) */}
        {question.reviewerNotes && (
            <div className={`mx-auto w-full mb-8 ${getContainerWidth()} animate-in slide-in-from-top-4 duration-500`}>
                <div className="p-5 rounded-2xl border-2 border-amber-200 bg-amber-50 shadow-sm flex gap-4">
                    <div className="p-2 bg-amber-100 rounded-xl h-fit text-amber-600">
                        <AlertCircle size={20} />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                            <h4 className="text-[10px] font-black uppercase text-amber-700 tracking-widest">Reviewer Feedback</h4>
                            <span className="text-[9px] font-bold text-amber-500 bg-white px-2 py-0.5 rounded-full border border-amber-100 uppercase">Reviewer Workspace Mode</span>
                        </div>
                        <p className="text-sm text-amber-900 font-medium leading-relaxed">
                            {question.reviewerNotes}
                        </p>
                    </div>
                </div>
            </div>
        )}
        
        {/* THE SIMULATED CARD / SPLIT VIEW */}
        <div className={`mx-auto w-full transition-all duration-300 pb-20 ${getContainerWidth()}`}>
            
            <div className={`grid grid-cols-1 ${isELA && deviceMode !== 'MOBILE' ? 'lg:grid-cols-2' : 'grid-cols-1'} gap-8 items-start`}>
                
                {/* 📖 PASSAGE COLUMN */}
                {isELA && (
                    <div className={`p-8 rounded-xl shadow-lg border border-gray-200 bg-white
                        ${deviceMode !== 'MOBILE' ? 'lg:sticky lg:top-8' : 'mb-4'}
                    `}>
                        <div className="flex items-center gap-2 mb-4 text-indigo-600">
                            <BookOpen size={18} />
                            <span className="text-xs font-bold uppercase tracking-wider">Reading Passage</span>
                        </div>

                        {question.passage?.mediaUrl && (
                            <div className="mb-6 rounded-lg overflow-hidden border bg-gray-50 shadow-inner">
                                <img 
                                    src={question.passage.mediaUrl} 
                                    className="w-full h-auto max-h-80 object-contain mx-auto" 
                                    alt="Passage Context"
                                />
                            </div>
                        )}

                        <h2 className="text-3xl font-serif font-bold mb-4 text-gray-900 leading-tight">{question.passage?.title}</h2>
                        
                        <div 
                            className="prose prose-indigo prose-lg max-w-none font-serif leading-relaxed text-gray-800"
                            dangerouslySetInnerHTML={{ __html: question.passage?.content || "<p class='italic opacity-40'>Passage content is missing.</p>" }}
                        />
                    </div>
                )}

                {/* 📝 QUESTION COLUMN */}
                <div className={`p-8 rounded-xl shadow-lg border-t-4 border-indigo-500 min-h-fit ${theme.paper} ${theme.border}`}>
                    
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">
                                {isELA ? 'Question context' : 'Question Preview'}
                            </span>
                            <span className="text-[10px] font-black uppercase text-indigo-400">{question.difficulty} Alignment</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {question.calculator && <Calculator size={14} className="text-slate-400" title="Calculator Enabled" />}
                            <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded text-gray-500">{question.points} Points</span>
                        </div>
                    </div>

                    <div 
                        className="mb-6 text-xl font-medium leading-relaxed prose prose-indigo max-w-none"
                        dangerouslySetInnerHTML={{ __html: question.text || "<p class='opacity-40 italic'>No question text provided.</p>" }}
                    />
                    
                    {question.mediaUrl && (
                        <div className="mb-6 flex justify-center border rounded-lg p-2 bg-white shadow-sm">
                            <img 
                                src={question.mediaUrl} 
                                alt={question.mediaAltText || "Question Media"} 
                                className="max-w-full max-h-[400px] object-contain"
                            />
                        </div>
                    )}

                    <div className="space-y-3">
                        {question.type === 'SHORT_ANSWER' ? (
                            <div className="space-y-2">
                                <textarea className="w-full p-3 border rounded-lg bg-white outline-none" rows={3} placeholder="Type your answer here..." />
                                {showAnswerKey && (
                                    <div className="p-3 bg-green-50 border border-green-100 rounded text-sm text-green-800 animate-in slide-in-from-top-1">
                                        <strong>Correct Answer:</strong> {question.options[0]?.text || "No rubric defined."}
                                    </div>
                                )}
                            </div>
                        ) : (
                            question.options.map((opt, i) => {
                                const isSelected = selectedOptionId === opt.id;
                                const showCorrect = showAnswerKey && opt.isCorrect;
                                const showIncorrect = showAnswerKey && !opt.isCorrect && isSelected;

                                let borderClass = "border-gray-200 hover:border-indigo-300";
                                if (isSelected) borderClass = "border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50";
                                if (showCorrect) borderClass = "border-green-500 bg-green-50";
                                if (showIncorrect) borderClass = "border-red-500 bg-red-50";

                                return (
                                    <div key={opt.id} className="group">
                                        <div 
                                            onClick={() => setSelectedOptionId(opt.id)}
                                            className={`p-4 border rounded-lg flex items-center gap-4 cursor-pointer transition-all ${borderClass}`}
                                        >
                                            <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-sm font-bold transition-colors
                                                ${isSelected || showCorrect ? 'bg-white border-transparent shadow-sm' : 'bg-gray-50 text-gray-500'}
                                            `}>
                                                {showCorrect ? <Check size={16} className="text-green-600"/> : String.fromCharCode(65 + i)}
                                            </div>
                                            <div className="flex-1 prose prose-sm max-w-none pointer-events-none" dangerouslySetInnerHTML={{ __html: opt.text }} />
                                        </div>
                                        
                                        {showRationales && opt.feedback && (
                                            <div className={`mt-1 ml-12 text-[11px] p-2 rounded animate-in fade-in duration-300
                                                ${opt.isCorrect ? 'text-green-700 bg-green-100/30' : 'text-amber-700 bg-amber-100/30'}
                                            `}>
                                                <div className="flex items-center gap-1 mb-0.5 font-black uppercase tracking-tighter opacity-70">
                                                    <Info size={10} />
                                                    {opt.isCorrect ? 'Rationale' : 'Distractor Explanation'}
                                                </div>
                                                {opt.feedback}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
            
            <div className="mt-12 text-center border-t border-dashed border-gray-200 pt-8">
                <p className="text-xs text-gray-400">
                    Student View Mode • {deviceMode.charAt(0) + deviceMode.slice(1).toLowerCase()} Preview
                </p>
            </div>
        </div>
    </div>
  );
}