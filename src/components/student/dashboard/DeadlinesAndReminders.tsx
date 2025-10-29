"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Bell,
  Filter,
  Plus,
} from "lucide-react";

interface Deadline {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  course: {
    id: string;
    title: string;
    color: string;
  };
  type: "assignment" | "quiz" | "project" | "exam" | "discussion";
  priority: "low" | "medium" | "high";
  status: "pending" | "submitted" | "overdue" | "completed";
  estimatedTime: number; // in minutes
  reminderSet: boolean;
}

interface DeadlinesAndRemindersProps {
  deadlines: Deadline[];
  onSetReminder: (deadlineId: string) => void;
  onViewDeadline: (deadlineId: string) => void;
  onAddReminder: () => void;
}

export default function DeadlinesAndReminders({
  deadlines,
  onSetReminder,
  onViewDeadline,
  onAddReminder,
}: DeadlinesAndRemindersProps) {
  const [filter, setFilter] = useState<
    "all" | "pending" | "overdue" | "completed"
  >("all");
  const [sortBy, setSortBy] = useState<"dueDate" | "priority" | "course">(
    "dueDate"
  );

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyColor = (daysUntil: number, status: string) => {
    if (status === "completed")
      return "bg-green-100 text-green-800 border-green-200";
    if (status === "overdue") return "bg-red-100 text-red-800 border-red-200";
    if (daysUntil <= 1) return "bg-red-100 text-red-800 border-red-200";
    if (daysUntil <= 3)
      return "bg-orange-100 text-orange-800 border-orange-200";
    if (daysUntil <= 7)
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-blue-100 text-blue-800 border-blue-200";
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "medium":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "low":
        return <Clock className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "assignment":
        return "📝";
      case "quiz":
        return "❓";
      case "project":
        return "🚀";
      case "exam":
        return "📊";
      case "discussion":
        return "💬";
      default:
        return "📋";
    }
  };

  const formatTimeEstimate = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  const filteredAndSortedDeadlines = deadlines
    .filter((deadline) => {
      if (filter === "all") return true;
      return deadline.status === filter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "dueDate":
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case "course":
          return a.course.title.localeCompare(b.course.title);
        default:
          return 0;
      }
    });

  const upcomingCount = deadlines.filter(
    (d) => d.status === "pending" && getDaysUntilDue(d.dueDate) <= 7
  ).length;
  const overdueCount = deadlines.filter((d) => d.status === "overdue").length;

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <Card className="bg-gradient-to-r from-orange-50 via-red-50 to-pink-50 border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Deadlines & Reminders</CardTitle>
                <p className="text-sm text-gray-600">
                  Stay on top of your assignments
                </p>
              </div>
            </div>
            <Button
              onClick={onAddReminder}
              size="sm"
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Reminder
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {deadlines.length}
                </p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {upcomingCount}
                </p>
                <p className="text-sm text-gray-600">This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {overdueCount}
                </p>
                <p className="text-sm text-gray-600">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {deadlines.filter((d) => d.status === "completed").length}
                </p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Sort */}
      <Card className="bg-white border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter:</span>
              <div className="flex space-x-1">
                {["all", "pending", "overdue", "completed"].map(
                  (filterOption) => (
                    <Button
                      key={filterOption}
                      variant={filter === filterOption ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilter(filterOption as any)}
                      className="capitalize"
                    >
                      {filterOption}
                    </Button>
                  )
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">
                Sort by:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
                <option value="course">Course</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deadlines List */}
      {filteredAndSortedDeadlines.length > 0 ? (
        <div className="space-y-4">
          {filteredAndSortedDeadlines.map((deadline) => {
            const daysUntil = getDaysUntilDue(deadline.dueDate);
            const urgencyColor = getUrgencyColor(daysUntil, deadline.status);

            return (
              <Card
                key={deadline.id}
                className={`border-l-4 ${urgencyColor} bg-white shadow-lg hover:shadow-xl transition-all duration-300`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl">
                          {getTypeIcon(deadline.type)}
                        </span>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {deadline.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {deadline.course.title}
                          </p>
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 mb-3">
                        {deadline.description}
                      </p>

                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(deadline.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>
                            {formatTimeEstimate(deadline.estimatedTime)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {getPriorityIcon(deadline.priority)}
                          <span className="capitalize">
                            {deadline.priority} priority
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Badge className={urgencyColor}>
                          {deadline.status === "overdue"
                            ? `${Math.abs(daysUntil)} days overdue`
                            : deadline.status === "completed"
                            ? "Completed"
                            : daysUntil === 0
                            ? "Due today"
                            : daysUntil === 1
                            ? "Due tomorrow"
                            : `${daysUntil} days left`}
                        </Badge>

                        {deadline.reminderSet && (
                          <Badge className="bg-blue-100 text-blue-800">
                            <Bell className="h-3 w-3 mr-1" />
                            Reminder set
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      <Button
                        onClick={() => onViewDeadline(deadline.id)}
                        size="sm"
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      >
                        View Details
                      </Button>

                      {!deadline.reminderSet &&
                        deadline.status === "pending" && (
                          <Button
                            onClick={() => onSetReminder(deadline.id)}
                            variant="outline"
                            size="sm"
                          >
                            <Bell className="h-4 w-4 mr-2" />
                            Set Reminder
                          </Button>
                        )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="bg-white border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {filter === "all" ? "No Deadlines" : `No ${filter} deadlines`}
            </h3>
            <p className="text-gray-600 mb-4">
              {filter === "all"
                ? "You're all caught up! No upcoming deadlines."
                : `No deadlines match the ${filter} filter.`}
            </p>
            {filter !== "all" && (
              <Button variant="outline" onClick={() => setFilter("all")}>
                View All Deadlines
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
