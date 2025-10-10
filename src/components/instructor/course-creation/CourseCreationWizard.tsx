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
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Upload,
  Calendar,
  Clock,
  DollarSign,
  Users,
  BookOpen,
  Target,
  FileText,
  Image,
  Video,
  Link,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";
import { makeAuthenticatedRequest } from "@/lib/token-utils";

interface CourseData {
  // Basic Information
  title: string;
  description: string;
  shortDescription: string;
  category: string;
  difficulty: string;
  language: string;

  // Pricing & Duration
  price: number;
  applicationFee: number;
  duration: number; // in weeks
  estimatedHours: number;
  installmentEnabled: boolean;
  installmentPlan: string;

  // Content Structure
  prerequisites: string[];
  learningObjectives: string[];
  courseOutline: CourseOutlineItem[];

  // Media & Resources
  thumbnail: File | null;
  promotionalVideo: string;
  courseMaterials: CourseMaterial[];

  // Settings
  mode: string[]; // online, offline, hybrid
  maxStudents: number;
  certificateAwarded: boolean;
  isPublic: boolean;
  allowEnrollment: boolean;

  // Advanced Settings
  autoApprove: boolean;
  requireApplication: boolean;
  enableDiscussion: boolean;
  enableLiveSessions: boolean;
  enableAssessments: boolean;
}

interface CourseOutlineItem {
  id: string;
  title: string;
  description: string;
  type: "lesson" | "assignment" | "quiz" | "project";
  duration: number; // in minutes
  order: number;
  isRequired: boolean;
  resources: string[];
}

interface CourseMaterial {
  id: string;
  name: string;
  type: "document" | "video" | "audio" | "link" | "image";
  url: string;
  size?: number;
  description: string;
}

const COURSE_CATEGORIES = [
  "Technology",
  "Business",
  "Design",
  "Marketing",
  "Health",
  "Education",
  "Arts",
  "Science",
  "Language",
  "Finance",
  "Lifestyle",
  "Other",
];

const DIFFICULTY_LEVELS = [
  {
    value: "BEGINNER",
    label: "Beginner",
    description: "No prior experience required",
  },
  {
    value: "INTERMEDIATE",
    label: "Intermediate",
    description: "Some basic knowledge helpful",
  },
  {
    value: "ADVANCED",
    label: "Advanced",
    description: "Requires significant experience",
  },
  {
    value: "EXPERT",
    label: "Expert",
    description: "For professionals and experts",
  },
];

const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Chinese",
  "Japanese",
  "Korean",
  "Arabic",
  "Hindi",
  "Other",
];

const INSTALLMENT_PLANS = [
  { value: "MONTHLY", label: "Monthly", description: "Pay monthly" },
  { value: "QUARTERLY", label: "Quarterly", description: "Pay every 3 months" },
  { value: "SEMESTER", label: "Semester", description: "Pay per semester" },
  { value: "CUSTOM", label: "Custom", description: "Custom payment schedule" },
];

