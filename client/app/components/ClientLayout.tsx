"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import { ThemeProvider, useTheme, THEMES, ThemeKey } from "../context/ThemeContext";
import { Palette, Check, Minus, Plus, Bell, User } from "lucide-react";

// --- INTERNAL COMPONENT: TOP HEADER ---
const TopHeader = () => {
  const { theme, themeKey, setThemeKey, fontStep, adjustFont } = useTheme();
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  return (
    <header className={`h-16 border-b flex items-center justify-between px-8 transition-colors duration-300 ${theme.paper} ${theme.border}`}>
      
      {/* Left side: Breadcrumbs */}
      <div className="font-semibold opacity-50 text-sm">
          Polaris LMS / System
      </div>

      {/* Right side: Controls */}
      <div className="flex items-center gap-4">
        
        {/* THEME & FONT CONTROLS */}
        <div className={`flex items-center gap-2 p-1.5 rounded-lg border ${theme.border} bg-opacity-50`}>
             {/* Font Resizer */}
             <div className="flex items-center">
                <button onClick={() => adjustFont(-1)} className="p-1.5 rounded hover:opacity-70">
                   <Minus size={14} />
                </button>
                <span className="font-mono text-xs w-6 text-center opacity-60">{fontStep}</span>
                <button onClick={() => adjustFont(1)} className="p-1.5 rounded hover:opacity-70">
                   <Plus size={14} />
                </button>
             </div>

             <div className="w-px h-4 bg-current opacity-20"></div>

             {/* Theme Dropdown */}
             <div className="relative">
                <button 
                    onClick={() => setShowThemeMenu(!showThemeMenu)}
                    className="p-1.5 rounded hover:opacity-70"
                    title="Change Theme"
                >
                    <Palette size={18} />
                </button>
                
                {showThemeMenu && (
                    <div className={`absolute top-full right-0 mt-2 w-48 shadow-xl rounded-lg border p-1 z-50 ${theme.paper} ${theme.border}`}>
                        {Object.entries(THEMES).map(([key, t]) => (
                            <button
                                key={key}
                                onClick={() => { setThemeKey(key as ThemeKey); setShowThemeMenu(false); }}
                                className={`w-full text-left px-3 py-2 text-sm rounded flex items-center justify-between hover:opacity-80 ${key === themeKey ? 'font-bold' : ''}`}
                                style={{ backgroundColor: key === 'CONTRAST' ? 'black' : 'transparent', color: key === 'CONTRAST' ? 'yellow' : 'inherit' }}
                            >
                                {t.label}
                                {key === themeKey && <Check size={14}/>}
                            </button>
                        ))}
                    </div>
                )}
             </div>
        </div>

        <div className="w-px h-6 bg-current opacity-10"></div>

        {/* Notifications & Profile */}
        <button className="p-2 opacity-60 hover:opacity-100"><Bell size={20} /></button>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${theme.accent.split(' ')[0]}`}>
            <User size={16} />
        </div>
      </div>
    </header>
  );
};

// --- LAYOUT LOGIC ---
function InnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // ✅ UPDATED: Hide sidebar on both Login AND Signup pages
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  // CASE 1: Auth Pages -> Full Screen, No Sidebar
  if (isAuthPage) {
    return <main className="min-h-screen w-full">{children}</main>;
  }

  // CASE 2: App Pages -> Sidebar + Header + Content
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        <TopHeader />
        <main className="flex-1 overflow-hidden relative">
           {children}
        </main>
      </div>
    </div>
  );
}

// --- MAIN WRAPPER ---
export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <InnerLayout>{children}</InnerLayout>
    </ThemeProvider>
  );
}