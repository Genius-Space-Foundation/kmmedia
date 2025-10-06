"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User, Settings, LogOut, Edit3, Shield } from "lucide-react";
import UserProfile from "./user-profile";
import ProfileEditModal from "./admin/profile/ProfileEditModal";

interface UserDropdownProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    phone?: string;
    bio?: string;
    address?: string;
    dateOfBirth?: string;
  };
  onUpdateProfile: (data: any) => void;
  onUpdatePassword: (data: any) => void;
  onLogout: () => void;
}

export default function UserDropdown({
  user,
  onUpdateProfile,
  onUpdatePassword,
  onLogout,
}: UserDropdownProps) {
  const router = useRouter();
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  // Provide default values if user is undefined
  const safeUser = user || {
    id: "",
    name: "User",
    email: "user@example.com",
    role: "USER",
    avatar: "",
    phone: "",
    bio: "",
    address: "",
    dateOfBirth: "",
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800";
      case "INSTRUCTOR":
        return "bg-blue-100 text-blue-800";
      case "STUDENT":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleDashboardRedirect = () => {
    const role = safeUser.role.toLowerCase();
    router.push(`/dashboards/${role}`);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-10 w-10 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={safeUser.avatar} alt={safeUser.name} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {getInitials(safeUser.name)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {safeUser.name}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {safeUser.email}
              </p>
              <Badge className={getRoleColor(safeUser.role)}>
                {safeUser.role}
              </Badge>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowProfileDialog(true)}>
            <User className="mr-2 h-4 w-4" />
            <span>View Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowEditProfile(true)}>
            <Edit3 className="mr-2 h-4 w-4" />
            <span>Edit Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDashboardRedirect}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onLogout} className="text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Profile Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Profile Settings</DialogTitle>
          </DialogHeader>
          <UserProfile
            user={safeUser}
            onUpdateProfile={onUpdateProfile}
            onUpdatePassword={onUpdatePassword}
            onLogout={onLogout}
          />
        </DialogContent>
      </Dialog>

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        user={safeUser}
        onUpdate={(updatedUser) => {
          onUpdateProfile(updatedUser);
          setShowEditProfile(false);
        }}
      />
    </>
  );
}
