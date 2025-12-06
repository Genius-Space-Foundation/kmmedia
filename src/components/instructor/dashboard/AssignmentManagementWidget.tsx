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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  FileText,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Calendar,
  BarChart3,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";


interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  isPublished: boolean;
  submissionCount: number;
  gradedCount: number;
  totalPoints: number;
  course: {
    id: string;
    title: string;
  };
  createdAt: string;
}

interface AssignmentStats {
  totalAssignments: number;
  publishedAssignments: number;
  pendingGrading: number;
  overdueSubmissions: number;
  averageScore: number;
  completionRate: number;
}

export default function AssignmentManagementWidget() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [stats, setStats] = useState<AssignmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    fetchAssignments();
    fetchStats();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await fetch("/api/assignments", { credentials: "include" });
      const result = await response.json();

      if (result.success) {
        setAssignments(result.data.assignments || []);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
      setAssignments([]);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/assignments/stats", { credentials: "include" });
      const result = await response.json();

      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error("Error fetching assignment stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (assignment: Assignment) => {
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const isOverdue = now > dueDate;
    const pendingGrading = assignment.submissionCount > assignment.gradedCount;

    if (!assignment.isPublished) {
      return <Badge variant="secondary">Draft</Badge>;
    }
    if (isOverdue && pendingGrading) {
      return <Badge variant="destructive">Overdue Grading</Badge>;
    }
    if (pendingGrading) {
      return <Badge variant="outline">Pending Grading</Badge>;
    }
    if (
      assignment.gradedCount === assignment.submissionCount &&
      assignment.submissionCount > 0
    ) {
      return <Badge variant="default">Completed</Badge>;
    }
    return <Badge variant="outline">Active</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getProgressPercentage = (assignment: Assignment) => {
    if (assignment.submissionCount === 0) return 0;
    return Math.round(
      (assignment.gradedCount / assignment.submissionCount) * 100
    );
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
            <CardTitle className="text-lg font-bold text-neutral-900">
              {/* <FileText className="w-5 h-5 text-blue-600" /> */}
              Assignment Management
            </CardTitle>
            <CardDescription>
              Manage assignments and track grading progress
            </CardDescription>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            {/* <DialogTrigger asChild>
              <Button size="sm" className="bg-brand-primary hover:bg-brand-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                New Assignment
              </Button>
            </DialogTrigger> */}
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Quick Assignment Creation</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Use the full assignment creator for detailed setup.
                </p>
                <div className="flex gap-2">
                  <Link href="/assignments/create" className="flex-1">
                    <Button
                      className="w-full"
                      onClick={() => setShowCreateDialog(false)}
                    >
                      Open Assignment Creator
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateDialog(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Total</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">
                {stats.totalAssignments}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">
                  Published
                </span>
              </div>
              <p className="text-2xl font-bold text-green-900">
                {stats.publishedAssignments}
              </p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">
                  Pending
                </span>
              </div>
              <p className="text-2xl font-bold text-orange-900">
                {stats.pendingGrading}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">
                  Avg Score
                </span>
              </div>
              <p className="text-2xl font-bold text-purple-900">
                {stats.averageScore}%
              </p>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {assignments.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No assignments yet</p>
            <p className="text-sm text-gray-400 mb-4">
              Create your first assignment to get started
            </p>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-brand-primary hover:bg-brand-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Assignment
            </Button>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {assignments.slice(0, 5).map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900 truncate">
                      {assignment.title}
                    </h4>
                    {getStatusBadge(assignment)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Due {formatDate(assignment.dueDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {assignment.submissionCount} submissions
                    </span>
                    {assignment.submissionCount > 0 && (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        {getProgressPercentage(assignment)}% graded
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {assignment.course.title}
                  </p>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <Link href={`/assignments/${assignment.id}`}>
                    <Button size="sm" variant="ghost">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href={`/assignments/${assignment.id}/edit`}>
                    <Button size="sm" variant="ghost">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {assignments.length > 5 && (
          <div className="pt-4 border-t">
            <Link href="/assignments">
              <Button variant="outline" className="w-full">
                View All Assignments ({assignments.length})
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
