"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  GraduationCap,
  Trophy,
  Bell,
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  Home,
  User,
  Settings,
  CreditCard,
} from "lucide-react";

interface StudentSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

const navigationItems = [
  {
    id: "overview",
    label: "Overview",
    icon: Home,
    badge: null,
  },
  {
    id: "profile",
    label: "Profile",
    icon: User,
    badge: null,
  },
  {
    id: "courses",
    label: "My Courses",
    icon: BookOpen,
    badge: null,
  },
  {
    id: "learning",
    label: "Learning Progress",
    icon: GraduationCap,
    badge: null,
  },
  // {
  //   id: "recommendations",
  //   label: "Recommended",
  //   icon: Target,
  //   badge: "New",
  // },
  {
    id: "achievements",
    label: "Achievements",
    icon: Trophy,
    badge: null,
  },
  {
    id: "assessments",
    label: "Assessments",
    icon: FileText,
    badge: null,
  },
  {
    id: "payments",
    label: "Payments",
    icon: CreditCard,
    badge: null,
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    badge: "3",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    badge: null,
  },
];

export default function StudentSidebar({
  isCollapsed,
  onToggle,
  activeTab,
  onTabChange,
  className = "",
}: StudentSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Handle search functionality
      console.log("Search:", searchQuery);
    }
  };

  return (
    <div
      className={`bg-white/95 backdrop-blur-xl border-r border-gray-200/50 transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      } ${className}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200/50">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">🎓</span>
              </div>
              <span className="font-semibold text-gray-900">
                Student Portal
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-8 w-8 p-0"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-200/50">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </form>
        </div>
      )}

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navigationItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start h-10 ${
                isActive
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              } ${isCollapsed ? "px-2" : "px-3"}`}
              onClick={() => onTabChange(item.id)}
            >
              <Icon className={`h-4 w-4 ${isCollapsed ? "" : "mr-3"}`} />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <Badge
                      variant={item.badge === "New" ? "default" : "secondary"}
                      className={`ml-2 ${
                        item.badge === "New"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </Button>
          );
        })}
      </nav>
    </div>
  );
}
