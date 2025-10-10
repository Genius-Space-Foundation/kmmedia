"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import InstructorAvatar from "@/components/instructor/profile/InstructorAvatar";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  FileText,
  MessageSquare,
  BarChart3,
  Brain,
  Users2,
  Link as LinkIcon,
  BarChart,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  User,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  profile?: {
    avatar?: string;
  };
}

interface Notification {
  id: string;
  read: boolean;
}

interface InstructorSidebarProps {
  user: User | null;
  notifications: Notification[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
  isMobile?: boolean;
}

export default function InstructorSidebar({
  user,
  notifications,
  activeTab,
  onTabChange,
  onLogout,
  sidebarOpen,
  onSidebarToggle,
  isMobile = false,
}: InstructorSidebarProps) {
  const sidebarItems = [
    {
      id: "overview",
      label: "Overview",
      icon: LayoutDashboard,
      description: "Dashboard overview and quick stats",
    },
    {
      id: "courses",
      label: "Course Management",
      icon: BookOpen,
      description: "Manage your courses and content",
    },
    {
      id: "students",
      label: "Student Analytics",
      icon: Users,
      description: "Track student progress and performance",
    },
    {
      id: "assessments",
      label: "Assessment Center",
      icon: FileText,
      description: "Create and manage assessments",
    },
    {
      id: "communication",
      label: "Communication Hub",
      icon: MessageSquare,
      description: "Announcements and messaging",
    },
    {
      id: "ai-assistant",
      label: "AI Assistant",
      icon: Brain,
      description: "AI-powered content creation",
    },
    {
      id: "analytics",
      label: "Predictive Analytics",
      icon: BarChart3,
      description: "Advanced analytics and insights",
    },
    {
      id: "collaboration",
      label: "Collaboration Hub",
      icon: Users2,
      description: "Team collaboration and reviews",
    },
    {
      id: "integrations",
      label: "Integration Hub",
      icon: LinkIcon,
      description: "Third-party integrations",
    },
    {
      id: "reports",
      label: "Advanced Reporting",
      icon: BarChart,
      description: "Custom reports and exports",
    },
  ];

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  if (isMobile) {
    return (
      <>
        {/* Mobile Header */}
        <div className="lg:hidden bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  Instructor Hub
                </h1>
                <p className="text-xs text-gray-600">Professional Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {unreadNotifications}
                  </Badge>
                )}
              </Button>
              <Button variant="ghost" size="sm" onClick={onSidebarToggle}>
                {sidebarOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
            <div className="absolute right-0 top-0 h-full w-80 bg-white/95 backdrop-blur-xl shadow-2xl">
              <div className="p-6 border-b border-gray-200/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Instructor Hub
                      </h1>
                      <p className="text-sm text-gray-600">
                        Professional Dashboard
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onSidebarToggle}
                    className="hover:bg-gray-100/80 rounded-xl p-2"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Mobile Navigation */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.id}
                      variant={activeTab === item.id ? "default" : "ghost"}
                      className={`w-full justify-start h-auto p-4 rounded-xl transition-all duration-200 ${
                        activeTab === item.id
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105"
                          : "hover:bg-gray-100/80 hover:scale-105"
                      }`}
                      onClick={() => {
                        onTabChange(item.id);
                        onSidebarToggle();
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <div className="text-left">
                          <div className="font-medium">{item.label}</div>
                          <div className="text-xs opacity-80">
                            {item.description}
                          </div>
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>

              {/* Mobile Footer */}
              <div className="p-4 border-t border-gray-200/50">
                <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50/80">
                  <InstructorAvatar
                    src={user?.profileImage || user?.profile?.avatar}
                    name={user?.name}
                    size="md"
                    showBorder
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {user?.name || "Instructor"}
                    </div>
                    <div className="text-sm text-gray-600 truncate">
                      {user?.email || "instructor@example.com"}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onLogout}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div
      className={`${
        sidebarOpen ? "w-80" : "w-16"
      } bg-white/90 backdrop-blur-xl border-r border-gray-200/50 shadow-xl transition-all duration-300 ease-in-out flex flex-col`}
    >
      {/* Sidebar Header */}
      <div className="p-6 border-b border-gray-200/50">
        <div className="flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Instructor Hub
                </h1>
                <p className="text-sm text-gray-600">Professional Dashboard</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onSidebarToggle}
            className="hover:bg-gray-100/80 rounded-xl p-2"
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              className={`w-full justify-start h-auto p-4 rounded-xl transition-all duration-200 ${
                activeTab === item.id
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105"
                  : "hover:bg-gray-100/80 hover:scale-105"
              }`}
              onClick={() => onTabChange(item.id)}
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <div className="text-left">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs opacity-80">{item.description}</div>
                  </div>
                )}
              </div>
            </Button>
          );
        })}
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-200/50">
        <Link href="/dashboards/instructor/profile">
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 transition-colors cursor-pointer">
            <InstructorAvatar
              src={user?.profileImage || user?.profile?.avatar}
              name={user?.name}
              size="md"
              showBorder
            />
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {user?.name || "Instructor"}
                </div>
                <div className="text-sm text-gray-600 truncate">
                  {user?.email || "instructor@example.com"}
                </div>
              </div>
            )}
            {sidebarOpen && <Settings className="w-4 h-4 text-gray-400" />}
          </div>
        </Link>
      </div>
    </div>
  );
}
