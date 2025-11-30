"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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

// Step schemas for validation
const step1Schema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "Name can only contain letters, spaces, hyphens, and apostrophes"
    ),
  email: z
    .string()
    .email("Invalid email address")
    .max(100, "Email must be less than 100 characters"),
});

const step2BaseSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be less than 128 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),
  confirmPassword: z.string(),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\+?[\d\s\-\(\)]+$/.test(val),
      "Invalid phone number format"
    ),
});

const step2Schema = step2BaseSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }
);

const step3Schema = z.object({
  role: z.enum(["STUDENT", "INSTRUCTOR"]).default("STUDENT"),
  interests: z.array(z.string()).optional(),
  experience: z
    .string()
    .max(500, "Experience description must be less than 500 characters")
    .optional(),
});

// Combined schema for final submission
const registrationSchema = step1Schema
  .merge(step2BaseSchema)
  .merge(step3Schema)
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegistrationFormData = z.infer<typeof registrationSchema>;

interface RegistrationStep {
  id: number;
  title: string;
  description: string;
  schema: z.ZodSchema<any>;
}

const INTERESTS = [
  "Photography",
  "Videography",
  "Video Editing",
  "Audio Production",
  "Digital Marketing",
  "Social Media Management",
  "Content Creation",
  "Graphic Design",
  "Web Development",
  "Animation",
  "Podcasting",
  "Live Streaming",
];

// Password strength calculator
const calculatePasswordStrength = (password: string) => {
  let strength = 0;
  const checks = {
    length: password.length >= 8,
    longLength: password.length >= 12,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    numbers: /\d/.test(password),
    symbols: /[^a-zA-Z0-9]/.test(password),
    noCommon: !/(password|123456|qwerty|abc123|admin|user)/i.test(password),
  };

  // Basic requirements
  if (checks.length) strength++;
  if (checks.lowercase && checks.uppercase) strength++;
  if (checks.numbers) strength++;

  // Advanced requirements
  if (checks.symbols) strength++;
  if (checks.longLength) strength++;
  if (checks.noCommon) strength++;

  return Math.min(strength, 5);
};

const getPasswordRequirements = (password: string) => {
  return [
    { text: "At least 8 characters", met: password.length >= 8 },
    {
      text: "Contains uppercase & lowercase",
      met: /[a-z]/.test(password) && /[A-Z]/.test(password),
    },
    { text: "Contains numbers", met: /\d/.test(password) },
    { text: "Contains special characters", met: /[^a-zA-Z0-9]/.test(password) },
  ];
};

