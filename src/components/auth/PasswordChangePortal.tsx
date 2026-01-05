"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Lock, CheckCircle, AlertCircle } from "lucide-react";

export default function PasswordChangePortal() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match");
      setIsLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          isFirstTime: true,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Password updated successfully");
        
        // Update session to remove the flag
        await update({ requiresPasswordChange: false });
        
        // Refresh to reload dashboard content
        router.refresh();
      } else {
        toast.error(data.message || "Failed to update password");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      
      <Card className="w-full max-w-md relative z-10 bg-slate-900/50 border-slate-800 backdrop-blur-xl">
        <CardHeader className="space-y-4 text-center pb-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-2">
            <Shield className="w-8 h-8 text-blue-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            Security Update Required
          </CardTitle>
          <CardDescription className="text-slate-400">
            Welcome to your instructor dashboard. To ensure the security of your account, you must update your temporary password before proceeding.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current (Temporary) Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="Enter temporary password"
                  className="pl-9 bg-slate-950/50 border-slate-800 focus:ring-blue-500"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  className="pl-9 bg-slate-950/50 border-slate-800 focus:ring-blue-500"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  className="pl-9 bg-slate-950/50 border-slate-800 focus:ring-blue-500"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex items-start space-x-2 text-xs text-blue-400">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>
                Your new password will be encrypted and secure. We recommend using a mix of letters, numbers, and symbols.
              </span>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Updating Security..." : "Secure Account & Continue"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
