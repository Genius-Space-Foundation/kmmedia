"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ProtectedRoute } from "@/components/protected-route";
import { LogoutButton } from "@/components/logout-button";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  price: number;
  applicationFee: number;
  mode: string[];
  difficulty: string;
  status: string;
  instructor: {
    id: string;
    name: string;
    email: string;
  };
}

const applicationSchema = z.object({
  // Personal Information
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other", "prefer-not-to-say"]),

  // Address Information
  address: z.string().min(10, "Address must be at least 10 characters"),
  city: z.string().min(2, "City is required"),
  region: z.string().min(2, "Region is required"),

  // Educational Background
  educationLevel: z.enum([
    "high-school",
    "diploma",
    "bachelor",
    "master",
    "phd",
    "other",
  ]),
  institution: z.string().min(2, "Institution name is required"),
  fieldOfStudy: z.string().min(2, "Field of study is required"),
  graduationYear: z.string().min(4, "Graduation year is required"),

  // Professional Experience
  employmentStatus: z.enum([
    "employed",
    "unemployed",
    "self-employed",
    "student",
  ]),
  currentPosition: z.string().optional(),
  companyName: z.string().optional(),
  yearsOfExperience: z.string(),

  // Course-Specific Information
  motivation: z
    .string()
    .min(
      50,
      "Please provide at least 50 characters explaining your motivation"
    ),
  goals: z
    .string()
    .min(50, "Please provide at least 50 characters describing your goals"),
  priorExperience: z.string().optional(),

  // Additional Information
  hearAboutUs: z.enum([
    "social-media",
    "google-search",
    "referral",
    "advertisement",
    "other",
  ]),
  referralSource: z.string().optional(),
  specialNeeds: z.string().optional(),

  // Agreements
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
  marketingConsent: z.boolean().optional(),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

function CourseApplicationPageContent() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Always true when this component renders
  const totalSteps = 4;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    mode: "onChange",
  });

  const watchedFields = watch();

  useEffect(() => {
    const fetchCourseAndCheckAuth = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch course data
        const token = localStorage.getItem("accessToken");
        const response = await fetch(`/api/courses/${courseId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (data.success) {
          setCourse(data.data);
        } else {
          setError(data.message || "Failed to fetch course");
        }
      } catch (error) {
        console.error("Error fetching course:", error);
        setError("Failed to load course information");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseAndCheckAuth();
    }
  }, [courseId]);

  const onSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("You must be logged in to apply for courses");
        return;
      }

      // Submit application to API
      console.log(
        "Submitting application with token:",
        token ? "Token present" : "No token"
      );
      console.log("Course ID:", courseId);

      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: courseId,
          formData: data,
        }),
      });

      console.log("Response status:", response.status);
      const result = await response.json();
      console.log("Response result:", result);

      if (result.success) {
        // Redirect to payment page or success page
        router.push(`/courses/${courseId}/apply/payment`);
      } else {
        setError(result.message || "Failed to submit application");
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      setError(
        "An error occurred while submitting your application. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const getFieldsForStep = (step: number) => {
    switch (step) {
      case 1:
        return [
          "firstName",
          "lastName",
          "email",
          "phone",
          "dateOfBirth",
          "gender",
        ] as (keyof ApplicationFormData)[];
      case 2:
        return [
          "address",
          "city",
          "region",
          "educationLevel",
          "institution",
          "fieldOfStudy",
          "graduationYear",
        ] as (keyof ApplicationFormData)[];
      case 3:
        return [
          "employmentStatus",
          "yearsOfExperience",
          "motivation",
          "goals",
        ] as (keyof ApplicationFormData)[];
      case 4:
        return [
          "hearAboutUs",
          "termsAccepted",
        ] as (keyof ApplicationFormData)[];
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
            <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="text-xl font-semibold text-gray-700">
            Loading Application Form...
          </div>
          <p className="text-gray-500">
            Please wait while we prepare your application
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Card className="max-w-md w-full mx-4 shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">❌</span>
            </div>
            <CardTitle className="text-2xl text-gray-900">
              {!isAuthenticated
                ? "Authentication Required"
                : "Error Loading Course"}
            </CardTitle>
            <CardDescription className="text-gray-600">{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-4">
              {!isAuthenticated ? (
                <div className="space-y-3">
                  <p className="text-gray-600">
                    You need to be logged in to apply for courses.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link href="/auth/login" className="flex-1">
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth/register" className="flex-1">
                      <Button variant="outline" className="w-full">
                        Create Account
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-gray-600">
                    Please try again or browse our available courses.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => window.location.reload()}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      Try Again
                    </Button>
                    <Link href="/courses" className="flex-1">
                      <Button variant="outline" className="w-full">
                        Browse Courses
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Card className="max-w-md w-full mx-4 shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">❌</span>
            </div>
            <CardTitle className="text-2xl text-gray-900">
              Course Not Found
            </CardTitle>
            <CardDescription className="text-gray-600">
              The course you're trying to apply for doesn't exist.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/courses">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                Browse Courses
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-lg overflow-hidden">
              <img
                src="/images/logo.jpeg"
                alt="KM Media Training Institute Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                KM Media Training Institute
              </h1>
            </div>
          </Link>

          <div className="inline-flex items-center px-4 py-2 bg-green-50 border border-green-200 rounded-full text-green-700 text-sm font-medium mb-4">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Course Application
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Apply for {course.title}
          </h2>
          <p className="text-gray-600">
            Complete your application to secure your spot in this course
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    step <= currentStep
                      ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {step < currentStep ? "✓" : step}
                </div>
                {step < 4 && (
                  <div
                    className={`w-full h-1 mx-4 transition-all duration-300 ${
                      step < currentStep ? "bg-blue-500" : "bg-gray-200"
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Personal Info</span>
            <span>Education & Address</span>
            <span>Experience & Goals</span>
            <span>Review & Submit</span>
          </div>
        </div>

        {/* Course Info Card */}
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm mb-8">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">
                  {course.title}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                  <span>📚 {course.category}</span>
                  <span>⏱️ {course.duration} weeks</span>
                  <span>💰 ₵{course.price.toLocaleString()}</span>
                  <span>🎯 {course.difficulty}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  Application Fee
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  ₵{course.applicationFee.toLocaleString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Application Form */}
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl text-gray-900">
              Step {currentStep} of {totalSteps}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {currentStep === 1 &&
                "Let's start with your personal information"}
              {currentStep === 2 &&
                "Tell us about your educational background and address"}
              {currentStep === 3 && "Share your experience and goals"}
              {currentStep === 4 && "Review your application and submit"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-red-500">❌</span>
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="firstName"
                        className="text-sm font-medium text-gray-700"
                      >
                        First Name *
                      </Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="John"
                        className="h-12 px-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg transition-all duration-200"
                        {...register("firstName")}
                      />
                      {errors.firstName && (
                        <p className="text-sm text-red-600 flex items-center space-x-1">
                          <span>❌</span>
                          <span>{errors.firstName.message}</span>
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="lastName"
                        className="text-sm font-medium text-gray-700"
                      >
                        Last Name *
                      </Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Doe"
                        className="h-12 px-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg transition-all duration-200"
                        {...register("lastName")}
                      />
                      {errors.lastName && (
                        <p className="text-sm text-red-600 flex items-center space-x-1">
                          <span>❌</span>
                          <span>{errors.lastName.message}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-sm font-medium text-gray-700"
                      >
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john.doe@example.com"
                        className="h-12 px-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg transition-all duration-200"
                        {...register("email")}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-600 flex items-center space-x-1">
                          <span>❌</span>
                          <span>{errors.email.message}</span>
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="phone"
                        className="text-sm font-medium text-gray-700"
                      >
                        Phone Number *
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+233 123 456 7890"
                        className="h-12 px-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg transition-all duration-200"
                        {...register("phone")}
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-600 flex items-center space-x-1">
                          <span>❌</span>
                          <span>{errors.phone.message}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="dateOfBirth"
                        className="text-sm font-medium text-gray-700"
                      >
                        Date of Birth *
                      </Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        className="h-12 px-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg transition-all duration-200"
                        {...register("dateOfBirth")}
                      />
                      {errors.dateOfBirth && (
                        <p className="text-sm text-red-600 flex items-center space-x-1">
                          <span>❌</span>
                          <span>{errors.dateOfBirth.message}</span>
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="gender"
                        className="text-sm font-medium text-gray-700"
                      >
                        Gender *
                      </Label>
                      <select
                        id="gender"
                        className="h-12 w-full rounded-lg border-2 border-gray-200 bg-white px-4 text-sm focus:border-blue-500 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
                        {...register("gender")}
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">
                          Prefer not to say
                        </option>
                      </select>
                      {errors.gender && (
                        <p className="text-sm text-red-600 flex items-center space-x-1">
                          <span>❌</span>
                          <span>{errors.gender.message}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Education & Address */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      📍 Address Information
                    </h3>

                    <div className="space-y-2">
                      <Label
                        htmlFor="address"
                        className="text-sm font-medium text-gray-700"
                      >
                        Street Address *
                      </Label>
                      <Input
                        id="address"
                        type="text"
                        placeholder="123 Main Street, Apartment 4B"
                        className="h-12 px-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg transition-all duration-200"
                        {...register("address")}
                      />
                      {errors.address && (
                        <p className="text-sm text-red-600 flex items-center space-x-1">
                          <span>❌</span>
                          <span>{errors.address.message}</span>
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="city"
                          className="text-sm font-medium text-gray-700"
                        >
                          City *
                        </Label>
                        <Input
                          id="city"
                          type="text"
                          placeholder="Accra"
                          className="h-12 px-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg transition-all duration-200"
                          {...register("city")}
                        />
                        {errors.city && (
                          <p className="text-sm text-red-600 flex items-center space-x-1">
                            <span>❌</span>
                            <span>{errors.city.message}</span>
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="region"
                          className="text-sm font-medium text-gray-700"
                        >
                          Region *
                        </Label>
                        <select
                          id="region"
                          className="h-12 w-full rounded-lg border-2 border-gray-200 bg-white px-4 text-sm focus:border-blue-500 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
                          {...register("region")}
                        >
                          <option value="">Select Region</option>
                          <option value="greater-accra">Greater Accra</option>
                          <option value="ashanti">Ashanti</option>
                          <option value="western">Western</option>
                          <option value="central">Central</option>
                          <option value="eastern">Eastern</option>
                          <option value="volta">Volta</option>
                          <option value="northern">Northern</option>
                          <option value="upper-east">Upper East</option>
                          <option value="upper-west">Upper West</option>
                          <option value="brong-ahafo">Brong Ahafo</option>
                        </select>
                        {errors.region && (
                          <p className="text-sm text-red-600 flex items-center space-x-1">
                            <span>❌</span>
                            <span>{errors.region.message}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      🎓 Educational Background
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="educationLevel"
                          className="text-sm font-medium text-gray-700"
                        >
                          Highest Education Level *
                        </Label>
                        <select
                          id="educationLevel"
                          className="h-12 w-full rounded-lg border-2 border-gray-200 bg-white px-4 text-sm focus:border-blue-500 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
                          {...register("educationLevel")}
                        >
                          <option value="">Select Education Level</option>
                          <option value="high-school">High School</option>
                          <option value="diploma">Diploma</option>
                          <option value="bachelor">Bachelor's Degree</option>
                          <option value="master">Master's Degree</option>
                          <option value="phd">PhD</option>
                          <option value="other">Other</option>
                        </select>
                        {errors.educationLevel && (
                          <p className="text-sm text-red-600 flex items-center space-x-1">
                            <span>❌</span>
                            <span>{errors.educationLevel.message}</span>
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="graduationYear"
                          className="text-sm font-medium text-gray-700"
                        >
                          Graduation Year *
                        </Label>
                        <Input
                          id="graduationYear"
                          type="text"
                          placeholder="2020"
                          className="h-12 px-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg transition-all duration-200"
                          {...register("graduationYear")}
                        />
                        {errors.graduationYear && (
                          <p className="text-sm text-red-600 flex items-center space-x-1">
                            <span>❌</span>
                            <span>{errors.graduationYear.message}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="institution"
                          className="text-sm font-medium text-gray-700"
                        >
                          Institution Name *
                        </Label>
                        <Input
                          id="institution"
                          type="text"
                          placeholder="University of Ghana"
                          className="h-12 px-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg transition-all duration-200"
                          {...register("institution")}
                        />
                        {errors.institution && (
                          <p className="text-sm text-red-600 flex items-center space-x-1">
                            <span>❌</span>
                            <span>{errors.institution.message}</span>
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="fieldOfStudy"
                          className="text-sm font-medium text-gray-700"
                        >
                          Field of Study *
                        </Label>
                        <Input
                          id="fieldOfStudy"
                          type="text"
                          placeholder="Computer Science"
                          className="h-12 px-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg transition-all duration-200"
                          {...register("fieldOfStudy")}
                        />
                        {errors.fieldOfStudy && (
                          <p className="text-sm text-red-600 flex items-center space-x-1">
                            <span>❌</span>
                            <span>{errors.fieldOfStudy.message}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Experience & Goals */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      💼 Professional Experience
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="employmentStatus"
                          className="text-sm font-medium text-gray-700"
                        >
                          Employment Status *
                        </Label>
                        <select
                          id="employmentStatus"
                          className="h-12 w-full rounded-lg border-2 border-gray-200 bg-white px-4 text-sm focus:border-blue-500 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
                          {...register("employmentStatus")}
                        >
                          <option value="">Select Status</option>
                          <option value="employed">Employed</option>
                          <option value="unemployed">Unemployed</option>
                          <option value="self-employed">Self-Employed</option>
                          <option value="student">Student</option>
                        </select>
                        {errors.employmentStatus && (
                          <p className="text-sm text-red-600 flex items-center space-x-1">
                            <span>❌</span>
                            <span>{errors.employmentStatus.message}</span>
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="yearsOfExperience"
                          className="text-sm font-medium text-gray-700"
                        >
                          Years of Experience
                        </Label>
                        <select
                          id="yearsOfExperience"
                          className="h-12 w-full rounded-lg border-2 border-gray-200 bg-white px-4 text-sm focus:border-blue-500 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
                          {...register("yearsOfExperience")}
                        >
                          <option value="">Select Experience</option>
                          <option value="0">No experience</option>
                          <option value="1-2">1-2 years</option>
                          <option value="3-5">3-5 years</option>
                          <option value="6-10">6-10 years</option>
                          <option value="10+">10+ years</option>
                        </select>
                      </div>
                    </div>

                    {watchedFields.employmentStatus === "employed" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="currentPosition"
                            className="text-sm font-medium text-gray-700"
                          >
                            Current Position
                          </Label>
                          <Input
                            id="currentPosition"
                            type="text"
                            placeholder="Marketing Assistant"
                            className="h-12 px-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg transition-all duration-200"
                            {...register("currentPosition")}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="companyName"
                            className="text-sm font-medium text-gray-700"
                          >
                            Company Name
                          </Label>
                          <Input
                            id="companyName"
                            type="text"
                            placeholder="ABC Company Ltd"
                            className="h-12 px-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg transition-all duration-200"
                            {...register("companyName")}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      🎯 Goals & Motivation
                    </h3>

                    <div className="space-y-2">
                      <Label
                        htmlFor="motivation"
                        className="text-sm font-medium text-gray-700"
                      >
                        Why do you want to take this course? *
                      </Label>
                      <textarea
                        id="motivation"
                        rows={4}
                        placeholder="Share your motivation for taking this course..."
                        className="w-full px-4 py-3 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg transition-all duration-200 resize-none"
                        {...register("motivation")}
                      />
                      {errors.motivation && (
                        <p className="text-sm text-red-600 flex items-center space-x-1">
                          <span>❌</span>
                          <span>{errors.motivation.message}</span>
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="goals"
                        className="text-sm font-medium text-gray-700"
                      >
                        What are your career goals? *
                      </Label>
                      <textarea
                        id="goals"
                        rows={4}
                        placeholder="Describe your career goals and how this course will help..."
                        className="w-full px-4 py-3 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg transition-all duration-200 resize-none"
                        {...register("goals")}
                      />
                      {errors.goals && (
                        <p className="text-sm text-red-600 flex items-center space-x-1">
                          <span>❌</span>
                          <span>{errors.goals.message}</span>
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="priorExperience"
                        className="text-sm font-medium text-gray-700"
                      >
                        Prior Experience (Optional)
                      </Label>
                      <textarea
                        id="priorExperience"
                        rows={3}
                        placeholder="Any relevant experience or projects you've worked on..."
                        className="w-full px-4 py-3 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg transition-all duration-200 resize-none"
                        {...register("priorExperience")}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Review & Submit */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      📝 Additional Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="hearAboutUs"
                          className="text-sm font-medium text-gray-700"
                        >
                          How did you hear about us? *
                        </Label>
                        <select
                          id="hearAboutUs"
                          className="h-12 w-full rounded-lg border-2 border-gray-200 bg-white px-4 text-sm focus:border-blue-500 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
                          {...register("hearAboutUs")}
                        >
                          <option value="">Select Source</option>
                          <option value="social-media">Social Media</option>
                          <option value="google-search">Google Search</option>
                          <option value="referral">
                            Friend/Colleague Referral
                          </option>
                          <option value="advertisement">Advertisement</option>
                          <option value="other">Other</option>
                        </select>
                        {errors.hearAboutUs && (
                          <p className="text-sm text-red-600 flex items-center space-x-1">
                            <span>❌</span>
                            <span>{errors.hearAboutUs.message}</span>
                          </p>
                        )}
                      </div>

                      {watchedFields.hearAboutUs === "referral" && (
                        <div className="space-y-2">
                          <Label
                            htmlFor="referralSource"
                            className="text-sm font-medium text-gray-700"
                          >
                            Referral Source
                          </Label>
                          <Input
                            id="referralSource"
                            type="text"
                            placeholder="Name of person who referred you"
                            className="h-12 px-4 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg transition-all duration-200"
                            {...register("referralSource")}
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="specialNeeds"
                        className="text-sm font-medium text-gray-700"
                      >
                        Special Accommodations (Optional)
                      </Label>
                      <textarea
                        id="specialNeeds"
                        rows={3}
                        placeholder="Any special accommodations or accessibility needs..."
                        className="w-full px-4 py-3 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg transition-all duration-200 resize-none"
                        {...register("specialNeeds")}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      ✅ Terms & Conditions
                    </h3>

                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          id="termsAccepted"
                          className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          {...register("termsAccepted")}
                        />
                        <label
                          htmlFor="termsAccepted"
                          className="text-sm text-gray-700"
                        >
                          I agree to the{" "}
                          <Link
                            href="#"
                            className="text-blue-600 hover:underline"
                          >
                            Terms and Conditions
                          </Link>{" "}
                          and
                          <Link
                            href="#"
                            className="text-blue-600 hover:underline ml-1"
                          >
                            Privacy Policy
                          </Link>{" "}
                          *
                        </label>
                      </div>
                      {errors.termsAccepted && (
                        <p className="text-sm text-red-600 flex items-center space-x-1 ml-7">
                          <span>❌</span>
                          <span>{errors.termsAccepted.message}</span>
                        </p>
                      )}

                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          id="marketingConsent"
                          className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          {...register("marketingConsent")}
                        />
                        <label
                          htmlFor="marketingConsent"
                          className="text-sm text-gray-700"
                        >
                          I consent to receive marketing communications about
                          courses and events
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Application Summary */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      📋 Application Summary
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p>
                          <span className="font-medium">Name:</span>{" "}
                          {watchedFields.firstName} {watchedFields.lastName}
                        </p>
                        <p>
                          <span className="font-medium">Email:</span>{" "}
                          {watchedFields.email}
                        </p>
                        <p>
                          <span className="font-medium">Phone:</span>{" "}
                          {watchedFields.phone}
                        </p>
                      </div>
                      <div>
                        <p>
                          <span className="font-medium">Course:</span>{" "}
                          {course.title}
                        </p>
                        <p>
                          <span className="font-medium">Application Fee:</span>{" "}
                          ₵{course.applicationFee.toLocaleString()}
                        </p>
                        <p>
                          <span className="font-medium">Course Fee:</span> ₵
                          {course.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t">
                <div>
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      className="px-6 py-3"
                    >
                      ← Previous
                    </Button>
                  )}
                </div>

                <div>
                  {currentStep < totalSteps ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      Next →
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Submitting...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span>🎯</span>
                          <span>Submit Application</span>
                        </div>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Need help with your application? Our admissions team is here to
            assist you.
          </p>
          <Link href="/contact">
            <Button variant="outline" className="px-6 py-3">
              💬 Contact Support
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CourseApplicationPage() {
  return (
    <>
      <LogoutButton />
      <ProtectedRoute>
        <CourseApplicationPageContent />
      </ProtectedRoute>
    </>
  );
}
