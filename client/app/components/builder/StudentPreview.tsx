"use client";

import React, { useState } from "react";
import { Eye, ArrowLeft, Check, Smartphone, Monitor, Tablet } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { QuestionData } from "../QuestionBuilder";

interface StudentPreviewProps {
  question: QuestionData;
  onBack: () => void; 
}

export default function StudentPreview({ question, onBack }: StudentPreviewProps) {
  const { theme } = useTheme();
  
  // Preview State
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [deviceMode, setDeviceMode] = useState<'DESKTOP' | 'TABLET' | 'MOBILE'>('DESKTOP');

  // Helper to determine container width based on device
  const getContainerWidth = () => {
      switch (deviceMode) {
          case 'MOBILE': return 'max-w-[375px]';
          case 'TABLET': return 'max-w-[768px]';
          default: return 'max-w-3xl';
      }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in zoom-in-95">
        
        {/* PREVIEW TOOLBAR */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-dashed border-gray-300">
            <button 
                onClick={onBack}
                className="flex items-center gap-2 text-sm font-bold opacity-60 hover:opacity-100 transition-opacity"
            >
                <ArrowLeft size={16} /> Back to Editor
            </button>

            <div className="flex items-center gap-4">
                {/* Device Toggles */}
                <div className="flex bg-black/5 p-1 rounded-lg">
                    <button onClick={() => setDeviceMode('DESKTOP')} className={`p-1.5 rounded ${deviceMode === 'DESKTOP' ? 'bg-white shadow' : 'opacity-50'}`} title="Desktop View"><Monitor size={14}/></button>
                    <button onClick={() => setDeviceMode('TABLET')} className={`p-1.5 rounded ${deviceMode === 'TABLET' ? 'bg-white shadow' : 'opacity-50'}`} title="Tablet View"><Tablet size={14}/></button>
                    <button onClick={() => setDeviceMode('MOBILE')} className={`p-1.5 rounded ${deviceMode === 'MOBILE' ? 'bg-white shadow' : 'opacity-50'}`} title="Mobile View"><Smartphone size={14}/></button>
                </div>

                <div className="w-px h-4 bg-gray-300"></div>

                {/* Answer Key Toggle */}
                <label className="flex items-center gap-2 text-xs font-bold uppercase cursor-pointer select-none">
                    <input 
                        type="checkbox" 
                        checked={showAnswerKey} 
                        onChange={(e) => setShowAnswerKey(e.target.checked)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    Show Answer Key
                </label>
            </div>
        </div>
        
        {/* THE SIMULATED CARD */}
        <div className={`mx-auto w-full transition-all duration-300 ${getContainerWidth()}`}>
            <div className={`p-8 rounded-xl shadow-lg border-t-4 border-indigo-500 ${theme.paper} ${theme.border}`}>
                
                {/* Question Header */}
                <div className="flex justify-between items-start mb-6">
                    <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">Question Preview</span>
                    <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded text-gray-500">{question.points} Points</span>
                </div>

                {/* 1. Question Text */}
                <div className="mb-6 text-lg font-medium leading-relaxed whitespace-pre-wrap">
                    {question.text || <span className="opacity-40 italic">Question text will appear here...</span>}
                </div>
                
                {/* 2. Media Image - FIXED HERE 👇 */}
                {question.mediaUrl && (
                    <div className="mb-6 flex justify-center">
                        <img 
                            src={question.mediaUrl} 
                            alt={question.mediaAltText || "Question Media"} 
                            className="max-w-full max-h-[400px] rounded-lg border shadow-sm object-contain bg-white"
                        />
                    </div>
                )}

                {/* 3. Answer Area */}
                <div className="space-y-3">
                    {question.type === 'SHORT_ANSWER' ? (
                        <div className="space-y-2">
                            <textarea 
                                className="w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                                rows={3} 
                                placeholder="Type your answer here..." 
                            />
                            {showAnswerKey && (
                                <div className="p-3 bg-green-50 border border-green-100 rounded text-sm text-green-800">
                                    <strong>Correct Answer / Keywords:</strong> {question.options[0]?.text || "No rubric defined."}
                                </div>
                            )}
                        </div>
                    ) : (
                        question.options.map((opt, i) => {
                            const isSelected = selectedOptionId === opt.id;
                            // Highlight logic
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
                                        <div className="flex-1">{opt.text}</div>
                                    </div>
                                    
                                    {/* Feedback Display */}
                                    {showAnswerKey && opt.feedback && (
                                        <div className={`mt-1 ml-12 text-xs p-2 rounded 
                                            ${opt.isCorrect ? 'text-green-700 bg-green-100/50' : 'text-amber-700 bg-amber-100/50'}
                                        `}>
                                            <strong>Rationale:</strong> {opt.feedback}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
            
            {/* Footer Note */}
            <div className="mt-8 text-center">
                <p className="text-xs text-gray-400">
                    Student View Mode • {deviceMode.charAt(0) + deviceMode.slice(1).toLowerCase()} Preview
                </p>
            </div>
        </div>
    </div>
  );
}