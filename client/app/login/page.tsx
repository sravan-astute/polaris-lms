"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Lock, Mail, ArrowRight, Loader2 } from "lucide-react";

// 🌐 Ensure this matches your Cloud Run or local backend URL
const API_URL = 'https://polaris-backend-379760782242.us-east4.run.app';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // 🛠️ FIX 1: Safely parse JSON. 
      // If the backend 500s with an HTML page, this will catch the error.
      let data;
      try {
        data = await res.json();
      } catch (parseError) {
        throw new Error("Server returned an invalid response. Please try again later.");
      }

      // 🛠️ FIX 2: Use the error message from our updated AuthController
      if (!res.ok) {
        throw new Error(data.message || "Invalid credentials");
      }

      const token = data.access_token || data.accessToken || data.token;

      if (!token) {
        toast.error("Login error: Server did not send a valid token.");
        return;
      }

      // 💾 SAVE TOKEN AND ROLE
      localStorage.setItem("token", token);
      
      const userRole = data.role || "STUDENT"; 
      localStorage.setItem("role", userRole);

      // 💾 SAVE NAME FIELDS (Matches schema.prisma @map)
      if (data.firstName) localStorage.setItem("firstName", data.firstName);
      if (data.lastName) localStorage.setItem("lastName", data.lastName);

      // 🍪 SET COOKIE FOR MIDDLEWARE
      document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;

      toast.success(`Welcome back, ${data.firstName || 'User'}!`);
      router.push("/dashboard");

    } catch (err: any) {
      console.error("Login Error:", err.message);
      // 🛠️ FIX 3: Display the actual error message from the backend
      toast.error(err.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100 w-full max-w-md">
        
        <div className="text-center mb-10">
          <div className="bg-indigo-600 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
            <span className="text-white font-black text-2xl">P</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Welcome back</h1>
          <p className="text-gray-500 text-sm font-medium mt-1">Sign in to Polaris LMS</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 px-1">Email address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-gray-900 text-sm font-medium"
                placeholder="name@company.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 px-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-gray-900 text-sm font-medium"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed mt-4 active:scale-95"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <>Sign in <ArrowRight size={20} /></>}
          </button>

          <div className="mt-8 text-center text-sm text-gray-500 font-medium">
            Don't have an account?{' '}
            <button 
                type="button" 
                onClick={() => router.push('/signup')} 
                className="text-indigo-600 font-black hover:underline"
            >
                Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}