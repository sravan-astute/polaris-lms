"use client";

import React, { useEffect, useMemo } from "react"; // 👈 Added useMemo
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
    // 1. Greek
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
    // 2. Operators
    const operatorSymbols: Record<string, string> = {
        '<=': '\\le', '>=': '\\ge', '!=': '\\neq', '+-': '\\pm', '~=': '\\approx'
    };
    Object.keys(operatorSymbols).forEach(key => {
        latex = latex.split(key).join(operatorSymbols[key]);
    });
    // 3. Functions
    const functions = ['sin', 'cos', 'tan', 'sec', 'csc', 'cot', 'log', 'ln', 'lim'];
    functions.forEach(func => {
         const regex = new RegExp(`\\b${func}\\b`, 'g');
         latex = latex.replace(regex, `\\${func}`);
    });
    // 4. Fractions
    latex = latex.replace(/\(([^)]+)\)\s*\/\s*\(([^)]+)\)/g, "\\frac{$1}{$2}");
    latex = latex.replace(/\(([^)]+)\)\s*\/\s*(\w+)/g, "\\frac{$1}{$2}");
    latex = latex.replace(/(\w+)\s*\/\s*\(([^)]+)\)/g, "\\frac{$1}{$2}");
    latex = latex.replace(/(\w+)\s*\/\s*(\w+)/g, "\\frac{$1}{$2}");
    // 5. Powers & Subscripts
    latex = latex.replace(/\^(\(([^)]+)\))/g, "^{$2}"); 
    latex = latex.replace(/\^(\w+)/g, "^{$1}");         
    latex = latex.replace(/_(\w+)/g, "_{$1}");
    // 6. Roots
    latex = latex.replace(/\\sqrt\(([^)]+)\)/g, "\\sqrt{$1}");

    return latex;
};

export default function RichTextEditor({ content, onChange, placeholder, compact = false }: RichTextEditorProps) {
  
  // ✅ FIX: Memoize extensions so they aren't re-created on every render
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
  }, []); // Empty dependency array = created only once

  const editor = useEditor({
    immediatelyRender: false, 
    shouldRerenderOnTransaction: false, 
    extensions: extensions, // 👈 Use the memoized list
    content: content,
    editorProps: {
      attributes: {
        class: `prose prose-sm focus:outline-none w-full ${compact ? 'min-h-[40px]' : 'min-h-[120px] p-4'}`,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync content if it changes externally
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
          console.log(`Converted: "${text}" -> "${latex}"`);
          
          const url = `https://latex.codecogs.com/png.latex?\\dpi{110}\\bg_white\\sf&space;${encodeURIComponent(latex)}`;
          
          editor.chain().focus().setImage({ src: url, alt: latex, title: latex }).run();
      } catch (e) {
          console.error("Math conversion error:", e);
          alert("Could not convert text.");
      }
  };

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm transition-all focus-within:ring-2 focus-within:ring-indigo-500/20 ${compact ? 'flex flex-row-reverse' : 'flex-col'}`}>
      
      {/* TOOLBAR */}
      <div className={`flex flex-wrap items-center gap-1 border-b bg-gray-50/50 text-gray-700 ${compact ? 'border-l border-b-0 w-auto flex-col p-1' : 'p-2'}`}>
        
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} icon={<Bold size={14} />} />
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} icon={<Italic size={14} />} />
        
        <div className="w-px h-4 bg-gray-300 mx-1" />

        <button 
            type="button"
            onClick={handleMath} 
            className="p-1.5 rounded hover:bg-indigo-100 text-indigo-600 font-bold flex items-center gap-1" 
            title="Convert Selection to Math"
        >
            <Sigma size={14} />
            <span className="text-[10px] font-bold">Math</span>
        </button>

        {!compact && (
            <>
                <div className="w-px h-4 bg-gray-300 mx-1" />
                <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} icon={<List size={14} />} />
                <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} icon={<ListOrdered size={14} />} />
            </>
        )}
      </div>

      <div className={`cursor-text w-full ${compact ? 'flex-1 p-2' : ''}`} onClick={() => editor.chain().focus().run()}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function ToolbarButton({ onClick, isActive, icon }: any) {
    return (
        <button type="button" onClick={onClick} className={`p-1.5 rounded transition-colors ${isActive ? "bg-gray-200 text-black shadow-inner" : "text-gray-500 hover:bg-gray-200"}`}>
            {icon}
        </button>
    )
}