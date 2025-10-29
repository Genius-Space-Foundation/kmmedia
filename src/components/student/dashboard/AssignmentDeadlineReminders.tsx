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
  Calendar,
  CheckCircle,
  ArrowRight,
  Settings,
  Plus,
} from "lucide-react";
import { makeAuthenticatedRequest } from "@/lib/token-utils";

interface DeadlineReminder {
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
  reminderType: "24h" | "48h" | "1week" | "custom";
  reminderTime: string;
  isActive: boolean;
  hasNotified: boolean;
  priority: "high" | "medium" | "low";
}

interface UpcomingDeadline {
  id: string;
  title: string;
  dueDate: string;
  course: {
    id: string;
    title: string;
    color?: string;
  };
  hoursUntilDue: number;
  priority: "urgent" | "soon" | "upcoming";
  hasReminder: boolean;
  submissionStatus?: "not_started" | "in_progress" | "submitted" | "graded";
}

export default function AssignmentDeadlineReminders() {
  const [reminders, setReminders] = useState<DeadlineReminder[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<
    UpcomingDeadline[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeadlineReminders();
    fetchUpcomingDeadlines();
  }, []);

  const fetchDeadlineReminders = async () => {
    try {
      const response = await makeAuthenticatedRequest("/api/student/reminders");
      const result = await response.json();

      if (result.success) {
        setReminders(result.data.reminders || []);
      }
    } catch (error) {
      console.error("Error fetching deadline reminders:", error);
      setReminders([]);
    }
  };

  const fetchUpcomingDeadlines = async () => {
    try {
      const response = await makeAuthenticatedRequest("/api/student/deadlines");
      const result = await response.json();

      if (result.success) {
        setUpcomingDeadlines(result.data.deadlines || []);
      }
    } catch (error) {
      console.error("Error fetching upcoming deadlines:", error);
      setUpcomingDeadlines([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSetReminder = async (
    assignmentId: string,
    reminderType: string
  ) => {
    try {
      const response = await makeAuthenticatedRequest(
        "/api/student/reminders",
        {
          method: "POST",
          body: JSON.stringify({
            assignmentId,
            reminderType,
          }),
        }
      );

      const result = await response.json();
      if (result.success) {
        fetchDeadlineReminders();
        fetchUpcomingDeadlines();
      }
    } catch (error) {
      console.error("Error setting reminder:", error);
    }
  };

  const handleToggleReminder = async (
    reminderId: string,
    isActive: boolean
  ) => {
    try {
      const response = await makeAuthenticatedRequest(
        `/api/student/reminders/${reminderId}`,
        {
          method: "PUT",
          body: JSON.stringify({ isActive }),
        }
      );

      const result = await response.json();
      if (result.success) {
        setReminders((prev) =>
          prev.map((reminder) =>
            reminder.id === reminderId ? { ...reminder, isActive } : reminder
          )
        );
      }
    } catch (error) {
      console.error("Error toggling reminder:", error);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case "soon":
        return <Clock className="w-4 h-4 text-orange-600" />;
      case "upcoming":
        return <Calendar className="w-4 h-4 text-blue-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "border-l-red-500 bg-red-50";
      case "soon":
        return "border-l-orange-500 bg-orange-50";
      case "upcoming":
        return "border-l-blue-500 bg-blue-50";
      default:
        return "border-l-gray-500 bg-gray-50";
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "submitted":
        return <Badge variant="default">Submitted</Badge>;
      case "in_progress":
        return <Badge variant="secondary">In Progress</Badge>;
      case "graded":
        return <Badge variant="outline">Graded</Badge>;
      case "not_started":
        return <Badge variant="destructive">Not Started</Badge>;
      default:
        return null;
    }
  };

  const formatTimeUntilDue = (hours: number) => {
    if (hours < 1) return "Due in less than 1 hour";
    if (hours < 24)
      return `Due in ${Math.round(hours)} hour${
        Math.round(hours) !== 1 ? "s" : ""
      }`;

    const days = Math.floor(hours / 24);
    const remainingHours = Math.round(hours % 24);

    if (days === 1 && remainingHours === 0) return "Due tomorrow";
    if (remainingHours === 0)
      return `Due in ${days} day${days !== 1 ? "s" : ""}`;

    return `Due in ${days}d ${remainingHours}h`;
  };

  const getReminderTypeLabel = (type: string) => {
    switch (type) {
      case "24h":
        return "24 hours before";
      case "48h":
        return "48 hours before";
      case "1week":
        return "1 week before";
      case "custom":
        return "Custom time";
      default:
        return type;
    }
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
              Deadline Reminders
              {upcomingDeadlines.filter((d) => d.priority === "urgent").length >
                0 && (
                <Badge variant="destructive" className="ml-2">
                  {
                    upcomingDeadlines.filter((d) => d.priority === "urgent")
                      .length
                  }
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Stay on top of your assignment deadlines
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/assignments/reminders">
              <Button size="sm" variant="outline">
                <Settings className="w-3 h-3 mr-1" />
                Manage
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {upcomingDeadlines.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No upcoming deadlines</p>
            <p className="text-sm text-gray-400">
              You're all caught up with your assignments!
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {upcomingDeadlines.slice(0, 5).map((deadline) => (
              <div
                key={deadline.id}
                className={`p-4 rounded-lg border-l-4 ${getPriorityColor(
                  deadline.priority
                )} hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getPriorityIcon(deadline.priority)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 truncate">
                          {deadline.title}
                        </h4>
                        {getStatusBadge(deadline.submissionStatus)}
                      </div>

                      <p className="text-sm text-gray-600 mb-2">
                        {deadline.course.title}
                      </p>

                      <div className="flex items-center gap-4 text-sm">
                        <span
                          className={`font-medium ${
                            deadline.priority === "urgent"
                              ? "text-red-700"
                              : deadline.priority === "soon"
                              ? "text-orange-700"
                              : "text-blue-700"
                          }`}
                        >
                          {formatTimeUntilDue(deadline.hoursUntilDue)}
                        </span>

                        {deadline.hasReminder ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <Bell className="w-3 h-3" />
                            Reminder set
                          </span>
                        ) : (
                          <button
                            onClick={() =>
                              handleSetReminder(deadline.id, "24h")
                            }
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            Set reminder
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Link href={`/assignments/${deadline.id}`}>
                      <Button size="sm" variant="outline">
                        View
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Active Reminders Summary */}
        {reminders.length > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Active Reminders</span>
              <Link href="/assignments/reminders">
                <Button variant="ghost" size="sm">
                  Manage All
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="space-y-2">
              {reminders
                .filter((r) => r.isActive)
                .slice(0, 3)
                .map((reminder) => (
                  <div
                    key={reminder.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {reminder.assignment.title}
                      </p>
                      <p className="text-gray-600">
                        {getReminderTypeLabel(reminder.reminderType)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleToggleReminder(reminder.id, false)}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Disable
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {upcomingDeadlines.length > 5 && (
          <div className="pt-4 border-t">
            <Link href="/assignments/deadlines">
              <Button variant="outline" className="w-full">
                View All Deadlines ({upcomingDeadlines.length})
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
