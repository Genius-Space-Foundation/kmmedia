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
    gpa: z.string().optional(),
  }),
});

const step3Schema = z.object({
  experience: z.object({
    workExperience: z.string().min(1, "Work experience is required"),
    relevantSkills: z.string().min(10, "Please describe your relevant skills"),
    motivation: z
      .string()
      .min(50, "Please provide a detailed motivation (minimum 50 characters)"),
    goals: z
      .string()
      .min(30, "Please describe your goals (minimum 30 characters)"),
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
    title: "Personal Information",
    description: "Basic personal details",
  },
  { id: 2, title: "Education", description: "Educational background" },
  {
    id: 3,
    title: "Experience & Motivation",
    description: "Work experience and goals",
  },
  { id: 4, title: "Documents", description: "Upload supporting documents" },
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
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  {...register("personalInfo.firstName")}
                  placeholder="Enter your first name"
                />
                {errors.personalInfo?.firstName && (
                  <p className="text-sm text-red-600">
                    {errors.personalInfo.firstName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  {...register("personalInfo.lastName")}
                  placeholder="Enter your last name"
                />
                {errors.personalInfo?.lastName && (
                  <p className="text-sm text-red-600">
                    {errors.personalInfo.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                {...register("personalInfo.email")}
                placeholder="Enter your email address"
              />
              {errors.personalInfo?.email && (
                <p className="text-sm text-red-600">
                  {errors.personalInfo.email.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  {...register("personalInfo.phone")}
                  placeholder="Enter your phone number"
                />
                {errors.personalInfo?.phone && (
                  <p className="text-sm text-red-600">
                    {errors.personalInfo.phone.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  {...register("personalInfo.dateOfBirth")}
                />
                {errors.personalInfo?.dateOfBirth && (
                  <p className="text-sm text-red-600">
                    {errors.personalInfo.dateOfBirth.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                {...register("personalInfo.address")}
                placeholder="Enter your full address"
                rows={3}
              />
              {errors.personalInfo?.address && (
                <p className="text-sm text-red-600">
                  {errors.personalInfo.address.message}
                </p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="highestEducation">Highest Education Level</Label>
              <Select
                onValueChange={(value) =>
                  setValue("education.highestEducation", value)
                }
              >
                <SelectTrigger>
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
                <p className="text-sm text-red-600">
                  {errors.education.highestEducation.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="institution">Institution Name</Label>
                <Input
                  id="institution"
                  {...register("education.institution")}
                  placeholder="Enter institution name"
                />
                {errors.education?.institution && (
                  <p className="text-sm text-red-600">
                    {errors.education.institution.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="graduationYear">Graduation Year</Label>
                <Input
                  id="graduationYear"
                  {...register("education.graduationYear")}
                  placeholder="e.g., 2020"
                />
                {errors.education?.graduationYear && (
                  <p className="text-sm text-red-600">
                    {errors.education.graduationYear.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fieldOfStudy">Field of Study</Label>
              <Input
                id="fieldOfStudy"
                {...register("education.fieldOfStudy")}
                placeholder="Enter your field of study"
              />
              {errors.education?.fieldOfStudy && (
                <p className="text-sm text-red-600">
                  {errors.education.fieldOfStudy.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gpa">GPA (Optional)</Label>
              <Input
                id="gpa"
                {...register("education.gpa")}
                placeholder="e.g., 3.8"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="workExperience">Work Experience</Label>
              <Select
                onValueChange={(value) =>
                  setValue("experience.workExperience", value)
                }
              >
                <SelectTrigger>
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
                <p className="text-sm text-red-600">
                  {errors.experience.workExperience.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="relevantSkills">Relevant Skills</Label>
              <Textarea
                id="relevantSkills"
                {...register("experience.relevantSkills")}
                placeholder="Describe your relevant skills and experience"
                rows={4}
              />
              {errors.experience?.relevantSkills && (
                <p className="text-sm text-red-600">
                  {errors.experience.relevantSkills.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="motivation">
                Why do you want to take this course?
              </Label>
              <Textarea
                id="motivation"
                {...register("experience.motivation")}
                placeholder="Explain your motivation for taking this course"
                rows={4}
              />
              {errors.experience?.motivation && (
                <p className="text-sm text-red-600">
                  {errors.experience.motivation.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="goals">Career Goals</Label>
              <Textarea
                id="goals"
                {...register("experience.goals")}
                placeholder="Describe your career goals and how this course will help"
                rows={4}
              />
              {errors.experience?.goals && (
                <p className="text-sm text-red-600">
                  {errors.experience.goals.message}
                </p>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">
                Document Upload
              </h3>
              <p className="text-sm text-blue-700">
                Upload your supporting documents. All documents are optional but
                recommended to strengthen your application.
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Resume/CV</Label>
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
                  description="Drag and drop your resume or click to browse (PDF, DOC, DOCX)"
                  disabled={isUploading}
                />
              </div>

              <div className="space-y-2">
                <Label>Cover Letter</Label>
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
                  description="Drag and drop your cover letter or click to browse (PDF, DOC, DOCX)"
                  disabled={isUploading}
                />
              </div>

              <div className="space-y-2">
                <Label>Portfolio (Optional)</Label>
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
                  description="Drag and drop your portfolio files or click to browse (PDF, DOC, DOCX, Images, Videos)"
                  disabled={isUploading}
                />
              </div>

              <div className="space-y-2">
                <Label>Certificates (Optional)</Label>
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
                  description="Drag and drop your certificates or click to browse (PDF, Images)"
                  disabled={isUploading}
                />
              </div>
            </div>

            {uploadError && (
              <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                {uploadError}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Application for {courseName}</CardTitle>
            <CardDescription>
              Step {currentStep} of {STEPS.length}:{" "}
              {STEPS[currentStep - 1].description}
            </CardDescription>
          </div>
          <AutoSaveIndicator status={saveStatus} />
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-between mt-4">
          {STEPS.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center ${
                index < STEPS.length - 1 ? "flex-1" : ""
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.id <= currentStep
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {step.id}
              </div>
              <div className="ml-2 hidden sm:block">
                <p className="text-sm font-medium">{step.title}</p>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-4 ${
                    step.id < currentStep ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-6 p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        <form className="space-y-6">
          {renderStep()}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1 || isLoading}
            >
              Previous
            </Button>

            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={saveNow}
                disabled={isLoading}
              >
                Save Now
              </Button>
              <Button type="button" onClick={handleNext} disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </div>
                ) : currentStep === STEPS.length ? (
                  "Submit Application"
                ) : (
                  "Next"
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
