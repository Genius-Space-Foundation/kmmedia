"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Upload,
  Calendar,
  Clock,
  DollarSign,
  Users,
  User,
  BookOpen,
  Target,
  FileText,
  Image,
  Video,
  Volume2,
  Link,
  AlertCircle,
  Info,
  Layers,
  Settings2,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Shield,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CourseData {
  // Basic Information
  title: string;
  description: string;
  shortDescription: string;
  category: string;
  difficulty: string;
  language: string;
  instructorId?: string; // New field for admin mode

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

interface CourseCreationWizardProps {
  adminMode?: boolean;
  instructors?: Array<{ id: string; name: string; email: string }>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CourseCreationWizard({ 
  adminMode = false, 
  instructors = [],
  onSuccess,
  onCancel 
}: CourseCreationWizardProps) {
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
    instructorId: "",
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
        if (adminMode && !courseData.instructorId)
          newErrors.instructorId = "Instructor assignment is required";
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

      const response = await fetch(
        adminMode ? "/api/admin/courses/create" : "/api/instructor/courses/create",
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(
            adminMode 
              ? "/dashboards/admin?tab=courses" 
              : `/dashboards/instructor?tab=courses&created=${result.data.id}`
          );
        }
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
    <div className="flex h-screen w-full bg-[#030712] overflow-hidden text-slate-200">
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] bg-violet-900/20 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] right-[10%] w-[25%] h-[25%] bg-blue-900/10 blur-[100px] rounded-full" />
      </div>

      {/* Sidebar Stepper */}
      <aside className="w-80 border-r border-white/5 bg-black/40 backdrop-blur-xl flex flex-col z-10">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                Course Builder
              </h2>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                Professional Wizard
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-8 px-4 custom-scrollbar">
          <div className="space-y-2">
            {steps.map((step) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <button
                  key={step.id}
                  onClick={() => currentStep > step.id && setCurrentStep(step.id)}
                  className={cn(
                    "w-full flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 group text-left",
                    isActive 
                      ? "bg-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-md" 
                      : "hover:bg-white/5"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                    isActive 
                      ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/40 scale-110" 
                      : isCompleted 
                        ? "bg-emerald-500/20 text-emerald-400" 
                        : "bg-slate-800 text-slate-500 group-hover:bg-slate-700"
                  )}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-bold">{step.id}</span>
                    )}
                  </div>
                  <div className="flex-1 mt-0.5">
                    <p className={cn(
                      "text-sm font-bold transition-colors duration-300",
                      isActive ? "text-white" : isCompleted ? "text-slate-300" : "text-slate-500"
                    )}>
                      {step.title}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                      {step.description}
                    </p>
                  </div>
                  {isActive && (
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 self-center shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Quick Stats Panel */}
        <div className="p-6 border-t border-white/5 bg-black/20">
          <h4 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-4">
            Course Summary
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <p className="text-[10px] text-slate-500 font-bold mb-1 uppercase">Price</p>
              <p className="text-white font-bold">GH₵ {courseData.price}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <p className="text-[10px] text-slate-500 font-bold mb-1 uppercase">Duration</p>
              <p className="text-white font-bold">{courseData.duration} Weeks</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative flex flex-col h-full bg-[#0a0f1d]/50">
        {/* Top bar */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 backdrop-blur-md z-10">
          <div>
            <h1 className="text-xl font-bold text-white">
              {steps[currentStep - 1].title}
            </h1>
            <p className="text-xs text-slate-400">
              {steps[currentStep - 1].description}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => onCancel ? onCancel() : router.back()}
              className="text-slate-400 hover:text-white hover:bg-white/5 rounded-xl px-6"
            >
              Cancel
            </Button>
            <div className="h-8 w-[1px] bg-white/5 mx-2" />
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Progress</span>
              <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500" 
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs font-bold text-white ml-2">{Math.round(progress)}%</span>
            </div>
          </div>
        </header>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar relative">
          <div className="max-w-4xl mx-auto">
            {/* Step content wrapped in Glass Card */}
            <div className="min-h-[500px] bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sparkles className="w-12 h-12 text-indigo-400" />
              </div>
              
              {renderStepContent()}

              {/* Navigation Footer Inside Card */}
              <div className="mt-16 flex items-center justify-between pt-10 border-t border-white/5">
                <Button
                  variant="ghost"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="flex items-center gap-3 text-slate-400 hover:text-white hover:bg-white/10 rounded-2xl py-6 px-8 transition-all"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="font-bold">Back</span>
                </Button>

                <div className="flex items-center gap-4">
                  {currentStep < steps.length ? (
                    <Button 
                      onClick={handleNext} 
                      className="group flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl py-6 px-10 transition-all shadow-xl shadow-indigo-600/20"
                    >
                      <span className="font-bold">Continue</span>
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl py-6 px-12 transition-all shadow-xl shadow-emerald-600/20"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Finalizing...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5 fill-white" />
                          <span className="font-bold">Publish Course</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Error Display */}
            {Object.keys(errors).length > 0 && (
              <div className="mt-8 bg-rose-500/10 backdrop-blur-xl border border-rose-500/20 rounded-3xl p-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-rose-500" />
                </div>
                <div>
                  <h5 className="font-bold text-rose-500 mb-1">Incomplete Information</h5>
                  <ul className="list-disc list-inside space-y-0.5">
                    {Object.entries(errors).map(([key, message]) => (
                      <li key={key} className="text-xs text-rose-400/80 font-medium">
                        {message}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Global CSS for scrollbars */}
        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 5px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.1);
          }
        `}</style>
      </main>
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
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {adminMode && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-indigo-400" />
              <Label htmlFor="instructorId" className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                Assign Instructor
              </Label>
            </div>
            <Select
              value={courseData.instructorId}
              onValueChange={(value) =>
                setCourseData((prev) => ({ ...prev, instructorId: value }))
              }
            >
              <SelectTrigger className={cn(
                "h-14 bg-white/5 border-white/10 text-white rounded-2xl focus:ring-indigo-500/50 transition-all",
                errors.instructorId && "border-rose-500/50 bg-rose-500/5"
              )}>
                <SelectValue placeholder="Select faculty member" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10 text-slate-200">
                {instructors.map((instructor) => (
                  <SelectItem key={instructor.id} value={instructor.id} className="focus:bg-indigo-600 focus:text-white">
                    {instructor.name} ({instructor.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.instructorId && (
              <p className="text-xs text-rose-500 font-medium ml-2">{errors.instructorId}</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <Label htmlFor="title" className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                Course Title
              </Label>
            </div>
            <Input
              id="title"
              value={courseData.title}
              onChange={(e) =>
                setCourseData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="e.g. Advanced Digital Marketing 2024"
              className={cn(
                "h-14 bg-white/5 border-white/10 text-white rounded-2xl focus:ring-indigo-500/50 transition-all placeholder:text-slate-600",
                errors.title && "border-rose-500/50 bg-rose-500/5"
              )}
            />
            {errors.title && (
              <p className="text-xs text-rose-500 font-medium ml-2">{errors.title}</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <Label htmlFor="category" className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                Category
              </Label>
            </div>
            <Select
              value={courseData.category}
              onValueChange={(value) =>
                setCourseData((prev) => ({ ...prev, category: value }))
              }
            >
              <SelectTrigger className={cn(
                "h-14 bg-white/5 border-white/10 text-white rounded-2xl focus:ring-indigo-500/50 transition-all",
                errors.category && "border-rose-500/50 bg-rose-500/5"
              )}>
                <SelectValue placeholder="Select course domain" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10 text-slate-200">
                {COURSE_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category} className="focus:bg-indigo-600 focus:text-white">
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-xs text-rose-500 font-medium ml-2">{errors.category}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-400" />
              <Label htmlFor="shortDescription" className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                Elevator Pitch
              </Label>
            </div>
            <span className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full",
              courseData.shortDescription.length > 140 ? "bg-amber-500/20 text-amber-500" : "bg-white/5 text-slate-500"
            )}>
              {courseData.shortDescription.length} / 160
            </span>
          </div>
          <Input
            id="shortDescription"
            value={courseData.shortDescription}
            onChange={(e) =>
              setCourseData((prev) => ({
                ...prev,
                shortDescription: e.target.value,
              }))
            }
            placeholder="A punchy one-liner that sells the course..."
            maxLength={160}
            className={cn(
              "h-14 bg-white/5 border-white/10 text-white rounded-2xl focus:ring-indigo-500/50 transition-all placeholder:text-slate-600",
              errors.shortDescription && "border-rose-500/50 bg-rose-500/5"
            )}
          />
          {errors.shortDescription && (
            <p className="text-xs text-rose-500 font-medium ml-2">{errors.shortDescription}</p>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <Label htmlFor="description" className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              Deep Dive Description
            </Label>
          </div>
          <Textarea
            id="description"
            value={courseData.description}
            onChange={(e) =>
              setCourseData((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            placeholder="Tell a story about what students will achieve..."
            rows={6}
            className={cn(
              "bg-white/5 border-white/10 text-white rounded-3xl focus:ring-indigo-500/50 transition-all placeholder:text-slate-600 p-6 leading-relaxed",
              errors.description && "border-rose-500/50 bg-rose-500/5"
            )}
          />
          {errors.description && (
            <p className="text-xs text-rose-500 font-medium ml-2">{errors.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-indigo-400" />
              <Label htmlFor="difficulty" className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                Expertise Level
              </Label>
            </div>
            <Select
              value={courseData.difficulty}
              onValueChange={(value) =>
                setCourseData((prev) => ({ ...prev, difficulty: value }))
              }
            >
              <SelectTrigger className={cn(
                "h-14 bg-white/5 border-white/10 text-white rounded-2xl focus:ring-indigo-500/50 transition-all",
                errors.difficulty && "border-rose-500/50 bg-rose-500/5"
              )}>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10 text-slate-200">
                {DIFFICULTY_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value} className="focus:bg-indigo-600 focus:text-white py-3">
                    <div className="flex flex-col">
                      <span className="font-bold">{level.label}</span>
                      <span className="text-[10px] text-slate-500 leading-tight">{level.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.difficulty && (
              <p className="text-xs text-rose-500 font-medium ml-2">{errors.difficulty}</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-indigo-400" />
              <Label htmlFor="language" className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                Instruction Language
              </Label>
            </div>
            <Select
              value={courseData.language}
              onValueChange={(value) =>
                setCourseData((prev) => ({ ...prev, language: value }))
              }
            >
              <SelectTrigger className="h-14 bg-white/5 border-white/10 text-white rounded-2xl focus:ring-indigo-500/50 transition-all">
                <SelectValue placeholder="English" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10 text-slate-200">
                {LANGUAGES.map((language) => (
                  <SelectItem key={language} value={language} className="focus:bg-indigo-600 focus:text-white">
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
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-indigo-400" />
              <Label htmlFor="price" className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                Course Tuition (GH₵)
              </Label>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-white transition-colors">
                <span className="font-bold">$</span>
              </div>
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
                className={cn(
                  "h-16 pl-12 bg-white/5 border-white/10 text-xl font-bold text-white rounded-2xl focus:ring-indigo-500/50 transition-all placeholder:text-slate-600",
                  errors.price && "border-rose-500/50 bg-rose-500/5"
                )}
                placeholder="0.00"
              />
            </div>
            {errors.price && (
              <p className="text-xs text-rose-500 font-medium ml-2">{errors.price}</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <ChevronRight className="w-4 h-4 text-indigo-400" />
              <Label htmlFor="applicationFee" className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                Application Fee (GH₵)
              </Label>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-white transition-colors">
                <span className="font-bold text-slate-400 text-xs">GH₵</span>
              </div>
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
                className="h-16 pl-12 bg-white/5 border-white/10 text-xl font-bold text-white rounded-2xl focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        <div className="p-8 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 space-y-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <Label className="text-sm font-bold text-white uppercase tracking-wider">Installment Plan</Label>
              <p className="text-xs text-slate-500 font-medium">Allow students to pay in multiple parts</p>
            </div>
            <div className="ml-auto">
              <Checkbox
                id="installmentEnabled"
                checked={courseData.installmentEnabled}
                onCheckedChange={(checked) =>
                  setCourseData((prev) => ({
                    ...prev,
                    installmentEnabled: checked as boolean,
                  }))
                }
                className="w-6 h-6 rounded-lg border-white/20 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
              />
            </div>
          </div>

          {courseData.installmentEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in zoom-in-95 duration-300">
              <div className="space-y-4">
                <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Payment Frequency</Label>
                <div className="grid grid-cols-2 gap-3">
                  {INSTALLMENT_PLANS.map((plan) => (
                    <button
                      key={plan.value}
                      onClick={() => setCourseData(prev => ({ ...prev, installmentPlan: plan.value }))}
                      className={cn(
                        "p-4 rounded-xl border text-left transition-all duration-300",
                        courseData.installmentPlan === plan.value 
                          ? "bg-indigo-500/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10" 
                          : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
                      )}
                    >
                      <p className="text-xs font-bold">{plan.label}</p>
                      <p className="text-[9px] opacity-60 leading-tight mt-1">{plan.description}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-center p-6 border border-white/5 rounded-2xl bg-black/20">
                <div className="text-center">
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Estimated per Payment</p>
                  <p className="text-3xl font-bold text-white">
                    GH₵ {(courseData.price / (courseData.installmentPlan === 'MONTHLY' ? 4 : 2)).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <Label htmlFor="duration" className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                Course Duration (Weeks)
              </Label>
            </div>
            <div className="relative group">
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
                className={cn(
                  "h-14 bg-white/5 border-white/10 text-white rounded-2xl focus:ring-indigo-500/50 transition-all pl-12",
                  errors.duration && "border-rose-500/50 bg-rose-500/5"
                )}
                placeholder="4"
              />
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            </div>
            {errors.duration && (
              <p className="text-xs text-rose-500 font-medium ml-2">{errors.duration}</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <Label htmlFor="estimatedHours" className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                Effort (Total Hours)
              </Label>
            </div>
            <div className="relative group">
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
                className={cn(
                  "h-14 bg-white/5 border-white/10 text-white rounded-2xl focus:ring-indigo-500/50 transition-all pl-12",
                  errors.estimatedHours && "border-rose-500/50 bg-rose-500/5"
                )}
                placeholder="20"
              />
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            </div>
            {errors.estimatedHours && (
              <p className="text-xs text-rose-500 font-medium ml-2">{errors.estimatedHours}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  function renderPrerequisitesObjectives() {
    return (
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Prerequisites */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Shield className="w-4 h-4 text-amber-500" />
              </div>
              <Label className="text-sm font-bold text-white uppercase tracking-wider">Prerequisites</Label>
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">Optional</span>
          </div>

          <div className="space-y-3">
            {courseData.prerequisites.map((prerequisite, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl group hover:bg-white/10 transition-all duration-300"
              >
                <div className="w-2 h-2 rounded-full bg-amber-500/40" />
                <span className="flex-1 text-slate-300 font-medium">{prerequisite}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removePrerequisite(index)}
                  className="w-8 h-8 rounded-lg text-slate-500 hover:bg-rose-500/20 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Input
              value={newPrerequisite}
              onChange={(e) => setNewPrerequisite(e.target.value)}
              placeholder="e.g. Basic understanding of JavaScript"
              onKeyPress={(e) => e.key === "Enter" && addPrerequisite()}
              className="h-14 bg-white/5 border-white/10 text-white rounded-2xl focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
            />
            <Button
              onClick={addPrerequisite}
              disabled={!newPrerequisite.trim()}
              className="h-14 w-14 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Learning Objectives */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <Target className="w-4 h-4 text-indigo-400" />
              </div>
              <Label className="text-sm font-bold text-white uppercase tracking-wider">Learning Objectives</Label>
            </div>
            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest bg-rose-500/10 px-2 py-0.5 rounded">Required</span>
          </div>

          <div className="space-y-3">
            {courseData.learningObjectives.map((objective, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl group hover:bg-indigo-500/10 transition-all duration-300"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-indigo-400">{index + 1}</span>
                </div>
                <span className="flex-1 text-slate-200 font-medium">{objective}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeObjective(index)}
                  className="w-8 h-8 rounded-lg text-slate-500 hover:bg-rose-500/20 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Input
              value={newObjective}
              onChange={(e) => setNewObjective(e.target.value)}
              placeholder="e.g. Master React Hooks and Context API"
              onKeyPress={(e) => e.key === "Enter" && addObjective()}
              className={cn(
                "h-14 bg-white/5 border-white/10 text-white rounded-2xl focus:ring-indigo-500/50 transition-all placeholder:text-slate-600",
                errors.objectives && "border-rose-500/20"
              )}
            />
            <Button 
              onClick={addObjective} 
              disabled={!newObjective.trim()}
              className="h-14 w-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-600/20 transition-all"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
          {errors.objectives && (
            <p className="text-xs text-rose-500 font-medium ml-2">{errors.objectives}</p>
          )}
        </div>
      </div>
    );
  }

  function renderCourseOutline() {
    return (
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <Layers className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <Label className="text-sm font-bold text-white uppercase tracking-wider">Course Curriculum</Label>
              <p className="text-xs text-slate-500 font-medium">Build your course structure item by item</p>
            </div>
          </div>
          <Badge className="bg-white/5 text-slate-400 border-white/5 px-3 py-1">
            {courseData.courseOutline.length} Modules
          </Badge>
        </div>

        {/* Outline Items */}
        <div className="space-y-4">
          {courseData.courseOutline.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-white/5 rounded-[2.5rem] bg-white/[0.01]">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-slate-500 font-medium">No content added yet. Start by defining your first module below.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {courseData.courseOutline.map((item, index) => (
                <div
                  key={item.id}
                  className="group flex items-center gap-6 p-6 bg-white/[0.03] border border-white/5 rounded-3xl hover:bg-white/[0.06] transition-all duration-300"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Seq</span>
                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-white/5 shadow-inner">
                      <span className="text-sm font-bold text-white">{(index + 1).toString().padStart(2, '0')}</span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <Badge className={cn(
                        "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md",
                        item.type === 'lesson' ? "bg-blue-500/20 text-blue-400" :
                        item.type === 'assignment' ? "bg-amber-500/20 text-amber-400" :
                        item.type === 'quiz' ? "bg-purple-500/20 text-purple-400" : "bg-emerald-500/20 text-emerald-400"
                      )}>
                        {item.type}
                      </Badge>
                      <h4 className="text-base font-bold text-white">{item.title}</h4>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1 mb-2 font-medium">{item.description || 'No description provided.'}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <Clock className="w-3 h-3" />
                        {item.duration} minutes
                      </div>
                      {item.isRequired && (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                          <CheckCircle2 className="w-3 h-3" />
                          Mandatory
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOutlineItem(item.id)}
                    className="w-12 h-12 rounded-2xl text-slate-500 hover:bg-rose-500/20 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add New Outline Item */}
        <div className="p-8 bg-indigo-500/5 border border-indigo-500/10 rounded-[2.5rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
            <Plus className="w-24 h-24 text-white" />
          </div>
          
          <h5 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Append New Content
          </h5>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            <div className="md:col-span-7 space-y-3">
              <Label htmlFor="outlineTitle" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Title</Label>
              <Input
                id="outlineTitle"
                value={newOutlineItem.title || ""}
                onChange={(e) =>
                  setNewOutlineItem((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                placeholder="e.g. Introduction to Neural Networks"
                className="h-14 bg-black/20 border-white/5 text-white rounded-2xl focus:ring-indigo-500/50 transition-all"
              />
            </div>

            <div className="md:col-span-3 space-y-3">
              <Label htmlFor="outlineType" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Type</Label>
              <Select
                value={newOutlineItem.type || "lesson"}
                onValueChange={(value: any) =>
                  setNewOutlineItem((prev) => ({
                    ...prev,
                    type: value,
                  }))
                }
              >
                <SelectTrigger className="h-14 bg-black/20 border-white/5 text-white rounded-2xl focus:ring-indigo-500/50 transition-all">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10 text-slate-200">
                  <SelectItem value="lesson">Lesson</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Button
                onClick={addOutlineItem}
                disabled={!newOutlineItem.title?.trim()}
                className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-600/20 transition-all"
              >
                <Plus className="w-6 h-6" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6 items-end">
            <div className="md:col-span-6 space-y-3">
              <Label htmlFor="outlineDescription" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Brief Summary</Label>
              <Input
                id="outlineDescription"
                value={newOutlineItem.description || ""}
                onChange={(e) =>
                  setNewOutlineItem((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="What will students learn in this part?"
                className="h-14 bg-black/20 border-white/5 text-white rounded-2xl focus:ring-indigo-500/50 transition-all"
              />
            </div>

            <div className="md:col-span-3 space-y-3">
              <Label htmlFor="outlineDuration" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Duration (min)</Label>
              <div className="relative">
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
                  className="h-14 bg-black/20 border-white/5 text-white rounded-2xl focus:ring-indigo-500/50 transition-all pl-12"
                />
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              </div>
            </div>

            <div className="md:col-span-3 pb-3">
              <div className="flex items-center gap-3 bg-black/10 p-3 rounded-xl border border-white/5">
                <Checkbox
                  id="outlineRequired"
                  checked={newOutlineItem.isRequired || true}
                  onCheckedChange={(checked) =>
                    setNewOutlineItem((prev) => ({
                      ...prev,
                      isRequired: checked as boolean,
                    }))
                  }
                  className="w-5 h-5 rounded-md border-white/20 data-[state=checked]:bg-emerald-500"
                />
                <Label htmlFor="outlineRequired" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer">Required Part</Label>
              </div>
            </div>
          </div>
        </div>

        {errors.outline && (
          <p className="text-xs text-rose-500 font-medium ml-2">{errors.outline}</p>
        )}
      </div>
    );
  }

  function renderMediaResources() {
    return (
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Course Thumbnail */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <Image className="w-4 h-4 text-indigo-400" />
            </div>
            <Label className="text-sm font-bold text-white uppercase tracking-wider">Visual Identity (Thumbnail)</Label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="relative group aspect-video bg-black/40 border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center overflow-hidden transition-all hover:border-indigo-500/40">
              {courseData.thumbnail ? (
                <>
                  <img
                    src={URL.createObjectURL(courseData.thumbnail)}
                    alt="Course thumbnail"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setCourseData((prev) => ({ ...prev, thumbnail: null }))}
                      className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-500 hover:bg-rose-500 transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </>
              ) : (
                <label className="cursor-pointer flex flex-col items-center p-8 w-full h-full justify-center">
                  <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all">
                    <Upload className="w-8 h-8 text-slate-600 group-hover:text-indigo-400" />
                  </div>
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Upload Cover</span>
                  <span className="text-[10px] text-slate-600 mt-2 font-medium">1280x720 recommended</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setCourseData((prev) => ({ ...prev, thumbnail: file }));
                    }}
                  />
                </label>
              )}
            </div>

            <div className="space-y-4">
              <h6 className="text-sm font-bold text-slate-300">Thumbnail Requirements</h6>
              <ul className="space-y-3">
                {[
                  { label: "High resolution (min 1280x720)", icon: <CheckCircle2 className="w-3 h-3 text-emerald-500" /> },
                  { label: "JPG, PNG or WEBP format", icon: <CheckCircle2 className="w-3 h-3 text-emerald-500" /> },
                  { label: "Maximum file size: 5MB", icon: <CheckCircle2 className="w-3 h-3 text-emerald-500" /> },
                  { label: "No offensive content or copyright material", icon: <CheckCircle2 className="w-3 h-3 text-emerald-500" /> }
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                    {item.icon}
                    {item.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {errors.thumbnail && (
            <p className="text-xs text-rose-500 font-medium ml-2">{errors.thumbnail}</p>
          )}
        </div>

        {/* Video Resources */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <Video className="w-4 h-4 text-indigo-400" />
              </div>
              <Label className="text-sm font-bold text-white uppercase tracking-wider">Course Trailer (Optional)</Label>
            </div>
          </div>

          <div className="p-8 bg-black/40 border border-white/5 rounded-[2rem] flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-3">
              <Link className="w-5 h-5 text-slate-600" />
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 text-center">Cloudinary Storage Ready</p>
            <div className="flex gap-3 w-full max-w-lg">
              <Input
                placeholder="Cloudinary public ID or video URL"
                value={courseData.promotionalVideo}
                onChange={(e) => setCourseData(prev => ({ ...prev, promotionalVideo: e.target.value }))}
                className="h-14 bg-black/20 border-white/5 text-white rounded-2xl focus:ring-indigo-500/50 transition-all font-medium"
              />
              <Button className="h-14 bg-white/10 hover:bg-white/20 text-white rounded-2xl px-6 font-bold transition-all">Preview</Button>
            </div>
          </div>
        </div>

        {/* Course Materials */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <FileText className="w-4 h-4 text-indigo-400" />
              </div>
              <Label className="text-sm font-bold text-white uppercase tracking-wider">Course Materials</Label>
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">
              {courseData.courseMaterials.length} Files Attached
            </span>
          </div>

          <div className="space-y-3">
            {courseData.courseMaterials.map((material) => (
              <div
                key={material.id}
                className="group flex items-center gap-4 p-4 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/[0.06] transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center">
                  {material.type === "video" && <Video className="w-5 h-5 text-rose-400" />}
                  {material.type === "audio" && <Volume2 className="w-5 h-5 text-blue-400" />}
                  {material.type === "image" && <Image className="w-5 h-5 text-emerald-400" />}
                  {material.type === "document" && <FileText className="w-5 h-5 text-indigo-400" />}
                  {material.type === "link" && <Link className="w-5 h-5 text-amber-400" />}
                </div>

                <div className="flex-1">
                  <p className="text-sm font-bold text-white">{material.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{material.type}</span>
                    {material.size && (
                      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                        • {(material.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMaterial(material.id)}
                  className="w-10 h-10 rounded-xl text-slate-500 hover:bg-rose-500/20 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="relative group p-6 border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.01] hover:bg-white/[0.02] hover:border-white/10 transition-all text-center">
            <input
              type="file"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                files.forEach((file) => handleFileUpload(file, "material"));
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6 text-slate-500" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Drop files here or click to browse</p>
            <p className="text-[10px] text-slate-600 mt-2 font-medium">Supporting PDF, Word, MP4, and Common Images</p>
          </div>
        </div>
      </div>
    );
  }

  function renderSettingsFeatures() {
    return (
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Course Delivery Mode */}
        <div className="space-y-8">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <Layers className="w-4 h-4 text-indigo-400" />
            </div>
            <Label className="text-sm font-bold text-white uppercase tracking-wider">Course Delivery Mode</Label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { value: "online", label: "Virtual Learning", description: "Fully remote experience via our LMS." },
              { value: "offline", label: "Campus Based", description: "Traditional in-person classroom setting." },
              { value: "hybrid", label: "Blended Model", description: "Best of both worlds: online & onsite." },
            ].map((mode) => (
              <button
                key={mode.value}
                onClick={() => {
                  if (courseData.mode.includes(mode.value)) {
                    setCourseData(prev => ({ ...prev, mode: prev.mode.filter(m => m !== mode.value) }));
                  } else {
                    setCourseData(prev => ({ ...prev, mode: [...prev.mode, mode.value] }));
                  }
                }}
                className={cn(
                  "p-6 rounded-3xl border text-left transition-all duration-300",
                  courseData.mode.includes(mode.value)
                    ? "bg-indigo-500/10 border-indigo-500/30 ring-1 ring-indigo-500/20"
                    : "bg-white/5 border-white/5 hover:bg-white/10"
                )}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className={cn("text-xs font-bold uppercase tracking-widest", courseData.mode.includes(mode.value) ? "text-indigo-400" : "text-slate-500")}>
                      {mode.value}
                    </span>
                    <Checkbox checked={courseData.mode.includes(mode.value)} className="pointer-events-none" />
                  </div>
                  <h6 className="text-sm font-bold text-white">{mode.label}</h6>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{mode.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <Settings2 className="w-4 h-4 text-indigo-400" />
            </div>
            <Label className="text-sm font-bold text-white uppercase tracking-wider">Deployment & Capacity</Label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <Label htmlFor="maxStudents" className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                  Audience Size (Max)
                </Label>
              </div>
              <div className="relative group">
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
                  className="h-14 bg-white/5 border-white/10 text-white rounded-2xl focus:ring-indigo-500/50 transition-all font-bold text-lg pl-12"
                  placeholder="Unlimited"
                />
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-indigo-400" />
                <Label htmlFor="language" className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                  Instruction Language
                </Label>
              </div>
              <Select
                value={courseData.language}
                onValueChange={(value) =>
                  setCourseData((prev) => ({ ...prev, language: value }))
                }
              >
                <SelectTrigger className="h-14 bg-white/5 border-white/10 text-white rounded-2xl focus:ring-indigo-500/50 transition-all">
                  <SelectValue placeholder="English" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10 text-slate-200">
                  {LANGUAGES.map((language) => (
                    <SelectItem key={language} value={language} className="focus:bg-indigo-600 focus:text-white">
                      {language}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <Label className="text-sm font-bold text-white uppercase tracking-wider">Course Features & Tools</Label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                key: "certificateAwarded" as const,
                label: "Digital Certification",
                icon: <Shield className="w-4 h-4" />,
                description: "Blockchain-verified certificates",
              },
              {
                key: "enableDiscussion" as const,
                label: "Real-time Discussion",
                icon: <FileText className="w-4 h-4" />,
                description: "Dedicated forum for each module",
              },
              {
                key: "enableLiveSessions" as const,
                label: "Sync Live Sessions",
                icon: <Video className="w-4 h-4" />,
                description: "Interactive Q&A and webinars",
              },
              {
                key: "enableAssessments" as const,
                label: "Guided Assessments",
                icon: <CheckCircle2 className="w-4 h-4" />,
                description: "Auto-graded quizzes and feedback",
              },
              {
                key: "isPublic" as const,
                label: "Catalog Visibility",
                icon: <Users className="w-4 h-4" />,
                description: "Feature in public marketplace",
              },
              {
                key: "allowEnrollment" as const,
                label: "Instant Enrollment",
                icon: <Zap className="w-4 h-4" />,
                description: "Skip application processing",
              },
              {
                key: "requireApplication" as const,
                label: "Admission Required",
                icon: <FileText className="w-4 h-4" />,
                description: "Vet students before they join",
              },
              {
                key: "autoApprove" as const,
                label: "Auto-Admission",
                icon: <CheckCircle2 className="w-4 h-4" />,
                description: "System-vetted intake protocol",
              },
            ].map((feature) => (
              <button
                key={feature.key}
                onClick={() => setCourseData(prev => ({ ...prev, [feature.key]: !prev[feature.key] }))}
                className={cn(
                  "p-5 rounded-2xl border text-left transition-all duration-300 group",
                  courseData[feature.key]
                    ? "bg-indigo-500/10 border-indigo-500/30 ring-1 ring-indigo-500/20"
                    : "bg-white/5 border-white/5 hover:bg-white/10"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                    courseData[feature.key] ? "bg-indigo-500 text-white" : "bg-white/5 text-slate-500"
                  )}>
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <p className={cn("text-sm font-bold", courseData[feature.key] ? "text-white" : "text-slate-400")}>{feature.label}</p>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">{feature.description}</p>
                  </div>
                  <Checkbox
                    checked={courseData[feature.key]}
                    className="mt-1 pointer-events-none"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderReviewPublish() {
    return (
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-[2.5rem] bg-indigo-500/20 flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/10">
            <Shield className="w-10 h-10 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white tracking-tight">Final Verification</h3>
            <p className="text-slate-500 font-medium">Please verify your course parameters before publishing to the platform.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Quick Stats Panel */}
          <div className="p-8 bg-indigo-500/5 border border-indigo-500/10 rounded-[2.5rem] space-y-6">
            <h5 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-3 h-3" />
              Course Vital Statistics
            </h5>
            <div className="grid grid-cols-2 gap-6">
              {[
                { label: "Final Price", value: `GH₵ ${courseData.price}`, icon: <DollarSign className="w-4 h-4 text-emerald-400" /> },
                { label: "Application Fee", value: `GH₵ ${courseData.applicationFee}`, icon: <Shield className="w-4 h-4 text-indigo-400" /> },
                { label: "Curriculum Size", value: `${courseData.courseOutline.length} Modules`, icon: <Layers className="w-4 h-4 text-blue-400" /> },
                { label: "Total Duration", value: `${courseData.duration} Weeks`, icon: <Calendar className="w-4 h-4 text-amber-400" /> }
              ].map((stat, i) => (
                <div key={i} className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                  <div className="flex items-center gap-2">
                    {stat.icon}
                    <span className="text-lg font-bold text-white tracking-tight">{stat.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Configuration */}
          <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] space-y-6">
            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Settings2 className="w-3 h-3" />
              Delivery & Access
            </h5>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                    <Layers className="w-4 h-4 text-indigo-400" />
                  </div>
                  <span className="text-sm font-bold text-slate-300">Mode</span>
                </div>
                <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/20 uppercase text-[10px] font-bold tracking-widest px-3">
                  {courseData.mode.join(" + ") || "Not Specified"}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-sm font-bold text-slate-300">Intake Process</span>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/20 uppercase text-[10px] font-bold tracking-widest px-3">
                  {courseData.requireApplication ? "Manual Vet" : "Instant Enroll"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Major Content Summary */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
              <FileText className="w-4 h-4 text-slate-400" />
            </div>
            <Label className="text-sm font-bold text-white uppercase tracking-wider">Course Outline Verification</Label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courseData.courseOutline.length > 0 ? (
              courseData.courseOutline.slice(0, 6).map((item, i) => (
                <div key={item.id} className="p-4 bg-white/[0.03] border border-white/10 rounded-2xl flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center border border-white/5 text-[10px] font-bold text-indigo-400">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h6 className="text-xs font-bold text-white truncate">{item.title}</h6>
                    <p className="text-[10px] text-slate-500 uppercase font-bold mt-1 tracking-widest">{item.type} • {item.duration} min</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full p-8 border-2 border-dashed border-white/5 rounded-3xl text-center">
                <AlertCircle className="w-8 h-8 text-rose-500/40 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No curriculum content defined.</p>
              </div>
            )}
            {courseData.courseOutline.length > 6 && (
              <div className="p-4 bg-indigo-600/10 border border-indigo-600/20 rounded-2xl flex items-center justify-center">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">+{courseData.courseOutline.length - 6} More Items</span>
              </div>
            )}
          </div>
        </div>

        {/* Final Confirmation Warning */}
        <div className="p-6 bg-rose-500/5 border border-rose-500/20 rounded-3xl flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-rose-500" />
          </div>
          <div className="space-y-1">
            <h6 className="text-sm font-bold text-rose-500 uppercase tracking-tight">Important Notice</h6>
            <p className="text-xs text-rose-500/70 font-medium leading-relaxed">
              By publishing this course, you confirm that all content adheres to our educational standards and you hold the necessary rights to use all attached media and materials.
            </p>
          </div>
        </div>
      </div>
    );
  }
}
