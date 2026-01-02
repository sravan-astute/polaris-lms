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
  // 🛠️ Destructure theme and themeKey for forced contrast logic
  const { theme, themeKey } = useTheme();

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
    <aside className={`w-80 border-r flex flex-col h-full overflow-y-auto transition-colors duration-300 ${theme.paper} ${theme.border}`}>
      
      {/* 1. CLASSIFICATION */}
      <div className={`p-5 border-b border-dashed ${theme.border}`}>
        <h3 className={`font-black uppercase tracking-widest mb-4 flex items-center gap-2 text-[10px] ${theme.text} opacity-60`}>
           <Type size={12} /> Classification
        </h3>
        
        <div className="space-y-4">
            <div>
                <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${theme.text}`}>Subject <span className="text-red-500">*</span></label>
                {/* 🛠️ Dropdown Visibility Fix */}
                <select 
                    value={question.subject}
                    onChange={(e) => onChange("subject", e.target.value)}
                    className={`w-full p-2.5 rounded-xl border font-bold text-sm outline-none transition-all focus:ring-2 ${theme.input} ${theme.border} ${theme.text}`}
                >
                    <option value="MATH">Mathematics</option>
                    <option value="ELA">ELA / Reading</option>
                    <option value="SCIENCE">Science</option>
                    <option value="SOCIAL_STUDIES">Social Studies</option>
                </select>
            </div>

            <div>
                <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block ${theme.text}`}>Item Type <span className="text-red-500">*</span></label>
                <div className="relative">
                    {/* 🛠️ Dropdown Visibility Fix */}
                    <select 
                        value={question.type}
                        onChange={(e) => onChange("type", e.target.value as QuestionType)}
                        className={`w-full p-2.5 rounded-xl border font-bold text-sm outline-none appearance-none cursor-pointer transition-colors ${theme.input} ${theme.border} ${theme.text}`}
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
                    <div className={`absolute right-3 top-3 opacity-40 pointer-events-none ${theme.text}`}>
                        <GripVertical size={14} />
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* 2. ALIGNMENT */}
      <div className={`p-5 border-b border-dashed ${theme.border}`}>
        <h3 className={`font-black uppercase tracking-widest mb-4 flex items-center gap-2 text-[10px] ${theme.text} opacity-60`}>
           <BookOpen size={12} /> Alignment
        </h3>

        <div className="mb-4">
            <label className={`text-[10px] font-black uppercase tracking-widest mb-2 block ${theme.text}`}>Grade Level(s) <span className="text-red-500">*</span></label>
            <div className="flex flex-wrap gap-1.5">
                {grades.map(grade => {
                    const isActive = question.gradeLevels.includes(grade);
                    return (
                        <button
                            key={grade}
                            onClick={() => onToggleGrade(grade)}
                            className={`w-9 h-9 flex items-center justify-center font-black text-xs rounded-xl border transition-all
                                ${isActive 
                                    ? `${theme.accent} shadow-md scale-110 z-10 border-transparent` 
                                    : `${theme.border} ${theme.text} bg-transparent hover:bg-opacity-10 hover:bg-current`}`}
                        /* ☝️ Logic: If not active, it's transparent with a themed border. 
                        Text is always theme.text, so it's White in Midnight and Dark in Light. */
                        >
                            {grade}
                        </button>
                    );
                })}
            </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
             <div>
                <label className={`text-[10px] font-black uppercase tracking-widest mb-1 block ${theme.text}`}>Difficulty</label>
                <select 
                    value={question.difficulty}
                    onChange={(e) => onChange("difficulty", e.target.value)}
                    className={`w-full p-2 rounded-lg border font-bold text-xs outline-none transition-all ${theme.input} ${theme.border} ${theme.text}`}
                >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                </select>
             </div>
             <div>
                <label className={`text-[10px] font-black uppercase tracking-widest mb-1 block ${theme.text}`}>Points</label>
                <input 
                    type="number" 
                    min={1} 
                    max={20}
                    value={question.points}
                    onChange={(e) => onChange("points", parseInt(e.target.value) || 1)}
                    className={`w-full p-2 rounded-lg border font-black text-xs outline-none transition-all ${theme.input} ${theme.border} ${theme.text}`}
                />
             </div>
        </div>
      </div>

      {/* 3. PEDAGOGY */}
      <div className="p-5">
        <h3 className={`font-black uppercase tracking-widest mb-4 flex items-center gap-2 text-[10px] ${theme.text} opacity-60`}>
           <BarChart3 size={12} /> Pedagogy
        </h3>

        <div className="space-y-3">
            <div>
                <label className={`text-[10px] font-black uppercase tracking-widest mb-1 block ${theme.text}`}>Bloom's Taxonomy</label>
                <select 
                    value={question.bloomsTaxonomy}
                    onChange={(e) => onChange("bloomsTaxonomy", e.target.value)}
                    className={`w-full p-2 rounded-lg border font-bold text-xs outline-none transition-all ${theme.input} ${theme.border} ${theme.text}`}
                >
                    {bloomsOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
            </div>

            <div>
                <label className={`text-[10px] font-black uppercase tracking-widest mb-1 block ${theme.text}`}>Depth of Knowledge</label>
                <select 
                    value={question.dokLevel}
                    onChange={(e) => onChange("dokLevel", e.target.value)}
                    className={`w-full p-2 rounded-lg border font-bold text-xs outline-none transition-all ${theme.input} ${theme.border} ${theme.text}`}
                >
                    {dokOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
            </div>

            {question.subject === 'MATH' && (
                <div className={`flex items-center justify-between p-4 rounded-xl border mt-6 transition-all duration-300
                    ${theme.paper} ${theme.border}`}> 
                    {/* ☝️ Logic: Uses theme.paper to match the sidebar background, ensuring no color conflict */}
                    
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${themeKey === 'CONTRAST' ? 'bg-yellow-400 text-black' : theme.accent}`}>
                            <Calculator size={18} />
                        </div>
                        <span className={`text-[11px] font-black uppercase tracking-widest ${theme.text}`}>
                            Allow Calculator?
                        </span>
                    </div>
                    
                    <input 
                        type="checkbox" 
                        checked={question.calculator}
                        onChange={(e) => onChange("calculator", e.target.checked)}
                        /* 🛠️ Use accent color for the checkbox to ensure the checkmark is visible */
                        className={`w-5 h-5 rounded-md cursor-pointer transition-all ${themeKey === 'CONTRAST' ? 'accent-yellow-400' : 'accent-indigo-600'}`}
                    />
                </div>
            )}  
        </div>
      </div>
    </aside>
  );
}