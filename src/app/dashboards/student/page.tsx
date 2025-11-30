import ProtectedRoute from "@/components/auth/ProtectedRoute";
import StudentDashboard from "./studentDashboard";

export default function StudentDashboardPage() {
  return (
    <ProtectedRoute requiredRole="STUDENT">
      <StudentDashboard />
    </ProtectedRoute>
  );
}