export default function CourseCreationWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [courseData, setCourseData] = useState<CourseData>({
    title: "",
    description: "",
    shortDescription: "",
    category: "",
    difficulty: "",
    language: "English",
    price: 0,
    applicationFee: 0,
    duration: 4,
    estimatedHours: 20,
    installmentEnabled: false,
    installmentPlan: "MONTHLY",
    prerequisites: [],
    learningObjectives: [],
    courseOutline: [],
    thumbnail: null,
    promotionalVideo: "",
    courseMaterials: [],
    mode: ["online"],
    maxStudents: 50,
    certificateAwarded: true,
    isPublic: true,
    allowEnrollment: true,
    autoApprove: false,
    requireApplication: true,
    enableDiscussion: true,
    enableLiveSessions: false,
    enableAssessments: true,
  });

  const [newPrerequisite, setNewPrerequisite] = useState("");
  const [newObjective, setNewObjective] = useState("");
  const [newOutlineItem, setNewOutlineItem] = useState<
    Partial<CourseOutlineItem>
  >({
    title: "",
    description: "",
    type: "lesson",
    duration: 30,
    isRequired: true,
    resources: [],
  });

  const steps = [
    {
      id: 1,
      title: "Basic Information",
      description: "Course title, description, and category",
    },
    {
      id: 2,
      title: "Pricing & Duration",
      description: "Set pricing and course duration",
    },
    {
      id: 3,
      title: "Prerequisites & Objectives",
      description: "Define requirements and learning goals",
    },
    {
      id: 4,
      title: "Course Outline",
      description: "Structure your course content",
    },
    {
      id: 5,
      title: "Media & Resources",
      description: "Add thumbnails and course materials",
    },
    {
      id: 6,
      title: "Settings & Features",
      description: "Configure course settings",
    },
    {
      id: 7,
      title: "Review & Publish",
      description: "Review and publish your course",
    },
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!courseData.title.trim())
          newErrors.title = "Course title is required";
        if (!courseData.description.trim())
          newErrors.description = "Course description is required";
        if (!courseData.shortDescription.trim())
          newErrors.shortDescription = "Short description is required";
        if (!courseData.category) newErrors.category = "Category is required";
        if (!courseData.difficulty)
          newErrors.difficulty = "Difficulty level is required";
        break;
      case 2:
        if (courseData.price < 0) newErrors.price = "Price cannot be negative";
        if (courseData.duration < 1)
          newErrors.duration = "Duration must be at least 1 week";
        if (courseData.estimatedHours < 1)
          newErrors.estimatedHours = "Estimated hours must be at least 1";
        break;
      case 3:
        if (courseData.learningObjectives.length === 0) {
          newErrors.objectives = "At least one learning objective is required";
        }
        break;
      case 4:
        if (courseData.courseOutline.length === 0) {
          newErrors.outline = "At least one course outline item is required";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const addPrerequisite = () => {
    if (newPrerequisite.trim()) {
      setCourseData((prev) => ({
        ...prev,
        prerequisites: [...prev.prerequisites, newPrerequisite.trim()],
      }));
      setNewPrerequisite("");
    }
  };

  const removePrerequisite = (index: number) => {
    setCourseData((prev) => ({
      ...prev,
      prerequisites: prev.prerequisites.filter((_, i) => i !== index),
    }));
  };

  const addObjective = () => {
    if (newObjective.trim()) {
      setCourseData((prev) => ({
        ...prev,
        learningObjectives: [...prev.learningObjectives, newObjective.trim()],
      }));
      setNewObjective("");
    }
  };

  const removeObjective = (index: number) => {
    setCourseData((prev) => ({
      ...prev,
      learningObjectives: prev.learningObjectives.filter((_, i) => i !== index),
    }));
  };

  const addOutlineItem = () => {
    if (newOutlineItem.title?.trim()) {
      const outlineItem: CourseOutlineItem = {
        id: Date.now().toString(),
        title: newOutlineItem.title.trim(),
        description: newOutlineItem.description?.trim() || "",
        type: newOutlineItem.type || "lesson",
        duration: newOutlineItem.duration || 30,
        order: courseData.courseOutline.length + 1,
        isRequired: newOutlineItem.isRequired || true,
        resources: newOutlineItem.resources || [],
      };

      setCourseData((prev) => ({
        ...prev,
        courseOutline: [...prev.courseOutline, outlineItem],
      }));

      setNewOutlineItem({
        title: "",
        description: "",
        type: "lesson",
        duration: 30,
        isRequired: true,
        resources: [],
      });
    }
  };

  const removeOutlineItem = (id: string) => {
    setCourseData((prev) => ({
      ...prev,
      courseOutline: prev.courseOutline.filter((item) => item.id !== id),
    }));
  };

  const reorderOutlineItems = (fromIndex: number, toIndex: number) => {
    const newOutline = [...courseData.courseOutline];
    const [movedItem] = newOutline.splice(fromIndex, 1);
    newOutline.splice(toIndex, 0, movedItem);

    // Update order numbers
    const updatedOutline = newOutline.map((item, index) => ({
      ...item,
      order: index + 1,
    }));

    setCourseData((prev) => ({
      ...prev,
      courseOutline: updatedOutline,
    }));
  };

  const handleFileUpload = (file: File, type: "thumbnail" | "material") => {
    if (type === "thumbnail") {
      setCourseData((prev) => ({ ...prev, thumbnail: file }));
    } else {
      const material: CourseMaterial = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type.startsWith("video/")
          ? "video"
          : file.type.startsWith("audio/")
          ? "audio"
          : file.type.startsWith("image/")
          ? "image"
          : "document",
        url: URL.createObjectURL(file),
        size: file.size,
        description: "",
      };

      setCourseData((prev) => ({
        ...prev,
        courseMaterials: [...prev.courseMaterials, material],
      }));
    }
  };

  const removeMaterial = (id: string) => {
    setCourseData((prev) => ({
      ...prev,
      courseMaterials: prev.courseMaterials.filter(
        (material) => material.id !== id
      ),
    }));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setLoading(true);
    try {
      const formData = new FormData();

      // Append all course data
      Object.entries(courseData).forEach(([key, value]) => {
        if (key === "thumbnail" && value instanceof File) {
          formData.append("thumbnail", value);
        } else if (key === "courseMaterials") {
          formData.append(key, JSON.stringify(value));
        } else if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      });

      const response = await makeAuthenticatedRequest(
        "/api/instructor/courses/create",
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const result = await response.json();
        router.push(
          `/dashboards/instructor?tab=courses&created=${result.data.id}`
        );
      } else {
        const error = await response.json();
        setErrors({ submit: error.message || "Failed to create course" });
      }
    } catch (error) {
      setErrors({ submit: "An error occurred while creating the course" });
    } finally {
      setLoading(false);
    }
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Create New Course
              </h1>
              <p className="text-gray-600 mt-2">
                Build an engaging and comprehensive course for your students
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Step {currentStep} of {steps.length}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center space-x-2 ${
                    currentStep >= step.id ? "text-blue-600" : "text-gray-400"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= step.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium">{step.title}</p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {steps[currentStep - 1].title}
            </CardTitle>
            <CardDescription>
              {steps[currentStep - 1].description}
            </CardDescription>
          </CardHeader>
          <CardContent>{renderStepContent()}</CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {currentStep < steps.length ? (
              <Button onClick={handleNext} className="flex items-center gap-2">
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Course...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Create Course
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Error Display */}
        {Object.keys(errors).length > 0 && (
          <Card className="mt-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">
                  Please fix the following errors:
                </span>
              </div>
              <ul className="list-disc list-inside space-y-1">
                {Object.entries(errors).map(([key, message]) => (
                  <li key={key} className="text-sm text-red-600">
                    {message}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  function renderStepContent() {
    switch (currentStep) {
      case 1:
        return renderBasicInformation();
      case 2:
        return renderPricingDuration();
      case 3:
        return renderPrerequisitesObjectives();
      case 4:
        return renderCourseOutline();
      case 5:
        return renderMediaResources();
      case 6:
        return renderSettingsFeatures();
      case 7:
        return renderReviewPublish();
      default:
        return null;
    }
  }

  function renderBasicInformation() {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="title">Course Title *</Label>
            <Input
              id="title"
              value={courseData.title}
              onChange={(e) =>
                setCourseData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Enter course title"
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={courseData.category}
              onValueChange={(value) =>
                setCourseData((prev) => ({ ...prev, category: value }))
              }
            >
              <SelectTrigger
                className={errors.category ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {COURSE_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="shortDescription">Short Description *</Label>
          <Input
            id="shortDescription"
            value={courseData.shortDescription}
            onChange={(e) =>
              setCourseData((prev) => ({
                ...prev,
                shortDescription: e.target.value,
              }))
            }
            placeholder="Brief description (max 160 characters)"
            maxLength={160}
            className={errors.shortDescription ? "border-red-500" : ""}
          />
          <p className="text-sm text-gray-500">
            {courseData.shortDescription.length}/160 characters
          </p>
          {errors.shortDescription && (
            <p className="text-sm text-red-500">{errors.shortDescription}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Full Description *</Label>
          <Textarea
            id="description"
            value={courseData.description}
            onChange={(e) =>
              setCourseData((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            placeholder="Detailed course description"
            rows={6}
            className={errors.description ? "border-red-500" : ""}
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty Level *</Label>
            <Select
              value={courseData.difficulty}
              onValueChange={(value) =>
                setCourseData((prev) => ({ ...prev, difficulty: value }))
              }
            >
              <SelectTrigger
                className={errors.difficulty ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTY_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    <div>
                      <div className="font-medium">{level.label}</div>
                      <div className="text-sm text-gray-500">
                        {level.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.difficulty && (
              <p className="text-sm text-red-500">{errors.difficulty}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select
              value={courseData.language}
              onValueChange={(value) =>
                setCourseData((prev) => ({ ...prev, language: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((language) => (
                  <SelectItem key={language} value={language}>
                    {language}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    );
  }

  function renderPricingDuration() {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="price">Course Price ($)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="price"
                type="number"
                value={courseData.price || ""}
                onChange={(e) =>
                  setCourseData((prev) => ({
                    ...prev,
                    price: parseFloat(e.target.value) || 0,
                  }))
                }
                placeholder="0.00"
                className="pl-10"
              />
            </div>
            {errors.price && (
              <p className="text-sm text-red-500">{errors.price}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="applicationFee">Application Fee ($)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="applicationFee"
                type="number"
                value={courseData.applicationFee || ""}
                onChange={(e) =>
                  setCourseData((prev) => ({
                    ...prev,
                    applicationFee: parseFloat(e.target.value) || 0,
                  }))
                }
                placeholder="0.00"
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (weeks) *</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="duration"
                type="number"
                value={courseData.duration || ""}
                onChange={(e) =>
                  setCourseData((prev) => ({
                    ...prev,
                    duration: parseInt(e.target.value) || 0,
                  }))
                }
                placeholder="4"
                className="pl-10"
              />
            </div>
            {errors.duration && (
              <p className="text-sm text-red-500">{errors.duration}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimatedHours">Estimated Hours *</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="estimatedHours"
                type="number"
                value={courseData.estimatedHours || ""}
                onChange={(e) =>
                  setCourseData((prev) => ({
                    ...prev,
                    estimatedHours: parseInt(e.target.value) || 0,
                  }))
                }
                placeholder="20"
                className="pl-10"
              />
            </div>
            {errors.estimatedHours && (
              <p className="text-sm text-red-500">{errors.estimatedHours}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="installmentEnabled"
              checked={courseData.installmentEnabled}
              onCheckedChange={(checked) =>
                setCourseData((prev) => ({
                  ...prev,
                  installmentEnabled: checked as boolean,
                }))
              }
            />
            <Label htmlFor="installmentEnabled">
              Enable installment payments
            </Label>
          </div>

          {courseData.installmentEnabled && (
            <div className="space-y-2">
              <Label htmlFor="installmentPlan">Installment Plan</Label>
              <Select
                value={courseData.installmentPlan}
                onValueChange={(value) =>
                  setCourseData((prev) => ({ ...prev, installmentPlan: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select installment plan" />
                </SelectTrigger>
                <SelectContent>
                  {INSTALLMENT_PLANS.map((plan) => (
                    <SelectItem key={plan.value} value={plan.value}>
                      <div>
                        <div className="font-medium">{plan.label}</div>
                        <div className="text-sm text-gray-500">
                          {plan.description}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderPrerequisitesObjectives() {
    return (
      <div className="space-y-8">
        {/* Prerequisites */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Prerequisites</h3>
            <span className="text-sm text-gray-500">Optional</span>
          </div>

          <div className="space-y-3">
            {courseData.prerequisites.map((prerequisite, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
              >
                <BookOpen className="w-4 h-4 text-gray-500" />
                <span className="flex-1">{prerequisite}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removePrerequisite(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              value={newPrerequisite}
              onChange={(e) => setNewPrerequisite(e.target.value)}
              placeholder="Add a prerequisite"
              onKeyPress={(e) => e.key === "Enter" && addPrerequisite()}
            />
            <Button
              onClick={addPrerequisite}
              disabled={!newPrerequisite.trim()}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Learning Objectives */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Learning Objectives *</h3>
            <span className="text-sm text-gray-500">Required</span>
          </div>

          <div className="space-y-3">
            {courseData.learningObjectives.map((objective, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg"
              >
                <Target className="w-4 h-4 text-blue-500" />
                <span className="flex-1">{objective}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeObjective(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              value={newObjective}
              onChange={(e) => setNewObjective(e.target.value)}
              placeholder="Add a learning objective"
              onKeyPress={(e) => e.key === "Enter" && addObjective()}
            />
            <Button onClick={addObjective} disabled={!newObjective.trim()}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {errors.objectives && (
            <p className="text-sm text-red-500">{errors.objectives}</p>
          )}
        </div>
      </div>
    );
  }

  function renderCourseOutline() {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Course Outline *</h3>
          <span className="text-sm text-gray-500">
            {courseData.courseOutline.length} items
          </span>
        </div>

        {/* Outline Items */}
        <div className="space-y-3">
          {courseData.courseOutline.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-500">
                  #{item.order}
                </span>
                <Badge variant="secondary">{item.type}</Badge>
              </div>

              <div className="flex-1">
                <h4 className="font-medium">{item.title}</h4>
                {item.description && (
                  <p className="text-sm text-gray-600">{item.description}</p>
                )}
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xs text-gray-500">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {item.duration} min
                  </span>
                  {item.isRequired && (
                    <Badge variant="outline" className="text-xs">
                      Required
                    </Badge>
                  )}
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeOutlineItem(item.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Add New Outline Item */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add Course Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="outlineTitle">Title *</Label>
                <Input
                  id="outlineTitle"
                  value={newOutlineItem.title || ""}
                  onChange={(e) =>
                    setNewOutlineItem((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Enter content title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="outlineType">Type</Label>
                <Select
                  value={newOutlineItem.type || "lesson"}
                  onValueChange={(value: any) =>
                    setNewOutlineItem((prev) => ({
                      ...prev,
                      type: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lesson">Lesson</SelectItem>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="outlineDescription">Description</Label>
              <Textarea
                id="outlineDescription"
                value={newOutlineItem.description || ""}
                onChange={(e) =>
                  setNewOutlineItem((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe this content"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="outlineDuration">Duration (minutes)</Label>
                <Input
                  id="outlineDuration"
                  type="number"
                  value={newOutlineItem.duration || ""}
                  onChange={(e) =>
                    setNewOutlineItem((prev) => ({
                      ...prev,
                      duration: parseInt(e.target.value) || 0,
                    }))
                  }
                  placeholder="30"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="outlineRequired"
                  checked={newOutlineItem.isRequired || true}
                  onCheckedChange={(checked) =>
                    setNewOutlineItem((prev) => ({
                      ...prev,
                      isRequired: checked as boolean,
                    }))
                  }
                />
                <Label htmlFor="outlineRequired">Required content</Label>
              </div>
            </div>

            <Button
              onClick={addOutlineItem}
              disabled={!newOutlineItem.title?.trim()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add to Course Outline
            </Button>
          </CardContent>
        </Card>

        {errors.outline && (
          <p className="text-sm text-red-500">{errors.outline}</p>
        )}
      </div>
    );
  }

  function renderMediaResources() {
    return (
      <div className="space-y-8">
        {/* Course Thumbnail */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Course Thumbnail</h3>
          <div className="flex items-center gap-4">
            {courseData.thumbnail ? (
              <div className="relative">
                <img
                  src={URL.createObjectURL(courseData.thumbnail)}
                  alt="Course thumbnail"
                  className="w-32 h-20 object-cover rounded-lg"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setCourseData((prev) => ({ ...prev, thumbnail: null }))
                  }
                  className="absolute -top-2 -right-2 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="w-32 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <Image className="w-6 h-6 text-gray-400" />
              </div>
            )}

            <div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, "thumbnail");
                }}
                className="hidden"
                id="thumbnail-upload"
              />
              <Label htmlFor="thumbnail-upload" className="cursor-pointer">
                <Button variant="outline" asChild>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Thumbnail
                  </span>
                </Button>
              </Label>
              <p className="text-sm text-gray-500 mt-1">
                Recommended: 1280x720px, max 5MB
              </p>
            </div>
          </div>
        </div>

        {/* Promotional Video */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Promotional Video</h3>
          <div className="space-y-2">
            <Label htmlFor="promotionalVideo">Video URL</Label>
            <Input
              id="promotionalVideo"
              value={courseData.promotionalVideo}
              onChange={(e) =>
                setCourseData((prev) => ({
                  ...prev,
                  promotionalVideo: e.target.value,
                }))
              }
              placeholder="https://youtube.com/watch?v=..."
            />
            <p className="text-sm text-gray-500">
              Add a YouTube or Vimeo URL to showcase your course
            </p>
          </div>
        </div>

        {/* Course Materials */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Course Materials</h3>
            <span className="text-sm text-gray-500">
              {courseData.courseMaterials.length} files
            </span>
          </div>

          <div className="space-y-3">
            {courseData.courseMaterials.map((material) => (
              <div
                key={material.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  {material.type === "video" && (
                    <Video className="w-4 h-4 text-red-500" />
                  )}
                  {material.type === "audio" && (
                    <FileText className="w-4 h-4 text-blue-500" />
                  )}
                  {material.type === "image" && (
                    <Image className="w-4 h-4 text-green-500" />
                  )}
                  {material.type === "document" && (
                    <FileText className="w-4 h-4 text-gray-500" />
                  )}
                  {material.type === "link" && (
                    <Link className="w-4 h-4 text-purple-500" />
                  )}
                </div>

                <div className="flex-1">
                  <p className="font-medium">{material.name}</p>
                  {material.description && (
                    <p className="text-sm text-gray-600">
                      {material.description}
                    </p>
                  )}
                  {material.size && (
                    <p className="text-xs text-gray-500">
                      {(material.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMaterial(material.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <div>
            <input
              type="file"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                files.forEach((file) => handleFileUpload(file, "material"));
              }}
              className="hidden"
              id="materials-upload"
            />
            <Label htmlFor="materials-upload" className="cursor-pointer">
              <Button variant="outline" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Materials
                </span>
              </Button>
            </Label>
            <p className="text-sm text-gray-500 mt-1">
              Upload documents, videos, images, and other course materials
            </p>
          </div>
        </div>
      </div>
    );
  }

  function renderSettingsFeatures() {
    return (
      <div className="space-y-8">
        {/* Course Mode */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Course Delivery Mode</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                value: "online",
                label: "Online",
                description: "Fully online course",
              },
              {
                value: "offline",
                label: "Offline",
                description: "In-person classes",
              },
              {
                value: "hybrid",
                label: "Hybrid",
                description: "Mix of online and offline",
              },
            ].map((mode) => (
              <div key={mode.value} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={mode.value}
                    checked={courseData.mode.includes(mode.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setCourseData((prev) => ({
                          ...prev,
                          mode: [...prev.mode, mode.value],
                        }));
                      } else {
                        setCourseData((prev) => ({
                          ...prev,
                          mode: prev.mode.filter((m) => m !== mode.value),
                        }));
                      }
                    }}
                  />
                  <Label htmlFor={mode.value}>{mode.label}</Label>
                </div>
                <p className="text-sm text-gray-500">{mode.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Course Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Course Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="maxStudents">Maximum Students</Label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="maxStudents"
                  type="number"
                  value={courseData.maxStudents || ""}
                  onChange={(e) =>
                    setCourseData((prev) => ({
                      ...prev,
                      maxStudents: parseInt(e.target.value) || 0,
                    }))
                  }
                  placeholder="50"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Primary Language</Label>
              <Select
                value={courseData.language}
                onValueChange={(value) =>
                  setCourseData((prev) => ({ ...prev, language: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((language) => (
                    <SelectItem key={language} value={language}>
                      {language}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Course Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                key: "certificateAwarded",
                label: "Certificate of Completion",
                description: "Award certificate upon completion",
              },
              {
                key: "enableDiscussion",
                label: "Discussion Forum",
                description: "Enable student discussions",
              },
              {
                key: "enableLiveSessions",
                label: "Live Sessions",
                description: "Schedule live video sessions",
              },
              {
                key: "enableAssessments",
                label: "Assessments",
                description: "Include quizzes and assignments",
              },
              {
                key: "isPublic",
                label: "Public Course",
                description: "Make course visible to all students",
              },
              {
                key: "allowEnrollment",
                label: "Allow Enrollment",
                description: "Students can enroll immediately",
              },
              {
                key: "requireApplication",
                label: "Require Application",
                description: "Students must apply first",
              },
              {
                key: "autoApprove",
                label: "Auto-approve Applications",
                description: "Automatically approve applications",
              },
            ].map((feature) => (
              <div key={feature.key} className="flex items-start space-x-3">
                <Checkbox
                  id={feature.key}
                  checked={
                    courseData[feature.key as keyof CourseData] as boolean
                  }
                  onCheckedChange={(checked) =>
                    setCourseData((prev) => ({
                      ...prev,
                      [feature.key]: checked,
                    }))
                  }
                />
                <div className="space-y-1">
                  <Label htmlFor={feature.key} className="text-sm font-medium">
                    {feature.label}
                  </Label>
                  <p className="text-xs text-gray-500">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderReviewPublish() {
    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Review Your Course
          </h3>
          <p className="text-gray-600">
            Please review all the information below before publishing your
            course
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Course Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Course Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold">{courseData.title}</h4>
                <p className="text-sm text-gray-600">
                  {courseData.shortDescription}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Category:</span>
                  <p className="font-medium">{courseData.category}</p>
                </div>
                <div>
                  <span className="text-gray-500">Difficulty:</span>
                  <p className="font-medium">{courseData.difficulty}</p>
                </div>
                <div>
                  <span className="text-gray-500">Duration:</span>
                  <p className="font-medium">{courseData.duration} weeks</p>
                </div>
                <div>
                  <span className="text-gray-500">Hours:</span>
                  <p className="font-medium">
                    {courseData.estimatedHours} hours
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Enrollment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Pricing & Enrollment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Course Price:</span>
                  <p className="font-medium">${courseData.price}</p>
                </div>
                <div>
                  <span className="text-gray-500">Application Fee:</span>
                  <p className="font-medium">${courseData.applicationFee}</p>
                </div>
                <div>
                  <span className="text-gray-500">Max Students:</span>
                  <p className="font-medium">{courseData.maxStudents}</p>
                </div>
                <div>
                  <span className="text-gray-500">Mode:</span>
                  <p className="font-medium">{courseData.mode.join(", ")}</p>
                </div>
              </div>

              {courseData.installmentEnabled && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">
                    Installment Plan
                  </p>
                  <p className="text-sm text-blue-700">
                    {courseData.installmentPlan}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Learning Objectives */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Learning Objectives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {courseData.learningObjectives.map((objective, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{objective}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Course Outline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Course Outline ({courseData.courseOutline.length} items)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {courseData.courseOutline.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-sm font-medium text-gray-500">
                    #{item.order}
                  </span>
                  <Badge variant="secondary">{item.type}</Badge>
                  <div className="flex-1">
                    <h4 className="font-medium">{item.title}</h4>
                    {item.description && (
                      <p className="text-sm text-gray-600">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {item.duration} min
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Features Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              Enabled Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { key: "certificateAwarded", label: "Certificate" },
                { key: "enableDiscussion", label: "Discussion" },
                { key: "enableLiveSessions", label: "Live Sessions" },
                { key: "enableAssessments", label: "Assessments" },
                { key: "isPublic", label: "Public" },
                { key: "allowEnrollment", label: "Enrollment" },
                { key: "requireApplication", label: "Application" },
                { key: "autoApprove", label: "Auto-approve" },
              ].map((feature) => (
                <div key={feature.key} className="flex items-center gap-2">
                  {courseData[feature.key as keyof CourseData] ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <div className="w-4 h-4 border border-gray-300 rounded-full" />
                  )}
                  <span className="text-sm">{feature.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}
