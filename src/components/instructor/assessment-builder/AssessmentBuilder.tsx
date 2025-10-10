"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  Clock,
  FileText,
  Target,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  BookOpen,
  Users,
  Calendar,
  BarChart3,
  Settings,
  Copy,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Brain,
  Award,
  Timer,
  HelpCircle,
  Type,
  List,
  CheckSquare,
  Image,
  Link,
  Upload,
} from "lucide-react";
import { makeAuthenticatedRequest } from "@/lib/token-utils";

interface Assessment {
  id: string;
  title: string;
  description: string;
  type: "QUIZ" | "EXAM" | "ASSIGNMENT" | "PROJECT";
  duration: number; // in minutes
  totalPoints: number;
  passingScore: number;
  attempts: number;
  isPublished: boolean;
  isTimed: boolean;
  allowReview: boolean;
  showCorrectAnswers: boolean;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  questions: Question[];
  courseId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    submissions: number;
    completions: number;
  };
}

interface Question {
  id: string;
  type:
    | "MULTIPLE_CHOICE"
    | "TRUE_FALSE"
    | "FILL_BLANK"
    | "SHORT_ANSWER"
    | "ESSAY"
    | "MATCHING"
    | "ORDERING";
  question: string;
  points: number;
  order: number;
  isRequired: boolean;
  options?: QuestionOption[];
  correctAnswer?: string | string[];
  explanation?: string;
  mediaUrl?: string;
  mediaType?: "IMAGE" | "VIDEO" | "AUDIO";
  timeLimit?: number; // in seconds
}

interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

interface Course {
  id: string;
  title: string;
  description: string;
  status: string;
  _count: {
    assessments: number;
    enrollments: number;
  };
}

const ASSESSMENT_TYPES = [
  {
    value: "QUIZ",
    label: "Quiz",
    icon: Target,
    description: "Quick knowledge check",
  },
  {
    value: "EXAM",
    label: "Exam",
    icon: FileText,
    description: "Comprehensive assessment",
  },
  {
    value: "ASSIGNMENT",
    label: "Assignment",
    icon: BookOpen,
    description: "Practical work",
  },
  {
    value: "PROJECT",
    label: "Project",
    icon: Users,
    description: "Group or individual project",
  },
];

const QUESTION_TYPES = [
  {
    value: "MULTIPLE_CHOICE",
    label: "Multiple Choice",
    icon: CheckSquare,
    description: "Choose one correct answer",
    defaultOptions: 4,
  },
  {
    value: "TRUE_FALSE",
    label: "True/False",
    icon: CheckCircle,
    description: "True or false statement",
    defaultOptions: 2,
  },
  {
    value: "FILL_BLANK",
    label: "Fill in the Blank",
    icon: Type,
    description: "Complete the sentence",
    defaultOptions: 0,
  },
  {
    value: "SHORT_ANSWER",
    label: "Short Answer",
    icon: Edit,
    description: "Brief written response",
    defaultOptions: 0,
  },
  {
    value: "ESSAY",
    label: "Essay",
    icon: FileText,
    description: "Detailed written response",
    defaultOptions: 0,
  },
  {
    value: "MATCHING",
    label: "Matching",
    icon: Link,
    description: "Match items from two columns",
    defaultOptions: 4,
  },
  {
    value: "ORDERING",
    label: "Ordering",
    icon: List,
    description: "Arrange items in correct order",
    defaultOptions: 4,
  },
];

