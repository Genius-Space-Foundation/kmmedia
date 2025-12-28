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
  Video,
  Image,
  Link,
  Upload,
  Save,
  X,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  Info,
  BookOpen,
  Target,
  Users,
  Calendar,
  BarChart3,
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  description: string;
  type: "VIDEO" | "TEXT" | "QUIZ" | "ASSIGNMENT" | "LIVE_SESSION";
  duration: number; // in minutes
  order: number;
  isRequired: boolean;
  isPublished: boolean;
  content: string;
  resources: LessonResource[];
  objectives: string[];
  prerequisites: string[];
  createdAt: string;
  updatedAt: string;
  courseId: string;
  _count?: {
    completions: number;
    submissions: number;
  };
}

interface LessonResource {
  id: string;
  name: string;
  type: "VIDEO" | "DOCUMENT" | "IMAGE" | "LINK" | "AUDIO";
  url: string;
  size?: number;
  description: string;
  order: number;
}

interface Course {
  id: string;
  title: string;
  description: string;
  status: string;
  _count: {
    lessons: number;
    enrollments: number;
  };
}

const LESSON_TYPES = [
  {
    value: "VIDEO",
    label: "Video Lesson",
    icon: Video,
    description: "Educational video content",
  },
  {
    value: "TEXT",
    label: "Text Lesson",
    icon: BookOpen,
    description: "Educational text content",
  },
  {
    value: "ASSIGNMENT",
    label: "Assignment",
    icon: FileText,
    description: "Student work to be graded",
  },
  { value: "QUIZ", label: "Quiz", icon: Target, description: "Assessment" },
  {
    value: "LIVE_SESSION",
    label: "Live Session",
    icon: Users,
    description: "Real-time interactive session",
  },
];

const RESOURCE_TYPES = [
  { value: "VIDEO", label: "Video", icon: Video },
  { value: "DOCUMENT", label: "Document", icon: FileText },
  { value: "IMAGE", label: "Image", icon: Image },
  { value: "LINK", label: "Link", icon: Link },
  { value: "AUDIO", label: "Audio", icon: Play },
];

