"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { safeJsonParse } from "@/lib/api-utils";
import {
  Award,
  BookOpen,
  Target,
  MoreVertical,
  Users,
  Clock,
  DollarSign,
  LayoutGrid,
  List,
  Search,
  Filter,
  Plus,
  FileText,
  Copy,
  Trash2,
  Edit,
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  price: number;
  status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "PUBLISHED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
  _count: {
    applications: number;
    enrollments: number;
    lessons: number;
  };
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  type: "VIDEO" | "TEXT" | "QUIZ" | "ASSIGNMENT" | "LIVE_SESSION";
  duration: number;
  order: number;
  isPublished: boolean;
}

interface CourseTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  estimatedDuration: number;
  features: string[];
}

export default function CourseManagement() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [templates, setTemplates] = useState<CourseTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("my-courses");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // Course creation form state
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    category: "",
    duration: 0,
    price: 0,
    mode: ["ONLINE"],
    applicationFee: 0,
    prerequisites: [] as string[],
    learningObjectives: [] as string[],
  });

  // Template creation form state
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    category: "",
    estimatedDuration: 0,
    features: [] as string[],
  });

  useEffect(() => {
    fetchCourses();
    fetchTemplates();
  }, []);

  const fetchCourses = async () => {
    try {
      if (typeof window === "undefined") return;

      const response = await fetch("/api/instructor/courses", {
        credentials: "include",
      });
      const data = await safeJsonParse(response, {
        success: false,
        data: { courses: [] },
      });
      if (data.success) {
        setCourses(data.data.courses || []);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      if (typeof window === "undefined") return;

      const response = await fetch("/api/instructor/courses/templates", {
        credentials: "include",
      });
      const data = await safeJsonParse(response, {
        success: false,
        data: { courses: [] },
      });
      if (data.success) {
        setTemplates(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/instructor/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCourse),
        credentials: "include",
      });
      const data = await safeJsonParse(response, {
        success: false,
        data: { courses: [] },
      });
      if (data.success) {
        setCourses([data.data, ...courses]);
        setShowCreateForm(false);
        setNewCourse({
          title: "",
          description: "",
          category: "",
          duration: 0,
          price: 0,
          mode: ["ONLINE"],
          applicationFee: 0,
          prerequisites: [],
          learningObjectives: [],
        });
      }
    } catch (error) {
      console.error("Error creating course:", error);
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/instructor/courses/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTemplate),
        credentials: "include",
      });
      const data = await safeJsonParse(response, {
        success: false,
        data: { courses: [] },
      });
      if (data.success) {
        setTemplates([data.data, ...templates]);
        setShowTemplateForm(false);
        setNewTemplate({
          name: "",
          description: "",
          category: "",
          estimatedDuration: 0,
          features: [],
        });
      }
    } catch (error) {
      console.error("Error creating template:", error);
    }
  };

  const handleDuplicateCourse = async (courseId: string) => {
    try {
      const response = await fetch(
        `/api/instructor/courses/${courseId}/duplicate`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      const data = await safeJsonParse(response, {
        success: false,
        data: { courses: [] },
      });
      if (data.success) {
        setCourses([data.data, ...courses]);
      }
    } catch (error) {
      console.error("Error duplicating course:", error);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (confirm("Are you sure you want to delete this course?")) {
      try {
        const response = await fetch(`/api/instructor/courses/${courseId}`, {
          method: "DELETE",
          credentials: "include",
        });
        const data = await safeJsonParse(response, {
          success: false,
          data: { courses: [] },
        });
        if (data.success) {
          setCourses(courses.filter((course) => course.id !== courseId));
        }
      } catch (error) {
        console.error("Error deleting course:", error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-neutral-100 text-neutral-700 border-neutral-200";
      case "PENDING_APPROVAL":
        return "bg-warning-light text-warning border-warning/20";
      case "APPROVED":
        return "bg-success-light text-success border-success/20";
      case "PUBLISHED":
        return "bg-brand-primary/10 text-brand-primary border-brand-primary/20";
      case "REJECTED":
        return "bg-error-light text-error border-error/20";
      default:
        return "bg-neutral-100 text-neutral-700 border-neutral-200";
    }
  };

  const filteredCourses = (Array.isArray(courses) ? courses : []).filter(
    (course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "ALL" || course.status === statusFilter;
      const matchesCategory =
        categoryFilter === "ALL" || course.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    }
  );

  const uniqueCategories = Array.from(
    new Set(courses.map((c) => c.category))
  ).filter(Boolean);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-neutral-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-neutral-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-neutral-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-24 bg-neutral-200 rounded w-full mb-4"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-4 bg-neutral-200 rounded"></div>
                  <div className="h-4 bg-neutral-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">
            Course Management
          </h2>
          <p className="text-neutral-600">
            Create, manage, and track your courses
          </p>
        </div>
        <div className="flex space-x-2 w-full sm:w-auto">
          <Button
            onClick={() =>
              router.push("/dashboards/instructor/course-creation")
            }
            className="bg-brand-primary hover:bg-brand-primary/90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Course Wizard
          </Button>
          <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
            <DialogTrigger asChild>
              <Button variant="outline">Quick Create</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Course</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateCourse} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Course Title</Label>
                    <Input
                      id="title"
                      value={newCourse.title}
                      onChange={(e) =>
                        setNewCourse({ ...newCourse, title: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={newCourse.category}
                      onChange={(e) =>
                        setNewCourse({ ...newCourse, category: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newCourse.description}
                    onChange={(e) =>
                      setNewCourse({
                        ...newCourse,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="duration">Duration (weeks)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={newCourse.duration || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numValue = value === "" ? 0 : parseInt(value, 10);
                        setNewCourse({
                          ...newCourse,
                          duration: isNaN(numValue) ? 0 : numValue,
                        });
                      }}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Price (GH₵)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={newCourse.price || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numValue = value === "" ? 0 : parseFloat(value);
                        setNewCourse({
                          ...newCourse,
                          price: isNaN(numValue) ? 0 : numValue,
                        });
                      }}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="applicationFee">
                      Application Fee (GH₵)
                    </Label>
                    <Input
                      id="applicationFee"
                      type="number"
                      value={newCourse.applicationFee || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numValue = value === "" ? 0 : parseFloat(value);
                        setNewCourse({
                          ...newCourse,
                          applicationFee: isNaN(numValue) ? 0 : numValue,
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
                  <Button type="submit">Create Course</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <TabsList>
            <TabsTrigger value="my-courses">My Courses</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex border rounded-md overflow-hidden">
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-none ${
                  viewMode === "grid" ? "bg-neutral-100" : ""
                }`}
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-none ${
                  viewMode === "list" ? "bg-neutral-100" : ""
                }`}
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <TabsContent value="my-courses" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 p-4 bg-white border border-neutral-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-neutral-500" />
              <span className="text-sm font-medium text-neutral-700">
                Filters:
              </span>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PENDING_APPROVAL">
                  Pending Approval
                </SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                {uniqueCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(statusFilter !== "ALL" || categoryFilter !== "ALL") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStatusFilter("ALL");
                  setCategoryFilter("ALL");
                }}
                className="text-neutral-500 hover:text-neutral-900"
              >
                Clear Filters
              </Button>
            )}
          </div>

          {/* Course Grid/List */}
          {filteredCourses.length === 0 ? (
            <div className="text-center py-12 bg-white border border-neutral-200 rounded-lg border-dashed">
              <BookOpen className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900">
                No courses found
              </h3>
              <p className="text-neutral-500 mt-1">
                Try adjusting your search or filters, or create a new course.
              </p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="mt-4 bg-brand-primary text-white"
              >
                Create New Course
              </Button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <Card
                  key={course.id}
                  className="group hover:shadow-lg transition-all duration-200 border-neutral-200 flex flex-col"
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <Badge className={getStatusColor(course.status)}>
                        {course.status.replace("_", " ")}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 -mr-2 text-neutral-400 hover:text-neutral-900"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(
                                `/dashboards/instructor/courses/${course.id}/edit`
                              )
                            }
                          >
                            <Edit className="mr-2 h-4 w-4" /> Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDuplicateCourse(course.id)}
                          >
                            <Copy className="mr-2 h-4 w-4" /> Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-error focus:text-error"
                            onClick={() => handleDeleteCourse(course.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardTitle className="text-lg font-bold mt-2 line-clamp-1 group-hover:text-brand-primary transition-colors">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-1">
                      {course.category}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 pb-3">
                    <p className="text-sm text-neutral-600 line-clamp-2 mb-4 h-10">
                      {course.description}
                    </p>

                    <div className="grid grid-cols-2 gap-y-2 text-sm text-neutral-600">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-neutral-400" />
                        {course.duration} weeks
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2 text-neutral-400" />
                        {course._count.enrollments} students
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-2 text-neutral-400" />
                        {course._count.lessons} lessons
                      </div>
                      <div className="flex items-center font-medium text-neutral-900">
                        <DollarSign className="w-4 h-4 mr-2 text-neutral-400" />
                        GH₵ {course.price.toLocaleString()}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-3 border-t border-neutral-100 bg-neutral-50/50 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={() =>
                        router.push(
                          `/dashboards/instructor/lesson-management?course=${course.id}`
                        )
                      }
                    >
                      Manage Content
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={() =>
                        router.push(
                          `/dashboards/instructor/gradebook?course=${course.id}`
                        )
                      }
                    >
                      Gradebook
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCourses.map((course) => (
                <Card
                  key={course.id}
                  className="hover:shadow-md transition-all duration-200 border-neutral-200"
                >
                  <div className="flex flex-col sm:flex-row">
                    <div className="flex-1 p-6">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold text-neutral-900 group-hover:text-brand-primary transition-colors">
                              {course.title}
                            </h3>
                            <Badge className={getStatusColor(course.status)}>
                              {course.status.replace("_", " ")}
                            </Badge>
                          </div>
                          <p className="text-sm text-neutral-500">
                            {course.category}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-neutral-900">
                            GH₵ {course.price.toLocaleString()}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {course.duration} weeks
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-neutral-600 line-clamp-2 mb-4">
                        {course.description}
                      </p>
                      <div className="flex items-center gap-6 text-sm text-neutral-600">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2 text-neutral-400" />
                          {course._count.enrollments} Students
                        </div>
                        <div className="flex items-center">
                          <BookOpen className="w-4 h-4 mr-2 text-neutral-400" />
                          {course._count.lessons} Lessons
                        </div>
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 mr-2 text-neutral-400" />
                          {course._count.applications} Applications
                        </div>
                      </div>
                    </div>
                    <div className="bg-neutral-50 border-t sm:border-t-0 sm:border-l border-neutral-200 p-4 flex sm:flex-col justify-center gap-2 min-w-[160px]">
                      <Button
                        size="sm"
                        className="w-full bg-brand-primary text-white"
                        onClick={() =>
                          router.push(
                            `/dashboards/instructor/lesson-management?course=${course.id}`
                          )
                        }
                      >
                        Manage Content
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() =>
                          router.push(
                            `/dashboards/instructor/gradebook?course=${course.id}`
                          )
                        }
                      >
                        Gradebook
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="w-full text-neutral-600"
                          >
                            More Actions
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(
                                `/dashboards/instructor/courses/${course.id}/edit`
                              )
                            }
                          >
                            <Edit className="mr-2 h-4 w-4" /> Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDuplicateCourse(course.id)}
                          >
                            <Copy className="mr-2 h-4 w-4" /> Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-error focus:text-error"
                            onClick={() => handleDeleteCourse(course.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-end mb-4">
            <Dialog open={showTemplateForm} onOpenChange={setShowTemplateForm}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" /> Create Template
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Course Template</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateTemplate} className="space-y-4">
                  <div>
                    <Label htmlFor="templateName">Template Name</Label>
                    <Input
                      id="templateName"
                      value={newTemplate.name}
                      onChange={(e) =>
                        setNewTemplate({ ...newTemplate, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="templateDescription">Description</Label>
                    <Textarea
                      id="templateDescription"
                      value={newTemplate.description}
                      onChange={(e) =>
                        setNewTemplate({
                          ...newTemplate,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="templateCategory">Category</Label>
                      <Input
                        id="templateCategory"
                        value={newTemplate.category}
                        onChange={(e) =>
                          setNewTemplate({
                            ...newTemplate,
                            category: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="estimatedDuration">
                        Estimated Duration (weeks)
                      </Label>
                      <Input
                        id="estimatedDuration"
                        type="number"
                        value={newTemplate.estimatedDuration || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          const numValue =
                            value === "" ? 0 : parseInt(value, 10);
                          setNewTemplate({
                            ...newTemplate,
                            estimatedDuration: isNaN(numValue) ? 0 : numValue,
                          });
                        }}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowTemplateForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Create Template</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card
                key={template.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.category}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-neutral-600">
                    {template.description}
                  </p>

                  <div className="text-sm">
                    <span className="font-medium">Duration:</span>{" "}
                    {template.estimatedDuration} weeks
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-medium">Features:</span>
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(template.features) &&
                        template.features.map((feature, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {feature}
                          </Badge>
                        ))}
                    </div>
                  </div>

                  <Button size="sm" className="w-full">
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
