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
  Download,
  Upload,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Calculator,
  Award,
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  Target,
  FileText,
  CheckCircle,
  AlertCircle,
  Info,
  BarChart3,
  PieChart,
  LineChart,
  Save,
  X,
  Star,
  Clock,
  Calendar,
  MessageSquare,
  Send,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

interface Grade {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  assessmentId: string;
  assessmentTitle: string;
  courseId: string;
  courseTitle: string;
  score: number;
  maxScore: number;
  percentage: number;
  letterGrade: string;
  status: "GRADED" | "PENDING" | "INCOMPLETE" | "EXEMPT";
  feedback: string;
  gradedBy: string;
  gradedAt: string;
  submittedAt: string;
  attempts: number;
  timeSpent: number; // in minutes
  rubricScores?: RubricScore[];
}

interface RubricScore {
  id: string;
  criterion: string;
  description: string;
  points: number;
  maxPoints: number;
  feedback: string;
}

interface Assessment {
  id: string;
  title: string;
  type: "QUIZ" | "EXAM" | "ASSIGNMENT" | "PROJECT";
  totalPoints: number;
  passingScore: number;
  courseId: string;
  courseTitle: string;
  dueDate: string;
  isPublished: boolean;
  _count: {
    submissions: number;
    graded: number;
  };
}

interface Course {
  id: string;
  title: string;
  description: string;
  _count: {
    students: number;
    assessments: number;
  };
}

interface GradingRubric {
  id: string;
  name: string;
  description: string;
  criteria: RubricCriterion[];
  totalPoints: number;
  courseId: string;
  createdAt: string;
}

interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  maxPoints: number;
  levels: RubricLevel[];
}

interface RubricLevel {
  id: string;
  name: string;
  description: string;
  points: number;
}

const GRADE_SCALE = [
  { letter: "A+", min: 97, max: 100, color: "text-green-600" },
  { letter: "A", min: 93, max: 96, color: "text-green-600" },
  { letter: "A-", min: 90, max: 92, color: "text-green-500" },
  { letter: "B+", min: 87, max: 89, color: "text-blue-600" },
  { letter: "B", min: 83, max: 86, color: "text-blue-600" },
  { letter: "B-", min: 80, max: 82, color: "text-blue-500" },
  { letter: "C+", min: 77, max: 79, color: "text-yellow-600" },
  { letter: "C", min: 73, max: 76, color: "text-yellow-600" },
  { letter: "C-", min: 70, max: 72, color: "text-yellow-500" },
  { letter: "D+", min: 67, max: 69, color: "text-orange-600" },
  { letter: "D", min: 63, max: 66, color: "text-orange-600" },
  { letter: "D-", min: 60, max: 62, color: "text-orange-500" },
  { letter: "F", min: 0, max: 59, color: "text-red-600" },
];