export default function LessonManagement() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [draggedLesson, setDraggedLesson] = useState<string | null>(null);

  const [newLesson, setNewLesson] = useState({
    title: "",
    description: "",
    type: "VIDEO" as const,
    duration: 30,
    isRequired: true,
    content: "",
    objectives: [] as string[],
    prerequisites: [] as string[],
    resources: [] as LessonResource[],
  });

  const [newObjective, setNewObjective] = useState("");
  const [newPrerequisite, setNewPrerequisite] = useState("");
  const [newResource, setNewResource] = useState({
    name: "",
    type: "VIDEO" as const,
    url: "",
    description: "",
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
      fetchLessons(selectedCourse);
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
        setCourses(
          Array.isArray(data)
            ? data
            : Array.isArray(data.data)
            ? data.data
            : data.data?.courses || []
        );
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async (courseId: string) => {
    try {
      if (typeof window === "undefined") return;

      const response = await fetch(
        `/api/instructor/courses/${courseId}/lessons`
      );
      if (response.ok) {
        const data = await response.json();
        setLessons(Array.isArray(data) ? data : data.data || []);
      }
    } catch (error) {
      console.error("Error fetching lessons:", error);
    }
  };

  const handleCreateLesson = async () => {
    if (!selectedCourse || !newLesson.title.trim()) return;

    try {
      const response = await fetch(
        `/api/instructor/courses/${selectedCourse}/lessons`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...newLesson,
            order: lessons.length + 1,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setLessons((prev) => [...prev, data.data]);
        setShowCreateDialog(false);
        resetNewLesson();
      }
    } catch (error) {
      console.error("Error creating lesson:", error);
    }
  };

  const handleUpdateLesson = async () => {
    if (!editingLesson) return;

    try {
      const response = await fetch(
        `/api/instructor/lessons/${editingLesson.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editingLesson),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setLessons((prev) =>
          prev.map((lesson) =>
            lesson.id === editingLesson.id ? data.data : lesson
          )
        );
        setShowEditDialog(false);
        setEditingLesson(null);
      }
    } catch (error) {
      console.error("Error updating lesson:", error);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;

    try {
      const response = await fetch(
        `/api/instructor/lessons/${lessonId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setLessons((prev) => prev.filter((lesson) => lesson.id !== lessonId));
      }
    } catch (error) {
      console.error("Error deleting lesson:", error);
    }
  };

  const handleTogglePublish = async (lesson: Lesson) => {
    try {
      const response = await fetch(
        `/api/instructor/lessons/${lesson.id}/publish`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isPublished: !lesson.isPublished }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setLessons((prev) =>
          prev.map((l) =>
            l.id === lesson.id
              ? { ...l, isPublished: data.data.isPublished }
              : l
          )
        );
      }
    } catch (error) {
      console.error("Error toggling publish status:", error);
    }
  };

  const handleDragStart = (e: React.DragEvent, lessonId: string) => {
    setDraggedLesson(lessonId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetLessonId: string) => {
    e.preventDefault();

    if (!draggedLesson || draggedLesson === targetLessonId) return;

    const draggedIndex = lessons.findIndex((l) => l.id === draggedLesson);
    const targetIndex = lessons.findIndex((l) => l.id === targetLessonId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Update local state immediately for better UX
    const newLessons = [...lessons];
    const [draggedItem] = newLessons.splice(draggedIndex, 1);
    newLessons.splice(targetIndex, 0, draggedItem);

    // Update order numbers
    const updatedLessons = newLessons.map((lesson, index) => ({
      ...lesson,
      order: index + 1,
    }));

    setLessons(updatedLessons);

    // Update on server
    try {
      const response = await fetch(
        `/api/instructor/courses/${selectedCourse}/lessons/reorder`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            lessonIds: updatedLessons.map((l) => l.id),
          }),
        }
      );

      if (!response.ok) {
        // Revert on error
        setLessons(lessons);
      }
    } catch (error) {
      console.error("Error reordering lessons:", error);
      setLessons(lessons);
    }

    setDraggedLesson(null);
  };

  const resetNewLesson = () => {
    setNewLesson({
      title: "",
      description: "",
      type: "VIDEO",
      duration: 30,
      isRequired: true,
      content: "",
      objectives: [],
      prerequisites: [],
      resources: [],
    });
  };

  const addObjective = () => {
    if (newObjective.trim()) {
      setNewLesson((prev) => ({
        ...prev,
        objectives: [...prev.objectives, newObjective.trim()],
      }));
      setNewObjective("");
    }
  };

  const removeObjective = (index: number) => {
    setNewLesson((prev) => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index),
    }));
  };

  const addPrerequisite = () => {
    if (newPrerequisite.trim()) {
      setNewLesson((prev) => ({
        ...prev,
        prerequisites: [...prev.prerequisites, newPrerequisite.trim()],
      }));
      setNewPrerequisite("");
    }
  };

  const removePrerequisite = (index: number) => {
    setNewLesson((prev) => ({
      ...prev,
      prerequisites: prev.prerequisites.filter((_, i) => i !== index),
    }));
  };

  const addResource = () => {
    if (newResource.name.trim() && newResource.url.trim()) {
      const resource: LessonResource = {
        id: Date.now().toString(),
        name: newResource.name.trim(),
        type: newResource.type,
        url: newResource.url.trim(),
        description: newResource.description.trim(),
        order: newLesson.resources.length + 1,
      };

      setNewLesson((prev) => ({
        ...prev,
        resources: [...prev.resources, resource],
      }));

      setNewResource({
        name: "",
        type: "VIDEO",
        url: "",
        description: "",
      });
    }
  };

  const removeResource = (resourceId: string) => {
    setNewLesson((prev) => ({
      ...prev,
      resources: prev.resources.filter((r) => r.id !== resourceId),
    }));
  };

  const getLessonTypeIcon = (type: string) => {
    const lessonType = LESSON_TYPES.find((t) => t.value === type);
    return lessonType ? lessonType.icon : BookOpen;
  };

  const getResourceTypeIcon = (type: string) => {
    const resourceType = RESOURCE_TYPES.find((t) => t.value === type);
    return resourceType ? resourceType.icon : FileText;
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
            Lesson Management
          </h1>
          <p className="text-gray-600 mt-2">
            Create and organize your course content
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
            Choose a course to manage its lessons
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
                        {course._count.lessons} lessons
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
          {/* Lessons Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Lessons
                    </p>
                    <p className="text-2xl font-bold">{lessons.length}</p>
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
                      {lessons.filter((l) => l.isPublished).length}
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
                      Total Duration
                    </p>
                    <p className="text-2xl font-bold">
                      {Math.round(
                        lessons.reduce((acc, l) => acc + l.duration, 0) / 60
                      )}
                      h
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Target className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Required
                    </p>
                    <p className="text-2xl font-bold">
                      {lessons.filter((l) => l.isRequired).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lessons List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Course Lessons</CardTitle>
                  <CardDescription>
                    Drag and drop to reorder lessons
                  </CardDescription>
                </div>
                <Dialog
                  open={showCreateDialog}
                  onOpenChange={setShowCreateDialog}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Lesson
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Lesson</DialogTitle>
                      <DialogDescription>
                        Add a new lesson to your course
                      </DialogDescription>
                    </DialogHeader>
                    {renderCreateLessonForm()}
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lessons
                  .sort((a, b) => a.order - b.order)
                  .map((lesson, index) => {
                    const IconComponent = getLessonTypeIcon(lesson.type);
                    return (
                      <div
                        key={lesson.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lesson.id)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, lesson.id)}
                        className={`flex items-center gap-4 p-4 bg-white border rounded-lg hover:shadow-md transition-shadow cursor-move ${
                          draggedLesson === lesson.id ? "opacity-50" : ""
                        }`}
                      >
                        <GripVertical className="w-5 h-5 text-gray-400" />

                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {index + 1}
                            </span>
                          </div>
                          <IconComponent className="w-5 h-5 text-gray-600" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{lesson.title}</h3>
                            <Badge
                              variant={
                                lesson.isPublished ? "default" : "secondary"
                              }
                            >
                              {lesson.isPublished ? "Published" : "Draft"}
                            </Badge>
                            {lesson.isRequired && (
                              <Badge variant="outline">Required</Badge>
                            )}
                            <Badge variant="outline">{lesson.type}</Badge>
                          </div>
                          {lesson.description && (
                            <p className="text-sm text-gray-600">
                              {lesson.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {lesson.duration} min
                            </span>
                            {lesson._count && (
                              <>
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {lesson._count.completions} completions
                                </span>
                                {lesson._count.submissions > 0 && (
                                  <span className="flex items-center gap-1">
                                    <FileText className="w-3 h-3" />
                                    {lesson._count.submissions} submissions
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTogglePublish(lesson)}
                          >
                            {lesson.isPublished ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingLesson(lesson);
                              setShowEditDialog(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteLesson(lesson.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}

                {lessons.length === 0 && (
                  <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No lessons yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Get started by creating your first lesson
                    </p>
                    <Button onClick={() => setShowCreateDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Lesson
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Edit Lesson Dialog */}
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Lesson</DialogTitle>
                <DialogDescription>
                  Update lesson details and content
                </DialogDescription>
              </DialogHeader>
              {editingLesson && renderEditLessonForm()}
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );

  function renderCreateLessonForm() {
    return (
      <div className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="objectives">Objectives</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="mt-6">
            <Card className="border-2">
              <CardHeader className="bg-gray-50">
                <CardTitle className="text-lg">Basic Information</CardTitle>
                <CardDescription>Configure the essential details for this lesson</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-semibold">Lesson Title *</Label>
                    <Input
                      id="title"
                      value={newLesson.title}
                      onChange={(e) =>
                        setNewLesson((prev) => ({ ...prev, title: e.target.value }))
                      }
                      placeholder="Enter lesson title"
                      className="border-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-sm font-semibold">Lesson Type</Label>
                    <Select
                      value={newLesson.type}
                      onValueChange={(value: any) =>
                        setNewLesson((prev) => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger className="border-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LESSON_TYPES.map((type) => (
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
                  <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
                  <Textarea
                    id="description"
                    value={newLesson.description}
                    onChange={(e) =>
                      setNewLesson((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Describe what students will learn in this lesson"
                    rows={3}
                    className="border-2"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration" className="text-sm font-semibold">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={newLesson.duration}
                      onChange={(e) =>
                        setNewLesson((prev) => ({
                          ...prev,
                          duration: parseInt(e.target.value) || 0,
                        }))
                      }
                      placeholder="30"
                      className="border-2"
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-8">
                    <Checkbox
                      id="isRequired"
                      checked={newLesson.isRequired}
                      onCheckedChange={(checked) =>
                        setNewLesson((prev) => ({
                          ...prev,
                          isRequired: checked as boolean,
                        }))
                      }
                    />
                    <Label htmlFor="isRequired" className="text-sm font-semibold">Mark as required lesson</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="mt-6">
            <Card className="border-2">
              <CardHeader className="bg-gray-50">
                <CardTitle className="text-lg">Lesson Content</CardTitle>
                <CardDescription>Write the main content that students will learn</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="content" className="text-sm font-semibold">Content Body</Label>
                  <Textarea
                    id="content"
                    value={newLesson.content}
                    onChange={(e) =>
                      setNewLesson((prev) => ({ ...prev, content: e.target.value }))
                    }
                    placeholder="Write your lesson content here...\n\nYou can include:\n- Key concepts\n- Examples\n- Instructions\n- Additional notes"
                    rows={12}
                    className="border-2 font-mono text-sm"
                  />
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    You can use markdown formatting for rich text content
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="objectives" className="mt-6">
            <div className="space-y-4">
              <Card className="border-2">
                <CardHeader className="bg-blue-50">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    Learning Objectives
                  </CardTitle>
                  <CardDescription>Define what students will be able to do after completing this lesson</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    {newLesson.objectives.map((objective, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg"
                      >
                        <Target className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span className="flex-1 text-sm font-medium">{objective}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeObjective(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {newLesson.objectives.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No objectives added yet</p>
                    )}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Input
                      value={newObjective}
                      onChange={(e) => setNewObjective(e.target.value)}
                      placeholder="e.g., Understand the basics of React hooks"
                      onKeyPress={(e) => e.key === "Enter" && addObjective()}
                      className="border-2"
                    />
                    <Button
                      onClick={addObjective}
                      disabled={!newObjective.trim()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader className="bg-gray-50">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-gray-600" />
                    Prerequisites
                  </CardTitle>
                  <CardDescription>List any knowledge or skills students need before starting</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    {newLesson.prerequisites.map((prerequisite, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-3 bg-gray-50 border-2 border-gray-200 rounded-lg"
                      >
                        <BookOpen className="w-4 h-4 text-gray-600 flex-shrink-0" />
                        <span className="flex-1 text-sm font-medium">{prerequisite}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePrerequisite(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {newLesson.prerequisites.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No prerequisites added</p>
                    )}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Input
                      value={newPrerequisite}
                      onChange={(e) => setNewPrerequisite(e.target.value)}
                      placeholder="e.g., Basic JavaScript knowledge"
                      onKeyPress={(e) => e.key === "Enter" && addPrerequisite()}
                      className="border-2"
                    />
                    <Button
                      onClick={addPrerequisite}
                      disabled={!newPrerequisite.trim()}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="resources" className="mt-6">
            <Card className="border-2">
              <CardHeader className="bg-purple-50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  Lesson Resources
                </CardTitle>
                <CardDescription>Add downloadable files, videos, and links for students</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Existing Resources List */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700">Added Resources ({newLesson.resources.length})</h4>
                  {newLesson.resources.length > 0 ? (
                    <div className="space-y-2">
                      {newLesson.resources.map((resource) => {
                        const IconComponent = getResourceTypeIcon(resource.type);
                        return (
                          <div
                            key={resource.id}
                            className="flex items-center gap-3 p-3 bg-purple-50 border-2 border-purple-200 rounded-lg"
                          >
                            <IconComponent className="w-5 h-5 text-purple-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{resource.name}</p>
                              {resource.description && (
                                <p className="text-xs text-gray-600 truncate">
                                  {resource.description}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 mt-1 truncate">{resource.url}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeResource(resource.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed">
                      No resources added yet. Add your first resource below.
                    </p>
                  )}
                </div>

                {/* Add New Resource Form */}
                <div className="border-t-2 pt-6 space-y-4">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add New Resource
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="resourceName" className="text-sm font-semibold">Resource Name *</Label>
                      <Input
                        id="resourceName"
                        value={newResource.name}
                        onChange={(e) =>
                          setNewResource((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="e.g., Course Syllabus PDF"
                        className="border-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="resourceType" className="text-sm font-semibold">Type *</Label>
                      <Select
                        value={newResource.type}
                        onValueChange={(value: any) =>
                          setNewResource((prev) => ({ ...prev, type: value }))
                        }
                      >
                        <SelectTrigger className="border-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {RESOURCE_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <type.icon className="w-4 h-4" />
                                {type.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resourceUrl" className="text-sm font-semibold">URL *</Label>
                    <Input
                      id="resourceUrl"
                      value={newResource.url}
                      onChange={(e) =>
                        setNewResource((prev) => ({
                          ...prev,
                          url: e.target.value,
                        }))
                      }
                      placeholder="https://example.com/resource.pdf"
                      className="border-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resourceDescription" className="text-sm font-semibold">Description (Optional)</Label>
                    <Textarea
                      id="resourceDescription"
                      value={newResource.description}
                      onChange={(e) =>
                        setNewResource((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Brief description of this resource"
                      rows={2}
                      className="border-2"
                    />
                  </div>

                  <Button
                    onClick={addResource}
                    disabled={!newResource.name.trim() || !newResource.url.trim()}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Resource to Lesson
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateLesson}
            disabled={!newLesson.title.trim()}
          >
            <Save className="w-4 h-4 mr-2" />
            Create Lesson
          </Button>
        </div>
      </div>
    );
  }

  function renderEditLessonForm() {
    if (!editingLesson) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="editTitle">Lesson Title</Label>
            <Input
              id="editTitle"
              value={editingLesson.title}
              onChange={(e) =>
                setEditingLesson((prev) =>
                  prev ? { ...prev, title: e.target.value } : null
                )
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="editType">Lesson Type</Label>
            <Select
              value={editingLesson.type}
              onValueChange={(value: any) =>
                setEditingLesson((prev) =>
                  prev ? { ...prev, type: value } : null
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LESSON_TYPES.map((type) => (
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
            value={editingLesson.description ?? ""}
            onChange={(e) =>
              setEditingLesson((prev) =>
                prev ? { ...prev, description: e.target.value } : null
              )
            }
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="editDuration">Duration (minutes)</Label>
            <Input
              id="editDuration"
              type="number"
              value={editingLesson.duration}
              onChange={(e) =>
                setEditingLesson((prev) =>
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

          <div className="flex items-center space-x-2">
            <Checkbox
              id="editIsRequired"
              checked={editingLesson.isRequired}
              onCheckedChange={(checked) =>
                setEditingLesson((prev) =>
                  prev
                    ? {
                        ...prev,
                        isRequired: checked as boolean,
                      }
                    : null
                )
              }
            />
            <Label htmlFor="editIsRequired">Required lesson</Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="editContent">Lesson Content</Label>
          <Textarea
            id="editContent"
            value={editingLesson.content ?? ""}
            onChange={(e) =>
              setEditingLesson((prev) =>
                prev ? { ...prev, content: e.target.value } : null
              )
            }
            rows={10}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setShowEditDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdateLesson}>
            <Save className="w-4 h-4 mr-2" />
            Update Lesson
          </Button>
        </div>
      </div>
    );
  }
}
