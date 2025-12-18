"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@polaris.edu"); // Default for easy testing
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    // 🛑 STOP THE FLASH: This prevents the browser from refreshing the page
    e.preventDefault(); 
    
    setError("");
    setLoading(true);

    try {
        // NOTE: Since we haven't built a full Auth/JWT backend module in this chat,
        // we will simulate the login check by verifying the user exists via the LTI/User service 
        // or simply allow the default admin for this "Builder Mode" phase.
        
        // TEMPORARY: Simple check against the Seeded Admin
        if (email.toLowerCase() === "admin@polaris.edu" && password === "password123") {
            // Simulate API delay
            await new Promise(r => setTimeout(r, 800));
            
            // Save dummy session
            localStorage.setItem("polaris_user", JSON.stringify({ 
                id: "00000000-0000-0000-0000-000000000000", 
                email: "admin@polaris.edu",
                role: "ADMIN" 
            }));
            
            // Redirect to Item Bank
            router.push("/banks"); 
        } else {
            throw new Error("Invalid credentials. Try admin@polaris.edu / password123");
        }

    } catch (err: any) {
        setError(err.message || "Login failed");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-slate-200">
        
        {/* Logo / Header */}
        <div className="text-center mb-8">
            <div className="h-12 w-12 bg-indigo-600 rounded-lg mx-auto flex items-center justify-center text-white mb-4">
                <Lock size={24} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Polaris Engine</h1>
            <p className="text-slate-500 text-sm mt-2">Sign in to access the Content Builder</p>
        </div>

        {/* Error Message */}
        {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 border border-red-100">
                <AlertCircle size={16} />
                {error}
            </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input 
                        type="email" 
                        required
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                        placeholder="name@school.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input 
                        type="password" 
                        required
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
                {loading ? "Signing In..." : "Sign In"}
            </button>
        </form>

        <div className="mt-6 text-center">
            <p className="text-xs text-slate-400">
                Development Mode: Use <span className="font-mono text-slate-600">admin@polaris.edu</span> / <span className="font-mono text-slate-600">password123</span>
            </p>
        </div>
      </div>
    </div>
  );
}