export default function AssessmentBuilder() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(
    null
  );
  const [activeTab, setActiveTab] = useState("questions");

  const [newAssessment, setNewAssessment] = useState({
    title: "",
    description: "",
    type: "QUIZ" as const,
    duration: 30,
    totalPoints: 100,
    passingScore: 70,
    attempts: 1,
    isTimed: true,
    allowReview: true,
    showCorrectAnswers: false,
    randomizeQuestions: false,
    randomizeOptions: false,
    questions: [] as Question[],
  });

  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    type: "MULTIPLE_CHOICE",
    question: "",
    points: 10,
    isRequired: true,
    options: [],
    correctAnswer: "",
    explanation: "",
  });

  const [newOption, setNewOption] = useState("");

  useEffect(() => {
    fetchCourses();

    // Check if course is specified in URL
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get("course");
    if (courseId) {
      setSelectedCourse(courseId);
    }
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchAssessments(selectedCourse);
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      if (typeof window === "undefined") return;

      const response = await makeAuthenticatedRequest(
        "/api/instructor/courses"
      );
      if (response.ok) {
        const data = await response.json();
        setCourses(Array.isArray(data) ? data : data.data || []);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssessments = async (courseId: string) => {
    try {
      if (typeof window === "undefined") return;

      const response = await makeAuthenticatedRequest(
        `/api/instructor/courses/${courseId}/assessments`
      );
      if (response.ok) {
        const data = await response.json();
        setAssessments(Array.isArray(data) ? data : data.data || []);
      }
    } catch (error) {
      console.error("Error fetching assessments:", error);
    }
  };

  const handleCreateAssessment = async () => {
    if (!selectedCourse || !newAssessment.title.trim()) return;

    try {
      const response = await makeAuthenticatedRequest(
        `/api/instructor/courses/${selectedCourse}/assessments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newAssessment),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAssessments((prev) => [...prev, data.data]);
        setShowCreateDialog(false);
        resetNewAssessment();
      }
    } catch (error) {
      console.error("Error creating assessment:", error);
    }
  };

  const handleUpdateAssessment = async () => {
    if (!editingAssessment) return;

    try {
      const response = await makeAuthenticatedRequest(
        `/api/instructor/assessments/${editingAssessment.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editingAssessment),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAssessments((prev) =>
          prev.map((assessment) =>
            assessment.id === editingAssessment.id ? data.data : assessment
          )
        );
        setShowEditDialog(false);
        setEditingAssessment(null);
      }
    } catch (error) {
      console.error("Error updating assessment:", error);
    }
  };

  const handleDeleteAssessment = async (assessmentId: string) => {
    if (!confirm("Are you sure you want to delete this assessment?")) return;

    try {
      const response = await makeAuthenticatedRequest(
        `/api/instructor/assessments/${assessmentId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setAssessments((prev) =>
          prev.filter((assessment) => assessment.id !== assessmentId)
        );
      }
    } catch (error) {
      console.error("Error deleting assessment:", error);
    }
  };

  const handleTogglePublish = async (assessment: Assessment) => {
    try {
      const response = await makeAuthenticatedRequest(
        `/api/instructor/assessments/${assessment.id}/publish`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isPublished: !assessment.isPublished }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAssessments((prev) =>
          prev.map((a) =>
            a.id === assessment.id
              ? { ...a, isPublished: data.data.isPublished }
              : a
          )
        );
      }
    } catch (error) {
      console.error("Error toggling publish status:", error);
    }
  };

  const resetNewAssessment = () => {
    setNewAssessment({
      title: "",
      description: "",
      type: "QUIZ",
      duration: 30,
      totalPoints: 100,
      passingScore: 70,
      attempts: 1,
      isTimed: true,
      allowReview: true,
      showCorrectAnswers: false,
      randomizeQuestions: false,
      randomizeOptions: false,
      questions: [],
    });
  };

  const addQuestion = () => {
    if (!newQuestion.question?.trim()) return;

    const question: Question = {
      id: Date.now().toString(),
      type: newQuestion.type || "MULTIPLE_CHOICE",
      question: newQuestion.question.trim(),
      points: newQuestion.points || 10,
      order: newAssessment.questions.length + 1,
      isRequired: newQuestion.isRequired || true,
      options: newQuestion.options || [],
      correctAnswer: newQuestion.correctAnswer || "",
      explanation: newQuestion.explanation || "",
      timeLimit: newQuestion.timeLimit,
    };

    setNewAssessment((prev) => ({
      ...prev,
      questions: [...prev.questions, question],
    }));

    setNewQuestion({
      type: "MULTIPLE_CHOICE",
      question: "",
      points: 10,
      isRequired: true,
      options: [],
      correctAnswer: "",
      explanation: "",
    });
  };

  const removeQuestion = (questionId: string) => {
    setNewAssessment((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== questionId),
    }));
  };

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    setNewAssessment((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === questionId ? { ...q, ...updates } : q
      ),
    }));
  };

  const addOption = () => {
    if (!newOption.trim()) return;

    const option: QuestionOption = {
      id: Date.now().toString(),
      text: newOption.trim(),
      isCorrect: false,
      order: (newQuestion.options?.length || 0) + 1,
    };

    setNewQuestion((prev) => ({
      ...prev,
      options: [...(prev.options || []), option],
    }));

    setNewOption("");
  };

  const removeOption = (optionId: string) => {
    setNewQuestion((prev) => ({
      ...prev,
      options: prev.options?.filter((o) => o.id !== optionId) || [],
    }));
  };

  const toggleCorrectOption = (optionId: string) => {
    setNewQuestion((prev) => ({
      ...prev,
      options:
        prev.options?.map((o) =>
          o.id === optionId ? { ...o, isCorrect: !o.isCorrect } : o
        ) || [],
    }));
  };

  const getAssessmentTypeIcon = (type: string) => {
    const assessmentType = ASSESSMENT_TYPES.find((t) => t.value === type);
    return assessmentType ? assessmentType.icon : Target;
  };

  const getQuestionTypeIcon = (type: string) => {
    const questionType = QUESTION_TYPES.find((t) => t.value === type);
    return questionType ? questionType.icon : HelpCircle;
  };

  const calculateTotalPoints = () => {
    return newAssessment.questions.reduce(
      (total, question) => total + question.points,
      0
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Assessment Builder
          </h1>
          <p className="text-gray-600 mt-2">
            Create and manage quizzes, exams, and assignments
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Back to Dashboard
        </Button>
      </div>

      {/* Course Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Course</CardTitle>
          <CardDescription>
            Choose a course to manage its assessments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger>
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{course.title}</span>
                    <div className="flex items-center gap-2 ml-4">
                      <Badge variant="secondary">
                        {course._count.assessments} assessments
                      </Badge>
                      <Badge variant="outline">
                        {course._count.enrollments} students
                      </Badge>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedCourse && (
        <>
          {/* Assessments Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Target className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Assessments
                    </p>
                    <p className="text-2xl font-bold">{assessments.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Published
                    </p>
                    <p className="text-2xl font-bold">
                      {assessments.filter((a) => a.isPublished).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Avg Duration
                    </p>
                    <p className="text-2xl font-bold">
                      {assessments.length > 0
                        ? Math.round(
                            assessments.reduce(
                              (acc, a) => acc + a.duration,
                              0
                            ) / assessments.length
                          )
                        : 0}
                      m
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Award className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Points
                    </p>
                    <p className="text-2xl font-bold">
                      {assessments.reduce((acc, a) => acc + a.totalPoints, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Assessments List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Course Assessments</CardTitle>
                  <CardDescription>
                    Create and manage assessments for your course
                  </CardDescription>
                </div>
                <Dialog
                  open={showCreateDialog}
                  onOpenChange={setShowCreateDialog}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Assessment
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Assessment</DialogTitle>
                      <DialogDescription>
                        Build a comprehensive assessment with multiple question
                        types
                      </DialogDescription>
                    </DialogHeader>
                    {renderCreateAssessmentForm()}
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {assessments.map((assessment) => {
                  const IconComponent = getAssessmentTypeIcon(assessment.type);
                  return (
                    <div
                      key={assessment.id}
                      className="flex items-center gap-4 p-4 bg-white border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <IconComponent className="w-6 h-6 text-gray-600" />

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{assessment.title}</h3>
                          <Badge
                            variant={
                              assessment.isPublished ? "default" : "secondary"
                            }
                          >
                            {assessment.isPublished ? "Published" : "Draft"}
                          </Badge>
                          <Badge variant="outline">{assessment.type}</Badge>
                          {assessment.isTimed && (
                            <Badge
                              variant="outline"
                              className="text-orange-600"
                            >
                              <Timer className="w-3 h-3 mr-1" />
                              {assessment.duration}m
                            </Badge>
                          )}
                        </div>
                        {assessment.description && (
                          <p className="text-sm text-gray-600">
                            {assessment.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            {assessment.totalPoints} points
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            {assessment.passingScore}% passing
                          </span>
                          <span className="flex items-center gap-1">
                            <HelpCircle className="w-3 h-3" />
                            {assessment.questions.length} questions
                          </span>
                          {assessment._count && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {assessment._count.submissions} submissions
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTogglePublish(assessment)}
                        >
                          {assessment.isPublished ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingAssessment(assessment);
                            setShowEditDialog(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAssessment(assessment.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {assessments.length === 0 && (
                  <div className="text-center py-12">
                    <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No assessments yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Create your first assessment to test student knowledge
                    </p>
                    <Button onClick={() => setShowCreateDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Assessment
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Edit Assessment Dialog */}
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Assessment</DialogTitle>
                <DialogDescription>
                  Update assessment details and questions
                </DialogDescription>
              </DialogHeader>
              {editingAssessment && renderEditAssessmentForm()}
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );

  function renderCreateAssessmentForm() {
    return (
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Assessment Title *</Label>
                <Input
                  id="title"
                  value={newAssessment.title}
                  onChange={(e) =>
                    setNewAssessment((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Enter assessment title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Assessment Type</Label>
                <Select
                  value={newAssessment.type}
                  onValueChange={(value: any) =>
                    setNewAssessment((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSESSMENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="w-4 h-4" />
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-gray-500">
                              {type.description}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newAssessment.description}
                onChange={(e) =>
                  setNewAssessment((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe the assessment"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={newAssessment.duration}
                  onChange={(e) =>
                    setNewAssessment((prev) => ({
                      ...prev,
                      duration: parseInt(e.target.value) || 0,
                    }))
                  }
                  placeholder="30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalPoints">Total Points</Label>
                <Input
                  id="totalPoints"
                  type="number"
                  value={newAssessment.totalPoints}
                  onChange={(e) =>
                    setNewAssessment((prev) => ({
                      ...prev,
                      totalPoints: parseInt(e.target.value) || 0,
                    }))
                  }
                  placeholder="100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passingScore">Passing Score (%)</Label>
                <Input
                  id="passingScore"
                  type="number"
                  value={newAssessment.passingScore}
                  onChange={(e) =>
                    setNewAssessment((prev) => ({
                      ...prev,
                      passingScore: parseInt(e.target.value) || 0,
                    }))
                  }
                  placeholder="70"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="questions" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">
                  Questions ({newAssessment.questions.length})
                </h4>
                <div className="text-sm text-gray-500">
                  Total Points: {calculateTotalPoints()}
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-3">
                {newAssessment.questions.map((question, index) => {
                  const IconComponent = getQuestionTypeIcon(question.type);
                  return (
                    <div key={question.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-500">
                            #{index + 1}
                          </span>
                          <IconComponent className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-medium">
                            {question.type.replace("_", " ")}
                          </span>
                          <Badge variant="outline">{question.points} pts</Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuestion(question.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm">{question.question}</p>
                    </div>
                  );
                })}
              </div>

              {/* Add Question Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Add New Question</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="questionType">Question Type</Label>
                      <Select
                        value={newQuestion.type || "MULTIPLE_CHOICE"}
                        onValueChange={(value: any) => {
                          setNewQuestion((prev) => ({
                            ...prev,
                            type: value,
                            options:
                              value === "MULTIPLE_CHOICE" ||
                              value === "TRUE_FALSE" ||
                              value === "MATCHING" ||
                              value === "ORDERING"
                                ? Array.from(
                                    {
                                      length:
                                        QUESTION_TYPES.find(
                                          (t) => t.value === value
                                        )?.defaultOptions || 0,
                                    },
                                    (_, i) => ({
                                      id: `option-${i}`,
                                      text: `Option ${i + 1}`,
                                      isCorrect: i === 0,
                                      order: i + 1,
                                    })
                                  )
                                : [],
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {QUESTION_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <type.icon className="w-4 h-4" />
                                <div>
                                  <div className="font-medium">
                                    {type.label}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {type.description}
                                  </div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="questionPoints">Points</Label>
                      <Input
                        id="questionPoints"
                        type="number"
                        value={newQuestion.points || ""}
                        onChange={(e) =>
                          setNewQuestion((prev) => ({
                            ...prev,
                            points: parseInt(e.target.value) || 0,
                          }))
                        }
                        placeholder="10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="questionText">Question Text *</Label>
                    <Textarea
                      id="questionText"
                      value={newQuestion.question || ""}
                      onChange={(e) =>
                        setNewQuestion((prev) => ({
                          ...prev,
                          question: e.target.value,
                        }))
                      }
                      placeholder="Enter your question here..."
                      rows={3}
                    />
                  </div>

                  {/* Options for Multiple Choice, True/False, Matching, Ordering */}
                  {(newQuestion.type === "MULTIPLE_CHOICE" ||
                    newQuestion.type === "TRUE_FALSE" ||
                    newQuestion.type === "MATCHING" ||
                    newQuestion.type === "ORDERING") && (
                    <div className="space-y-3">
                      <Label>Options</Label>
                      <div className="space-y-2">
                        {newQuestion.options?.map((option, index) => (
                          <div
                            key={option.id}
                            className="flex items-center gap-2"
                          >
                            <Checkbox
                              checked={option.isCorrect}
                              onCheckedChange={() =>
                                toggleCorrectOption(option.id)
                              }
                            />
                            <Input
                              value={option.text}
                              onChange={(e) => {
                                setNewQuestion((prev) => ({
                                  ...prev,
                                  options:
                                    prev.options?.map((o) =>
                                      o.id === option.id
                                        ? { ...o, text: e.target.value }
                                        : o
                                    ) || [],
                                }));
                              }}
                              placeholder={`Option ${index + 1}`}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeOption(option.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={newOption}
                          onChange={(e) => setNewOption(e.target.value)}
                          placeholder="Add new option"
                          onKeyPress={(e) => e.key === "Enter" && addOption()}
                        />
                        <Button
                          onClick={addOption}
                          disabled={!newOption.trim()}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Correct Answer for Fill in Blank, Short Answer */}
                  {(newQuestion.type === "FILL_BLANK" ||
                    newQuestion.type === "SHORT_ANSWER") && (
                    <div className="space-y-2">
                      <Label htmlFor="correctAnswer">Correct Answer</Label>
                      <Input
                        id="correctAnswer"
                        value={(newQuestion.correctAnswer as string) || ""}
                        onChange={(e) =>
                          setNewQuestion((prev) => ({
                            ...prev,
                            correctAnswer: e.target.value,
                          }))
                        }
                        placeholder="Enter the correct answer"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="explanation">Explanation (Optional)</Label>
                    <Textarea
                      id="explanation"
                      value={newQuestion.explanation || ""}
                      onChange={(e) =>
                        setNewQuestion((prev) => ({
                          ...prev,
                          explanation: e.target.value,
                        }))
                      }
                      placeholder="Explain why this is the correct answer"
                      rows={2}
                    />
                  </div>

                  <Button
                    onClick={addQuestion}
                    disabled={!newQuestion.question?.trim()}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-3">Assessment Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="attempts">Number of Attempts</Label>
                    <Input
                      id="attempts"
                      type="number"
                      value={newAssessment.attempts}
                      onChange={(e) =>
                        setNewAssessment((prev) => ({
                          ...prev,
                          attempts: parseInt(e.target.value) || 1,
                        }))
                      }
                      placeholder="1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeLimit">
                      Time Limit per Question (seconds)
                    </Label>
                    <Input
                      id="timeLimit"
                      type="number"
                      value={newQuestion.timeLimit || ""}
                      onChange={(e) =>
                        setNewQuestion((prev) => ({
                          ...prev,
                          timeLimit: parseInt(e.target.value) || undefined,
                        }))
                      }
                      placeholder="Optional"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isTimed"
                    checked={newAssessment.isTimed}
                    onCheckedChange={(checked) =>
                      setNewAssessment((prev) => ({
                        ...prev,
                        isTimed: checked as boolean,
                      }))
                    }
                  />
                  <Label htmlFor="isTimed">Enable time limit</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allowReview"
                    checked={newAssessment.allowReview}
                    onCheckedChange={(checked) =>
                      setNewAssessment((prev) => ({
                        ...prev,
                        allowReview: checked as boolean,
                      }))
                    }
                  />
                  <Label htmlFor="allowReview">
                    Allow students to review after completion
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showCorrectAnswers"
                    checked={newAssessment.showCorrectAnswers}
                    onCheckedChange={(checked) =>
                      setNewAssessment((prev) => ({
                        ...prev,
                        showCorrectAnswers: checked as boolean,
                      }))
                    }
                  />
                  <Label htmlFor="showCorrectAnswers">
                    Show correct answers after completion
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="randomizeQuestions"
                    checked={newAssessment.randomizeQuestions}
                    onCheckedChange={(checked) =>
                      setNewAssessment((prev) => ({
                        ...prev,
                        randomizeQuestions: checked as boolean,
                      }))
                    }
                  />
                  <Label htmlFor="randomizeQuestions">
                    Randomize question order
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="randomizeOptions"
                    checked={newAssessment.randomizeOptions}
                    onCheckedChange={(checked) =>
                      setNewAssessment((prev) => ({
                        ...prev,
                        randomizeOptions: checked as boolean,
                      }))
                    }
                  />
                  <Label htmlFor="randomizeOptions">
                    Randomize option order
                  </Label>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateAssessment}
            disabled={
              !newAssessment.title.trim() ||
              newAssessment.questions.length === 0
            }
          >
            <Save className="w-4 h-4 mr-2" />
            Create Assessment
          </Button>
        </div>
      </div>
    );
  }

  function renderEditAssessmentForm() {
    if (!editingAssessment) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="editTitle">Assessment Title</Label>
            <Input
              id="editTitle"
              value={editingAssessment.title}
              onChange={(e) =>
                setEditingAssessment((prev) =>
                  prev ? { ...prev, title: e.target.value } : null
                )
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="editType">Assessment Type</Label>
            <Select
              value={editingAssessment.type}
              onValueChange={(value: any) =>
                setEditingAssessment((prev) =>
                  prev ? { ...prev, type: value } : null
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASSESSMENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="editDescription">Description</Label>
          <Textarea
            id="editDescription"
            value={editingAssessment.description}
            onChange={(e) =>
              setEditingAssessment((prev) =>
                prev ? { ...prev, description: e.target.value } : null
              )
            }
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="editDuration">Duration (minutes)</Label>
            <Input
              id="editDuration"
              type="number"
              value={editingAssessment.duration}
              onChange={(e) =>
                setEditingAssessment((prev) =>
                  prev
                    ? {
                        ...prev,
                        duration: parseInt(e.target.value) || 0,
                      }
                    : null
                )
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="editTotalPoints">Total Points</Label>
            <Input
              id="editTotalPoints"
              type="number"
              value={editingAssessment.totalPoints}
              onChange={(e) =>
                setEditingAssessment((prev) =>
                  prev
                    ? {
                        ...prev,
                        totalPoints: parseInt(e.target.value) || 0,
                      }
                    : null
                )
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="editPassingScore">Passing Score (%)</Label>
            <Input
              id="editPassingScore"
              type="number"
              value={editingAssessment.passingScore}
              onChange={(e) =>
                setEditingAssessment((prev) =>
                  prev
                    ? {
                        ...prev,
                        passingScore: parseInt(e.target.value) || 0,
                      }
                    : null
                )
              }
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setShowEditDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdateAssessment}>
            <Save className="w-4 h-4 mr-2" />
            Update Assessment
          </Button>
        </div>
      </div>
    );
  }
}
