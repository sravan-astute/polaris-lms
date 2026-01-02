"use client";

import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/DashboardHeader";
// 🛠️ Import the theme hook to access global tokens
import { useTheme } from "../context/ThemeContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 🛠️ Destructure the theme object
  const { theme } = useTheme();

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-300 ${theme.bg}`}>
      {/* 1. The ONLY Sidebar */}
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* 2. The ONLY Header */}
        <DashboardHeader />

        {/* 3. The Page Content */}
        {/* 🛠️ Applied theme.text to ensure all child pages inherit the correct font color */}
        <main className={`flex-1 overflow-y-auto relative p-6 ${theme.text}`}>
          {children}
        </main>
      </div>
    </div>
  );
}