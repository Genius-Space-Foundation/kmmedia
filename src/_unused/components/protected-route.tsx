"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check authentication immediately
    const checkAuth = () => {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setIsAuthenticated(false);
        // Get current path for return URL
        const currentPath = window.location.pathname;
        const returnUrl = encodeURIComponent(currentPath);
        router.push(`/auth/login?returnUrl=${returnUrl}`);
        return;
      }

      setIsAuthenticated(true);
    };

    checkAuth();
  }, [router]);

  // Show loading while checking
  if (isAuthenticated === null) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
              <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="text-xl font-semibold text-gray-700">
              Checking Authentication...
            </div>
            <p className="text-gray-500">
              Please wait while we verify your access
            </p>
          </div>
        </div>
      )
    );
  }

  // If not authenticated, don't render anything (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // If authenticated, render children
  return <>{children}</>;
}
