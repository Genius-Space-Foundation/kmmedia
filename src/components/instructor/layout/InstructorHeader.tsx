"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import InstructorAvatar from "@/components/instructor/profile/InstructorAvatar";
import {
  Search,
  Bell,
  Settings,
  LogOut,
  Menu,
  Download,
  Plus,
  Filter,
  RefreshCw,
  User,
} from "lucide-react";

interface Notification {
  id: string;
  title: string;
  read: boolean;
}

interface DashboardStats {
  totalCourses: number;
  activeStudents: number;
  pendingAssessments: number;
  unreadMessages: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  profile?: {
    avatar?: string;
  };
}

interface InstructorHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  notifications: Notification[];
  stats: DashboardStats | null;
  onLogout: () => void;
  onSidebarToggle: () => void;
  activeTab: string;
  isMobile?: boolean;
  user?: User | null;
}

export default function InstructorHeader({
  searchQuery,
  onSearchChange,
  notifications,
  stats,
  onLogout,
  onSidebarToggle,
  activeTab,
  isMobile = false,
  user,
}: InstructorHeaderProps) {
  const unreadNotifications = notifications.filter((n) => !n.read).length;

  if (isMobile) {
    return (
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onSidebarToggle}
              className="lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Mobile Title */}
            <div className="flex-1 text-center">
              <h1 className="text-lg font-bold text-gray-900 capitalize">
                {activeTab.replace("-", " ")}
              </h1>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {unreadNotifications}
                  </Badge>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="text-red-600 hover:text-red-700"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="mt-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 bg-white/80 border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Mobile Quick Stats */}
          {stats && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  {stats.totalCourses}
                </div>
                <div className="text-xs text-blue-600">Courses</div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  {stats.activeStudents}
                </div>
                <div className="text-xs text-green-600">Students</div>
              </div>
              <div className="text-center p-2 bg-orange-50 rounded-lg">
                <div className="text-lg font-bold text-orange-600">
                  {stats.pendingAssessments}
                </div>
                <div className="text-xs text-orange-600">Pending</div>
              </div>
            </div>
          )}
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search courses, students, assessments..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 bg-white/80 border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="relative bg-white/50 hover:bg-white/80 border-gray-200/50 shadow-sm px-4 py-2"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {unreadNotifications}
                </Badge>
              )}
            </Button>

            {/* Quick Stats */}
            <div className="flex items-center space-x-4 bg-white/50 rounded-xl px-6 py-3 shadow-sm border border-gray-200/50">
              {stats && (
                <>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {stats.totalCourses}
                    </div>
                    <div className="text-xs text-gray-600">Courses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {stats.activeStudents}
                    </div>
                    <div className="text-xs text-gray-600">Students</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {stats.pendingAssessments}
                    </div>
                    <div className="text-xs text-gray-600">Pending</div>
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="rounded-xl">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm" className="rounded-xl">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                New
              </Button>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-2">
              <Link href="/dashboards/instructor/profile">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <InstructorAvatar
                    src={user?.profileImage || user?.profile?.avatar}
                    name={user?.name}
                    size="sm"
                  />
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 px-4 py-2"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
