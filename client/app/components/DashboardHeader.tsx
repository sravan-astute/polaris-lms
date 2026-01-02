"use client";

import React, { useEffect, useState } from "react";
import { 
  Bell, Search, User, LogOut, Settings, 
  Palette, Check, Minus, Plus, ChevronDown 
} from "lucide-react";
import Link from "next/link";
import { useTheme, THEMES, ThemeKey } from "../context/ThemeContext";

// 🛠️ API URL for profile fetching
const API_URL = 'https://polaris-backend-379760782242.us-east4.run.app';

export default function DashboardHeader() {
  const { theme, themeKey, setThemeKey, fontStep, adjustFont } = useTheme();
  
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const res = await fetch(`${API_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.ok) {
      const data = await res.json();
      setUser({
        // 🛠️ Using the direct database field now
        name: data.firstName || "User", 
        role: data.role || "STUDENT"
      });
    } else {
      // 🛠️ Resolve the loading state if API fails
      setUser({ name: "Profile", role: "STUDENT" });
    }
  } catch (e) {
    // 🛠️ Resolve the loading state if connection fails
    setUser({ name: "Offline", role: "STUDENT" });
  }
};

  const handleLogout = () => {
    localStorage.clear();
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = '/login';
  };

  return (
    <header className={`h-16 border-b flex items-center justify-between px-8 sticky top-0 z-50 transition-colors duration-300 ${theme.paper} ${theme.border}`}>
      
      {/* 🔍 SEARCH BAR */}
      <div className="flex-1 max-w-md relative group">
        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${themeKey === 'CONTRAST' ? 'text-yellow-400' : 'opacity-40'}`} size={18} />
        <input 
          type="text" 
          placeholder="Search items, assessments..." 
          className={`w-full border rounded-xl py-2 pl-10 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/20 
            ${theme.input} ${theme.border}`} 
        />
      </div>

      <div className="flex items-center gap-4">
        
        {/* THEME & FONT CONTROLS */}
        <div className={`flex items-center gap-2 p-1.5 rounded-lg border ${theme.border} bg-current/[0.05]`}>
             <div className="flex items-center">
                <button onClick={() => adjustFont(-1)} className={`p-1.5 rounded transition-colors ${themeKey === 'CONTRAST' ? 'hover:bg-yellow-400 hover:text-black' : 'hover:bg-current/10'}`}>
                    <Minus size={14} />
                </button>
                <span className="font-mono text-xs w-6 text-center opacity-60">{fontStep}</span>
                <button onClick={() => adjustFont(1)} className={`p-1.5 rounded transition-colors ${themeKey === 'CONTRAST' ? 'hover:bg-yellow-400 hover:text-black' : 'hover:bg-current/10'}`}>
                    <Plus size={14} />
                </button>
             </div>

             <div className="w-px h-4 bg-current opacity-20"></div>

             <div className="relative">
                <button 
                    onClick={() => setShowThemeMenu(!showThemeMenu)}
                    className={`p-1.5 rounded transition-colors ${themeKey === 'CONTRAST' ? 'hover:bg-yellow-400 hover:text-black' : 'hover:bg-current/10'}`}
                    title="Change theme"
                >
                    <Palette size={18} />
                </button>
                
                {showThemeMenu && (
                    <div className={`absolute top-full right-0 mt-2 w-48 shadow-xl rounded-xl border p-1 z-50 ${theme.paper} ${theme.border}`}>
                        {Object.entries(THEMES).map(([key, t]) => (
                            <button
                                key={key}
                                onClick={() => { setThemeKey(key as ThemeKey); setShowThemeMenu(false); }}
                                className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center justify-between transition-colors 
                                    ${key === themeKey ? 'bg-indigo-600 text-white font-bold' : `hover:bg-current/[0.05] ${theme.text}`}`}
                                style={{ 
                                    backgroundColor: key === 'CONTRAST' && key === themeKey ? 'black' : undefined, 
                                    color: key === 'CONTRAST' && key === themeKey ? 'yellow' : undefined 
                                }}
                            >
                                {t.label}
                                {key === themeKey && <Check size={14}/>}
                            </button>
                        ))}
                    </div>
                )}
             </div>
        </div>

        <div className="w-px h-6 bg-current opacity-10 mx-2"></div>

        {/* NOTIFICATIONS */}
        <button className={`relative p-2 transition-colors ${themeKey === 'CONTRAST' ? 'text-yellow-400' : 'opacity-60 hover:opacity-100'}`}>
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* 👤 USER DROPDOWN */}
        <div className="relative ml-2">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center gap-3 group">
            <div className="text-right hidden md:block">
              {/* 🛠️ Dynamic name from database with font-bold */}
              <p className={`text-sm font-bold leading-none ${theme.text}`}>
                {user?.name || "Loading..."}
              </p>
              {/* 🛠️ Role in Proper Case with font-medium */}
              <p className={`text-[10px] font-medium mt-1 ${themeKey === 'CONTRAST' ? 'text-yellow-200' : 'text-indigo-600'}`}>
                {user?.role ? user.role.charAt(0) + user.role.slice(1).toLowerCase().replace('_', ' ') : ""}
              </p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105 ${theme.accent.split(' ')[0]}`}>
              <User size={20} />
            </div>
            <ChevronDown size={14} className={`opacity-40 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isMenuOpen && (
            <div className={`absolute right-0 mt-3 w-60 rounded-2xl shadow-2xl py-2 border z-50 animate-in fade-in slide-in-from-top-2 ${theme.paper} ${theme.border}`}>
              <Link 
                href="/dashboard/profile" 
                onClick={() => setIsMenuOpen(false)} 
                className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-current/[0.05] ${theme.text}`}
              >
                <User size={18} className="opacity-60" /> My profile
              </Link>
              <Link 
                href="/dashboard/settings" 
                onClick={() => setIsMenuOpen(false)} 
                className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-current/[0.05] ${theme.text}`}
              >
                <Settings size={18} className="opacity-60" /> Account settings
              </Link>
              <hr className={`my-2 opacity-10 ${theme.border}`} />
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 w-full text-left font-bold"
              >
                <LogOut size={18} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}