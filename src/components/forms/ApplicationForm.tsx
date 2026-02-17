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
  BookOpen,
  Info,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
    gender: z.string().min(1, "Gender is required"),
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
    gender?: string;
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
        gender: initialUser?.gender || "",
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
            if (key === 'personalInfo' && typeof value === 'object' && value !== null) {
              // Merge personalInfo with initialUser values to ensure prefilled data persists
              const personalInfoDraft = value as any;
              const mergedPersonalInfo = {
                ...personalInfoDraft,
                // Hard-priority for profile data if it exists
                firstName: initialUser?.firstName || personalInfoDraft.firstName || "",
                lastName: initialUser?.lastName || personalInfoDraft.lastName || "",
                email: initialUser?.email || personalInfoDraft.email || "",
                phone: initialUser?.phone || personalInfoDraft.phone || "",
                address: initialUser?.address || personalInfoDraft.address || "",
                gender: initialUser?.gender || personalInfoDraft.gender || "",
                dateOfBirth: initialUser?.dateOfBirth || personalInfoDraft.dateOfBirth || "",
              };
              setValue("personalInfo", mergedPersonalInfo);
            } else {
              setValue(key as any, value);
            }
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
  }, [loadDraft, setValue, onDraftLoad, initialUser]);

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
                  placeholder="e.g. John"
                  className={`h-12 rounded-xl border-neutral-200 bg-neutral-50/50 focus:bg-white transition-all ${initialUser?.firstName ? 'text-neutral-500 cursor-not-allowed border-dashed' : ''}`}
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
                  placeholder="e.g. Doe"
                  className={`h-12 rounded-xl border-neutral-200 bg-neutral-50/50 focus:bg-white transition-all ${initialUser?.lastName ? 'text-neutral-500 cursor-not-allowed border-dashed' : ''}`}
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
                placeholder="john.doe@example.com"
                className={`h-12 rounded-xl border-neutral-200 bg-neutral-50/50 focus:bg-white transition-all ${initialUser?.email ? 'text-neutral-500 cursor-not-allowed border-dashed' : ''}`}
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
                  className={`h-12 rounded-xl border-neutral-200 bg-neutral-50/50 focus:bg-white transition-all ${initialUser?.phone ? 'text-neutral-500 cursor-not-allowed border-dashed' : ''}`}
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
                <Label htmlFor="gender" className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  Gender *
                </Label>
                {initialUser?.gender ? (
                  <Input
                    value={initialUser.gender.charAt(0).toUpperCase() + initialUser.gender.slice(1).replace('_', ' ')}
                    readOnly
                    className="h-12 rounded-xl border-neutral-200 bg-neutral-50/50 text-neutral-500 cursor-not-allowed border-dashed"
                  />
                ) : (
                  <Select
                    onValueChange={(value) => setValue("personalInfo.gender", value)}
                    defaultValue={watch("personalInfo.gender")}
                  >
                    <SelectTrigger className="h-12 rounded-xl border-neutral-200 bg-neutral-50/50 focus:bg-white transition-all">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                {errors.personalInfo?.gender && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.personalInfo.gender.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  Date of Birth *
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  {...register("personalInfo.dateOfBirth")}
                  className={`h-12 rounded-xl border-neutral-200 bg-neutral-50/50 focus:bg-white transition-all ${initialUser?.dateOfBirth ? 'text-neutral-500 cursor-not-allowed border-dashed' : ''}`}
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
                placeholder="e.g. 123 Education St, Accra, Ghana"
                rows={3}
                className={`resize-none rounded-xl border-neutral-200 bg-neutral-50/50 focus:bg-white transition-all ${initialUser?.address ? 'text-neutral-500 cursor-not-allowed border-dashed' : ''}`}
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
                <SelectTrigger className="h-12 rounded-xl border-neutral-200 bg-neutral-50/50">
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
                  placeholder="e.g. University of Ghana"
                  className="h-12 rounded-xl border-neutral-200 bg-neutral-50/50 focus:bg-white transition-all"
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
                  placeholder="2024"
                  className="h-12 rounded-xl border-neutral-200 bg-neutral-50/50 focus:bg-white transition-all"
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
                placeholder="e.g. Digital Marketing"
                className="h-12 rounded-xl border-neutral-200 bg-neutral-50/50 focus:bg-white transition-all"
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
                <SelectTrigger className="h-12 rounded-xl border-neutral-200 bg-neutral-50/50">
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
                placeholder="Tell us about the skills you've acquired..."
                rows={4}
                className="resize-none rounded-xl border-neutral-200 bg-neutral-50/50 focus:bg-white transition-all"
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
                placeholder="What drives your interest in this specific course?"
                rows={4}
                className="resize-none rounded-xl border-neutral-200 bg-neutral-50/50 focus:bg-white transition-all"
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
                placeholder="Where do you see yourself after completing this course?"
                rows={4}
                className="resize-none rounded-xl border-neutral-200 bg-neutral-50/50 focus:bg-white transition-all"
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
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-neutral-900 rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <CreditCard className="h-32 w-32 rotate-12" />
              </div>
              <div className="flex items-start gap-4 relative z-10">
                <div className="bg-brand-primary p-3 rounded-2xl">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Final Review & Fee</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed max-w-md">
                    Please review your information carefully. A non-refundable application fee is required to initiate the formal review process.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-2 border-neutral-100 shadow-none rounded-3xl p-6 bg-neutral-50/50">
                <h4 className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-6">Payment Details</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-500 font-medium">Application Fee</span>
                    <span className="font-bold text-neutral-900">{formatCurrency(applicationFee || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-500 font-medium">Processing Time</span>
                    <span className="text-neutral-900 font-bold italic">Instant</span>
                  </div>
                  <div className="pt-4 border-t border-neutral-200 flex justify-between items-center text-sm">
                    <span className="text-neutral-900 font-bold">Total to Pay</span>
                    <span className="text-xl font-black text-brand-primary">{formatCurrency(applicationFee || 0)}</span>
                  </div>
                </div>
              </Card>

              <Card className={`border-2 shadow-none rounded-3xl p-6 flex flex-col justify-center items-center text-center space-y-4 transition-all ${isFeePaid ? 'border-green-100 bg-green-50/30' : 'border-orange-100 bg-orange-50/30'}`}>
                {isFeePaid ? (
                  <>
                    <div className="bg-green-500 p-3 rounded-full text-white shadow-lg shadow-green-200">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <div>
                      <h4 className="font-bold text-green-900">Payment Verified</h4>
                      <p className="text-xs text-green-700 mt-1">Ready for submission</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-orange-500 p-3 rounded-full text-white shadow-lg shadow-orange-200 animate-pulse">
                      <AlertCircle className="h-8 w-8" />
                    </div>
                    <div>
                      <h4 className="font-bold text-orange-900">Payment Required</h4>
                      <p className="text-xs text-orange-700 mt-1">Please pay to activate submission</p>
                    </div>
                  </>
                )}
              </Card>
            </div>

            <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex gap-4">
               <Info className="h-5 w-5 text-blue-600 shrink-0" />
               <p className="text-xs text-blue-700 leading-relaxed italic">
                 "By proceeding, I confirm that all submitted details are accurate to the best of my knowledge and I agree to the terms of enrollment."
               </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Content */}
        <div className="lg:col-span-8 order-2 lg:order-1">
          <Card className="border-0 shadow-2xl shadow-neutral-200/50 overflow-hidden bg-white rounded-3xl">
            <CardHeader className="bg-neutral-900 text-white p-8 sm:p-10">
              <div className="flex items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 text-brand-primary mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded-full bg-brand-primary/10 border border-brand-primary/20">
                      Step {currentStep} of {STEPS.length}
                    </span>
                  </div>
                  <CardTitle className="text-3xl font-bold tracking-tight">
                    {STEPS[currentStep - 1].title}
                  </CardTitle>
                  <CardDescription className="text-neutral-400 mt-1.5 text-base">
                    {STEPS[currentStep - 1].description}
                  </CardDescription>
                </div>
                <div className="hidden sm:block bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                  {(() => {
                    const Icon = STEPS[currentStep - 1].icon;
                    return <Icon className="h-8 w-8 text-brand-primary" />;
                  })()}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 sm:p-10">
              {error && (
                <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-4 animate-in fade-in zoom-in duration-300">
                  <div className="bg-red-100 p-2 rounded-xl h-fit">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-red-900 text-sm">Submission Error</p>
                    <p className="text-sm text-red-700 leading-relaxed">{error}</p>
                  </div>
                </div>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <form className="space-y-8">
                    {renderStep()}
                  </form>
                </motion.div>
              </AnimatePresence>

              <div className="mt-12 pt-10 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handlePrevious}
                  disabled={currentStep === 1 || isLoading}
                  className="h-14 px-8 rounded-2xl font-bold text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 transition-all flex-1 sm:flex-none justify-center sm:justify-start"
                >
                  <ChevronLeft className="mr-2 h-5 w-5" />
                  Back
                </Button>

                <div className="flex flex-col sm:flex-row gap-4 flex-1 sm:flex-none w-full sm:w-auto">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={saveNow}
                    disabled={isLoading}
                    className="h-14 px-8 rounded-2xl font-bold border-2 border-neutral-100 hover:border-neutral-200 transition-all flex items-center justify-center"
                  >
                    <Save className="mr-2 h-5 w-5 text-neutral-400" />
                    Save Draft
                  </Button>
                  
                  {currentStep < STEPS.length ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      disabled={isLoading}
                      className="h-14 px-10 bg-neutral-900 hover:bg-black text-white rounded-2xl font-bold shadow-2xl shadow-neutral-300 transition-all flex items-center justify-center group"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                           <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                           <span>Verifying...</span>
                        </div>
                      ) : (
                        <>
                          Continue
                          <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={
                        !isFeePaid && applicationFee > 0 ? handlePayFee : handleFinalSubmit
                      }
                      disabled={isLoading || isInitializingPayment}
                  className="h-11 px-8 bg-blue-600 hover:bg-blue-700"
                    >
                      {isLoading || isInitializingPayment ? (
                         <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Processing...</span>
                         </div>
                      ) : (
                        <>
                          {!isFeePaid && applicationFee > 0 ? (
                            <>
                              <CreditCard className="mr-2 h-5 w-5" />
                              Pay {formatCurrency(applicationFee)} & Submit
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="mr-2 h-5 w-5" />
                              Submit Application
                            </>
                          )}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Sidebar */}
        <div className="lg:col-span-4 space-y-6 order-1 lg:order-2">
          {/* Course Summary Card */}
          <Card className="border-0 shadow-lg border-neutral-100 rounded-3xl overflow-hidden bg-white">
             <div className="bg-brand-primary/5 p-8 border-b border-brand-primary/10">
                <div className="flex items-center gap-3 text-brand-primary mb-3">
                   <BookOpen className="h-5 w-5" />
                   <span className="text-[10px] font-black uppercase tracking-widest">Applying for</span>
                </div>
                <h3 className="text-xl font-bold text-neutral-900 leading-tight">
                  {courseName}
                </h3>
             </div>
             <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500 font-medium">Application Fee</span>
                    <span className="font-bold text-neutral-900">{formatCurrency(applicationFee)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500 font-medium">Type</span>
                    <span className="bg-neutral-100 px-2 py-0.5 rounded-lg text-xs font-bold text-neutral-600">Standard Application</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-neutral-100 space-y-4">
                  <div className="flex items-center justify-between">
                     <h4 className="text-sm font-black uppercase tracking-widest text-neutral-400">Step Progression</h4>
                     <span className="text-xs font-bold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-lg">
                        {Math.round(progress)}%
                     </span>
                  </div>
                  <div className="space-y-4">
                    {STEPS.map((step) => {
                      const isCompleted = step.id < currentStep;
                      const isActive = step.id === currentStep;
                      const StepIcon = step.icon;

                      return (
                        <div key={step.id} className="flex items-center gap-4 group">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl border-2 transition-all duration-300 ${
                              isCompleted
                                ? "border-green-500 bg-green-500 text-white"
                                : isActive
                                ? "border-brand-primary bg-white text-brand-primary shadow-lg shadow-brand-primary/10"
                                : "border-neutral-100 bg-neutral-50 text-neutral-300"
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="h-5 w-5" />
                            ) : (
                              <StepIcon className={`h-5 w-5 ${isActive ? "animate-pulse" : ""}`} />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span
                              className={`text-sm font-bold transition-colors ${
                                isActive ? "text-neutral-900" : isCompleted ? "text-neutral-600" : "text-neutral-400"
                              }`}
                            >
                              {step.title}
                            </span>
                            {isActive && (
                              <motion.span 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-[10px] font-bold text-brand-primary uppercase tracking-tighter"
                              >
                                Currently Active
                              </motion.span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-6 border-t border-neutral-100">
                    <Progress value={progress} className="h-3 bg-neutral-100 rounded-full" />
                    <div className="mt-4 flex items-center justify-between">
                     <AutoSaveIndicator status={saveStatus} />
                    </div>
                </div>
             </CardContent>
          </Card>

          {/* Secure Trust Badge */}
          <div className="bg-neutral-900 rounded-3xl p-8 text-white space-y-6 shadow-2xl shadow-neutral-900/20">
             <div className="flex items-center gap-4">
                <div className="bg-white/10 p-3 rounded-2xl border border-white/10 h-fit">
                   <ShieldCheck className="h-6 w-6 text-brand-primary" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm">Secure Enrollment</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Industry-standard encryption secures your personal and academic data.
                  </p>
                </div>
             </div>
             
             <div className="flex items-center justify-between pt-6 border-t border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">
                <div className="flex items-center gap-1.5">
                   <Lock className="h-3 w-3" />
                   SSL SECURE
                </div>
                <div className="flex items-center gap-1.5 font-sans lowercase text-xs normal-case tracking-normal">
                   km-media-security-v2
                </div>
             </div>
          </div>
        </div>
      </div>

      <Dialog open={showPaymentFlow} onOpenChange={setShowPaymentFlow}>
        <DialogContent className="sm:max-w-md bg-white rounded-[2.5rem] border-0 shadow-2xl p-0 overflow-hidden outline-none">
          <div className="p-8 sm:p-10 bg-neutral-900 text-white relative">
             <div className="absolute top-0 right-0 p-10 opacity-10">
                <CreditCard className="h-32 w-32 rotate-12" />
             </div>
             <DialogTitle className="text-2xl font-bold tracking-tight relative z-10">Secure Checkout</DialogTitle>
             <p className="text-neutral-400 text-base mt-2 relative z-10">Choose your preferred payment method</p>
          </div>
          <div className="p-8 sm:p-10">
            {paymentContext && (
              <UnifiedPaymentFlow
                amount={paymentContext.amount}
                courseId={paymentContext.courseId}
                courseName={paymentContext.courseName}
                type={paymentContext.type}
                onSuccess={handlePaymentSuccess}
                onCancel={handlePaymentCancel}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
