"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, FileQuestion, BookOpen, BarChart3, Settings, 
  Upload, LogOut
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "All Quizzes", href: "/quizzes", icon: BookOpen },
  { label: "Item Bank", href: "/banks", icon: FileQuestion },
  { label: "Grading", href: "/grading", icon: BarChart3 },
  { label: "Import / Export", href: "/import", icon: Upload },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme } = useTheme();

  return (
    <div className={`w-64 h-screen flex flex-col border-r transition-colors duration-300 ${theme.sidebar} ${theme.text} ${theme.border}`}>
      
      {/* Branding */}
      <div className={`p-6 h-16 border-b flex items-center gap-2 ${theme.border}`}>
           <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${theme.accent.split(' ')[0]}`}>
             P
           </div>
           <h1 className="text-xl font-bold tracking-tight">Polaris</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive 
                    ? `${theme.accent}` 
                    : `hover:bg-black/5 opacity-70 hover:opacity-100`
                }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer (Simple Sign Out) */}
      <div className={`p-4 border-t ${theme.border}`}>
        <button className={`flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium opacity-70 hover:opacity-100 hover:bg-red-50 hover:text-red-600 transition-all`}>
            <LogOut size={18} />
            Sign Out
        </button>
      </div>
    </div>
  );
}