"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        // No token? Login.
        router.push("/login");
        return;
      }

      try {
        // 🔍 Verify the token with the backend
        // We try to fetch the users list (or any protected endpoint)
        const res = await fetch("http://localhost:4000/users", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          // Token is good -> Dashboard
          router.push("/dashboard");
        } else {
          // Token is bad/expired -> Clear it and Login
          throw new Error("Invalid token");
        }
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50 text-indigo-600">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="animate-spin" size={32} />
        <span className="text-sm font-medium animate-pulse">Loading Polaris...</span>
      </div>
    </div>
  );
}