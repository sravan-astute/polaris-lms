"use client";

import React from "react";
import { Settings, Calculator, X } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { QuestionData } from "../QuestionBuilder";

interface EditorSidebarProps {
  question: QuestionData;
  onChange: (field: keyof QuestionData, value: any) => void;
  onToggleGrade: (grade: string) => void;
}

export default function EditorSidebar({ question, onChange, onToggleGrade }: EditorSidebarProps) {
  const { theme } = useTheme();

  return (
    <aside className={`w-[360px] border-r overflow-y-auto p-6 space-y-8 flex-shrink-0 ${theme.paper} ${theme.border}`}>
        {/* Classification */}
        <div className="space-y-4">
            <h3 className={`font-bold uppercase tracking-wider flex items-center gap-2 opacity-50 text-sm`}>
                <Settings size={14}/> Classification
            </h3>
            <div className="space-y-4">
                <div>
                    <label className="block font-semibold mb-1 text-sm">Subject <span className="text-red-500">*</span></label>
                    <select 
                        className={`w-full p-3 border rounded-lg outline-none transition-all ${theme.input}`}
                        value={question.subject}
                        onChange={(e) => onChange("subject", e.target.value)}
                    >
                        <option value="MATH">Mathematics</option>
                        <option value="ELA">ELA / English</option>
                        <option value="SCIENCE">Science</option>
                        <option value="SOCIAL_STUDIES">Social Studies</option>
                    </select>
                </div>

                <div>
                     <label className="block font-semibold mb-1 text-sm">Item Type <span className="text-red-500">*</span></label>
                     <select 
                        className={`w-full p-3 border rounded-lg outline-none transition-all ${theme.input}`}
                        value={question.type}
                        onChange={(e) => onChange("type", e.target.value)}
                    >
                        <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                        <option value="TRUE_FALSE">True / False</option>
                        <option value="SHORT_ANSWER">Short Answer / CR</option>
                    </select>
                </div>
            </div>
        </div>

        {/* Alignment */}
        <div className="space-y-4">
            <h3 className={`font-bold uppercase tracking-wider opacity-50 text-sm`}>Alignment</h3>
            <div>
                <label className="block font-semibold mb-2 text-sm">Grade Level(s) <span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-2">
                    {['K','1','2','3','4','5','6','7','8','9','10','11','12'].map((g) => (
                        <button
                            key={g}
                            onClick={() => onToggleGrade(g)}
                            className={`h-10 w-10 font-medium rounded-md border transition-all flex items-center justify-center
                                ${question.gradeLevels.includes(g) 
                                    ? theme.accent
                                    : `${theme.paper} ${theme.border} hover:opacity-70`
                                }`}
                        >
                            {g}
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <label className="block font-semibold mb-1 text-sm">Standards</label>
                <input 
                    type="text" 
                    className={`w-full p-3 border rounded-lg outline-none ${theme.input}`}
                    placeholder="e.g. 3.NBT.A.1"
                    value={question.standards.join(", ")}
                    onChange={(e) => onChange("standards", e.target.value.split(",").map(s => s.trim()))}
                />
            </div>
        </div>

        {/* Pedagogy */}
         <div className="space-y-4">
            <h3 className={`font-bold uppercase tracking-wider opacity-50 text-sm`}>Pedagogy</h3>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="font-semibold opacity-70 text-sm">Difficulty</label>
                    <select className={`w-full p-2 border rounded mt-1 outline-none ${theme.input}`} value={question.difficulty} onChange={(e) => onChange("difficulty", e.target.value)}>
                        <option value="EASY">Easy</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HARD">Hard</option>
                    </select>
                </div>
                <div>
                    <label className="font-semibold opacity-70 text-sm">DOK Level</label>
                    <select className={`w-full p-2 border rounded mt-1 outline-none ${theme.input}`} value={question.dokLevel} onChange={(e) => onChange("dokLevel", e.target.value)}>
                        <option value="LEVEL_1">1 - Recall</option>
                        <option value="LEVEL_2">2 - Skill</option>
                        <option value="LEVEL_3">3 - Strategic</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="font-semibold opacity-70 text-sm">Bloom's Taxonomy</label>
                <select className={`w-full p-2 border rounded mt-1 outline-none ${theme.input}`} value={question.bloomsTaxonomy} onChange={(e) => onChange("bloomsTaxonomy", e.target.value)}>
                    <option value="REMEMBER">Remember</option>
                    <option value="UNDERSTAND">Understand</option>
                    <option value="APPLY">Apply</option>
                    <option value="ANALYZE">Analyze</option>
                    <option value="EVALUATE">Evaluate</option>
                    <option value="CREATE">Create</option>
                </select>
            </div>

             <div 
                onClick={() => onChange("calculator", !question.calculator)}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${theme.border} hover:opacity-80`}
            >
                <div className={`p-1.5 rounded-full ${question.calculator ? 'bg-green-100 text-green-700' : 'bg-current opacity-20'}`}>
                    <Calculator size={18} />
                </div>
                <div>
                    <p className={`font-bold text-sm`}>Calculator Tool</p>
                    <p className="text-[10px] opacity-70">{question.calculator ? "Enabled for Students" : "Disabled"}</p>
                </div>
            </div>
        </div>
    </aside>
  );
}