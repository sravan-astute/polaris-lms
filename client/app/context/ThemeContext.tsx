"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// --- TYPES ---
export type ThemeKey = 'LIGHT' | 'DARK' | 'CONTRAST' | 'SEPIA' | 'BLUE' | 'FOREST';

export interface Theme {
  label: string;
  bg: string;       
  paper: string;    
  sidebar: string;  
  text: string;     
  border: string;   
  accent: string;   
  input: string;    
  muted: string;    
}

// --- THEME DEFINITIONS ---
export const THEMES: Record<ThemeKey, Theme> = {
  LIGHT: { 
    label: "Polaris Light", 
    bg: "bg-slate-50", 
    paper: "bg-white", 
    sidebar: "bg-white",
    text: "text-slate-800", 
    border: "border-slate-200", 
    accent: "bg-indigo-600 text-white hover:bg-indigo-700",
    input: "bg-white border-slate-300 focus:ring-indigo-500",
    muted: "text-slate-500" 
  },
  DARK: { 
    label: "Midnight", 
    bg: "bg-slate-950", 
    paper: "bg-slate-900", 
    sidebar: "bg-slate-900",
    text: "text-slate-100", 
    border: "border-slate-700", 
    accent: "bg-indigo-500 text-white hover:bg-indigo-600",
    input: "bg-slate-800 border-slate-600 text-white focus:ring-indigo-400",
    muted: "text-slate-400"
  },
  CONTRAST: { 
    label: "High Contrast", 
    bg: "bg-black", 
    paper: "bg-black", 
    sidebar: "bg-black",
    text: "text-yellow-400", 
    border: "border-yellow-400", 
    accent: "bg-yellow-400 text-black font-bold hover:bg-yellow-500",
    input: "bg-black border-yellow-400 text-yellow-300 focus:ring-yellow-500",
    muted: "text-yellow-200"
  },
  SEPIA: { 
    label: "Warm Sepia", 
    bg: "bg-amber-50", 
    paper: "bg-orange-50", 
    sidebar: "bg-orange-100",
    text: "text-amber-900", 
    border: "border-amber-200", 
    accent: "bg-amber-700 text-white hover:bg-amber-800",
    input: "bg-white border-amber-300 text-amber-900 focus:ring-amber-500",
    muted: "text-amber-700/70"
  },
  BLUE: { 
    label: "Calm Blue", 
    bg: "bg-sky-50", 
    paper: "bg-white", 
    sidebar: "bg-sky-100",
    text: "text-sky-900", 
    border: "border-sky-200", 
    accent: "bg-sky-600 text-white hover:bg-sky-700",
    input: "bg-white border-sky-300 text-sky-900 focus:ring-sky-500",
    muted: "text-sky-600"
  },
  FOREST: { 
    label: "Deep Forest", 
    bg: "bg-emerald-950", 
    paper: "bg-emerald-900", 
    sidebar: "bg-emerald-900",
    text: "text-emerald-50", 
    border: "border-emerald-700", 
    accent: "bg-emerald-500 text-white hover:bg-emerald-600",
    input: "bg-emerald-800 border-emerald-600 text-emerald-50 focus:ring-emerald-400",
    muted: "text-emerald-300"
  }
};

const FONT_SIZES = [
  "text-xs", "text-sm", "text-base", "text-lg", "text-xl", "text-2xl", "text-3xl"
];

// --- CONTEXT SETUP ---
interface ThemeContextType {
  themeKey: ThemeKey;
  setThemeKey: (key: ThemeKey) => void;
  theme: Theme;
  mode: 'light' | 'dark'; // 👈 Added this for compatibility
  fontStep: number;
  setFontStep: (step: number) => void;
  adjustFont: (dir: -1 | 1) => void;
  currentFontClass: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeKey, setThemeKey] = useState<ThemeKey>('LIGHT');
  const [fontStep, setFontStep] = useState(2); 
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('polaris-theme') as ThemeKey;
    const savedFont = localStorage.getItem('polaris-font');
    
    if (savedTheme && THEMES[savedTheme]) setThemeKey(savedTheme);
    if (savedFont) setFontStep(parseInt(savedFont));
    
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('polaris-theme', themeKey);
    localStorage.setItem('polaris-font', fontStep.toString());
  }, [themeKey, fontStep, mounted]);

  const adjustFont = (dir: -1 | 1) => {
    setFontStep(prev => {
      const next = prev + dir;
      if (next < 0) return 0;
      if (next > 6) return 6;
      return next;
    });
  };

  // 🧠 DERIVE MODE AUTOMATICALLY
  // Light = Light, Sepia, Blue
  // Dark = Dark, Contrast, Forest
  const mode: 'light' | 'dark' = ['DARK', 'CONTRAST', 'FOREST'].includes(themeKey) ? 'dark' : 'light';

  const value = {
    themeKey,
    setThemeKey,
    theme: THEMES[themeKey],
    mode, // 👈 Pass it here
    fontStep,
    setFontStep,
    adjustFont,
    currentFontClass: FONT_SIZES[fontStep]
  };

  return (
    <ThemeContext.Provider value={value}>
      <div 
        suppressHydrationWarning
        className={`min-h-screen transition-colors duration-300 ${THEMES[themeKey].bg} ${THEMES[themeKey].text} ${FONT_SIZES[fontStep]}`}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}