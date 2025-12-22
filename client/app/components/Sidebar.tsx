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

// 1. UPDATE TYPES to match your Prisma Seed
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

  // 2. Get Role from LocalStorage
  useEffect(() => {
    // We assume your Login page saves this as 'role'
    // If it saved it as 'userRole', change this key below to 'userRole'
    const storedRole = localStorage.getItem("role") as UserRole;
    setRole(storedRole); 
  }, []);

  // 3. Define Menu Items with EXACT Database Roles
  const allMenuItems = [
    { 
        name: "Dashboard", 
        path: "/dashboard", 
        icon: LayoutDashboard,
        // Everyone sees Dashboard
        roles: ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER", "CONTENT_DEVELOPER", "REVIEWER", "TEACHER"] 
    },
    { 
        name: "Item Bank", 
        path: "/dashboard/item-bank", 
        icon: Library,
        // Authors (Developers) & Managers & Admins
        roles: ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER", "CONTENT_DEVELOPER"] 
    },
    { 
        name: "Review Queue", 
        path: "/dashboard/review", 
        icon: CheckCircle,
        // Reviewers, Managers, and Admins
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

  // 4. Filter Logic
  const visibleItems = allMenuItems.filter(item => 
    role && item.roles.includes(role)
  );

  const isActive = (path: string) => {
    if (path === "/dashboard" && pathname === "/dashboard") return true;
    return path !== "/dashboard" && pathname?.startsWith(path);
  };

  return (
    <div className="w-64 h-screen bg-white border-r flex flex-col flex-shrink-0 sticky top-0">
      {/* BRANDING */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
          P
        </div>
        <div>
            <span className="font-bold text-xl tracking-tight text-gray-900 block leading-none">Polaris</span>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                {role ? role.replace('_', ' ') : "Loading..."}
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
                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                    ${active 
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" 
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                >
                  <item.icon size={20} className={active ? "text-white" : "text-gray-400"} />
                  {item.name}
                </Link>
              );
            })
        ) : (
            <div className="px-4 py-8 text-center text-gray-400 text-sm">
                No menu items found for role: <br/><strong>{role || "Unknown"}</strong>
            </div>
        )}
      </nav>

      {/* FOOTER */}
      <div className="p-4 border-t">
        <button 
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
          className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </div>
  );
}