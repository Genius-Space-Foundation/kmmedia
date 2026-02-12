"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";
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

// Validation schema for registration
const registrationSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "First name can only contain letters, spaces, hyphens, and apostrophes"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Last name can only contain letters, spaces, hyphens, and apostrophes"),
  email: z
    .string()
    .email("Invalid email address")
    .max(100, "Email must be less than 100 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be less than 128 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain uppercase, lowercase and a number"),
  confirmPassword: z.string(),
  role: z.enum(["STUDENT", "INSTRUCTOR"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegistrationFormData = z.infer<typeof registrationSchema>;



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



export function MultiStepRegistrationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "STUDENT",

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



  const onSubmit = async (data: RegistrationFormData) => {
    setIsLoading(true);
    setError("");

    try {
      // Check email availability first
      const checkResponse = await fetch(`/api/auth/check-email?email=${encodeURIComponent(data.email)}`);
      const checkResult = await checkResponse.json();

      if (checkResponse.ok && !checkResult.available) {
        setError(checkResult.message || "This email is already registered.");
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          role: data.role,
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
          // Redirect to onboarding or returnUrl/dashboard based on role
          const rolePrefix = result.user.role.toLowerCase();
          if (returnUrl) {
            router.push(`${returnUrl}${returnUrl.includes('?') ? '&' : '?'}registered=true`);
          } else {
            router.push(`/auth/onboarding?role=${rolePrefix}`);
          }
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
        return "bg-brand-primary";
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
  const renderFormContent = () => {
    return (
      <div className="space-y-12">
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-semibold text-gray-800">First Name</Label>
              <div className="relative group">
                <Input
                  id="firstName"
                  type="text"
                  placeholder="First name"
                  className="h-12 pl-11 bg-gray-50 border-2 border-gray-300 focus:bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/20 rounded-xl transition-all"
                  {...register("firstName")}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <User className="w-5 h-5 text-gray-500 group-focus-within:text-brand-primary transition-colors" />
                </div>
              </div>
              {errors.firstName && <p className="text-sm text-red-600 font-medium mt-1">{errors.firstName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-semibold text-gray-800">Last Name</Label>
              <div className="relative group">
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Last name"
                  className="h-12 pl-11 bg-gray-50 border-2 border-gray-300 focus:bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/20 rounded-xl transition-all"
                  {...register("lastName")}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <User className="w-5 h-5 text-gray-500 group-focus-within:text-brand-primary transition-colors" />
                </div>
              </div>
              {errors.lastName && <p className="text-sm text-red-600 font-medium mt-1">{errors.lastName.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold text-gray-800">Email Address</Label>
            <div className="relative group">
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                className="h-12 pl-11 bg-gray-50 border-2 border-gray-300 focus:bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/20 rounded-xl transition-all"
                {...register("email")}
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-500 group-focus-within:text-brand-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            {errors.email && <p className="text-sm text-red-600 font-medium mt-1">{errors.email.message}</p>}
          </div>
        </div>

        <div className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password" title="At least 8 chars, 1 uppercase, 1 lowercase, 1 number" className="text-sm font-semibold text-gray-800">Password</Label>
              <div className="relative group">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create password"
                  className="h-12 pl-11 pr-12 bg-gray-50 border-2 border-gray-300 focus:bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/20 rounded-xl transition-all"
                  {...register("password")}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500 group-focus-within:text-brand-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none">
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
              {password && (
                <div className="mt-3 space-y-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700 tracking-tight tracking-widest uppercase">STRENGTH: {getPasswordStrengthText()}</span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div key={level} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${level <= passwordStrength ? getPasswordStrengthColor() : "bg-gray-200"}`} />
                    ))}
                  </div>
                </div>
              )}
              {errors.password && <p className="text-sm text-red-600 font-medium mt-1">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-800">Confirm Password</Label>
              <div className="relative group">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repeat password"
                  className="h-12 pl-11 pr-12 bg-gray-50 border-2 border-gray-300 focus:bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/20 rounded-xl transition-all"
                  {...register("confirmPassword")}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500 group-focus-within:text-brand-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none">
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-red-600 font-medium mt-1">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          <div className="space-y-4">
            <Label htmlFor="role" className="text-sm font-semibold text-gray-800">I am a...</Label>
            <Select onValueChange={(value: "STUDENT" | "INSTRUCTOR") => setValue("role", value)} defaultValue="STUDENT">
              <SelectTrigger className="h-12 pl-4 bg-gray-50 border-2 border-gray-300 focus:bg-white focus:border-brand-primary rounded-xl transition-all">
                <SelectValue placeholder="Choose role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STUDENT">Student - Learn and grow</SelectItem>
                <SelectItem value="INSTRUCTOR">Instructor - Teach and inspire</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>


      </div>
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white backdrop-blur-2xl border border-gray-200 shadow-2xl rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-3xl">
      <CardHeader className="text-center pb-8 pt-10 px-8 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border-b border-gray-200">
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-primary to-teal-600 rounded-2xl blur opacity-50 animate-pulse"></div>
          <div className="relative w-14 h-14 mx-auto bg-gradient-to-br from-brand-primary via-teal-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-xl">
            <User className="text-white w-8 h-8" />
          </div>
        </div>
        <CardTitle className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</CardTitle>
        <CardDescription className="text-gray-600 text-base max-w-md mx-auto">
          Join KM Media Training Institute today. Fill in your details below to get started on your learning journey.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-10 px-8 pb-10">
        {error && (
          <div className="mb-8 p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-3 animate-in fade-in slide-in-from-top-2">
            <svg className="w-5 h-5 mt-0.5 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
          {renderFormContent()}

          <div className="space-y-6 pt-6 border-t border-gray-100">
            <div className="flex items-start space-x-3 bg-gray-50/50 p-4 rounded-xl border border-gray-200">
              <input
                type="checkbox"
                id="terms"
                className="w-5 h-5 text-brand-primary border-gray-300 rounded focus:ring-brand-primary mt-0.5 cursor-pointer"
                required
              />
              <label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed cursor-pointer select-none">
                I agree to the <a href="/terms" className="text-brand-primary hover:underline font-semibold">Terms of Service</a> and <a href="/privacy" className="text-brand-primary hover:underline font-semibold">Privacy Policy</a>
              </label>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-brand-primary hover:bg-brand-secondary text-white text-lg font-bold rounded-2xl shadow-lg shadow-brand-primary/20 hover:shadow-xl hover:shadow-brand-primary/30 transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                "Create Account"
              )}
            </Button>
          </div>
        </form>

        <div className="mt-10">
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold text-gray-500">
              <span className="px-4 bg-white">Or sign up with</span>
            </div>
          </div>

          <div className="mt-8">
            <button
              type="button"
              onClick={() => handleSocialSignIn("google")}
              disabled={isLoading}
              className="w-full h-12 flex items-center justify-center px-4 border-2 border-gray-200 rounded-xl hover:border-brand-primary hover:bg-emerald-50/30 transition-all font-semibold text-gray-700 active:scale-[0.99]"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 text-center">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 font-medium">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Secure Enterprise-Grade Registration</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
