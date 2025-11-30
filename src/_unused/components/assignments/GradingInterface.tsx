"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Eye,
  FileText,
  Filter,
  Search,
  Star,
  User,
  Calendar,
  AlertTriangle,
  MoreHorizontal,
  CheckSquare,
  Square,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { EnhancedFilePreview } from "./SimpleFilePreview";

interface SubmissionFile {
  id: string;
  originalName: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  cloudinaryUrl: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
}

interface Assignment {
  id: string;
  title: string;
  totalPoints: number;
  dueDate: string;
  allowLateSubmission: boolean;
  latePenalty?: number;
}

interface Submission {
  id: string;
  submissionText?: string;
  submittedAt: string;
  isLate: boolean;
  daysLate: number;
  status: "DRAFT" | "SUBMITTED" | "GRADED" | "RETURNED" | "RESUBMITTED";
  grade?: number;
  feedback?: string;
  gradedAt?: string;
  gradedBy?: string;
  originalScore?: number;
  finalScore?: number;
  resubmissionCount: number;
  parsedFiles: SubmissionFile[];
  student: Student;
  assignment: Assignment;
}

interface GradingInterfaceProps {
  assignmentId: string;
  onGradeSubmitted?: (
    submissionId: string,
    grade: number,
    feedback: string
  ) => void;
}

