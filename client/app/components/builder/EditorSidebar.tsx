"use client";

import React from "react";
import { 
  Type, BookOpen, BarChart3, Calculator, GripVertical 
} from "lucide-react";
import { QuestionData, QuestionType } from "../QuestionBuilder";
import { useTheme } from "../../context/ThemeContext";

interface EditorSidebarProps {
  question: QuestionData;
  onChange: (field: keyof QuestionData, value: any) => void;
  onToggleGrade: (grade: string) => void;
}

export default function EditorSidebar({ question, onChange, onToggleGrade }: EditorSidebarProps) {
  const { theme, mode } = useTheme();

  const grades = ["K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
  
  const bloomsOptions = [
    { value: "REMEMBER", label: "Remember" },
    { value: "UNDERSTAND", label: "Understand" },
    { value: "APPLY", label: "Apply" },
    { value: "ANALYZE", label: "Analyze" },
    { value: "EVALUATE", label: "Evaluate" },
    { value: "CREATE", label: "Create" }
  ];

  const dokOptions = [
    { value: "LEVEL_1", label: "Level 1: Recall" },
    { value: "LEVEL_2", label: "Level 2: Skill/Concept" },
    { value: "LEVEL_3", label: "Level 3: Strategic Thinking" },
    { value: "LEVEL_4", label: "Level 4: Extended Thinking" }
  ];

  return (
    <aside className={`w-80 border-r flex flex-col h-full overflow-y-auto ${theme.paper} ${theme.border}`}>
      
      {/* 1. CLASSIFICATION */}
      <div className="p-5 border-b border-dashed border-gray-200">
        <h3 className="font-bold opacity-50 uppercase tracking-wider mb-4 flex items-center gap-2 text-xs">
           <Type size={12} /> Classification
        </h3>
        
        <div className="space-y-4">
            <div>
                <label className="font-bold opacity-70 mb-1.5 block">Subject <span className="text-red-500">*</span></label>
                <select 
                    value={question.subject}
                    onChange={(e) => onChange("subject", e.target.value)}
                    className={`w-full p-2.5 rounded-lg border outline-none transition-all focus:ring-2 focus:ring-indigo-500/20 ${theme.input}`}
                >
                    <option value="MATH">Mathematics</option>
                    <option value="ELA">ELA / Reading</option>
                    <option value="SCIENCE">Science</option>
                    <option value="SOCIAL_STUDIES">Social Studies</option>
                </select>
            </div>

            <div>
                <label className="font-bold opacity-70 mb-1.5 block">Item Type <span className="text-red-500">*</span></label>
                <div className="relative">
                    <select 
                        value={question.type}
                        onChange={(e) => onChange("type", e.target.value as QuestionType)}
                        className={`w-full p-2.5 rounded-lg border outline-none appearance-none cursor-pointer hover:bg-black/5 transition-colors ${theme.input}`}
                    >
                        <optgroup label="Common">
                            <option value="MULTIPLE_CHOICE">Multiple Choice (Radio)</option>
                            <option value="MULTIPLE_SELECT">Multiple Select (Checkbox)</option>
                            <option value="TRUE_FALSE">True / False</option>
                        </optgroup>
                        <optgroup label="Written">
                            <option value="SHORT_ANSWER">Short Answer</option>
                            <option value="FILL_IN_THE_BLANK">Fill in the Blank</option>
                        </optgroup>
                        <optgroup label="Interactive">
                            <option value="MATCHING">Matching Pairs</option>
                            <option value="ORDERING">Ordering</option>
                        </optgroup>
                    </select>
                    <div className="absolute right-3 top-3 opacity-50 pointer-events-none">
                        <GripVertical size={14} />
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* 2. ALIGNMENT */}
      <div className="p-5 border-b border-dashed border-gray-200">
        <h3 className="font-bold opacity-50 uppercase tracking-wider mb-4 flex items-center gap-2 text-xs">
           <BookOpen size={12} /> Alignment
        </h3>

        <div className="mb-4">
            <label className="font-bold opacity-70 mb-2 block">Grade Level(s) <span className="text-red-500">*</span></label>
            <div className="flex flex-wrap gap-1.5">
                {grades.map(grade => (
                    <button
                        key={grade}
                        onClick={() => onToggleGrade(grade)}
                        className={`w-8 h-8 flex items-center justify-center font-bold rounded transition-all
                            ${question.gradeLevels.includes(grade) 
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30 scale-105" 
                                : `bg-gray-100 text-gray-500 hover:bg-gray-200 ${mode === 'dark' ? 'bg-gray-800' : ''}`}`}
                    >
                        {grade}
                    </button>
                ))}
            </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
             <div>
                <label className="font-bold opacity-70 mb-1 block">Difficulty</label>
                <select 
                    value={question.difficulty}
                    onChange={(e) => onChange("difficulty", e.target.value)}
                    className={`w-full p-2 rounded border outline-none ${theme.input}`}
                >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                </select>
             </div>
             <div>
                <label className="font-bold opacity-70 mb-1 block">Points</label>
                <input 
                    type="number" 
                    min={1} 
                    max={20}
                    value={question.points}
                    onChange={(e) => onChange("points", parseInt(e.target.value) || 1)}
                    className={`w-full p-2 rounded border outline-none ${theme.input}`}
                />
             </div>
        </div>
      </div>

      {/* 3. PEDAGOGY */}
      <div className="p-5">
        <h3 className="font-bold opacity-50 uppercase tracking-wider mb-4 flex items-center gap-2 text-xs">
           <BarChart3 size={12} /> Pedagogy
        </h3>

        <div className="space-y-3">
            <div>
                <label className="font-bold opacity-70 mb-1 block">Bloom's Taxonomy</label>
                <select 
                    value={question.bloomsTaxonomy}
                    onChange={(e) => onChange("bloomsTaxonomy", e.target.value)}
                    className={`w-full p-2 rounded border outline-none ${theme.input}`}
                >
                    {bloomsOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
            </div>

            <div>
                <label className="font-bold opacity-70 mb-1 block">Depth of Knowledge</label>
                <select 
                    value={question.dokLevel}
                    onChange={(e) => onChange("dokLevel", e.target.value)}
                    className={`w-full p-2 rounded border outline-none ${theme.input}`}
                >
                    {dokOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
            </div>

            {question.subject === 'MATH' && (
                <div className={`flex items-center justify-between p-3 rounded border mt-4 ${theme.border} bg-gray-50/50`}>
                    <div className="flex items-center gap-2">
                        <Calculator size={14} className="text-indigo-600"/>
                        <span className="font-bold opacity-80">Allow Calculator?</span>
                    </div>
                    <input 
                        type="checkbox" 
                        checked={question.calculator}
                        onChange={(e) => onChange("calculator", e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                    />
                </div>
            )}
        </div>
      </div>
    </aside>
  );
}