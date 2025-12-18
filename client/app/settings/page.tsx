"use client";

// ❌ REMOVE Sidebar import
import React from 'react';
import { useTheme } from "../context/ThemeContext";

export default function Settings() {
  // Use theme for dynamic background
  const { theme } = useTheme();

  return (
    // ❌ Removed 'flex' and 'Sidebar'. Just content.
    <div className={`h-full p-8 ${theme.bg} ${theme.text}`}>
        <h1 className="text-3xl font-bold mb-4">⚙️ System Settings</h1>
        <p className="opacity-70">Configure global defaults for quizzes.</p>
        
        {/* Example Content */}
        <div className={`mt-8 p-6 rounded-xl border max-w-2xl ${theme.paper} ${theme.border}`}>
            <h2 className="font-bold mb-4">General Configuration</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium opacity-70 mb-1">Organization Name</label>
                    <input type="text" className={`w-full p-2 border rounded ${theme.input}`} defaultValue="Demo School" />
                </div>
            </div>
        </div>
    </div>
  );
}