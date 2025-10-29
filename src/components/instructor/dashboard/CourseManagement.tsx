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
import { makeAuthenticatedRequest } from "@/lib/token-utils";
import { safeJsonParse } from "@/lib/api-utils";
import { useRouter } from "next/navigation";
import { Award, BookOpen, Target } from "lucide-react";

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
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Course creation form
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

  // Template creation form
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
      // Check if we're on the client side
      if (typeof window === "undefined") {
        return;
      }

      const response = await makeAuthenticatedRequest(
        "/api/instructor/courses"
      );
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
      // Check if we're on the client side
      if (typeof window === "undefined") {
        return;
      }

      const response = await makeAuthenticatedRequest(
        "/api/instructor/templates"
      );
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
      const response = await makeAuthenticatedRequest(
        "/api/instructor/courses",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newCourse),
        }
      );
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
      const response = await makeAuthenticatedRequest(
        "/api/instructor/templates",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newTemplate),
        }
      );
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
      const response = await makeAuthenticatedRequest(
        `/api/instructor/courses/${courseId}/duplicate`,
        {
          method: "POST",
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
        const response = await makeAuthenticatedRequest(
          `/api/instructor/courses/${courseId}`,
          {
            method: "DELETE",
          }
        );
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
        return "bg-gray-100 text-gray-800";
      case "PENDING_APPROVAL":
        return "bg-yellow-100 text-yellow-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "PUBLISHED":
        return "bg-blue-100 text-blue-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredCourses = (Array.isArray(courses) ? courses : []).filter(
    (course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "ALL" || course.status === statusFilter;
      return matchesSearch && matchesStatus;
    }
  );

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
        <h2 className="text-2xl font-bold">Course Management</h2>
        <div className="flex space-x-2">
          <Button
            onClick={() =>
              router.push("/dashboards/instructor/course-creation")
            }
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
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
          <Dialog open={showTemplateForm} onOpenChange={setShowTemplateForm}>
            <DialogTrigger asChild>
              <Button variant="outline">Create Template</Button>
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
                        const numValue = value === "" ? 0 : parseInt(value, 10);
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
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="my-courses">My Courses</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="my-courses" className="space-y-4">
          <div className="flex space-x-4">
            <Input
              placeholder="Search courses..."
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
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PENDING_APPROVAL">
                  Pending Approval
                </SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCourses.map((course) => (
              <Card
                key={course.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <CardDescription>{course.category}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(course.status)}>
                      {course.status.replace("_", " ")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {course.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Duration:</span>{" "}
                      {course.duration} weeks
                    </div>
                    <div>
                      <span className="font-medium">Price:</span> GH₵
                      {course.price.toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Students:</span>{" "}
                      {course._count.enrollments}
                    </div>
                    <div>
                      <span className="font-medium">Lessons:</span>{" "}
                      {course._count.lessons}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        router.push(
                          `/dashboards/instructor/lesson-management?course=${course.id}`
                        )
                      }
                      className="flex-1"
                    >
                      <BookOpen className="w-4 h-4 mr-1" />
                      Lessons
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        router.push(
                          `/dashboards/instructor/assessment-builder?course=${course.id}`
                        )
                      }
                      className="flex-1"
                    >
                      <Target className="w-4 h-4 mr-1" />
                      Assessments
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        router.push(
                          `/dashboards/instructor/gradebook?course=${course.id}`
                        )
                      }
                      className="flex-1"
                    >
                      <Award className="w-4 h-4 mr-1" />
                      Gradebook
                    </Button>
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDuplicateCourse(course.id)}
                    >
                      Duplicate
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteCourse(course.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
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
                  <p className="text-sm text-muted-foreground">
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