export function GradingInterface({
  assignmentId,
  onGradeSubmitted,
}: GradingInterfaceProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const [gradingSubmission, setGradingSubmission] = useState<string | null>(
    null
  );

  // Filters and search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("submittedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Grading form state
  const [gradeForm, setGradeForm] = useState({
    grade: "",
    feedback: "",
  });

  // Bulk grading state
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([]);
  const [bulkGrading, setBulkGrading] = useState(false);
  const [bulkGradeForm, setBulkGradeForm] = useState({
    grade: "",
    feedback: "",
  });

  // Load submissions
  useEffect(() => {
    loadSubmissions();
  }, [assignmentId]);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...submissions];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (submission) =>
          submission.student.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          submission.student.email
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (submission) => submission.status === statusFilter
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Submission];
      let bValue: any = b[sortBy as keyof Submission];

      if (sortBy === "student") {
        aValue = a.student.name;
        bValue = b.student.name;
      }

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredSubmissions(filtered);
  }, [submissions, searchTerm, statusFilter, sortBy, sortOrder]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/assignments/${assignmentId}/submissions`
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        throw new Error(`Failed to load submissions: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const errorText = await response.text();
        console.error("Non-JSON response:", errorText);
        throw new Error("Server returned non-JSON response");
      }

      const data = await response.json();
      setSubmissions(data.submissions || []);
    } catch (error) {
      console.error("Error loading submissions:", error);
      if (error instanceof Error) {
        toast.error(`Failed to load submissions: ${error.message}`);
      } else {
        toast.error("Failed to load submissions");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmission = async (submissionId: string) => {
    if (!gradeForm.grade || isNaN(Number(gradeForm.grade))) {
      toast.error("Please enter a valid grade");
      return;
    }

    const grade = Number(gradeForm.grade);
    const submission = submissions.find((s) => s.id === submissionId);

    if (!submission) {
      toast.error("Submission not found");
      return;
    }

    if (grade < 0 || grade > submission.assignment.totalPoints) {
      toast.error(
        `Grade must be between 0 and ${submission.assignment.totalPoints}`
      );
      return;
    }

    try {
      setGradingSubmission(submissionId);

      const response = await fetch(`/api/submissions/${submissionId}/grade`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grade,
          feedback: gradeForm.feedback,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Grading API Error:", errorText);
        throw new Error(`Failed to grade submission: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const errorText = await response.text();
        console.error("Non-JSON response:", errorText);
        throw new Error("Server returned non-JSON response");
      }

      const updatedSubmission = await response.json();

      // Update submissions list
      setSubmissions((prev) =>
        prev.map((s) => (s.id === submissionId ? updatedSubmission : s))
      );

      // Reset form and close dialog
      setGradeForm({ grade: "", feedback: "" });
      setSelectedSubmission(null);

      toast.success("Submission graded successfully");

      if (onGradeSubmitted) {
        onGradeSubmitted(submissionId, grade, gradeForm.feedback);
      }
    } catch (error) {
      console.error("Error grading submission:", error);
      toast.error("Failed to grade submission");
    } finally {
      setGradingSubmission(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { color: "bg-gray-500", label: "Draft" },
      SUBMITTED: { color: "bg-blue-500", label: "Submitted" },
      GRADED: { color: "bg-green-500", label: "Graded" },
      RETURNED: { color: "bg-yellow-500", label: "Returned" },
      RESUBMITTED: { color: "bg-purple-500", label: "Resubmitted" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.SUBMITTED;

    return (
      <Badge className={`${config.color} text-white`}>{config.label}</Badge>
    );
  };

  const calculateGradingProgress = () => {
    const gradedCount = submissions.filter((s) => s.status === "GRADED").length;
    const totalCount = submissions.filter((s) => s.status !== "DRAFT").length;
    return totalCount > 0 ? (gradedCount / totalCount) * 100 : 0;
  };

  const getGradingStats = () => {
    const total = submissions.length;
    const submitted = submissions.filter((s) => s.status !== "DRAFT").length;
    const graded = submissions.filter((s) => s.status === "GRADED").length;
    const pending = submitted - graded;
    const late = submissions.filter((s) => s.isLate).length;
    const avgGrade =
      graded > 0
        ? submissions
            .filter((s) => s.grade !== null && s.grade !== undefined)
            .reduce((sum, s) => sum + (s.finalScore || s.grade!), 0) / graded
        : 0;

    return { total, submitted, graded, pending, late, avgGrade };
  };

  const handleBulkGrade = async () => {
    if (!bulkGradeForm.grade || isNaN(Number(bulkGradeForm.grade))) {
      toast.error("Please enter a valid grade");
      return;
    }

    if (selectedSubmissions.length === 0) {
      toast.error("Please select submissions to grade");
      return;
    }

    const grade = Number(bulkGradeForm.grade);

    try {
      setBulkGrading(true);

      const response = await fetch("/api/submissions/bulk-grade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          submissionIds: selectedSubmissions,
          grade,
          feedback: bulkGradeForm.feedback,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Bulk grading API Error:", errorText);
        throw new Error(`Failed to bulk grade submissions: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const errorText = await response.text();
        console.error("Non-JSON response:", errorText);
        throw new Error("Server returned non-JSON response");
      }

      const result = await response.json();

      // Reload submissions to get updated data
      await loadSubmissions();

      // Reset form and selections
      setBulkGradeForm({ grade: "", feedback: "" });
      setSelectedSubmissions([]);

      if (result.failed > 0) {
        toast.warning(
          `Graded ${result.successful} submissions successfully. ${result.failed} failed.`
        );
      } else {
        toast.success(`Successfully graded ${result.successful} submissions`);
      }
    } catch (error) {
      console.error("Error bulk grading:", error);
      toast.error("Failed to grade submissions");
    } finally {
      setBulkGrading(false);
    }
  };

  const toggleSubmissionSelection = (submissionId: string) => {
    setSelectedSubmissions((prev) =>
      prev.includes(submissionId)
        ? prev.filter((id) => id !== submissionId)
        : [...prev, submissionId]
    );
  };

  const selectAllSubmissions = () => {
    const ungradedSubmissions = filteredSubmissions
      .filter((s) => s.status !== "GRADED")
      .map((s) => s.id);

    if (selectedSubmissions.length === ungradedSubmissions.length) {
      setSelectedSubmissions([]);
    } else {
      setSelectedSubmissions(ungradedSubmissions);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Progress and Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              <div className="ml-2">
                <p className="text-2xl font-bold">
                  {getGradingStats().submitted}
                </p>
                <p className="text-xs text-muted-foreground">
                  Total Submissions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div className="ml-2">
                <p className="text-2xl font-bold">{getGradingStats().graded}</p>
                <p className="text-xs text-muted-foreground">Graded</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-yellow-500" />
              <div className="ml-2">
                <p className="text-2xl font-bold">
                  {getGradingStats().pending}
                </p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              <div className="ml-2">
                <p className="text-2xl font-bold">
                  {getGradingStats().avgGrade > 0
                    ? getGradingStats().avgGrade.toFixed(1)
                    : "N/A"}
                </p>
                <p className="text-xs text-muted-foreground">Average Grade</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Grading Progress</span>
            <Badge variant="outline">
              {getGradingStats().graded} / {getGradingStats().submitted} Graded
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={calculateGradingProgress()} className="w-full" />
          <p className="text-sm text-gray-600 mt-2">
            {Math.round(calculateGradingProgress())}% of submissions have been
            graded
          </p>
          {getGradingStats().late > 0 && (
            <p className="text-sm text-red-600 mt-1">
              {getGradingStats().late} late submission(s)
            </p>
          )}
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by student name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="SUBMITTED">Submitted</SelectItem>
                <SelectItem value="GRADED">Graded</SelectItem>
                <SelectItem value="RETURNED">Returned</SelectItem>
                <SelectItem value="RESUBMITTED">Resubmitted</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="submittedAt">Submission Date</SelectItem>
                <SelectItem value="student">Student Name</SelectItem>
                <SelectItem value="grade">Grade</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="w-full md:w-auto"
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Grading Interface */}
      {selectedSubmissions.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Bulk Grading ({selectedSubmissions.length} selected)</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedSubmissions([])}
              >
                Clear Selection
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="bulk-grade">Grade</Label>
                <Input
                  id="bulk-grade"
                  type="number"
                  min="0"
                  value={bulkGradeForm.grade}
                  onChange={(e) =>
                    setBulkGradeForm({
                      ...bulkGradeForm,
                      grade: e.target.value,
                    })
                  }
                  placeholder="Enter grade"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="bulk-feedback">Feedback (Optional)</Label>
                <Textarea
                  id="bulk-feedback"
                  value={bulkGradeForm.feedback}
                  onChange={(e) =>
                    setBulkGradeForm({
                      ...bulkGradeForm,
                      feedback: e.target.value,
                    })
                  }
                  placeholder="Enter feedback for all selected submissions"
                  rows={2}
                />
              </div>
            </div>
            <div className="mt-4">
              <Button
                onClick={handleBulkGrade}
                disabled={!bulkGradeForm.grade || bulkGrading}
                className="w-full md:w-auto"
              >
                {bulkGrading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Grading {selectedSubmissions.length} submissions...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Grade {selectedSubmissions.length} Submissions
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Submissions ({filteredSubmissions.length})</span>
            {filteredSubmissions.filter((s) => s.status !== "GRADED").length >
              0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={selectAllSubmissions}
              >
                {selectedSubmissions.length ===
                filteredSubmissions.filter((s) => s.status !== "GRADED").length
                  ? "Deselect All"
                  : "Select All Ungraded"}
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No submissions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={selectAllSubmissions}
                        className="p-0 h-auto"
                      >
                        {selectedSubmissions.length ===
                          filteredSubmissions.filter(
                            (s) => s.status !== "GRADED"
                          ).length &&
                        filteredSubmissions.filter((s) => s.status !== "GRADED")
                          .length > 0 ? (
                          <CheckSquare className="h-4 w-4" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Files</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>
                        {submission.status !== "GRADED" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              toggleSubmissionSelection(submission.id)
                            }
                            className="p-0 h-auto"
                          >
                            {selectedSubmissions.includes(submission.id) ? (
                              <CheckSquare className="h-4 w-4 text-blue-600" />
                            ) : (
                              <Square className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                          </div>
                          <div>
                            <p className="font-medium">
                              {submission.student.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {submission.student.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(submission.status)}
                          {submission.isLate && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Late ({submission.daysLate}d)
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {format(
                              new Date(submission.submittedAt),
                              "MMM dd, yyyy 'at' HH:mm"
                            )}
                          </span>
                        </div>
                        {submission.resubmissionCount > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            Resubmitted {submission.resubmissionCount} time(s)
                          </p>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {submission.parsedFiles.length} files
                          </span>
                        </div>
                        {submission.submissionText && (
                          <p className="text-xs text-gray-500 mt-1">
                            + Text submission
                          </p>
                        )}
                      </TableCell>

                      <TableCell>
                        {submission.grade !== null &&
                        submission.grade !== undefined ? (
                          <div>
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="font-medium">
                                {submission.finalScore || submission.grade}/
                                {submission.assignment.totalPoints}
                              </span>
                            </div>
                            {submission.isLate && submission.originalScore && (
                              <p className="text-xs text-gray-500">
                                Original: {submission.originalScore}
                              </p>
                            )}
                          </div>
                        ) : (
                          <Badge variant="outline">Not graded</Badge>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setSelectedSubmission(submission)
                                }
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Review
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>
                                  Review Submission - {submission.student.name}
                                </DialogTitle>
                              </DialogHeader>

                              {selectedSubmission && (
                                <SubmissionReviewDialog
                                  submission={selectedSubmission}
                                  gradeForm={gradeForm}
                                  setGradeForm={setGradeForm}
                                  onGrade={() =>
                                    handleGradeSubmission(selectedSubmission.id)
                                  }
                                  isGrading={
                                    gradingSubmission === selectedSubmission.id
                                  }
                                />
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Submission Review Dialog Component
interface SubmissionReviewDialogProps {
  submission: Submission;
  gradeForm: { grade: string; feedback: string };
  setGradeForm: (form: { grade: string; feedback: string }) => void;
  onGrade: () => void;
  isGrading: boolean;
}

function SubmissionReviewDialog({
  submission,
  gradeForm,
  setGradeForm,
  onGrade,
  isGrading,
}: SubmissionReviewDialogProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const calculateLatePenalty = () => {
    if (!submission.isLate || !submission.assignment.latePenalty) return 0;
    return (submission.assignment.latePenalty / 100) * submission.daysLate;
  };

  const calculateFinalGrade = (originalGrade: number) => {
    if (!submission.isLate || !submission.assignment.latePenalty)
      return originalGrade;
    const penalty = calculateLatePenalty();
    return Math.max(0, originalGrade - originalGrade * penalty);
  };

  return (
    <div className="space-y-6">
      {/* Submission Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Submission Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <div className="mt-1">
                {submission.status === "GRADED" ? (
                  <Badge className="bg-green-500 text-white">Graded</Badge>
                ) : (
                  <Badge className="bg-blue-500 text-white">
                    Pending Review
                  </Badge>
                )}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Submitted At</Label>
              <p className="text-sm text-gray-600 mt-1">
                {format(
                  new Date(submission.submittedAt),
                  "MMMM dd, yyyy 'at' HH:mm"
                )}
              </p>
            </div>

            {submission.isLate && (
              <div>
                <Label className="text-sm font-medium text-red-600">
                  Late Submission
                </Label>
                <p className="text-sm text-red-600 mt-1">
                  {submission.daysLate} day(s) late
                  {submission.assignment.latePenalty && (
                    <span>
                      {" "}
                      • {submission.assignment.latePenalty}% penalty per day
                    </span>
                  )}
                </p>
              </div>
            )}

            {submission.resubmissionCount > 0 && (
              <div>
                <Label className="text-sm font-medium">Resubmissions</Label>
                <p className="text-sm text-gray-600 mt-1">
                  {submission.resubmissionCount} time(s)
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Grade</CardTitle>
          </CardHeader>
          <CardContent>
            {submission.grade !== null && submission.grade !== undefined ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Grade:</span>
                  <span className="font-medium">
                    {submission.finalScore || submission.grade}/
                    {submission.assignment.totalPoints}
                  </span>
                </div>

                {submission.isLate && submission.originalScore && (
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center justify-between">
                      <span>Original Score:</span>
                      <span>{submission.originalScore}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Penalty Applied:</span>
                      <span>
                        -
                        {(
                          submission.originalScore -
                          (submission.finalScore || submission.grade)
                        ).toFixed(1)}
                      </span>
                    </div>
                  </div>
                )}

                {submission.feedback && (
                  <div className="mt-3">
                    <Label className="text-sm font-medium">Feedback</Label>
                    <p className="text-sm text-gray-600 mt-1 p-2 bg-gray-50 rounded">
                      {submission.feedback}
                    </p>
                  </div>
                )}

                {submission.gradedAt && (
                  <p className="text-xs text-gray-500 mt-2">
                    Graded on{" "}
                    {format(
                      new Date(submission.gradedAt),
                      "MMM dd, yyyy 'at' HH:mm"
                    )}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Not yet graded</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Files */}
      {submission.parsedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Submitted Files</CardTitle>
          </CardHeader>
          <CardContent>
            <EnhancedFilePreview files={submission.parsedFiles} />
          </CardContent>
        </Card>
      )}

      {/* Text Submission */}
      {submission.submissionText && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Text Submission</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="whitespace-pre-wrap">{submission.submissionText}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grading Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {submission.grade !== null && submission.grade !== undefined
              ? "Update Grade"
              : "Grade Submission"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="grade">
              Grade (out of {submission.assignment.totalPoints})
            </Label>
            <Input
              id="grade"
              type="number"
              min="0"
              max={submission.assignment.totalPoints}
              value={gradeForm.grade}
              onChange={(e) =>
                setGradeForm({ ...gradeForm, grade: e.target.value })
              }
              placeholder={`Enter grade (0-${submission.assignment.totalPoints})`}
            />
            {gradeForm.grade &&
              submission.isLate &&
              submission.assignment.latePenalty && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                  <p className="text-yellow-800">
                    <strong>Late Penalty Applied:</strong>{" "}
                    {calculateLatePenalty().toFixed(1)}% reduction
                  </p>
                  <p className="text-yellow-800">
                    Final Grade:{" "}
                    {calculateFinalGrade(Number(gradeForm.grade)).toFixed(1)}/
                    {submission.assignment.totalPoints}
                  </p>
                </div>
              )}
          </div>

          <div>
            <Label htmlFor="feedback">Feedback (Optional)</Label>
            <Textarea
              id="feedback"
              value={gradeForm.feedback}
              onChange={(e) =>
                setGradeForm({ ...gradeForm, feedback: e.target.value })
              }
              placeholder="Provide feedback for the student..."
              rows={4}
            />
          </div>

          <Button
            onClick={onGrade}
            disabled={!gradeForm.grade || isGrading}
            className="w-full"
          >
            {isGrading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Grading...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                {submission.grade !== null && submission.grade !== undefined
                  ? "Update Grade"
                  : "Submit Grade"}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
