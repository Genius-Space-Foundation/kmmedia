"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { makeAuthenticatedRequest } from "@/lib/token-utils";
import { ModernSidebar } from "@/components/dashboard/modern-sidebar";
import { ModernHeader } from "@/components/dashboard/modern-header";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  CreditCard,
  MessageSquare,
  Settings,
  Award,
  Calendar,
  Target,
  User,
} from "lucide-react";

interface StudentLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

export default function StudentLayout({
  children,
  activeTab,
  onTabChange,
  className = "",
}: StudentLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (status === "authenticated") {
          // Check if user has STUDENT role
          if (session?.user?.role !== "STUDENT") {
            console.warn("Non-student user accessing student dashboard");
            // Redirect to appropriate dashboard based on role
            if (session?.user?.role === "ADMIN") {
              router.push("/admin");
            } else if (session?.user?.role === "INSTRUCTOR") {
              router.push("/instructor");
            }
            return;
          }

          const response = await makeAuthenticatedRequest("/api/user/profile");
          if (response.ok) {
            const data = await response.json();
            setUser(data.user || data.data);
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
  }, [status, session, router]);

  const handleLogout = async () => {
    try {
      // Use NextAuth signOut
      const { signOut } = await import("next-auth/react");
      await signOut({ callbackUrl: "/auth/login" });
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/auth/login");
    }
  };

  const navigationItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard, badge: null },
    { id: "courses", label: "My Course", icon: BookOpen, badge: null },
    { id: "assessments", label: "Assessments", icon: FileText, badge: null },
    { id: "achievements", label: "Achievements", icon: Award, badge: null },
    { id: "payments", label: "Payments", icon: CreditCard, badge: null },
    {
      id: "notifications",
      label: "Notifications",
      icon: MessageSquare,
      badge: null,
    },
    { id: "profile", label: "My Profile", icon: User, badge: null },
    { id: "settings", label: "Settings", icon: Settings, badge: null },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Modern Sidebar */}
      <ModernSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        activeTab={activeTab}
        onTabChange={onTabChange}
        navigationItems={navigationItems}
        brandName="KM Media"
        brandSubtitle="Student Portal"
        brandInitials="KM"
      />

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-72" : "ml-20"
        }`}
      >
        {/* Modern Header */}
        <ModernHeader
          title="Student Dashboard"
          subtitle={`Welcome back, ${
            user?.name || "Student"
          }! Ready to continue learning?`}
          currentUser={user}
          onProfileClick={() => onTabChange("profile")}
          onSettingsClick={() => onTabChange("settings")}
          onLogout={handleLogout}
          notificationCount={0}
        />

        {/* Page Content */}
        <main className={`px-8 py-8 ${className}`}>{children}</main>
      </div>
    </div>
  );
}
