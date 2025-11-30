"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "STUDENT" | "INSTRUCTOR" | "ADMIN";
}

export default function ProtectedRoute({ 
  children, 
  requiredRole 
}: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still checking session
    
    if (status === "unauthenticated") {
      // Not logged in - redirect to login
      router.push("/auth/login");
      return;
    }

    if (requiredRole && session?.user?.role !== requiredRole) {
      // Logged in but wrong role - redirect to appropriate dashboard
      const roleDashboards = {
        STUDENT: "/dashboards/student",
        INSTRUCTOR: "/dashboards/instructor",
        ADMIN: "/dashboards/admin",
      };
      
      const userRole = session?.user?.role as keyof typeof roleDashboards;
      if (userRole && roleDashboards[userRole]) {
        router.push(roleDashboards[userRole]);
      } else {
        router.push("/");
      }
    }
  }, [status, session, requiredRole, router]);

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children until authenticated
  if (status === "unauthenticated") {
    return null;
  }

  // Check role if required
  if (requiredRole && session?.user?.role !== requiredRole) {
    return null;
  }

  // Authenticated and authorized - render children
  return <>{children}</>;
}
