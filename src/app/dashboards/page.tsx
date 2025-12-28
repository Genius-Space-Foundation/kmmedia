import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";

export default async function DashboardsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/auth/login");
  }

  const role = session.user.role?.toLowerCase() || "student";
  
  redirect(`/dashboards/${role}`);
}
