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
    const { theme, themeKey } = useTheme();
    
    const [showAnswerKey, setShowAnswerKey] = useState(true);
    const [showRationales, setShowRationales] = useState(true); 
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
    const [deviceMode, setDeviceMode] = useState<'DESKTOP' | 'TABLET' | 'MOBILE'>('DESKTOP');

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
        <div className={`flex flex-col h-full animate-in fade-in zoom-in-95 ${theme.text}`}>
            
            {/* 🛠️ PREVIEW TOOLBAR */}
            <div className={`flex items-center justify-between mb-6 pb-4 border-b border-dashed ${theme.border}`}>
                <button onClick={onBack} className={`flex items-center gap-2 text-sm font-black transition-opacity hover:opacity-70 ${theme.text}`}>
                    <ArrowLeft size={16} /> Back to editor
                </button>

                <div className="flex items-center gap-6">
                    <div className={`flex bg-current/[0.08] p-1 rounded-xl`}>
                        <button onClick={() => setDeviceMode('DESKTOP')} className={`p-2 rounded-lg transition-all ${deviceMode === 'DESKTOP' ? `${theme.paper} shadow-md ${theme.text}` : 'opacity-40'}`}><Monitor size={14}/></button>
                        <button onClick={() => setDeviceMode('TABLET')} className={`p-2 rounded-lg transition-all ${deviceMode === 'TABLET' ? `${theme.paper} shadow-md ${theme.text}` : 'opacity-40'}`}><Tablet size={14}/></button>
                        <button onClick={() => setDeviceMode('MOBILE')} className={`p-2 rounded-lg transition-all ${deviceMode === 'MOBILE' ? `${theme.paper} shadow-md ${theme.text}` : 'opacity-40'}`}><Smartphone size={14}/></button>
                    </div>

                    <div className={`w-px h-4 bg-current/20`}></div>

                    <div className="flex items-center gap-4">
                        <label className={`flex items-center gap-2 text-xs font-black cursor-pointer select-none transition-colors ${theme.text}`}>
                            <input 
                                type="checkbox" 
                                checked={showAnswerKey} 
                                onChange={(e) => setShowAnswerKey(e.target.checked)}
                                className="rounded border-current/30 bg-transparent text-indigo-600 focus:ring-indigo-500"
                            />
                            Show answer key
                        </label>

                        <label className={`flex items-center gap-2 text-xs font-black cursor-pointer select-none transition-colors ${theme.text}`}>
                            <input 
                                type="checkbox" 
                                checked={showRationales} 
                                onChange={(e) => setShowRationales(e.target.checked)}
                                className="rounded border-current/30 bg-transparent text-indigo-600 focus:ring-indigo-500"
                            />
                            Show rationales
                        </label>
                    </div>
                </div>
            </div>

            {/* 🛠️ REVIEWER FEEDBACK */}
            {question.reviewerNotes && (
                <div className={`mx-auto w-full mb-8 ${getContainerWidth()} animate-in slide-in-from-top-4`}>
                    <div className={`p-5 rounded-2xl border-2 shadow-md flex gap-4 
                        ${themeKey === 'CONTRAST' ? 'border-yellow-400 bg-black' : 'border-amber-500/30 bg-amber-500/10'}`}>
                        <div className={`p-2 rounded-xl h-fit ${themeKey === 'CONTRAST' ? 'text-yellow-400' : 'text-amber-600 bg-amber-500/20'}`}>
                            <AlertCircle size={20} />
                        </div>
                        <div className="flex-1">
                            <h4 className={`text-xs font-black mb-1 ${themeKey === 'CONTRAST' ? 'text-yellow-400' : 'text-amber-700'}`}>Reviewer feedback</h4>
                            <p className={`text-sm font-bold leading-relaxed ${themeKey === 'CONTRAST' ? 'text-yellow-100' : 'text-amber-900'}`}>
                                {question.reviewerNotes}
                            </p>
                        </div>
                    </div>
                </div>
            )}
            
            <div className={`mx-auto w-full transition-all duration-300 pb-20 ${getContainerWidth()}`}>
                <div className={`grid grid-cols-1 ${isELA && deviceMode !== 'MOBILE' ? 'lg:grid-cols-2' : 'grid-cols-1'} gap-8 items-start`}>
                    
                    {/* 📖 PASSAGE COLUMN - Forced Static Font Sizes (Immune to site-wide scaling) */}
                    {isELA && (
                        <div className={`p-8 rounded-2xl shadow-lg border ${theme.paper} ${theme.border}
                            ${deviceMode !== 'MOBILE' ? 'lg:sticky lg:top-8' : 'mb-4'}`}>
                            
                            <div className={`flex items-center gap-2 mb-4 ${theme.text} opacity-60`}>
                                <BookOpen size={18} />
                                <span className="text-xs font-black tracking-tight">Reading passage</span>
                            </div>

                            {question.passage?.mediaUrl && (
                                <div className="mb-6 rounded-xl overflow-hidden border shadow-inner bg-white">
                                    <img src={question.passage.mediaUrl} className="w-full h-auto max-h-80 object-contain mx-auto" alt="Passage" />
                                </div>
                            )}

                            {/* 🛠️ STATIC TITLE: Forced to 36px regardless of site settings */}
                            <h2 
                                className={`font-serif font-bold mb-6 leading-tight ${theme.text}`}
                                style={{ fontSize: '36px' }}
                            >
                                {question.passage?.title}
                            </h2>
                            
                            {/* 🛠️ STATIC CONTENT: Forced to 20px regardless of site settings */}
                            <div 
                                className={`prose max-w-none font-serif leading-relaxed ${theme.text} opacity-95`}
                                style={{ fontSize: '20px', lineHeight: '1.75' }}
                                dangerouslySetInnerHTML={{ __html: question.passage?.content || "" }} 
                            />
                        </div>
                    )}

                    {/* 📝 QUESTION COLUMN */}
                    <div className={`p-8 rounded-2xl shadow-lg border-t-8 border-indigo-600 min-h-fit ${theme.paper} ${theme.border}`}>
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex flex-col gap-1">
                                <span className={`text-xs font-black opacity-40 ${theme.text}`}>
                                    {isELA ? 'Question context' : 'Question preview'}
                                </span>
                                <span className="text-[10px] font-black text-indigo-400">{question.difficulty.charAt(0) + question.difficulty.slice(1).toLowerCase()} alignment</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {question.calculator && <Calculator size={14} className="opacity-40" />}
                                <span className={`text-xs font-black px-3 py-1 rounded-lg bg-current/[0.08] ${theme.text}`}>
                                    {question.points} {question.points === 1 ? 'point' : 'points'}
                                </span>
                            </div>
                        </div>

                        <div className={`mb-6 text-xl font-bold leading-relaxed prose max-w-none ${theme.text}`}
                            dangerouslySetInnerHTML={{ __html: question.text || "" }} />
                        
                        {question.mediaUrl && (
                            <div className="mb-6 flex justify-center border rounded-xl p-2 bg-white shadow-sm">
                                <img src={question.mediaUrl} alt="Question Media" className="max-w-full max-h-[400px] object-contain" />
                            </div>
                        )}

                        <div className="space-y-3">
                            {question.type === 'SHORT_ANSWER' ? (
                                <div className="space-y-2">
                                    <textarea className={`w-full p-4 border rounded-xl outline-none bg-current/[0.05] ${theme.border} ${theme.text}`} rows={3} placeholder="Type your answer here..." />
                                    {showAnswerKey && (
                                        <div className="p-4 bg-green-600/10 border border-green-600/20 rounded-xl text-sm font-bold text-green-600 animate-in slide-in-from-top-1">
                                            Correct answer: {question.options[0]?.text || "No rubric defined."}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                question.options.map((opt, i) => {
                                    const isSelected = selectedOptionId === opt.id;
                                    const showCorrect = showAnswerKey && opt.isCorrect;
                                    const showIncorrect = showAnswerKey && !opt.isCorrect && isSelected;

                                    let containerClass = `bg-current/[0.05] ${theme.border} border-transparent`;
                                    if (isSelected) containerClass = `bg-current/[0.12] border-indigo-600 shadow-md scale-[1.01]`;
                                    if (showCorrect) containerClass = `bg-green-600/10 border-green-600`;
                                    if (showIncorrect) containerClass = `bg-red-600/10 border-red-600`;

                                    return (
                                        <div key={opt.id} className="group">
                                            <div 
                                                onClick={() => setSelectedOptionId(opt.id)}
                                                className={`p-4 border rounded-2xl flex items-center gap-4 cursor-pointer transition-all ${containerClass}`}
                                            >
                                                <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-sm font-black transition-all
                                                    ${isSelected || showCorrect ? `${theme.paper} border-transparent shadow-sm ${theme.text}` : 'bg-current/[0.1] border-transparent opacity-60'}
                                                `}>
                                                    {showCorrect ? <Check size={16} className="text-green-600"/> : String.fromCharCode(65 + i)}
                                                </div>
                                                <div className={`flex-1 text-base font-bold pointer-events-none ${theme.text}`} dangerouslySetInnerHTML={{ __html: opt.text }} />
                                            </div>
                                            
                                            {showRationales && opt.feedback && (
                                                <div className={`mt-2 ml-12 text-[12px] p-3 rounded-xl border border-transparent animate-in fade-in
                                                    ${opt.isCorrect ? 'text-green-600 bg-green-600/10' : 'text-amber-600 bg-amber-600/10'}
                                                `}>
                                                    <div className="flex items-center gap-1 mb-1 font-black opacity-70">
                                                        <Info size={12} />
                                                        {opt.isCorrect ? 'Rationale' : 'Distractor explanation'}
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
                
                <div className={`mt-12 text-center border-t border-dashed ${theme.border} pt-8`}>
                    <p className={`text-xs font-black opacity-40 ${theme.text}`}>
                        Student view mode • {deviceMode.charAt(0) + deviceMode.slice(1).toLowerCase()} preview
                    </p>
                </div>
            </div>
        </div>
    );
}