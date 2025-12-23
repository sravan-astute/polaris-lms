"use client";

import React, { useEffect, useMemo } from "react"; 
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import ImageExtension from "@tiptap/extension-image"; 
import { Bold, Italic, List, ListOrdered, Sigma } from "lucide-react";

export interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  compact?: boolean; 
}

// --- MATH PARSER (Unchanged) ---
const convertToLatex = (input: string) => {
    let latex = input.trim();
    const wordSymbols: Record<string, string> = {
        'alpha': '\\alpha', 'beta': '\\beta', 'gamma': '\\gamma', 'delta': '\\delta', 
        'theta': '\\theta', 'pi': '\\pi', 'sigma': '\\sigma', 'omega': '\\omega', 
        'phi': '\\phi', 'lambda': '\\lambda', 'mu': '\\mu', 'infinity': '\\infty',
        'sum': '\\sum', 'prod': '\\prod', 'int': '\\int', 'sqrt': '\\sqrt'
    };
    Object.keys(wordSymbols).forEach(key => {
        const regex = new RegExp(`\\b${key}\\b`, 'g'); 
        latex = latex.replace(regex, wordSymbols[key]);
    });
    const operatorSymbols: Record<string, string> = {
        '<=': '\\le', '>=': '\\ge', '!=': '\\neq', '+-': '\\pm', '~=': '\\approx'
    };
    Object.keys(operatorSymbols).forEach(key => {
        latex = latex.split(key).join(operatorSymbols[key]);
    });
    const functions = ['sin', 'cos', 'tan', 'sec', 'csc', 'cot', 'log', 'ln', 'lim'];
    functions.forEach(func => {
         const regex = new RegExp(`\\b${func}\\b`, 'g');
         latex = latex.replace(regex, `\\${func}`);
    });
    latex = latex.replace(/\(([^)]+)\)\s*\/\s*\(([^)]+)\)/g, "\\frac{$1}{$2}");
    latex = latex.replace(/\(([^)]+)\)\s*\/\s*(\w+)/g, "\\frac{$1}{$2}");
    latex = latex.replace(/(\w+)\s*\/\s*\(([^)]+)\)/g, "\\frac{$1}{$2}");
    latex = latex.replace(/(\w+)\s*\/\s*(\w+)/g, "\\frac{$1}{$2}");
    latex = latex.replace(/\^(\(([^)]+)\))/g, "^{$2}"); 
    latex = latex.replace(/\^(\w+)/g, "^{$1}");         
    latex = latex.replace(/_(\w+)/g, "_{$1}");
    latex = latex.replace(/\\sqrt\(([^)]+)\)/g, "\\sqrt{$1}");

    return latex;
};

export default function RichTextEditor({ content, onChange, placeholder, compact = false }: RichTextEditorProps) {
  
  const extensions = useMemo(() => {
      return [
        StarterKit, 
        Underline,
        ImageExtension.configure({ 
            inline: true, 
            allowBase64: true,
            HTMLAttributes: {
                class: 'inline-math-image',
                style: 'display: inline-block; vertical-align: middle; margin: 0 4px;'
            }
        }) 
      ];
  }, []);

  const editor = useEditor({
    immediatelyRender: false, 
    shouldRerenderOnTransaction: false, 
    extensions: extensions,
    content: content,
    editorProps: {
      attributes: {
        // 🛠️ FIXED: Removed min-height and padding for a true single-line feel
        class: `prose prose-sm focus:outline-none w-full ${compact ? 'min-h-[32px] px-2 py-1' : 'min-h-[120px] p-4'}`,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
        editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  const handleMath = () => {
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to, ' ');
      
      if (!text) return alert("Select the math part first (e.g., '1/2')");

      try {
          const latex = convertToLatex(text);
          const url = `https://latex.codecogs.com/png.latex?\\dpi{110}\\bg_white\\sf&space;${encodeURIComponent(latex)}`;
          editor.chain().focus().setImage({ src: url, alt: latex, title: latex }).run();
      } catch (e) {
          console.error("Math conversion error:", e);
          alert("Could not convert text.");
      }
  };

  return (
    // 🛠️ FIXED: flex-row divides the box into two parts horizontally
    <div className={`group border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm transition-all focus-within:ring-2 focus-within:ring-indigo-500/20 flex flex-row items-stretch`}>
      
      {/* PART 1: Main Text Field */}
      <div className={`cursor-text flex-1 min-w-0`} onClick={() => editor.chain().focus().run()}>
        <EditorContent editor={editor} />
      </div>

      {/* PART 2: Fixed-width Action Buttons */}
      <div className={`flex items-center justify-center border-l bg-gray-50/50 p-0.5 ${compact ? 'w-auto' : 'w-10 flex-col'}`}>
        <div className={`flex ${compact ? 'flex-row items-center gap-0.5' : 'flex-col gap-1'}`}>
            <ToolbarButton 
              onClick={() => editor.chain().focus().toggleBold().run()} 
              isActive={editor.isActive('bold')} 
              icon={<Bold size={12} />} 
            />
            <ToolbarButton 
              onClick={() => editor.chain().focus().toggleItalic().run()} 
              isActive={editor.isActive('italic')} 
              icon={<Italic size={12} />} 
            />
            
            {/* 🛠️ FIXED: The Sigma/Math button is now icon-only in the compact side panel */}
            <button 
                type="button"
                onClick={handleMath} 
                className="p-1 rounded hover:bg-indigo-100 text-indigo-600 transition-colors" 
                title="Math"
            >
                <Sigma size={12} />
            </button>
        </div>

        {!compact && (
            <div className="flex flex-col gap-1 mt-2 border-t pt-2">
                <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} icon={<List size={12} />} />
                <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} icon={<ListOrdered size={12} />} />
            </div>
        )}
      </div>
    </div>
  );
}

function ToolbarButton({ onClick, isActive, icon }: any) {
    return (
        <button type="button" onClick={onClick} className={`p-1 rounded transition-colors ${isActive ? "bg-indigo-100 text-indigo-700" : "text-gray-500 hover:bg-gray-200"}`}>
            {icon}
        </button>
    )
}