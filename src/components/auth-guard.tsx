"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export function AuthGuard({
  children,
  redirectTo = "/auth/login",
  fallback,
}: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log("AuthGuard: Checking authentication...");
    // Check authentication immediately
    const token = localStorage.getItem("accessToken");
    console.log("AuthGuard: Token present:", !!token);

    if (!token) {
      console.log("AuthGuard: No token, redirecting to login");
      // Get current path for return URL
      const currentPath = window.location.pathname;
      const returnUrl = encodeURIComponent(currentPath);
      router.push(`${redirectTo}?returnUrl=${returnUrl}`);
      return;
    }

    console.log("AuthGuard: Token found, setting authenticated to true");
    // If token exists, user is authenticated
    setIsAuthenticated(true);
    setIsChecking(false);
  }, [router, redirectTo]);

  // Show loading while checking
  if (isChecking) {
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
