"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Calendar,
  Award,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Submission {
  id: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
  submittedAt: Date;
  files: any[];
  submissionText?: string;
  grade?: number;
  feedback?: string;
  status: "SUBMITTED" | "GRADED" | "RETURNED";
  isLate: boolean;
  daysLate?: number;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  totalPoints: number;
  dueDate: Date;
  courseId: string;
  course: {
    title: string;
  };
}

interface AssignmentGradingDashboardProps {
  assignmentId: string;
  onClose?: () => void;
}

export default function AssignmentGradingDashboard({
  assignmentId,
  onClose,
}: AssignmentGradingDashboardProps) {
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(false);
  
  // Grading form state
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");
  
  // Filter state
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchAssignmentAndSubmissions();
  }, [assignmentId]);

  useEffect(() => {
    filterSubmissions();
  }, [submissions, statusFilter, searchQuery]);

  const fetchAssignmentAndSubmissions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/instructor/assignments/${assignmentId}/submissions`);
      const data = await response.json();

      if (data.success) {
        setAssignment(data.data.assignment);
        setSubmissions(data.data.submissions);
      } else {
        toast.error("Failed to load submissions");
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  const filterSubmissions = () => {
    let filtered = [...submissions];

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((s) => s.status === statusFilter.toUpperCase());
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((s) =>
        s.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.student.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredSubmissions(filtered);
  };

  const handleSelectSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
    setGrade(submission.grade?.toString() || "");
    setFeedback(submission.feedback || "");
  };

  const handleSubmitGrade = async () => {
    if (!selectedSubmission) return;

    const gradeValue = parseFloat(grade);
    if (isNaN(gradeValue) || gradeValue < 0 || gradeValue > assignment!.totalPoints) {
      toast.error(`Grade must be between 0 and ${assignment!.totalPoints}`);
      return;
    }

    setGrading(true);
    try {
      const response = await fetch(`/api/instructor/submissions/${selectedSubmission.id}/grade`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grade: gradeValue,
          feedback,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Grade submitted successfully");
        await fetchAssignmentAndSubmissions();
        setSelectedSubmission(null);
        setGrade("");
        setFeedback("");
      } else {
        toast.error(data.message || "Failed to submit grade");
      }
    } catch (error) {
      console.error("Error submitting grade:", error);
      toast.error("Failed to submit grade");
    } finally {
      setGrading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return <Badge className="bg-blue-100 text-blue-700 border-0">Pending</Badge>;
      case "GRADED":
        return <Badge className="bg-green-100 text-green-700 border-0">Graded</Badge>;
      case "RETURNED":
        return <Badge className="bg-purple-100 text-purple-700 border-0">Returned</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const stats = {
    total: submissions.length,
    pending: submissions.filter((s) => s.status === "SUBMITTED").length,
    graded: submissions.filter((s) => s.status === "GRADED" || s.status === "RETURNED").length,
    late: submissions.filter((s) => s.isLate).length,
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-gray-600">Loading submissions...</p>
        </CardContent>
      </Card>
    );
  }

  if (!assignment) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-gray-600">Assignment not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-brand-primary/20">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl">{assignment.title}</CardTitle>
              <CardDescription className="mt-2 text-base">
                {assignment.course.title}
              </CardDescription>
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Due: {format(new Date(assignment.dueDate), "MMM dd, yyyy")}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  <span>{assignment.totalPoints} points</span>
                </div>
              </div>
            </div>
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
              <p className="text-sm text-gray-600 mt-1">Total Submissions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.pending}</div>
              <p className="text-sm text-gray-600 mt-1">Pending Review</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.graded}</div>
              <p className="text-sm text-gray-600 mt-1">Graded</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{stats.late}</div>
              <p className="text-sm text-gray-600 mt-1">Late Submissions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by student name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="submitted">Pending</SelectItem>
                <SelectItem value="graded">Graded</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Submissions List and Grading Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submissions List */}
        <Card className="border-2">
          <CardHeader className="bg-gray-50">
            <CardTitle>Submissions ({filteredSubmissions.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[600px] overflow-y-auto">
              {filteredSubmissions.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  No submissions found
                </div>
              ) : (
                filteredSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedSubmission?.id === submission.id ? "bg-blue-50 border-l-4 border-l-brand-primary" : ""
                    }`}
                    onClick={() => handleSelectSubmission(submission)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                          <User className="h-5 w-5 text-brand-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900">{submission.student.name}</h4>
                          <p className="text-sm text-gray-600 truncate">{submission.student.email}</p>
                          <div className="flex items-center gap-2 mt-2">
                            {getStatusBadge(submission.status)}
                            {submission.isLate && (
                              <Badge variant="outline" className="text-orange-600 border-orange-300">
                                <Clock className="h-3 w-3 mr-1" />
                                {submission.daysLate} day(s) late
                              </Badge>
                            )}
                            {submission.grade !== undefined && (
                              <Badge className="bg-green-100 text-green-700 border-0">
                                {submission.grade}/{assignment.totalPoints}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 text-right flex-shrink-0 ml-2">
                        {format(new Date(submission.submittedAt), "MMM dd, yyyy")}
                        <br />
                        {format(new Date(submission.submittedAt), "h:mm a")}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Grading Panel */}
        <Card className="border-2">
          <CardHeader className="bg-gray-50">
            <CardTitle>
              {selectedSubmission ? "Grade Submission" : "Select a Submission"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {!selectedSubmission ? (
              <div className="py-12 text-center text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Select a submission from the list to start grading</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Student Info */}
                <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-brand-primary flex items-center justify-center text-white font-bold text-lg">
                      {selectedSubmission.student.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedSubmission.student.name}</h3>
                      <p className="text-sm text-gray-600">{selectedSubmission.student.email}</p>
                    </div>
                  </div>
                </div>

                {/* Submission Content */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Submission</h4>
                  
                  {/* Files */}
                  {selectedSubmission.files && selectedSubmission.files.length > 0 && (
                    <div className="space-y-2">
                      <Label>Attached Files</Label>
                      <div className="space-y-2">
                        {selectedSubmission.files.map((file: any, index: number) => (
                          <a
                            key={index}
                            href={file.url || file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-3 border-2 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <FileText className="h-5 w-5 text-brand-primary" />
                            <span className="flex-1 text-sm font-medium">
                              {file.name || `File ${index + 1}`}
                            </span>
                            <ExternalLink className="h-4 w-4 text-gray-400" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Text Submission */}
                  {selectedSubmission.submissionText && (
                    <div className="space-y-2">
                      <Label>Written Response</Label>
                      <div className="p-4 bg-gray-50 rounded-lg border-2 max-h-[200px] overflow-y-auto">
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">
                          {selectedSubmission.submissionText}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Grading Form */}
                <div className="space-y-4 pt-4 border-t-2">
                  <div className="space-y-2">
                    <Label htmlFor="grade">Grade (out of {assignment.totalPoints})</Label>
                    <Input
                      id="grade"
                      type="number"
                      min="0"
                      max={assignment.totalPoints}
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      placeholder="Enter grade"
                      className="border-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="feedback">Feedback</Label>
                    <Textarea
                      id="feedback"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Provide feedback to the student..."
                      rows={6}
                      className="border-2"
                    />
                  </div>

                  <Button
                    onClick={handleSubmitGrade}
                    disabled={grading || !grade}
                    className="w-full bg-brand-primary hover:bg-brand-secondary"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {grading ? "Submitting..." : "Submit Grade"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
