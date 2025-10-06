"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StudentSidebar from "../navigation/StudentSidebar";
import UserDropdown from "@/components/user-dropdown";
import { Button } from "@/components/ui/button";
import { Bell, Menu, X, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(3); // This would come from props/state
  const [user, setUser] = useState<any>(null); // User state
  const router = useRouter();

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (token) {
          // Fetch user profile
          const response = await fetch("/api/user/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data.data);
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Handler functions for UserDropdown
  const handleUpdateProfile = (updatedUser: any) => {
    console.log("Update profile:", updatedUser);
    setUser(updatedUser);
    // Update local storage if needed
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const handleUpdatePassword = (data: any) => {
    console.log("Update password:", data);
    // Implement password update logic
  };

  const handleLogout = async () => {
    try {
      // Clear local storage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      // Redirect to login
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Still redirect even if there's an error
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      router.push("/auth/login");
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="h-8 w-8 p-0"
            >
              {mobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">🎓</span>
            </div>
            <span className="font-semibold text-gray-900">Student Portal</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              {notifications > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs bg-red-500 text-white">
                  {notifications}
                </Badge>
              )}
            </Button>
            <UserDropdown
              user={user}
              onUpdateProfile={handleUpdateProfile}
              onUpdatePassword={handleUpdatePassword}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div
          className={`${
            sidebarCollapsed ? "lg:w-16" : "lg:w-64"
          } transition-all duration-300 ${
            mobileMenuOpen
              ? "fixed inset-y-0 left-0 z-50 w-64"
              : "hidden lg:block"
          }`}
        >
          <StudentSidebar
            isCollapsed={sidebarCollapsed}
            onToggle={toggleSidebar}
            activeTab={activeTab}
            onTabChange={onTabChange}
            className="h-full"
          />
        </div>

        {/* Mobile Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Desktop Header */}
          <header className="hidden lg:block bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">🎓</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                      Welcome back, {user?.name || "Student"}!
                    </h1>
                    <p className="text-sm text-gray-600">
                      Ready to continue your learning journey?
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-80">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search courses, lessons..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                    />
                  </div>
                </div>

                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  {notifications > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs bg-red-500 text-white">
                      {notifications}
                    </Badge>
                  )}
                </Button>

                <UserDropdown
                  user={user}
                  onUpdateProfile={handleUpdateProfile}
                  onUpdatePassword={handleUpdatePassword}
                  onLogout={handleLogout}
                />
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className={`flex-1 p-4 lg:p-6 ${className}`}>{children}</main>
        </div>
      </div>
    </div>
  );
}

