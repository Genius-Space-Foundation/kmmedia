"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { makeAuthenticatedRequest } from "@/lib/token-utils";

interface Assessment {
  id: string;
  title: string;
  description: string;
  type: "QUIZ" | "EXAM" | "ASSIGNMENT" | "PROJECT";
  courseId: string;
  courseTitle: string;
  totalPoints: number;
  passingScore: number;
  timeLimit?: number;
  attempts: number;
  isPublished: boolean;
  dueDate?: string;
  createdAt: string;
  _count: {
    submissions: number;
    questions: number;
  };
  averageScore: number;
  completionRate: number;
}

interface Submission {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  score: number;
  submittedAt: string;
  status: "PENDING" | "GRADED" | "RETURNED";
  timeSpent: number;
  answers: any[];
}

interface Question {
  id: string;
  text: string;
  type:
    | "MULTIPLE_CHOICE"
    | "MULTIPLE_SELECT"
    | "TRUE_FALSE"
    | "SHORT_ANSWER"
    | "ESSAY";
  points: number;
  options?: string[];
  correctAnswer?: string | string[];
  explanation?: string;
  order: number;
}

interface GradingQueue {
  pendingSubmissions: number;
  averageGradingTime: number;
  overdueSubmissions: number;
}

export default function AssessmentCenter() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [gradingQueue, setGradingQueue] = useState<GradingQueue>({
    pendingSubmissions: 0,
    averageGradingTime: 0,
    overdueSubmissions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("assessments");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showGradingForm, setShowGradingForm] = useState(false);
  const [selectedAssessment, setSelectedAssessment] =
    useState<Assessment | null>(null);
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Assessment creation form
  const [newAssessment, setNewAssessment] = useState({
    title: "",
    description: "",
    type: "QUIZ" as const,
    courseId: "",
    totalPoints: 100,
    passingScore: 70,
    timeLimit: 60,
    attempts: 1,
    dueDate: "",
    questions: [] as Question[],
  });

  // Grading form
  const [gradingData, setGradingData] = useState({
    score: 0,
    feedback: "",
    rubric: [] as any[],
  });

  useEffect(() => {
    fetchAssessmentData();
  }, []);

  const fetchAssessmentData = async () => {
    try {
      // Check if we're on the client side
      if (typeof window === "undefined") {
        return;
      }

      const [assessmentsRes, submissionsRes, queueRes] = await Promise.all([
        makeAuthenticatedRequest("/api/instructor/assessments"),
        makeAuthenticatedRequest("/api/instructor/assessments/submissions"),
        makeAuthenticatedRequest("/api/instructor/assessments/grading-queue"),
      ]);

      const [assessmentsData, submissionsData, queueData] = await Promise.all([
        assessmentsRes.json(),
        submissionsRes.json(),
        queueRes.json(),
      ]);

      if (assessmentsData.success) {
        const assessmentsArray = Array.isArray(assessmentsData.data)
          ? assessmentsData.data
          : assessmentsData.data?.assessments || [];
        setAssessments(assessmentsArray);
      }
      if (submissionsData.success) {
        const submissionsArray = Array.isArray(submissionsData.data)
          ? submissionsData.data
          : submissionsData.data?.submissions || [];
        setSubmissions(submissionsArray);
      }
      if (queueData.success) setGradingQueue(queueData.data || {});
    } catch (error) {
      console.error("Error fetching assessment data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await makeAuthenticatedRequest(
        "/api/instructor/assessments",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newAssessment),
        }
      );
      const data = await response.json();
      if (data.success) {
        setAssessments([data.data, ...assessments]);
        setShowCreateForm(false);
        setNewAssessment({
          title: "",
          description: "",
          type: "QUIZ",
          courseId: "",
          totalPoints: 100,
          passingScore: 70,
          timeLimit: 60,
          attempts: 1,
          dueDate: "",
          questions: [],
        });
      }
    } catch (error) {
      console.error("Error creating assessment:", error);
    }
  };

  const handleGradeSubmission = async (submissionId: string) => {
    try {
      const response = await makeAuthenticatedRequest(
        `/api/instructor/assessments/submissions/${submissionId}/grade`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(gradingData),
        }
      );
      const data = await response.json();
      if (data.success) {
        setSubmissions(
          submissions.map((sub) =>
            sub.id === submissionId
              ? { ...sub, status: "GRADED", score: gradingData.score }
              : sub
          )
        );
        setShowGradingForm(false);
        setSelectedSubmission(null);
      }
    } catch (error) {
      console.error("Error grading submission:", error);
    }
  };

  const handlePublishAssessment = async (assessmentId: string) => {
    try {
      const response = await makeAuthenticatedRequest(
        `/api/instructor/assessments/${assessmentId}/publish`,
        {
          method: "POST",
        }
      );
      const data = await response.json();
      if (data.success) {
        setAssessments(
          assessments.map((assessment) =>
            assessment.id === assessmentId
              ? { ...assessment, isPublished: true }
              : assessment
          )
        );
      }
    } catch (error) {
      console.error("Error publishing assessment:", error);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "QUIZ":
        return "bg-blue-100 text-blue-800";
      case "EXAM":
        return "bg-red-100 text-red-800";
      case "ASSIGNMENT":
        return "bg-green-100 text-green-800";
      case "PROJECT":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "GRADED":
        return "bg-green-100 text-green-800";
      case "RETURNED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredAssessments = (
    Array.isArray(assessments) ? assessments : []
  ).filter((assessment) => {
    const matchesSearch = assessment.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "ALL" || assessment.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const filteredSubmissions = (
    Array.isArray(submissions) ? submissions : []
  ).filter((submission) => {
    const matchesSearch = submission.studentName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || submission.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Assessment Center</h2>
        <div className="flex space-x-2">
          <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
            <DialogTrigger asChild>
              <Button>Create Assessment</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Assessment</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateAssessment} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Assessment Title</Label>
                    <Input
                      id="title"
                      value={newAssessment.title}
                      onChange={(e) =>
                        setNewAssessment({
                          ...newAssessment,
                          title: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={newAssessment.type}
                      onValueChange={(value) =>
                        setNewAssessment({
                          ...newAssessment,
                          type: value as any,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="QUIZ">Quiz</SelectItem>
                        <SelectItem value="EXAM">Exam</SelectItem>
                        <SelectItem value="ASSIGNMENT">Assignment</SelectItem>
                        <SelectItem value="PROJECT">Project</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newAssessment.description}
                    onChange={(e) =>
                      setNewAssessment({
                        ...newAssessment,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="totalPoints">Total Points</Label>
                    <Input
                      id="totalPoints"
                      type="number"
                      value={newAssessment.totalPoints || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numValue = value === "" ? 0 : parseInt(value, 10);
                        setNewAssessment({
                          ...newAssessment,
                          totalPoints: isNaN(numValue) ? 0 : numValue,
                        });
                      }}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="passingScore">Passing Score</Label>
                    <Input
                      id="passingScore"
                      type="number"
                      value={newAssessment.passingScore || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numValue = value === "" ? 0 : parseInt(value, 10);
                        setNewAssessment({
                          ...newAssessment,
                          passingScore: isNaN(numValue) ? 0 : numValue,
                        });
                      }}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                    <Input
                      id="timeLimit"
                      type="number"
                      value={newAssessment.timeLimit || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numValue = value === "" ? 0 : parseInt(value, 10);
                        setNewAssessment({
                          ...newAssessment,
                          timeLimit: isNaN(numValue) ? 0 : numValue,
                        });
                      }}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create Assessment</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          <Button variant="outline">Question Bank</Button>
        </div>
      </div>

      {/* Grading Queue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Grading
            </CardTitle>
            <span className="text-2xl">📝</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {gradingQueue.pendingSubmissions}
            </div>
            <p className="text-xs text-muted-foreground">
              Submissions awaiting review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Grading Time
            </CardTitle>
            <span className="text-2xl">⏱️</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {gradingQueue.averageGradingTime}m
            </div>
            <p className="text-xs text-muted-foreground">Per submission</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <span className="text-2xl">⚠️</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {gradingQueue.overdueSubmissions}
            </div>
            <p className="text-xs text-muted-foreground">Past due date</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="grading">Grading Queue</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="assessments" className="space-y-4">
          <div className="flex space-x-4">
            <Input
              placeholder="Search assessments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="QUIZ">Quiz</SelectItem>
                <SelectItem value="EXAM">Exam</SelectItem>
                <SelectItem value="ASSIGNMENT">Assignment</SelectItem>
                <SelectItem value="PROJECT">Project</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssessments.map((assessment) => (
              <Card
                key={assessment.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {assessment.title}
                      </CardTitle>
                      <CardDescription>
                        {assessment.courseTitle}
                      </CardDescription>
                    </div>
                    <Badge className={getTypeColor(assessment.type)}>
                      {assessment.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {assessment.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Points:</span>{" "}
                      {assessment.totalPoints}
                    </div>
                    <div>
                      <span className="font-medium">Passing:</span>{" "}
                      {assessment.passingScore}%
                    </div>
                    <div>
                      <span className="font-medium">Submissions:</span>{" "}
                      {assessment._count.submissions}
                    </div>
                    <div>
                      <span className="font-medium">Questions:</span>{" "}
                      {assessment._count.questions}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Average Score</span>
                      <span>{assessment.averageScore}%</span>
                    </div>
                    <Progress value={assessment.averageScore} className="h-2" />
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      Edit
                    </Button>
                    {!assessment.isPublished && (
                      <Button
                        size="sm"
                        onClick={() => handlePublishAssessment(assessment.id)}
                      >
                        Publish
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="grading" className="space-y-4">
          <div className="flex space-x-4">
            <Input
              placeholder="Search submissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="GRADED">Graded</SelectItem>
                <SelectItem value="RETURNED">Returned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {filteredSubmissions.map((submission) => (
              <Card
                key={submission.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {submission.studentName}
                      </CardTitle>
                      <CardDescription>
                        {submission.studentEmail}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(submission.status)}>
                        {submission.status}
                      </Badge>
                      {submission.status === "GRADED" && (
                        <Badge variant="outline">{submission.score}%</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Submitted:</span>{" "}
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Time Spent:</span>{" "}
                      {submission.timeSpent} minutes
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setSelectedSubmission(submission);
                        setShowGradingForm(true);
                      }}
                    >
                      Grade
                    </Button>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Grading Dialog */}
      <Dialog open={showGradingForm} onOpenChange={setShowGradingForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Grade Submission</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="score">Score</Label>
                <Input
                  id="score"
                  type="number"
                  value={gradingData.score || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numValue = value === "" ? 0 : parseInt(value, 10);
                    setGradingData({
                      ...gradingData,
                      score: isNaN(numValue) ? 0 : numValue,
                    });
                  }}
                  max={100}
                  min={0}
                />
              </div>
              <div>
                <Label htmlFor="feedback">Feedback</Label>
                <Textarea
                  id="feedback"
                  value={gradingData.feedback}
                  onChange={(e) =>
                    setGradingData({ ...gradingData, feedback: e.target.value })
                  }
                  rows={4}
                  placeholder="Provide detailed feedback for the student..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowGradingForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleGradeSubmission(selectedSubmission.id)}
                >
                  Submit Grade
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
