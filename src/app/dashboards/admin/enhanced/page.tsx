import AdminLayout from "@/components/admin/layout/AdminLayout";
import EnhancedDashboard from "@/components/admin/dashboard/EnhancedDashboard";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export default function EnhancedAdminDashboardPage() {
  return (
    <AdminLayout>
      <EnhancedDashboard />
    </AdminLayout>
  );
}
