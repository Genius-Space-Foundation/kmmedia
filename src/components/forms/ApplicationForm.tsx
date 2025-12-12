"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AutoSaveIndicator } from "@/components/ui/auto-save-indicator";
import { useAutoSave } from "@/lib/hooks/useAutoSave";
import { Progress } from "@/components/ui/progress";
import { FileUpload, UploadedFile } from "@/components/ui/file-upload";
import { useDocumentUpload } from "@/lib/hooks/useDocumentUpload";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Briefcase,
  Target,
  FileText,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Save,
} from "lucide-react";

// Form validation schemas for each step
const step1Schema = z.object({
  personalInfo: z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    address: z.string().min(10, "Address must be at least 10 characters"),
  }),
});

const step2Schema = z.object({
  education: z.object({
    highestEducation: z.string().min(1, "Education level is required"),
    institution: z.string().min(2, "Institution name is required"),
    graduationYear: z.string().min(4, "Graduation year is required"),
    fieldOfStudy: z.string().min(2, "Field of study is required"),
  }),
});

const step3Schema = z.object({
  experience: z.object({
    workExperience: z.string().min(1, "Work experience is required"),
    relevantSkills: z.string().min(10, "Please describe your relevant skills"),
    motivation: z
      .string()
      .min(10, "Please provide your motivation (minimum 10 characters)"),
    goals: z
      .string()
      .min(10, "Please describe your goals (minimum 10 characters)"),
  }),
});

const step4Schema = z.object({
  documents: z.object({
    resume: z.array(z.string()).optional(),
    coverLetter: z.array(z.string()).optional(),
    portfolio: z.array(z.string()).optional(),
    certificates: z.array(z.string()).optional(),
  }),
});

// Combined schema for final submission
const applicationSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema);

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface ApplicationFormProps {
  courseId: string;
  courseName: string;
  onSubmit?: (data: ApplicationFormData) => void;
  onDraftLoad?: (draft: any) => void;
}

const STEPS = [
  {
    id: 1,
    title: "Personal Info",
    description: "Tell us about yourself",
    icon: User,
  },
  {
    id: 2,
    title: "Education",
    description: "Your academic background",
    icon: GraduationCap,
  },
  {
    id: 3,
    title: "Experience",
    description: "Skills and motivation",
    icon: Briefcase,
  },
  {
    id: 4,
    title: "Documents",
    description: "Supporting materials",
    icon: FileText,
  },
];

