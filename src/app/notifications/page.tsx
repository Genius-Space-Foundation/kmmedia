import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import { NotificationList } from "@/components/ui/notification-list";

export const metadata: Metadata = {
  title: "Notifications | KM Media Training Institute",
  description: "View and manage your notifications",
};

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-600 mt-1">
          Stay updated with your assignments, courses, and important
          announcements.
        </p>
      </div>

      <NotificationList userId={session.user.id} />
    </div>
  );
}
