"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AuditLogViewer from "@/components/admin/audit/AuditLogViewer";

const DashboardHeader = ({ heading, text }: { heading: string; text: string }) => (
  <div className="mb-8">
    <h1 className="text-3xl font-black text-gray-900">{heading}</h1>
    <p className="text-sm text-gray-600 font-medium mt-1">{text}</p>
  </div>
);

export default function AuditLogsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!session || session.user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="space-y-6 p-6">
      <DashboardHeader 
        heading="Audit Logs" 
        text="View and filter system activity logs." 
      />
      
      <AuditLogViewer />
    </div>
  );
}
