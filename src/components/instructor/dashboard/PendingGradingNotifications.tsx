"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Clock,
  AlertTriangle,
  CheckCircle,
  FileText,
  Users,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { makeAuthenticatedRequest } from "@/lib/token-utils";

interface PendingSubmission {
  id: string;
  assignment: {
    id: string;
    title: string;
    dueDate: string;
    course: {
      id: string;
      title: string;
    };
  };
  student: {
    id: string;
    name: string;
    email: string;
  };
  submittedAt: string;
  isLate: boolean;
  daysLate: number;
}

interface GradingNotification {
  id: string;
  type: "overdue" | "pending" | "urgent";
  title: string;
  message: string;
  count: number;
  assignmentId?: string;
  priority: "high" | "medium" | "low";
  createdAt: string;
}

export default function PendingGradingNotifications() {
  const [pendingSubmissions, setPendingSubmissions] = useState<
    PendingSubmission[]
  >([]);
  const [notifications, setNotifications] = useState<GradingNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingGrading();
  }, []);

  const fetchPendingGrading = async () => {
    try {
      const response = await makeAuthenticatedRequest(
        "/api/assignments/pending-grading"
      );
      const result = await response.json();

      if (result.success) {
        setPendingSubmissions(result.data.submissions || []);
        generateNotifications(result.data.submissions || []);
      }
    } catch (error) {
      console.error("Error fetching pending grading:", error);
      setPendingSubmissions([]);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const generateNotifications = (submissions: PendingSubmission[]) => {
    const notificationMap = new Map<string, GradingNotification>();

    submissions.forEach((submission) => {
      const daysOverdue = submission.isLate ? submission.daysLate : 0;
      const daysSinceSubmission = Math.floor(
        (Date.now() - new Date(submission.submittedAt).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      let type: "overdue" | "pending" | "urgent" = "pending";
      let priority: "high" | "medium" | "low" = "medium";

      if (daysOverdue > 0) {
        type = "overdue";
        priority = "high";
      } else if (daysSinceSubmission > 3) {
        type = "urgent";
        priority = "high";
      }

      const key = `${submission.assignment.id}-${type}`;

      if (notificationMap.has(key)) {
        const existing = notificationMap.get(key)!;
        existing.count += 1;
      } else {
        notificationMap.set(key, {
          id: key,
          type,
          title: getNotificationTitle(type, submission.assignment.title),
          message: getNotificationMessage(type, submission.assignment.title),
          count: 1,
          assignmentId: submission.assignment.id,
          priority,
          createdAt: submission.submittedAt,
        });
      }
    });

    const sortedNotifications = Array.from(notificationMap.values()).sort(
      (a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
    );

    setNotifications(sortedNotifications);
  };

  const getNotificationTitle = (type: string, assignmentTitle: string) => {
    switch (type) {
      case "overdue":
        return "Overdue Grading Required";
      case "urgent":
        return "Urgent: Grading Needed";
      case "pending":
        return "Pending Grading";
      default:
        return "Grading Required";
    }
  };

  const getNotificationMessage = (type: string, assignmentTitle: string) => {
    switch (type) {
      case "overdue":
        return `Late submissions for "${assignmentTitle}" need immediate attention`;
      case "urgent":
        return `Submissions for "${assignmentTitle}" have been waiting for grading`;
      case "pending":
        return `New submissions for "${assignmentTitle}" are ready for grading`;
      default:
        return `Submissions need grading`;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "overdue":
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case "urgent":
        return <Clock className="w-4 h-4 text-orange-600" />;
      case "pending":
        return <Bell className="w-4 h-4 text-blue-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getNotificationBadgeVariant = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "outline";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (loading) {
    return (
      <Card className="h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-600" />
              Grading Notifications
              {notifications.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {notifications.reduce((sum, n) => sum + n.count, 0)}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Pending submissions requiring your attention
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">All caught up!</p>
            <p className="text-sm text-gray-400">
              No pending grading at the moment
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border-l-4 ${
                  notification.priority === "high"
                    ? "border-l-red-500 bg-red-50"
                    : notification.priority === "medium"
                    ? "border-l-orange-500 bg-orange-50"
                    : "border-l-blue-500 bg-blue-50"
                } hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">
                          {notification.title}
                        </h4>
                        <Badge
                          variant={getNotificationBadgeVariant(
                            notification.priority
                          )}
                        >
                          {notification.count}{" "}
                          {notification.count === 1
                            ? "submission"
                            : "submissions"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {notification.assignmentId && (
                      <Link
                        href={`/assignments/${notification.assignmentId}/grading`}
                      >
                        <Button size="sm" variant="outline">
                          Grade Now
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {pendingSubmissions.length > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Recent Submissions</span>
              <Link href="/assignments/grading">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="space-y-2">
              {pendingSubmissions.slice(0, 3).map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {submission.student.name}
                    </p>
                    <p className="text-gray-600 truncate">
                      {submission.assignment.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {submission.isLate && (
                      <Badge variant="destructive" className="text-xs">
                        {submission.daysLate}d late
                      </Badge>
                    )}
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(submission.submittedAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
