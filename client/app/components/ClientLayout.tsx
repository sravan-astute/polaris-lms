"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "../context/ThemeContext";

// --- LAYOUT LOGIC ---
function InnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // ✅ Keeps logic to identify Auth pages for full-screen view
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  // CASE 1: Auth Pages -> Full Screen, No Sidebar
  if (isAuthPage) {
    return <main className="min-h-screen w-full">{children}</main>;
  }

  // CASE 2: App Pages
  // 🛠️ UPDATED: Removed Sidebar and TopHeader from here. 
  // This prevents duplication because app/dashboard/layout.tsx handles these now.
  return (
    <div className="min-h-screen">
       {children}
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