"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  Users,
  FileText,
  MessageSquare,
  Calendar,
  TrendingUp,
  Filter,
  SortAsc,
  Eye,
  MoreHorizontal,
  Star,
  Flag,
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  type:
    | "grading"
    | "content_creation"
    | "student_support"
    | "course_management"
    | "communication";
  priority: "urgent" | "high" | "medium" | "low";
  status: "pending" | "in_progress" | "completed" | "overdue";
  dueDate: string;
  estimatedTime: number; // in minutes
  course?: {
    id: string;
    title: string;
  };
  student?: {
    id: string;
    name: string;
  };
  relatedItems: number;
  completedItems: number;
  createdAt: string;
  urgencyScore: number;
}

interface TaskPrioritizationSystemProps {
  onTaskClick: (taskId: string) => void;
  onMarkComplete: (taskId: string) => void;
  onUpdatePriority: (taskId: string, priority: string) => void;
}

export default function TaskPrioritizationSystem({
  onTaskClick,
  onMarkComplete,
  onUpdatePriority,
}: TaskPrioritizationSystemProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [sortBy, setSortBy] = useState<
    "urgency" | "dueDate" | "priority" | "type"
  >("urgency");

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [tasks, filterType, filterPriority, sortBy]);

  const fetchTasks = async () => {
    try {
      // Mock data - in real implementation, this would be an API call
      const mockTasks: Task[] = [
        {
          id: "1",
          title: "Grade Photography Assignment 1",
          description: "Review and grade 25 photography portfolio submissions",
          type: "grading",
          priority: "urgent",
          status: "pending",
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          estimatedTime: 120,
          course: { id: "1", title: "Digital Photography Basics" },
          relatedItems: 25,
          completedItems: 0,
          createdAt: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
          urgencyScore: 95,
        },
        {
          id: "2",
          title: "Respond to Student Inquiries",
          description:
            "Answer 8 pending student questions about video editing techniques",
          type: "student_support",
          priority: "high",
          status: "pending",
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          estimatedTime: 45,
          course: { id: "2", title: "Video Production Mastery" },
          relatedItems: 8,
          completedItems: 3,
          createdAt: new Date(
            Date.now() - 1 * 24 * 60 * 60 * 1000
          ).toISOString(),
          urgencyScore: 85,
        },
        {
          id: "3",
          title: "Create Week 4 Content",
          description:
            "Develop lesson materials for advanced lighting techniques",
          type: "content_creation",
          priority: "medium",
          status: "in_progress",
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          estimatedTime: 180,
          course: { id: "1", title: "Digital Photography Basics" },
          relatedItems: 4,
          completedItems: 2,
          createdAt: new Date(
            Date.now() - 3 * 24 * 60 * 60 * 1000
          ).toISOString(),
          urgencyScore: 65,
        },
        {
          id: "4",
          title: "Send Course Announcement",
          description:
            "Notify students about upcoming live session schedule changes",
          type: "communication",
          priority: "high",
          status: "pending",
          dueDate: new Date(
            Date.now() + 0.5 * 24 * 60 * 60 * 1000
          ).toISOString(),
          estimatedTime: 15,
          course: { id: "3", title: "Advanced Color Grading" },
          relatedItems: 1,
          completedItems: 0,
          createdAt: new Date(
            Date.now() - 0.5 * 24 * 60 * 60 * 1000
          ).toISOString(),
          urgencyScore: 90,
        },
        {
          id: "5",
          title: "Update Course Curriculum",
          description:
            "Review and update course outline based on industry trends",
          type: "course_management",
          priority: "low",
          status: "pending",
          dueDate: new Date(
            Date.now() + 14 * 24 * 60 * 60 * 1000
          ).toISOString(),
          estimatedTime: 240,
          course: { id: "2", title: "Video Production Mastery" },
          relatedItems: 12,
          completedItems: 1,
          createdAt: new Date(
            Date.now() - 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          urgencyScore: 35,
        },
      ];

      setTasks(mockTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...tasks];

    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter((task) => task.type === filterType);
    }

    // Apply priority filter
    if (filterPriority !== "all") {
      filtered = filtered.filter((task) => task.priority === filterPriority);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "urgency":
          return b.urgencyScore - a.urgencyScore;
        case "dueDate":
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case "priority":
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case "type":
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

    setFilteredTasks(filtered);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-neutral-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-neutral-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "grading":
        return <FileText className="h-4 w-4" />;
      case "content_creation":
        return <Star className="h-4 w-4" />;
      case "student_support":
        return <Users className="h-4 w-4" />;
      case "course_management":
        return <Calendar className="h-4 w-4" />;
      case "communication":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTimeUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));

    if (diffHours < 0) return "Overdue";
    if (diffHours < 24) return `${diffHours}h left`;
    const diffDays = Math.ceil(diffHours / 24);
    return `${diffDays}d left`;
  };

  const formatEstimatedTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  const urgentTasks = tasks.filter(
    (t) => t.priority === "urgent" && t.status !== "completed"
  ).length;
  const overdueTasks = tasks.filter(
    (t) => new Date(t.dueDate) < new Date() && t.status !== "completed"
  ).length;
  const totalPendingTasks = tasks.filter((t) => t.status === "pending").length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-neutral-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-900">{urgentTasks}</p>
                <p className="text-sm text-red-700">Urgent Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-neutral-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-900">
                  {overdueTasks}
                </p>
                <p className="text-sm text-orange-700">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-neutral-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-900">
                  {totalPendingTasks}
                </p>
                <p className="text-sm text-blue-700">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-neutral-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-900">
                  {Math.round(
                    (tasks.filter((t) => t.status === "completed").length /
                      tasks.length) *
                      100
                  )}
                  %
                </p>
                <p className="text-sm text-green-700">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card className="bg-white border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span>Task Prioritization</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <SortAsc className="h-4 w-4 mr-2" />
                Sort
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Type:</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-1 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="grading">Grading</option>
                <option value="content_creation">Content Creation</option>
                <option value="student_support">Student Support</option>
                <option value="course_management">Course Management</option>
                <option value="communication">Communication</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">
                Priority:
              </label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-1 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">
                Sort by:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="urgency">Urgency Score</option>
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
                <option value="type">Type</option>
              </select>
            </div>
          </div>

          {/* Task List */}
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <Card
                key={task.id}
                className="border border-gray-200 hover:shadow-md transition-all duration-300"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          {getTypeIcon(task.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {task.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {task.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatEstimatedTime(task.estimatedTime)}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{getTimeUntilDue(task.dueDate)}</span>
                        </span>
                        {task.course && (
                          <span className="text-blue-600">
                            {task.course.title}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-3 mb-3">
                        <Badge className={getPriorityColor(task.priority)}>
                          <Flag className="h-3 w-3 mr-1" />
                          {task.priority}
                        </Badge>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status.replace("_", " ")}
                        </Badge>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span>Urgency Score:</span>
                          <div className="w-16">
                            <Progress
                              value={task.urgencyScore}
                              className="h-2"
                            />
                          </div>
                          <span className="font-medium">
                            {task.urgencyScore}
                          </span>
                        </div>
                      </div>

                      {task.relatedItems > 0 && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span>Progress:</span>
                          <div className="w-24">
                            <Progress
                              value={
                                (task.completedItems / task.relatedItems) * 100
                              }
                              className="h-2"
                            />
                          </div>
                          <span>
                            {task.completedItems}/{task.relatedItems} items
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      <Button
                        onClick={() => onTaskClick(task.id)}
                        size="sm"
                        className="bg-brand-primary hover:bg-brand-primary/90"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>

                      {task.status !== "completed" && (
                        <Button
                          onClick={() => onMarkComplete(task.id)}
                          variant="outline"
                          size="sm"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Complete
                        </Button>
                      )}

                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTasks.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No tasks found
              </h3>
              <p className="text-gray-600">
                {filterType !== "all" || filterPriority !== "all"
                  ? "Try adjusting your filters to see more tasks."
                  : "All caught up! No pending tasks at the moment."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