export function ApplicationForm({
  courseId,
  courseName,
  onSubmit,
  onDraftLoad,
}: ApplicationFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadedDocuments, setUploadedDocuments] = useState<{
    resume: UploadedFile[];
    coverLetter: UploadedFile[];
    portfolio: UploadedFile[];
    certificates: UploadedFile[];
  }>({
    resume: [],
    coverLetter: [],
    portfolio: [],
    certificates: [],
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    mode: "onChange",
  });

  // Watch all form values for auto-save
  const formData = watch();

  // Document upload functionality
  const {
    uploadFiles,
    isUploading,
    error: uploadError,
  } = useDocumentUpload({
    onUploadSuccess: (files) => {
      console.log("Files uploaded successfully:", files);
    },
    onUploadError: (error) => {
      console.error("Upload error:", error);
      setError(`Upload failed: ${error}`);
    },
  });

  // Auto-save functionality
  const { saveStatus, loadDraft, deleteDraft, saveNow } = useAutoSave({
    courseId,
    currentStep,
    formData,
    enabled: true,
    debounceMs: 2000,
    onSaveSuccess: (data) => {
      console.log("Draft saved successfully:", data);
    },
    onSaveError: (error) => {
      console.error("Failed to save draft:", error);
    },
  });

  // Load existing draft on component mount
  useEffect(() => {
    const loadExistingDraft = async () => {
      try {
        const draft = await loadDraft();
        if (draft) {
          // Populate form with draft data
          Object.entries(draft.formData).forEach(([key, value]) => {
            setValue(key as any, value);
          });
          setCurrentStep(draft.currentStep);
          onDraftLoad?.(draft);
        }
      } catch (error) {
        console.error("Failed to load draft:", error);
      }
    };

    loadExistingDraft();
  }, [loadDraft, setValue, onDraftLoad]);

  const progress = (currentStep / STEPS.length) * 100;

  const handleNext = async () => {
    const currentStepSchema = getCurrentStepSchema();
    const currentData = getCurrentStepData();

    try {
      await currentStepSchema.parseAsync(currentData);
      if (currentStep < STEPS.length) {
        setCurrentStep(currentStep + 1);
      } else {
        await handleFinalSubmit();
      }
    } catch (validationError) {
      // Trigger validation to show errors
      await trigger();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getCurrentStepSchema = () => {
    switch (currentStep) {
      case 1:
        return step1Schema;
      case 2:
        return step2Schema;
      case 3:
        return step3Schema;
      case 4:
        return step4Schema;
      default:
        return step1Schema;
    }
  };

  const getCurrentStepData = () => {
    const allData = getValues();
    switch (currentStep) {
      case 1:
        return { personalInfo: allData.personalInfo };
      case 2:
        return { education: allData.education };
      case 3:
        return { experience: allData.experience };
      case 4:
        return { documents: allData.documents };
      default:
        return {};
    }
  };

  const handleFinalSubmit = async () => {
    setIsLoading(true);
    setError("");

    try {
      const formData = getValues();

      // Submit the application
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId,
          formData,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Delete the draft after successful submission
        await deleteDraft();
        onSubmit?.(formData);
      } else {
        setError(result.message || "Application submission failed");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  First Name *
                </Label>
                <Input
                  id="firstName"
                  {...register("personalInfo.firstName")}
                  placeholder="Enter your first name"
                  className="h-11"
                />
                {errors.personalInfo?.firstName && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.personalInfo.firstName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  Last Name *
                </Label>
                <Input
                  id="lastName"
                  {...register("personalInfo.lastName")}
                  placeholder="Enter your last name"
                  className="h-11"
                />
                {errors.personalInfo?.lastName && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.personalInfo.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-600" />
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                {...register("personalInfo.email")}
                placeholder="your.email@example.com"
                className="h-11"
              />
              {errors.personalInfo?.email && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.personalInfo.email.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4 text-blue-600" />
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  {...register("personalInfo.phone")}
                  placeholder="+233 XX XXX XXXX"
                  className="h-11"
                />
                {errors.personalInfo?.phone && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.personalInfo.phone.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  Date of Birth *
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  {...register("personalInfo.dateOfBirth")}
                  className="h-11"
                />
                {errors.personalInfo?.dateOfBirth && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.personalInfo.dateOfBirth.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                Address *
              </Label>
              <Textarea
                id="address"
                {...register("personalInfo.address")}
                placeholder="Enter your full address"
                rows={3}
                className="resize-none"
              />
              {errors.personalInfo?.address && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.personalInfo.address.message}
                </p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <Label htmlFor="highestEducation" className="text-sm font-medium flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-purple-600" />
                Highest Education Level *
              </Label>
              <Select
                onValueChange={(value) =>
                  setValue("education.highestEducation", value)
                }
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select your education level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high-school">High School</SelectItem>
                  <SelectItem value="diploma">Diploma</SelectItem>
                  <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                  <SelectItem value="master">Master's Degree</SelectItem>
                  <SelectItem value="phd">PhD</SelectItem>
                </SelectContent>
              </Select>
              {errors.education?.highestEducation && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.education.highestEducation.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="institution" className="text-sm font-medium">
                  Institution Name *
                </Label>
                <Input
                  id="institution"
                  {...register("education.institution")}
                  placeholder="University or institution name"
                  className="h-11"
                />
                {errors.education?.institution && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.education.institution.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="graduationYear" className="text-sm font-medium">
                  Graduation Year *
                </Label>
                <Input
                  id="graduationYear"
                  {...register("education.graduationYear")}
                  placeholder="e.g., 2020"
                  className="h-11"
                />
                {errors.education?.graduationYear && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.education.graduationYear.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fieldOfStudy" className="text-sm font-medium">
                Field of Study *
              </Label>
              <Input
                id="fieldOfStudy"
                {...register("education.fieldOfStudy")}
                placeholder="e.g., Computer Science, Business Administration"
                className="h-11"
              />
              {errors.education?.fieldOfStudy && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.education.fieldOfStudy.message}
                </p>
              )}
            </div>
          </div>
        );

      case 3:
        const motivationValue = watch("experience.motivation") || "";
        const goalsValue = watch("experience.goals") || "";
        const skillsValue = watch("experience.relevantSkills") || "";

        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <Label htmlFor="workExperience" className="text-sm font-medium flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-green-600" />
                Work Experience *
              </Label>
              <Select
                onValueChange={(value) =>
                  setValue("experience.workExperience", value)
                }
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select your work experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No experience</SelectItem>
                  <SelectItem value="0-1">0-1 years</SelectItem>
                  <SelectItem value="1-3">1-3 years</SelectItem>
                  <SelectItem value="3-5">3-5 years</SelectItem>
                  <SelectItem value="5+">5+ years</SelectItem>
                </SelectContent>
              </Select>
              {errors.experience?.workExperience && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.experience.workExperience.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="relevantSkills" className="text-sm font-medium">
                  Relevant Skills *
                </Label>
                <span className="text-xs text-gray-500">
                  {skillsValue.length} characters
                </span>
              </div>
              <Textarea
                id="relevantSkills"
                {...register("experience.relevantSkills")}
                placeholder="Describe your relevant skills and experience..."
                rows={4}
                className="resize-none"
              />
              {errors.experience?.relevantSkills && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.experience.relevantSkills.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="motivation" className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4 text-orange-600" />
                  Why do you want to take this course? *
                </Label>
                <span className={`text-xs ${motivationValue.length < 10 ? 'text-red-500' : 'text-gray-500'}`}>
                  {motivationValue.length}/10 min
                </span>
              </div>
              <Textarea
                id="motivation"
                {...register("experience.motivation")}
                placeholder="Explain your motivation for taking this course..."
                rows={4}
                className="resize-none"
              />
              {errors.experience?.motivation && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.experience.motivation.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="goals" className="text-sm font-medium">
                  Career Goals *
                </Label>
                <span className={`text-xs ${goalsValue.length < 10 ? 'text-red-500' : 'text-gray-500'}`}>
                  {goalsValue.length}/10 min
                </span>
              </div>
              <Textarea
                id="goals"
                {...register("experience.goals")}
                placeholder="Describe your career goals and how this course will help..."
                rows={4}
                className="resize-none"
              />
              {errors.experience?.goals && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.experience.goals.message}
                </p>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">
                    Document Upload
                  </h3>
                  <p className="text-sm text-blue-700">
                    Upload your supporting documents. All documents are optional but
                    recommended to strengthen your application.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Resume/CV</Label>
                <FileUpload
                  accept=".pdf,.doc,.docx"
                  maxFiles={1}
                  maxSize={5}
                  multiple={false}
                  onFilesChange={(files) => {
                    setUploadedDocuments((prev) => ({
                      ...prev,
                      resume: files,
                    }));
                    const urls = files.filter((f) => f.url).map((f) => f.url!);
                    setValue("documents.resume", urls);
                  }}
                  onUpload={uploadFiles}
                  label="Upload Resume/CV"
                  description="PDF, DOC, or DOCX (Max 5MB)"
                  disabled={isUploading}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Cover Letter</Label>
                <FileUpload
                  accept=".pdf,.doc,.docx"
                  maxFiles={1}
                  maxSize={5}
                  multiple={false}
                  onFilesChange={(files) => {
                    setUploadedDocuments((prev) => ({
                      ...prev,
                      coverLetter: files,
                    }));
                    const urls = files.filter((f) => f.url).map((f) => f.url!);
                    setValue("documents.coverLetter", urls);
                  }}
                  onUpload={uploadFiles}
                  label="Upload Cover Letter"
                  description="PDF, DOC, or DOCX (Max 5MB)"
                  disabled={isUploading}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">
                  Portfolio (Optional)
                </Label>
                <FileUpload
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.mp4,.mov"
                  maxFiles={3}
                  maxSize={10}
                  multiple={true}
                  onFilesChange={(files) => {
                    setUploadedDocuments((prev) => ({
                      ...prev,
                      portfolio: files,
                    }));
                    const urls = files.filter((f) => f.url).map((f) => f.url!);
                    setValue("documents.portfolio", urls);
                  }}
                  onUpload={uploadFiles}
                  label="Upload Portfolio"
                  description="Documents, images, or videos (Max 10MB each, up to 3 files)"
                  disabled={isUploading}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">
                  Certificates (Optional)
                </Label>
                <FileUpload
                  accept=".pdf,.jpg,.jpeg,.png"
                  maxFiles={5}
                  maxSize={5}
                  multiple={true}
                  onFilesChange={(files) => {
                    setUploadedDocuments((prev) => ({
                      ...prev,
                      certificates: files,
                    }));
                    const urls = files.filter((f) => f.url).map((f) => f.url!);
                    setValue("documents.certificates", urls);
                  }}
                  onUpload={uploadFiles}
                  label="Upload Certificates"
                  description="PDF or images (Max 5MB each, up to 5 files)"
                  disabled={isUploading}
                />
              </div>
            </div>

            {uploadError && (
              <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <span>{uploadError}</span>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="border-0 shadow-2xl">
        <CardHeader className="space-y-6 pb-8">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Application for {courseName}
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Complete all steps to submit your application
              </CardDescription>
            </div>
            <AutoSaveIndicator status={saveStatus} />
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-sm font-medium text-gray-700 mb-3">
              <span>Progress</span>
              <span className="text-blue-600">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2.5" />
          </div>

          {/* Step Indicators */}
          <div className="grid grid-cols-4 gap-2">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;

              return (
                <div
                  key={step.id}
                  className={`relative flex flex-col items-center p-4 rounded-xl transition-all ${
                    isActive
                      ? "bg-blue-50 border-2 border-blue-600"
                      : isCompleted
                      ? "bg-green-50 border-2 border-green-600"
                      : "bg-gray-50 border-2 border-gray-200"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg scale-110"
                        : isCompleted
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      <Icon className="h-6 w-6" />
                    )}
                  </div>
                  <p
                    className={`text-xs font-semibold text-center ${
                      isActive
                        ? "text-blue-900"
                        : isCompleted
                        ? "text-green-900"
                        : "text-gray-600"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 text-center mt-1 hidden sm:block">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </CardHeader>

        <CardContent className="pb-8">
          {error && (
            <div className="mb-6 p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
              <AlertCircle className="h-5 w-5 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-8">
            {renderStep()}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-8 border-t-2">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1 || isLoading}
                className="h-11 px-6"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={saveNow}
                  disabled={isLoading}
                  className="h-11 px-6"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={isLoading}
                  className="h-11 px-8 bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </div>
                  ) : currentStep === STEPS.length ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Submit Application
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
