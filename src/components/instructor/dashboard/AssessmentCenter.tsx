"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  CheckSquare,
  Clock,
  AlertCircle,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  MoreVertical,
  BarChart,
  Users,
  Calendar,
  ChevronRight,
  Edit,
  Trash2,
  Copy,
  Eye,
  ArrowLeft,
  Save,
  CheckCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import QuestionEditor, { Question } from "../assessments/QuestionEditor";
import CreateAssessmentForm from "../assessments/CreateAssessmentForm";
import { ErrorBoundary } from "@/components/ErrorBoundary";

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
  priority: "HIGH" | "MEDIUM" | "LOW";
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
  urgentCount: number;
}

export default function AssessmentCenter() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [courses, setCourses] = useState<Array<{ id: string; title: string }>>([]);
  const [editingAssessment, setEditingAssessment] = useState<any>(null);
  const [gradingQueue, setGradingQueue] = useState<GradingQueue>({
    pendingSubmissions: 0,
    averageGradingTime: 0,
    overdueSubmissions: 0,
    urgentCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("grading");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showGradingForm, setShowGradingForm] = useState(false);
  const [selectedAssessment, setSelectedAssessment] =
    useState<Assessment | null>(null);
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Removed old newAssessment state as it's now in CreateAssessmentForm

  // Grading form
  const [gradingData, setGradingData] = useState({
    score: 0,
    feedback: "",
    rubric: [] as any[],
  });

  useEffect(() => {
    fetchAssessmentData();
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/instructor/courses", { credentials: "include" });
      const data = await response.json();
      if (data.success) {
        setCourses(data.data.courses.map((c: any) => ({ id: c.id, title: c.title })));
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchAssessmentData = async () => {
    try {
      setLoading(true);
      
      const [assessmentsRes, queueRes, submissionsRes] = await Promise.all([
        fetch("/api/instructor/assessments", { credentials: "include" }),
        fetch("/api/instructor/assessments/grading-queue", { credentials: "include" }),
        fetch("/api/instructor/assessments/submissions?status=SUBMITTED", { credentials: "include" })
      ]);

      const assessmentsData = await assessmentsRes.json();
      const queueData = await queueRes.json();
      const submissionsData = await submissionsRes.json();

      if (assessmentsData.success) {
        setAssessments(assessmentsData.data);
      }

      if (queueData.success) {
        setGradingQueue(queueData.data);
      }

      if (submissionsData.success) {
        // Transform submissions to match interface
        const transformedSubmissions = submissionsData.data.submissions.map((sub: any) => ({
          id: sub.id,
          studentId: sub.student.id,
          studentName: sub.student.name,
          studentEmail: sub.student.email,
          score: sub.score || 0,
          submittedAt: sub.submittedAt,
          status: sub.status === "SUBMITTED" ? "PENDING" : sub.status,
          timeSpent: sub.timeSpent || 0,
          answers: [], // Would need detailed fetch for answers
          priority: getPriority(sub.submittedAt),
        }));
        setSubmissions(transformedSubmissions);
      }

    } catch (error) {
      console.error("Error fetching assessment data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPriority = (submittedAt: string) => {
    const days = (Date.now() - new Date(submittedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (days > 3) return "HIGH";
    if (days > 1) return "MEDIUM";
    return "LOW";
  };

  // Removed handleCreateAssessment as it's now in CreateAssessmentForm

  const handleGradeSubmission = async (submissionId: string) => {
    try {
      const response = await fetch(`/api/instructor/submissions/${submissionId}/grade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: gradingData.score,
          feedback: gradingData.feedback,
        }),
        credentials: "include",
      });

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
        // Refresh queue stats
        fetch("/api/instructor/assessments/grading-queue", { credentials: "include" })
          .then(res => res.json())
          .then(data => {
            if (data.success) setGradingQueue(data.data);
          });
      }
    } catch (error) {
      console.error("Error grading submission:", error);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "QUIZ":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "EXAM":
        return "bg-red-100 text-red-800 border-red-200";
      case "ASSIGNMENT":
        return "bg-green-100 text-green-800 border-green-200";
      case "PROJECT":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "GRADED":
        return "bg-green-100 text-green-800 border-green-200";
      case "RETURNED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "text-red-600 bg-red-50 border-red-200";
      case "MEDIUM":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "LOW":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const filteredAssessments = assessments.filter((assessment) => {
    const matchesSearch = assessment.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "ALL" || assessment.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const filteredSubmissions = submissions.filter((submission) => {
    const matchesSearch = submission.studentName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || submission.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
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
    <ErrorBoundary>
      <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-neutral-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-900">
                  {gradingQueue.pendingSubmissions}
                </p>
                <p className="text-sm text-yellow-700">Pending Grading</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-neutral-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-900">
                  {gradingQueue.urgentCount}
                </p>
                <p className="text-sm text-red-700">Urgent Items</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-neutral-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-900">
                  {gradingQueue.averageGradingTime}m
                </p>
                <p className="text-sm text-blue-700">Avg Grading Time</p>
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
                  {assessments.reduce((acc, curr) => acc + curr._count.submissions, 0)}
                </p>
                <p className="text-sm text-green-700">Total Graded</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-neutral-900">Assessment Center</h2>
        <Button onClick={() => setShowCreateForm(true)} className="bg-brand-primary text-white">
          <Plus className="h-4 w-4 mr-2" /> Create Assessment
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
          <TabsTrigger 
            value="grading"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            Grading Queue
            {gradingQueue.pendingSubmissions > 0 && (
              <Badge className="ml-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-0">
                {gradingQueue.pendingSubmissions}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="assessments"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            Assessments
          </TabsTrigger>
          <TabsTrigger 
            value="analytics"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="grading" className="mt-6 space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search submissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
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
              <Card key={submission.id} className="hover:shadow-md transition-shadow border-neutral-200">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg text-gray-900">{submission.studentName}</h3>
                        <Badge className={getStatusColor(submission.status)}>
                          {submission.status}
                        </Badge>
                        {submission.priority === "HIGH" && (
                          <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
                            High Priority
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mb-4">{submission.studentEmail}</p>
                      
                      <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-gray-400" />
                          Time Spent: {submission.timeSpent}m
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {submission.status === "PENDING" ? (
                        <Button 
                          onClick={() => {
                            setSelectedSubmission(submission);
                            setShowGradingForm(true);
                          }}
                          className="bg-brand-primary text-white"
                        >
                          Grade Now
                        </Button>
                      ) : (
                        <div className="text-right mr-4">
                          <span className="block text-2xl font-bold text-gray-900">{submission.score}%</span>
                          <span className="text-xs text-gray-500">Score</span>
                        </div>
                      )}
                      <Button variant="outline" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="assessments" className="mt-6 space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search assessments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssessments.map((assessment) => (
              <Card key={assessment.id} className="hover:shadow-md transition-shadow border-neutral-200 flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={getTypeColor(assessment.type)}>
                      {assessment.type}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setEditingAssessment(assessment);
                          setShowCreateForm(true);
                        }}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={async () => {
                          if (confirm(`Are you sure you want to delete "${assessment.title}"?`)) {
                            try {
                              const response = await fetch(`/api/instructor/assessments/${assessment.id}`, {
                                method: "DELETE",
                                credentials: "include",
                              });
                              const data = await response.json();
                              if (data.success) {
                                alert("Assessment deleted successfully");
                                fetchAssessmentData();
                              } else {
                                alert(`Error: ${data.message}`);
                              }
                            } catch (error) {
                              console.error("Error deleting assessment:", error);
                              alert("Failed to delete assessment");
                            }
                          }
                        }}>
                          <Copy className="mr-2 h-4 w-4" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={async () => {
                          if (confirm(`Are you sure you want to delete "${assessment.title}"? This action cannot be undone.`)) {
                            try {
                              const response = await fetch(`/api/instructor/assessments/${assessment.id}`, {
                                method: "DELETE",
                                credentials: "include",
                              });
                              const data = await response.json();
                              if (data.success) {
                                alert("Assessment deleted successfully");
                                fetchAssessmentData();
                              } else {
                                alert(`Error: ${data.message}`);
                              }
                            } catch (error) {
                              console.error("Error deleting assessment:", error);
                              alert("Failed to delete assessment");
                            }
                          }
                        }}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardTitle className="line-clamp-1">{assessment.title}</CardTitle>
                  <CardDescription className="line-clamp-1">{assessment.courseTitle}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {assessment.description}
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Completion Rate</span>
                      <span className="font-medium">{assessment.completionRate}%</span>
                    </div>
                    <Progress value={assessment.completionRate} className="h-2" />
                    
                    <div className="grid grid-cols-2 gap-4 pt-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-gray-400" />
                        {assessment._count.submissions} Subs
                      </div>
                      <div className="flex items-center">
                        <BarChart3 className="h-4 w-4 mr-2 text-gray-400" />
                        Avg: {assessment.averageScore}%
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 border-t p-4">
                  <Button variant="ghost" className="w-full justify-between hover:bg-transparent hover:text-brand-primary p-0 h-auto">
                    View Analytics <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Assessment Dialog */}
      <CreateAssessmentForm 
        open={showCreateForm} 
        onOpenChange={(open) => {
          setShowCreateForm(open);
          if (!open) setEditingAssessment(null);
        }}
        onSuccess={() => {
          fetchAssessmentData();
          setEditingAssessment(null);
        }}
        courses={courses}
        initialData={editingAssessment}
      />

      {/* Grading Dialog */}
      <Dialog open={showGradingForm} onOpenChange={setShowGradingForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Grade Submission</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">{selectedSubmission.studentName}</span>
                  <span className="text-gray-500">{new Date(selectedSubmission.submittedAt).toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-600">Time spent: {selectedSubmission.timeSpent} minutes</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="score">Score (0-100)</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="score"
                      type="number"
                      value={gradingData.score}
                      onChange={(e) => setGradingData({ ...gradingData, score: parseInt(e.target.value) })}
                      className="w-32"
                      max={100}
                      min={0}
                    />
                    <Progress value={gradingData.score} className="flex-1" />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="feedback">Feedback</Label>
                  <Textarea
                    id="feedback"
                    value={gradingData.feedback}
                    onChange={(e) => setGradingData({ ...gradingData, feedback: e.target.value })}
                    rows={6}
                    placeholder="Provide constructive feedback..."
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowGradingForm(false)}>
                  Cancel
                </Button>
                <Button onClick={() => handleGradeSubmission(selectedSubmission.id)} className="bg-brand-primary text-white">
                  <Save className="h-4 w-4 mr-2" /> Save Grade
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </ErrorBoundary>
  );
}
