"use client";

import React, { useEffect, useMemo } from "react"; 
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import ImageExtension from "@tiptap/extension-image"; 
import { Bold, Italic, List, ListOrdered, Sigma } from "lucide-react";
// 🛠️ Import theme hook
import { useTheme } from "../context/ThemeContext";

export interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  compact?: boolean; 
}

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
  const { theme, mode } = useTheme(); // 🛠️ Access theme and light/dark mode
  
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
        // 🛠️ FIXED: Added theme.text and prose-invert (for dark modes) to ensure typed text is visible
        class: `prose prose-sm focus:outline-none w-full ${mode === 'dark' ? 'prose-invert' : ''} ${theme.text} ${compact ? 'min-h-[32px] px-2 py-1' : 'min-h-[120px] p-4'}`,
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
          // 🛠️ FIXED: Adjusted URL to use transparent background (\bg_transparent) so it works on dark themes
          const colorParam = mode === 'dark' ? '\\color{white}' : '\\color{black}';
          const url = `https://latex.codecogs.com/png.latex?\\dpi{110}${colorParam}&space;${encodeURIComponent(latex)}`;
          editor.chain().focus().setImage({ src: url, alt: latex, title: latex }).run();
      } catch (e) {
          console.error("Math conversion error:", e);
      }
  };

  return (
    <div className={`group border rounded-lg overflow-hidden shadow-sm transition-all focus-within:ring-2 focus-within:ring-indigo-500/20 flex flex-row items-stretch ${theme.input} ${theme.border}`}>
      
      {/* PART 1: Main Text Field */}
      <div className={`cursor-text flex-1 min-w-0`} onClick={() => editor.chain().focus().run()}>
        <EditorContent editor={editor} />
      </div>

      {/* PART 2: Action Buttons - Updated for theme consistency */}
      <div className={`flex items-center justify-center border-l p-0.5 transition-colors ${theme.border} ${compact ? 'w-auto' : 'w-10 flex-col'} bg-black/5`}>
        <div className={`flex ${compact ? 'flex-row items-center gap-0.5' : 'flex-col gap-1'}`}>
            <ToolbarButton 
              onClick={() => editor.chain().focus().toggleBold().run()} 
              isActive={editor.isActive('bold')} 
              icon={<Bold size={12} />} 
              theme={theme}
            />
            <ToolbarButton 
              onClick={() => editor.chain().focus().toggleItalic().run()} 
              isActive={editor.isActive('italic')} 
              icon={<Italic size={12} />} 
              theme={theme}
            />
            
            <button 
                type="button"
                onClick={handleMath} 
                className={`p-1 rounded transition-colors ${theme.text} hover:bg-indigo-500/20`}
                title="Math"
            >
                <Sigma size={12} />
            </button>
        </div>

        {!compact && (
            <div className={`flex flex-col gap-1 mt-2 border-t pt-2 ${theme.border}`}>
                <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} icon={<List size={12} />} theme={theme} />
                <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} icon={<ListOrdered size={12} />} theme={theme} />
            </div>
        )}
      </div>
    </div>
  );
}

function ToolbarButton({ onClick, isActive, icon, theme }: any) {
    return (
        <button 
          type="button" 
          onClick={onClick} 
          className={`p-1 rounded transition-colors ${isActive ? "bg-indigo-600 text-white" : `${theme.text} opacity-60 hover:opacity-100 hover:bg-black/5`}`}
        >
            {icon}
        </button>
    )
}