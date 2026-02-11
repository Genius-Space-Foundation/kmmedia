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
  CreditCard,
} from "lucide-react";
import { makeAuthenticatedRequest } from "@/lib/token-utils";
import UnifiedPaymentFlow from "@/components/student/payments/UnifiedPaymentFlow";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/currency";

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

// Step 4 is now Review & Pay - no validation needed beyond payment check
const step4Schema = z.object({});

// Combined schema for final submission
const applicationSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema);

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface ApplicationFormProps {
  courseId: string;
  courseName: string;
  applicationFee: number;
  initialUser?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
    dateOfBirth?: string;
  } | null;
  onSubmit?: (data: ApplicationFormData) => void;
  onDraftLoad?: (draft: any) => void;
  onSuccessRedirect?: string;
}

// Add this interface for payment context
interface PaymentContext {
  amount: number;
  courseId?: string;
  courseName?: string;
  applicationId?: string;
  type: "APPLICATION_FEE" | "TUITION" | "INSTALLMENT";
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
    title: "Review & Pay",
    description: "Application Fee",
    icon: CreditCard,
  },
];

export function ApplicationForm({
  courseId,
  courseName,
  applicationFee,
  initialUser,
  onSubmit,
  onDraftLoad,
  onSuccessRedirect,
}: ApplicationFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isFeePaid, setIsFeePaid] = useState(false);
  const [isInitializingPayment, setIsInitializingPayment] = useState(false);
  // Add these new state variables for payment flow
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);
  const [paymentContext, setPaymentContext] = useState<PaymentContext | null>(null);

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
    defaultValues: {
      personalInfo: {
        firstName: initialUser?.firstName || "",
        lastName: initialUser?.lastName || "",
        email: initialUser?.email || "",
        phone: initialUser?.phone || "",
        address: initialUser?.address || "",
        dateOfBirth: initialUser?.dateOfBirth || "",
      }
    }
  });

  // Document upload functionality removed

  const formData = watch();

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

  // Load existing draft and check payment status on mount
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

    // Check URL for payment success
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      setIsFeePaid(true);
      if (params.get("step")) {
         const step = parseInt(params.get("step")!);
         setCurrentStep(step);
      } else {
         setCurrentStep(4);
      }
    }

    loadExistingDraft();
  }, [loadDraft, setValue, onDraftLoad]);

  // Auto-submit after payment success
  useEffect(() => {
    if (isFeePaid && currentStep === 4 && !isLoading) {
      handleFinalSubmit();
    }
  }, [isFeePaid, currentStep, isLoading]);

  const progress = (currentStep / STEPS.length) * 100;

  const handleNext = async () => {
    const currentStepSchema = getCurrentStepSchema();
    const currentData = getCurrentStepData();

    try {
      await currentStepSchema.parseAsync(currentData);
      if (currentStep < STEPS.length) {
        setCurrentStep(currentStep + 1);
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
      default:
        return {};
    }
  };

  const handlePayFee = async () => {
    setIsInitializingPayment(true);
    setError("");
    try {
      // Save draft first
      await saveNow();

      // Set up payment context for unified flow
      setPaymentContext({
        amount: applicationFee,
        courseId: courseId,
        courseName: courseName,
        type: "APPLICATION_FEE"
      });
      setShowPaymentFlow(true);
      
      /* 
      // Original payment initialization code - commented out
      // Initialize payment
      const response = await makeAuthenticatedRequest("/api/payments/initialize", {
        method: "POST",
        body: JSON.stringify({
          type: "APPLICATION_FEE",
          amount: applicationFee,
          courseId: courseId, 
          callbackUrl: `${window.location.origin}${window.location.pathname}?payment=success&step=4`
        }),
      });

      const result = await response.json();
      if (result.success) {
        // Redirect to Paystack
         const authUrl = result.data.authorizationUrl || result.data.authorization_url;
         if (authUrl) {
           window.location.href = authUrl;
         } else {
            setError("Failed to get payment URL");
         }
      } else {
        setError(result.message || "Payment initialization failed");
      }
      */
    } catch (err) {
      console.error("Payment error:", err);
      setError("An error occurred while initializing payment");
    } finally {
      setIsInitializingPayment(false);
    }
  };

  const handleFinalSubmit = async () => {
    setIsLoading(true);
    setError("");

    // Check if application fee is required and not paid
    if (applicationFee > 0 && !isFeePaid) {
        setError("Please pay the application fee first.");
        setIsLoading(false);
        return;
    }

    try {
      const formData = getValues();

      // Submit the application
      const response = await makeAuthenticatedRequest("/api/applications", {
        method: "POST",
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
        
        if (onSuccessRedirect) {
          window.location.href = onSuccessRedirect;
        } else {
          window.location.href = "/dashboards/student";
        }
      } else {
        console.error("Submission failed:", result); 
        setError(result.message || "Application submission failed");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Add this function to handle payment success
  const handlePaymentSuccess = (paymentData: any) => {
    setShowPaymentFlow(false);
    setPaymentContext(null);
    setIsFeePaid(true);
    // Move to next step after payment
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Add this function to handle payment cancellation
  const handlePaymentCancel = () => {
    setShowPaymentFlow(false);
    setPaymentContext(null);
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
                  className={`h-11 ${initialUser?.firstName ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
                  readOnly={!!initialUser?.firstName}
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
                  className={`h-11 ${initialUser?.lastName ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
                  readOnly={!!initialUser?.lastName}
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
                className={`h-11 ${initialUser?.email ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
                readOnly={!!initialUser?.email}
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
                  className={`h-11 ${initialUser?.phone ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
                  readOnly={!!initialUser?.phone}
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
                  className={`h-11 ${initialUser?.dateOfBirth ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
                  readOnly={!!initialUser?.dateOfBirth}
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
                className={`resize-none ${initialUser?.address ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
                readOnly={!!initialUser?.address}
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
                <CreditCard className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">
                    Application Fee Payment
                  </h3>
                  <p className="text-sm text-blue-700">
                    To process your application, a non-refundable application fee is required.
                  </p>
                </div>
              </div>
            </div>

            <Card className="border shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Fee Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Application Fee</span>
                        <span className="font-bold text-lg">
                            {formatCurrency(applicationFee || 0)}
                        </span>
                    </div>
                    {isFeePaid ? (
                        <div className="bg-green-50 text-green-700 p-3 rounded-md flex items-center gap-2">
                             <CheckCircle2 className="h-4 w-4" />
                             Payment Verified - You can now submit your application
                        </div>
                    ) : (
                        <div className="bg-yellow-50 text-yellow-700 p-3 rounded-md flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Payment Pending - Please pay the application fee to proceed
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="space-y-4">
                <p className="text-sm text-gray-500 text-center">
                    By submitting this application, you confirm that all information provided is accurate.
                </p>
            </div>
            
             {error && (
              <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <span>{error}</span>
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
                  onClick={
                    currentStep === STEPS.length
                      ? (!isFeePaid && applicationFee > 0 ? handlePayFee : handleFinalSubmit)
                      : handleNext
                  }
                  disabled={isLoading || isInitializingPayment}
                  className="h-11 px-8 bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading || isInitializingPayment ? (
                    <div className="flex items-center gap-2">
                       <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                       <span>Processing...</span>
                    </div>
                  ) : currentStep === STEPS.length ? (
                    !isFeePaid && applicationFee > 0 ? (
                        <>
                            <CreditCard className="h-4 w-4 mr-2" />
                            Pay Application Fee
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Submit Application
                        </>
                    )
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

      {/* Unified Payment Flow Dialog */}
      {showPaymentFlow && paymentContext && (
        <Dialog open={showPaymentFlow} onOpenChange={setShowPaymentFlow}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Payment Options</DialogTitle>
            </DialogHeader>
            <UnifiedPaymentFlow
              amount={paymentContext.amount}
              courseId={paymentContext.courseId}
              courseName={paymentContext.courseName}
              type={paymentContext.type}
              onSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