export function MultiStepRegistrationForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const router = useRouter();

  const steps: RegistrationStep[] = [
    {
      id: 1,
      title: "Basic Information",
      description: "Let's start with your name and email",
      schema: step1Schema,
    },
    {
      id: 2,
      title: "Security & Contact",
      description: "Create a secure password and add contact info",
      schema: step2Schema,
    },
    {
      id: 3,
      title: "Profile Setup",
      description: "Tell us about yourself and your interests",
      schema: step3Schema,
    },
  ];

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "STUDENT",
      interests: [],
      experience: "",
      phone: "",
    },
    mode: "onChange",
  });

  const password = watch("password");
  const role = watch("role");

  useEffect(() => {
    if (password) {
      setPasswordStrength(calculatePasswordStrength(password));
    } else {
      setPasswordStrength(0);
    }
  }, [password]);

  // Update interests in form when selectedInterests changes
  useEffect(() => {
    setValue("interests", selectedInterests);
  }, [selectedInterests, setValue]);

  const progress = (currentStep / steps.length) * 100;
  const handleNext = async () => {
    const currentStepSchema = steps[currentStep - 1].schema;
    const currentData = getValues();

    try {
      await currentStepSchema.parseAsync(currentData);
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      } else {
        await handleSubmit(onSubmit as any)();
      }
    } catch {
      // Trigger validation to show errors
      await trigger();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: RegistrationFormData) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          phone: data.phone,
          role: data.role,
          interests: data.interests,
          experience: data.experience,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Automatically sign in the user
        const signInResult = await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        });

        if (signInResult?.error) {
          setError("Registration successful, but failed to log in automatically. Please log in manually.");
          setTimeout(() => router.push("/auth/login"), 2000);
        } else {
          // Redirect to onboarding or dashboard based on role
          const role = result.user.role.toLowerCase();
          router.push(`/auth/onboarding?role=${role}`);
        }
      } else {
        setError(result.message || "Registration failed");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: "google" | "github") => {
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn(provider, {
        callbackUrl: "/auth/onboarding",
        redirect: false,
      });

      if (result?.error) {
        setError(`${provider} sign-in failed. Please try again.`);
      } else if (result?.url) {
        router.push(result.url);
      }
    } catch {
      setError(
        `An error occurred during ${provider} sign-in. Please try again.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return "bg-red-500";
      case 2:
        return "bg-orange-500";
      case 3:
        return "bg-yellow-500";
      case 4:
        return "bg-green-500";
      case 5:
        return "bg-emerald-500";
      default:
        return "bg-slate-200";
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return "Weak";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
        return "Strong";
      case 5:
        return "Very Strong";
      default:
        return "";
    }
  };
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-sm font-semibold text-gray-800 flex items-center space-x-2"
                >
                  <svg
                    className="w-4 h-4 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>Full Name</span>
                </Label>
                <div className="relative group">
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    className="h-12 pl-11 pr-4 bg-gray-50 border-2 border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 rounded-xl transition-all duration-200 font-medium group-hover:border-gray-400"
                    {...register("name")}
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-500 group-focus-within:text-emerald-500 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                </div>
                {errors.name && (
                  <p className="text-sm text-red-600 flex items-center space-x-2 mt-2">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium">{errors.name.message}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-semibold text-gray-800 flex items-center space-x-2"
                >
                  <svg
                    className="w-4 h-4 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Email Address</span>
                </Label>
                <div className="relative group">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    className="h-12 pl-11 pr-4 bg-gray-50 border-2 border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 rounded-xl transition-all duration-200 font-medium group-hover:border-gray-400"
                    {...register("email")}
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-500 group-focus-within:text-emerald-500 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                      />
                    </svg>
                  </div>
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600 flex items-center space-x-2 mt-2">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium">{errors.email.message}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-semibold text-gray-800 flex items-center space-x-2"
                >
                  <svg
                    className="w-4 h-4 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <span>Password</span>
                </Label>
                <div className="relative group">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    className="h-12 pl-11 pr-12 bg-gray-50 border-2 border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 rounded-xl transition-all duration-200 font-medium group-hover:border-gray-400"
                    {...register("password")}
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-500 group-focus-within:text-emerald-500 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
                  >
                    {showPassword ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {password && (
                  <div className="space-y-3 mt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-700">
                        Password Strength:
                      </span>
                      <span
                        className={`text-xs font-semibold ${
                          passwordStrength <= 1
                            ? "text-red-600"
                            : passwordStrength === 2
                            ? "text-orange-600"
                            : passwordStrength === 3
                            ? "text-yellow-600"
                            : passwordStrength === 4
                            ? "text-green-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                            level <= passwordStrength
                              ? getPasswordStrengthColor()
                              : "bg-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="space-y-1">
                      {getPasswordRequirements(password).map((req, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          <div
                            className={`w-3 h-3 rounded-full flex items-center justify-center ${
                              req.met ? "bg-green-100" : "bg-gray-100"
                            }`}
                          >
                            {req.met ? (
                              <svg
                                className="w-2 h-2 text-green-600"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            ) : (
                              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            )}
                          </div>
                          <span
                            className={`text-xs ${
                              req.met ? "text-green-600" : "text-gray-500"
                            }`}
                          >
                            {req.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {errors.password && (
                  <p className="text-sm text-red-600 flex items-center space-x-2 mt-2">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium">
                      {errors.password.message}
                    </span>
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-semibold text-gray-800 flex items-center space-x-2"
                >
                  <svg
                    className="w-4 h-4 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Confirm Password</span>
                </Label>
                <div className="relative group">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    className="h-12 pl-11 pr-12 bg-gray-50 border-2 border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 rounded-xl transition-all duration-200 font-medium group-hover:border-gray-400"
                    {...register("confirmPassword")}
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-500 group-focus-within:text-emerald-500 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 flex items-center space-x-2 mt-2">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium">
                      {errors.confirmPassword.message}
                    </span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="text-sm font-semibold text-gray-800 flex items-center space-x-2"
                >
                  <svg
                    className="w-4 h-4 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <span>Phone Number</span>
                  <span className="text-xs text-slate-400">(Optional)</span>
                </Label>
                <div className="relative group">
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    className="h-12 pl-11 pr-4 bg-gray-50 border-2 border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 rounded-xl transition-all duration-200 font-medium group-hover:border-gray-400"
                    {...register("phone")}
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-500 group-focus-within:text-emerald-500 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
                {errors.phone && (
                  <p className="text-sm text-red-600 flex items-center space-x-2 mt-2">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium">{errors.phone.message}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="role"
                  className="text-sm font-semibold text-gray-800 flex items-center space-x-2"
                >
                  <svg
                    className="w-4 h-4 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Account Type</span>
                </Label>
                <Select
                  onValueChange={(value: "STUDENT" | "INSTRUCTOR") =>
                    setValue("role", value)
                  }
                  defaultValue="STUDENT"
                >
                  <SelectTrigger className="h-12 pl-11 bg-gray-50 border-2 border-gray-300 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 rounded-xl">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg
                        className="w-5 h-5 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                    <SelectValue placeholder="Choose your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STUDENT">
                      Student - Learn and grow
                    </SelectItem>
                    <SelectItem value="INSTRUCTOR">
                      Instructor - Teach and inspire
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-sm text-red-600 flex items-center space-x-2 mt-2">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium">{errors.role.message}</span>
                  </p>
                )}
              </div>

              {role === "STUDENT" && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
                    <svg
                      className="w-4 h-4 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    <span>What interests you?</span>
                    <span className="text-xs text-slate-400">(Optional)</span>
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {INTERESTS.map((interest) => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 text-sm font-medium touch-manipulation ${
                          selectedInterests.includes(interest)
                            ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                            : "border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                  {selectedInterests.length > 0 && (
                    <p className="text-sm text-gray-600 mt-2">
                      Selected: {selectedInterests.length} interest
                      {selectedInterests.length !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              )}

              {role === "INSTRUCTOR" && (
                <div className="space-y-2">
                  <Label
                    htmlFor="experience"
                    className="text-sm font-semibold text-gray-800 flex items-center space-x-2"
                  >
                    <svg
                      className="w-4 h-4 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                    <span>Tell us about your experience</span>
                    <span className="text-xs text-slate-400">(Optional)</span>
                  </Label>
                  <textarea
                    id="experience"
                    placeholder="Describe your teaching experience, expertise, and qualifications..."
                    className="w-full h-24 p-4 bg-gray-50 border-2 border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 rounded-xl transition-all duration-200 font-medium resize-none"
                    {...register("experience")}
                  />
                  {errors.experience && (
                    <p className="text-sm text-red-600 flex items-center space-x-2 mt-2">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-medium">
                        {errors.experience.message}
                      </span>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white backdrop-blur-2xl border border-gray-200 shadow-2xl rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-3xl">
      <CardHeader className="text-center pb-8 pt-10 px-8 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border-b border-gray-200">
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl blur opacity-50 animate-pulse"></div>
          <div className="relative w-14 h-14 mx-auto bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-xl">
            <span className="text-white text-2xl font-bold">{currentStep}</span>
          </div>
        </div>
        <CardTitle className="text-3xl font-bold text-gray-900 mb-3">
          {steps[currentStep - 1].title}
        </CardTitle>
        <CardDescription className="text-gray-700 text-base leading-relaxed font-medium">
          {steps[currentStep - 1].description}
        </CardDescription>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>
              Step {currentStep} of {steps.length}
            </span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="pt-8 px-8 pb-8">
        {error && (
          <div className="mb-6 p-4 text-sm text-red-700 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/60 rounded-2xl flex items-start space-x-3">
            <div className="w-5 h-5 mt-0.5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg
                className="w-3 h-3 text-red-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="font-medium flex-1">{error}</span>
          </div>
        )}

        <form className="space-y-6">
          {renderStep()}

          {/* Terms and Conditions - Show only on last step */}
          {currentStep === steps.length && (
            <div className="flex items-start space-x-3 bg-gray-50 p-4 rounded-xl border border-gray-300">
              <input
                type="checkbox"
                id="terms"
                className="w-5 h-5 text-emerald-600 border-gray-400 rounded focus:ring-emerald-500 focus:ring-offset-0 mt-0.5 cursor-pointer"
                required
              />
              <label
                htmlFor="terms"
                className="text-sm text-gray-800 leading-relaxed cursor-pointer select-none"
              >
                I agree to the{" "}
                <a
                  href="/terms"
                  className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors hover:underline underline-offset-2"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="/privacy"
                  className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors hover:underline underline-offset-2"
                >
                  Privacy Policy
                </a>
              </label>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1 || isLoading}
              className="px-6"
            >
              Previous
            </Button>

            <Button
              type="button"
              onClick={handleNext}
              disabled={isLoading}
              className="px-8 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-xl shadow-emerald-500/25 hover:shadow-2xl hover:shadow-emerald-600/40 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </div>
              ) : currentStep === steps.length ? (
                "Create Account"
              ) : (
                "Next"
              )}
            </Button>
          </div>
        </form>
        {/* Social Registration - Show only on first step */}
        {currentStep === 1 && (
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-white text-gray-600 font-medium uppercase tracking-wider">
                  Or sign up with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleSocialSignIn("google")}
                disabled={isLoading}
                className="group flex items-center justify-center px-4 py-3 min-h-[48px] border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 touch-manipulation"
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="ml-3 text-sm font-semibold text-gray-800 group-hover:text-gray-900">
                  Continue with Google
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialSignIn("github")}
                disabled={isLoading}
                className="group flex items-center justify-center px-4 py-3 min-h-[48px] border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 touch-manipulation"
              >
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span className="ml-3 text-sm font-semibold text-gray-800 group-hover:text-gray-900">
                  Continue with GitHub
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Security Badge */}
        <div className="mt-8 pt-6 border-t border-gray-300 text-center">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-700">
            <svg
              className="w-4 h-4 text-green-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">
              Your data is protected with enterprise-grade security
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
