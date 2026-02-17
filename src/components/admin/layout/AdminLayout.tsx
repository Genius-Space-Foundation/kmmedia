"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../navigation/Sidebar";
import Breadcrumbs from "../navigation/Breadcrumbs";
import GlobalSearch from "../search/GlobalSearch";
import UserDropdown from "@/components/user-dropdown";
import ThemeToggle from "../theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Bell, Settings, Menu, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { safeJsonParse } from "@/lib/api-utils";
import { clearAuthTokens } from "@/lib/token-utils";

interface AdminLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function AdminLayout({
  children,
  className = "",
}: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(3); // This would come from props/state
  const [user, setUser] = useState(null); // User state
  const router = useRouter();

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          // Fetch user profile
          const response = await fetch("/api/user/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
              "x-user-id": "admin-user-id", // This should come from token decode
            },
          });

          if (response.ok) {
            const data = await safeJsonParse(response, { data: null });
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
      // Call logout API
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Clear local storage
      clearAuthTokens();
      localStorage.removeItem("token");

      // Redirect to login
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Still redirect even if API call fails
      clearAuthTokens();
      localStorage.removeItem("token");
      router.push("/auth/login");
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
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
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">KM</span>
            </div>
            <span className="font-semibold text-gray-900">Admin</span>
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
          <Sidebar
            isCollapsed={sidebarCollapsed}
            onToggle={toggleSidebar}
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
                <Breadcrumbs />
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-80">
                  <GlobalSearch />
                </div>

                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  {notifications > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs bg-red-500 text-white">
                      {notifications}
                    </Badge>
                  )}
                </Button>

                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>

                <ThemeToggle />

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
