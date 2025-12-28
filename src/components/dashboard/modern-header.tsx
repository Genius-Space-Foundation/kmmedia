"use client";

import React from "react";
import { Bell, Search, ChevronDown, LogOut, User as UserIcon, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ModernHeaderProps {
  title: string;
  subtitle: string;
  currentUser: any;
  onProfileClick: () => void;
  onSettingsClick: () => void;
  onLogout: () => void;
  notificationCount?: number;
  additionalActions?: React.ReactNode;
}

export function ModernHeader({
  title,
  subtitle,
  currentUser,
  onProfileClick,
  onSettingsClick,
  onLogout,
  notificationCount = 0,
  additionalActions,
}: ModernHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm">
      <div className="max-w-full mx-auto px-8 py-5">
        <div className="flex items-center justify-between">
          {/* Title Section */}
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-3xl font-black text-gray-900">{title}</h1>
              <p className="text-sm text-gray-600 font-medium mt-1">{subtitle}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative hidden md:block">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search anything..."
                className="pl-12 pr-4 py-3 w-80 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
              />
            </div>

            {additionalActions && (
              <div className="hidden md:flex items-center">
                {additionalActions}
              </div>
            )}

            {/* Notifications */}
            <Button
              variant="outline"
              size="icon"
              className="relative rounded-xl border-2 hover:bg-gray-50 h-12 w-12"
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 h-6 w-6 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-bold shadow-lg">
                  {notificationCount}
                </span>
              )}
            </Button>

            {/* Profile Dropdown */}
            <div className="pl-4 border-l-2 border-gray-200">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-3 hover:bg-gray-50 rounded-2xl px-4 py-3 h-auto"
                  >
                    <Avatar className="h-11 w-11 ring-2 ring-blue-500 ring-offset-2">
                      {currentUser?.avatar && (
                        <AvatarImage
                          src={currentUser.avatar}
                          alt={currentUser.name}
                        />
                      )}
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                        {currentUser?.name
                          ? currentUser.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)
                          : "AD"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-bold text-gray-900">
                        {currentUser?.name || "Admin User"}
                      </p>
                      <p className="text-xs text-gray-500 font-medium">
                        {currentUser?.email || "admin@kmmedia.com"}
                      </p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500 hidden lg:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl shadow-xl">
                  <DropdownMenuLabel className="font-bold">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={onProfileClick}
                    className="rounded-xl cursor-pointer"
                  >
                    <UserIcon className="mr-3 h-4 w-4" />
                    <span className="font-medium">Profile Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={onSettingsClick}
                    className="rounded-xl cursor-pointer"
                  >
                    <Settings className="mr-3 h-4 w-4" />
                    <span className="font-medium">System Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={onLogout}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50 rounded-xl cursor-pointer"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    <span className="font-medium">Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