export default function GradebookSystem() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [rubrics, setRubrics] = useState<GradingRubric[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showGradeDialog, setShowGradeDialog] = useState(false);
  const [showRubricDialog, setShowRubricDialog] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [editingRubric, setEditingRubric] = useState<GradingRubric | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState("studentName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [newGrade, setNewGrade] = useState({
    studentId: "",
    assessmentId: "",
    score: 0,
    maxScore: 100,
    feedback: "",
    rubricScores: [] as RubricScore[],
  });

  const [newRubric, setNewRubric] = useState({
    name: "",
    description: "",
    criteria: [] as RubricCriterion[],
  });

  const [newCriterion, setNewCriterion] = useState({
    name: "",
    description: "",
    maxPoints: 10,
    levels: [] as RubricLevel[],
  });

  const [newLevel, setNewLevel] = useState({
    name: "",
    description: "",
    points: 0,
  });

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
      fetchGrades(selectedCourse);
      fetchRubrics(selectedCourse);
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      if (typeof window === "undefined") return;

      const response = await fetch(
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

      const response = await fetch(
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

  const fetchGrades = async (courseId: string) => {
    try {
      if (typeof window === "undefined") return;

      const response = await fetch(
        `/api/instructor/courses/${courseId}/grades`
      );
      if (response.ok) {
        const data = await response.json();
        setGrades(Array.isArray(data) ? data : data.data || []);
      }
    } catch (error) {
      console.error("Error fetching grades:", error);
    }
  };

  const fetchRubrics = async (courseId: string) => {
    try {
      if (typeof window === "undefined") return;

      const response = await fetch(
        `/api/instructor/courses/${courseId}/rubrics`
      );
      if (response.ok) {
        const data = await response.json();
        setRubrics(Array.isArray(data) ? data : data.data || []);
      }
    } catch (error) {
      console.error("Error fetching rubrics:", error);
    }
  };

  const handleGradeSubmission = async () => {
    if (!newGrade.studentId || !newGrade.assessmentId) return;

    try {
      const response = await fetch(
        `/api/instructor/grades`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...newGrade,
            percentage: (newGrade.score / newGrade.maxScore) * 100,
            letterGrade: calculateLetterGrade(
              (newGrade.score / newGrade.maxScore) * 100
            ),
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setGrades((prev) => [...prev, data.data]);
        setShowGradeDialog(false);
        resetNewGrade();
      }
    } catch (error) {
      console.error("Error submitting grade:", error);
    }
  };

  const handleUpdateGrade = async () => {
    if (!editingGrade) return;

    try {
      const response = await fetch(
        `/api/instructor/grades/${editingGrade.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editingGrade),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setGrades((prev) =>
          prev.map((grade) =>
            grade.id === editingGrade.id ? data.data : grade
          )
        );
        setShowGradeDialog(false);
        setEditingGrade(null);
      }
    } catch (error) {
      console.error("Error updating grade:", error);
    }
  };

  const handleCreateRubric = async () => {
    if (!newRubric.name.trim() || newRubric.criteria.length === 0) return;

    try {
      const totalPoints = newRubric.criteria.reduce(
        (sum, criterion) => sum + criterion.maxPoints,
        0
      );

      const response = await fetch(
        `/api/instructor/rubrics`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...newRubric,
            totalPoints,
            courseId: selectedCourse,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRubrics((prev) => [...prev, data.data]);
        setShowRubricDialog(false);
        resetNewRubric();
      }
    } catch (error) {
      console.error("Error creating rubric:", error);
    }
  };

  const calculateLetterGrade = (percentage: number): string => {
    const grade = GRADE_SCALE.find(
      (g) => percentage >= g.min && percentage <= g.max
    );
    return grade ? grade.letter : "F";
  };

  const getGradeColor = (percentage: number): string => {
    const grade = GRADE_SCALE.find(
      (g) => percentage >= g.min && percentage <= g.max
    );
    return grade ? grade.color : "text-red-600";
  };

  const getGradeStats = () => {
    if (grades.length === 0) return null;

    const totalGrades = grades.length;
    const averageScore =
      grades.reduce((sum, g) => sum + g.percentage, 0) / totalGrades;
    const passingGrades = grades.filter((g) => g.percentage >= 70).length;
    const failingGrades = grades.filter((g) => g.percentage < 70).length;

    return {
      totalGrades,
      averageScore: Math.round(averageScore),
      passingGrades,
      failingGrades,
      passRate: Math.round((passingGrades / totalGrades) * 100),
    };
  };

  const getGradeDistribution = () => {
    const distribution = GRADE_SCALE.map((grade) => ({
      ...grade,
      count: grades.filter(
        (g) => g.percentage >= grade.min && g.percentage <= grade.max
      ).length,
    }));

    return distribution;
  };

  const filteredGrades = grades
    .filter((grade) => {
      const matchesSearch =
        grade.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grade.assessmentTitle.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        filterStatus === "ALL" || grade.status === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy as keyof Grade];
      let bValue: any = b[sortBy as keyof Grade];

      if (sortBy === "studentName") {
        aValue = a.studentName;
        bValue = b.studentName;
      } else if (sortBy === "percentage") {
        aValue = a.percentage;
        bValue = b.percentage;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const resetNewGrade = () => {
    setNewGrade({
      studentId: "",
      assessmentId: "",
      score: 0,
      maxScore: 100,
      feedback: "",
      rubricScores: [],
    });
  };

  const resetNewRubric = () => {
    setNewRubric({
      name: "",
      description: "",
      criteria: [],
    });
  };

  const addCriterion = () => {
    if (!newCriterion.name.trim()) return;

    const criterion: RubricCriterion = {
      id: Date.now().toString(),
      name: newCriterion.name.trim(),
      description: newCriterion.description.trim(),
      maxPoints: newCriterion.maxPoints,
      levels: newCriterion.levels,
    };

    setNewRubric((prev) => ({
      ...prev,
      criteria: [...prev.criteria, criterion],
    }));

    setNewCriterion({
      name: "",
      description: "",
      maxPoints: 10,
      levels: [],
    });
  };

  const addLevel = () => {
    if (!newLevel.name.trim()) return;

    const level: RubricLevel = {
      id: Date.now().toString(),
      name: newLevel.name.trim(),
      description: newLevel.description.trim(),
      points: newLevel.points,
    };

    setNewCriterion((prev) => ({
      ...prev,
      levels: [...prev.levels, level],
    }));

    setNewLevel({
      name: "",
      description: "",
      points: 0,
    });
  };

  const removeCriterion = (criterionId: string) => {
    setNewRubric((prev) => ({
      ...prev,
      criteria: prev.criteria.filter((c) => c.id !== criterionId),
    }));
  };

  const removeLevel = (levelId: string) => {
    setNewCriterion((prev) => ({
      ...prev,
      levels: prev.levels.filter((l) => l.id !== levelId),
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = getGradeStats();
  const distribution = getGradeDistribution();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gradebook System</h1>
          <p className="text-gray-600 mt-2">
            Manage grades, rubrics, and student performance
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
            Choose a course to manage its gradebook
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
                        {course._count.students} students
                      </Badge>
                      <Badge variant="outline">
                        {course._count.assessments} assessments
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
          {/* Gradebook Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Calculator className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Grades
                    </p>
                    <p className="text-2xl font-bold">
                      {stats?.totalGrades || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Average Score
                    </p>
                    <p className="text-2xl font-bold">
                      {stats?.averageScore || 0}%
                    </p>
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
                      Passing Rate
                    </p>
                    <p className="text-2xl font-bold">
                      {stats?.passRate || 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Failing Grades
                    </p>
                    <p className="text-2xl font-bold">
                      {stats?.failingGrades || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="grades">Grades</TabsTrigger>
              <TabsTrigger value="rubrics">Rubrics</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Grade Distribution Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="w-5 h-5" />
                      Grade Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {distribution.map((grade) => (
                        <div
                          key={grade.letter}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                grade.count > 0 ? "bg-blue-500" : "bg-gray-200"
                              }`}
                            />
                            <span className="text-sm font-medium">
                              {grade.letter}
                            </span>
                          </div>
                          <span className="text-sm text-gray-600">
                            {grade.count} (
                            {Math.round((grade.count / grades.length) * 100)}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Grades */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Recent Grades
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {grades.slice(0, 5).map((grade) => (
                        <div
                          key={grade.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-sm">
                              {grade.studentName}
                            </p>
                            <p className="text-xs text-gray-600">
                              {grade.assessmentTitle}
                            </p>
                          </div>
                          <div className="text-right">
                            <p
                              className={`font-bold ${getGradeColor(
                                grade.percentage
                              )}`}
                            >
                              {grade.percentage.toFixed(1)}%
                            </p>
                            <p className="text-xs text-gray-600">
                              {grade.letterGrade}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="grades" className="space-y-6">
              {/* Grades Management */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Grades Management</CardTitle>
                      <CardDescription>
                        View and manage student grades
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowGradeDialog(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Grade
                      </Button>
                      <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Filters and Search */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search students or assessments..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select
                      value={filterStatus}
                      onValueChange={setFilterStatus}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Status</SelectItem>
                        <SelectItem value="GRADED">Graded</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="INCOMPLETE">Incomplete</SelectItem>
                        <SelectItem value="EXEMPT">Exempt</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="studentName">Student</SelectItem>
                        <SelectItem value="percentage">Score</SelectItem>
                        <SelectItem value="submittedAt">Date</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                      }
                    >
                      {sortOrder === "asc" ? (
                        <SortAsc className="w-4 h-4" />
                      ) : (
                        <SortDesc className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  {/* Grades Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3">Student</th>
                          <th className="text-left p-3">Assessment</th>
                          <th className="text-left p-3">Score</th>
                          <th className="text-left p-3">Grade</th>
                          <th className="text-left p-3">Status</th>
                          <th className="text-left p-3">Date</th>
                          <th className="text-left p-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredGrades.map((grade) => (
                          <tr
                            key={grade.id}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="p-3">
                              <div>
                                <p className="font-medium">
                                  {grade.studentName}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {grade.studentEmail}
                                </p>
                              </div>
                            </td>
                            <td className="p-3">
                              <div>
                                <p className="font-medium">
                                  {grade.assessmentTitle}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {grade.courseTitle}
                                </p>
                              </div>
                            </td>
                            <td className="p-3">
                              <div>
                                <p className="font-medium">
                                  {grade.score}/{grade.maxScore}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {grade.attempts} attempts
                                </p>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="text-center">
                                <p
                                  className={`font-bold text-lg ${getGradeColor(
                                    grade.percentage
                                  )}`}
                                >
                                  {grade.percentage.toFixed(1)}%
                                </p>
                                <p
                                  className={`text-sm font-medium ${getGradeColor(
                                    grade.percentage
                                  )}`}
                                >
                                  {grade.letterGrade}
                                </p>
                              </div>
                            </td>
                            <td className="p-3">
                              <Badge
                                variant={
                                  grade.status === "GRADED"
                                    ? "default"
                                    : grade.status === "PENDING"
                                    ? "secondary"
                                    : "destructive"
                                }
                              >
                                {grade.status}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <div>
                                <p className="text-sm">
                                  {new Date(
                                    grade.gradedAt
                                  ).toLocaleDateString()}
                                </p>
                                <p className="text-xs text-gray-600">
                                  by {grade.gradedBy}
                                </p>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingGrade(grade);
                                    setShowGradeDialog(true);
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    // View feedback
                                  }}
                                >
                                  <MessageSquare className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rubrics" className="space-y-6">
              {/* Rubrics Management */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Grading Rubrics</CardTitle>
                      <CardDescription>
                        Create and manage grading rubrics
                      </CardDescription>
                    </div>
                    <Button onClick={() => setShowRubricDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Rubric
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rubrics.map((rubric) => (
                      <Card
                        key={rubric.id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardHeader>
                          <CardTitle className="text-lg">
                            {rubric.name}
                          </CardTitle>
                          <CardDescription>
                            {rubric.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">
                                Criteria:
                              </span>
                              <span className="font-medium">
                                {rubric.criteria.length}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">
                                Total Points:
                              </span>
                              <span className="font-medium">
                                {rubric.totalPoints}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">
                                Created:
                              </span>
                              <span className="text-sm">
                                {new Date(
                                  rubric.createdAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              {/* Analytics Dashboard */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Performance Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      Performance chart would go here
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LineChart className="w-5 h-5" />
                      Grade Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      Distribution chart would go here
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Grade Dialog */}
          <Dialog open={showGradeDialog} onOpenChange={setShowGradeDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingGrade ? "Edit Grade" : "Add New Grade"}
                </DialogTitle>
                <DialogDescription>
                  {editingGrade
                    ? "Update the student's grade and feedback"
                    : "Enter grade information for a student"}
                </DialogDescription>
              </DialogHeader>
              {renderGradeForm()}
            </DialogContent>
          </Dialog>

          {/* Rubric Dialog */}
          <Dialog open={showRubricDialog} onOpenChange={setShowRubricDialog}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Grading Rubric</DialogTitle>
                <DialogDescription>
                  Define criteria and performance levels for assessment grading
                </DialogDescription>
              </DialogHeader>
              {renderRubricForm()}
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );

  function renderGradeForm() {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="student">Student</Label>
            <Select
              value={editingGrade?.studentId || newGrade.studentId}
              onValueChange={(value) => {
                if (editingGrade) {
                  setEditingGrade({ ...editingGrade, studentId: value });
                } else {
                  setNewGrade({ ...newGrade, studentId: value });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select student" />
              </SelectTrigger>
              <SelectContent>
                {/* Student options would be populated from API */}
                <SelectItem value="student1">John Doe</SelectItem>
                <SelectItem value="student2">Jane Smith</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assessment">Assessment</Label>
            <Select
              value={editingGrade?.assessmentId || newGrade.assessmentId}
              onValueChange={(value) => {
                if (editingGrade) {
                  setEditingGrade({ ...editingGrade, assessmentId: value });
                } else {
                  setNewGrade({ ...newGrade, assessmentId: value });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select assessment" />
              </SelectTrigger>
              <SelectContent>
                {assessments.map((assessment) => (
                  <SelectItem key={assessment.id} value={assessment.id}>
                    {assessment.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="score">Score</Label>
            <Input
              id="score"
              type="number"
              value={editingGrade?.score || newGrade.score}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                if (editingGrade) {
                  setEditingGrade({ ...editingGrade, score: value });
                } else {
                  setNewGrade({ ...newGrade, score: value });
                }
              }}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxScore">Max Score</Label>
            <Input
              id="maxScore"
              type="number"
              value={editingGrade?.maxScore || newGrade.maxScore}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                if (editingGrade) {
                  setEditingGrade({ ...editingGrade, maxScore: value });
                } else {
                  setNewGrade({ ...newGrade, maxScore: value });
                }
              }}
              placeholder="100"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="feedback">Feedback</Label>
          <Textarea
            id="feedback"
            value={editingGrade?.feedback || newGrade.feedback}
            onChange={(e) => {
              if (editingGrade) {
                setEditingGrade({ ...editingGrade, feedback: e.target.value });
              } else {
                setNewGrade({ ...newGrade, feedback: e.target.value });
              }
            }}
            placeholder="Provide feedback to the student..."
            rows={4}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setShowGradeDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={editingGrade ? handleUpdateGrade : handleGradeSubmission}
          >
            <Save className="w-4 h-4 mr-2" />
            {editingGrade ? "Update Grade" : "Submit Grade"}
          </Button>
        </div>
      </div>
    );
  }

  function renderRubricForm() {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rubricName">Rubric Name</Label>
            <Input
              id="rubricName"
              value={newRubric.name}
              onChange={(e) =>
                setNewRubric({ ...newRubric, name: e.target.value })
              }
              placeholder="Enter rubric name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rubricDescription">Description</Label>
            <Textarea
              id="rubricDescription"
              value={newRubric.description}
              onChange={(e) =>
                setNewRubric({ ...newRubric, description: e.target.value })
              }
              placeholder="Describe the rubric purpose and usage"
              rows={3}
            />
          </div>
        </div>

        {/* Criteria */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Rubric Criteria</h4>
            <span className="text-sm text-gray-500">
              {newRubric.criteria.length} criteria
            </span>
          </div>

          <div className="space-y-3">
            {newRubric.criteria.map((criterion, index) => (
              <Card key={criterion.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {index + 1}. {criterion.name}
                      </CardTitle>
                      <CardDescription>{criterion.description}</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCriterion(criterion.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Max Points:</span>
                      <span className="font-medium">{criterion.maxPoints}</span>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm font-medium">
                        Performance Levels:
                      </span>
                      {criterion.levels.map((level) => (
                        <div
                          key={level.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <div>
                            <p className="text-sm font-medium">{level.name}</p>
                            <p className="text-xs text-gray-600">
                              {level.description}
                            </p>
                          </div>
                          <span className="text-sm font-medium">
                            {level.points} pts
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add Criterion Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add New Criterion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="criterionName">Criterion Name</Label>
                  <Input
                    id="criterionName"
                    value={newCriterion.name}
                    onChange={(e) =>
                      setNewCriterion({ ...newCriterion, name: e.target.value })
                    }
                    placeholder="Enter criterion name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxPoints">Max Points</Label>
                  <Input
                    id="maxPoints"
                    type="number"
                    value={newCriterion.maxPoints}
                    onChange={(e) =>
                      setNewCriterion({
                        ...newCriterion,
                        maxPoints: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="criterionDescription">Description</Label>
                <Textarea
                  id="criterionDescription"
                  value={newCriterion.description}
                  onChange={(e) =>
                    setNewCriterion({
                      ...newCriterion,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe what this criterion measures"
                  rows={2}
                />
              </div>

              {/* Performance Levels */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Performance Levels</Label>
                  <span className="text-sm text-gray-500">
                    {newCriterion.levels.length} levels
                  </span>
                </div>

                <div className="space-y-2">
                  {newCriterion.levels.map((level) => (
                    <div
                      key={level.id}
                      className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">{level.name}</p>
                        <p className="text-xs text-gray-600">
                          {level.description}
                        </p>
                      </div>
                      <span className="text-sm font-medium">
                        {level.points} pts
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLevel(level.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Add Level Form */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Input
                    value={newLevel.name}
                    onChange={(e) =>
                      setNewLevel({ ...newLevel, name: e.target.value })
                    }
                    placeholder="Level name"
                  />
                  <Input
                    value={newLevel.description}
                    onChange={(e) =>
                      setNewLevel({ ...newLevel, description: e.target.value })
                    }
                    placeholder="Description"
                  />
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={newLevel.points}
                      onChange={(e) =>
                        setNewLevel({
                          ...newLevel,
                          points: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="Points"
                    />
                    <Button onClick={addLevel} disabled={!newLevel.name.trim()}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <Button
                onClick={addCriterion}
                disabled={
                  !newCriterion.name.trim() || newCriterion.levels.length === 0
                }
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Criterion
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setShowRubricDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateRubric}
            disabled={!newRubric.name.trim() || newRubric.criteria.length === 0}
          >
            <Save className="w-4 h-4 mr-2" />
            Create Rubric
          </Button>
        </div>
      </div>
    );
  }
}
