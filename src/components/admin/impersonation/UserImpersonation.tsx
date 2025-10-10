"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { UserCog, AlertTriangle, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "INSTRUCTOR" | "STUDENT";
  avatar?: string;
}

interface UserImpersonationProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export default function UserImpersonation({
  isOpen,
  onClose,
  user,
}: UserImpersonationProps) {
  const [impersonating, setImpersonating] = useState(false);
  const router = useRouter();

  const handleImpersonate = async () => {
    setImpersonating(true);
    try {
      // TODO: Implement impersonation API
      // This would create a special token that:
      // 1. Logs the admin action
      // 2. Creates a session as the target user
      // 3. Stores the original admin ID for later restoration

      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Store impersonation state
      localStorage.setItem("impersonating", "true");
      localStorage.setItem("originalAdminId", "current-admin-id");
      localStorage.setItem("impersonatedUserId", user.id);

      toast.success(`Now viewing as ${user.name}`);

      // Redirect to appropriate dashboard
      const dashboardRoutes: Record<string, string> = {
        STUDENT: "/dashboards/student",
        INSTRUCTOR: "/dashboards/instructor",
        ADMIN: "/dashboards/admin",
      };

      router.push(dashboardRoutes[user.role] || "/dashboards/student");
      onClose();
    } catch (error) {
      toast.error("Failed to impersonate user");
      setImpersonating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Impersonate User
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning */}
          <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-900">
                Administrative Action
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                You are about to view the system as another user. All actions
                will be logged and attributed to the impersonated user.
              </p>
            </div>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{user.name}</h3>
              <p className="text-sm text-gray-600">{user.email}</p>
              <Badge
                className={
                  user.role === "ADMIN"
                    ? "bg-red-100 text-red-800"
                    : user.role === "INSTRUCTOR"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-green-100 text-green-800"
                }
              >
                {user.role}
              </Badge>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-blue-900 mb-2">
              Important Notes:
            </p>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>
                All actions will be logged as administrative impersonation
              </li>
              <li>You can exit impersonation mode anytime</li>
              <li>This session will be recorded in activity logs</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={impersonating}>
            Cancel
          </Button>
          <Button onClick={handleImpersonate} disabled={impersonating}>
            {impersonating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Starting...
              </>
            ) : (
              <>
                <UserCog className="h-4 w-4 mr-2" />
                Start Impersonation
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
