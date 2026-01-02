"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation"; 
import { 
  LayoutDashboard, 
  FileQuestion, 
  Library, 
  BarChart2, 
  Settings, 
  LogOut,
  Upload,
  CheckCircle,
} from "lucide-react";
// 🛠️ Hook into the global theme
import { useTheme } from "../context/ThemeContext";

type UserRole = 
  | "SUPER_ADMIN" 
  | "ADMIN" 
  | "CONTENT_MANAGER" 
  | "CONTENT_DEVELOPER" 
  | "REVIEWER"
  | "TEACHER" 
  | "STUDENT";

export default function Sidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState<UserRole | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const storedRole = localStorage.getItem("role") as UserRole;
    setRole(storedRole); 
  }, []);

  const allMenuItems = [
    { 
        name: "Dashboard", 
        path: "/dashboard", 
        icon: LayoutDashboard,
        roles: ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER", "CONTENT_DEVELOPER", "REVIEWER", "TEACHER"] 
    },
    { 
        name: "Item Bank", 
        path: "/dashboard/item-bank", 
        icon: Library,
        roles: ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER", "CONTENT_DEVELOPER"] 
    },
    { 
        name: "Review Queue", 
        path: "/dashboard/review", 
        icon: CheckCircle,
        roles: ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER", "REVIEWER"] 
    },
    { 
        name: "Assessments", 
        path: "/dashboard/assessments", 
        icon: FileQuestion,
        roles: ["SUPER_ADMIN", "ADMIN", "TEACHER"] 
    },
    { 
        name: "Grading", 
        path: "/dashboard/grading", 
        icon: BarChart2,
        roles: ["SUPER_ADMIN", "ADMIN", "TEACHER"] 
    },
    /* ✂️ "My Profile" removed from here as it is now accessed via the Header icon */
    { 
        name: "Import / Export", 
        path: "/dashboard/import", 
        icon: Upload,
        roles: ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"] 
    },
    { 
        name: "Settings", 
        path: "/dashboard/settings", 
        icon: Settings,
        roles: ["SUPER_ADMIN", "ADMIN"] 
    },
  ];

  const visibleItems = allMenuItems.filter(item => 
    role && item.roles.includes(role)
  );

  const isActive = (path: string) => {
    if (path === "/dashboard" && pathname === "/dashboard") return true;
    return path !== "/dashboard" && pathname?.startsWith(path);
  };

  return (
    <div className={`w-64 h-screen border-r flex flex-col flex-shrink-0 sticky top-0 transition-colors duration-300 ${theme.sidebar} ${theme.border}`}>
      {/* BRANDING */}
      <div className="p-6 flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold shadow-sm ${theme.accent}`}>
          P
        </div>
        <div>
            <span className={`font-bold text-xl tracking-tight block leading-none ${theme.text}`}>Polaris</span>
            {/* 🛠️ Proper Case Role Display */}
            <span className="text-[10px] font-bold opacity-50 tracking-wider">
                {role ? role.charAt(0) + role.slice(1).toLowerCase().replace('_', ' ') : "Loading..." }
            </span>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {visibleItems.length > 0 ? (
            visibleItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link 
                  key={item.path} 
                  href={item.path}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black transition-all
                    ${active 
                      ? `${theme.accent} shadow-md` 
                      : `hover:bg-black/5 ${theme.text} opacity-70 hover:opacity-100`
                    }
                  `}
                >
                  <item.icon size={20} className={active ? "text-inherit" : "opacity-60"} />
                  {item.name}
                </Link>
              );
            })
        ) : (
            <div className="px-4 py-8 text-center opacity-40 text-sm italic">
                No menu items found for role: <br/><strong>{role || "Unknown"}</strong>
            </div>
        )}
      </nav>

      {/* FOOTER */}
      <div className={`p-4 border-t ${theme.border}`}>
        <button 
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
          className="flex items-center gap-3 px-4 py-3 w-full text-sm font-black text-red-500 rounded-xl hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={20} />
          Sign out
        </button>
      </div>
    </div>
  );
}