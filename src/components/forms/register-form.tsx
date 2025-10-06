"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    phone: z.string().optional(),
    role: z.enum(["STUDENT", "INSTRUCTOR"]).default("STUDENT"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
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
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Redirect based on user role
        const role = result.user.role.toLowerCase();
        router.push(`/dashboards/${role}`);
      } else {
        setError(result.message || "Registration failed");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-xl border-0 shadow-2xl rounded-2xl overflow-hidden">
      <CardHeader className="text-center pb-6 bg-gradient-to-br from-green-50 to-emerald-50 border-b border-gray-100">
        <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">
          Join Our Community
        </CardTitle>
        <CardDescription className="text-gray-600 mt-2">
          Create your account and start your media career journey
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-8 px-8 pb-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {error && (
            <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3">
              <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-500 text-xs">⚠</span>
              </div>
              <span className="font-medium">{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-sm font-semibold text-gray-700 flex items-center space-x-2"
            >
              <svg
                className="w-4 h-4 text-gray-500"
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
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              className="h-12 px-4 bg-gray-50 border-2 border-gray-200 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-xl transition-all duration-200 font-medium"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-600 flex items-center space-x-2 mt-1">
                <span className="w-4 h-4 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-500 text-xs">✕</span>
                </span>
                <span className="font-medium">{errors.name.message}</span>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-semibold text-gray-700 flex items-center space-x-2"
            >
              <svg
                className="w-4 h-4 text-gray-500"
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
              <span>Email Address</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              className="h-12 px-4 bg-gray-50 border-2 border-gray-200 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-xl transition-all duration-200 font-medium"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-600 flex items-center space-x-2 mt-1">
                <span className="w-4 h-4 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-500 text-xs">✕</span>
                </span>
                <span className="font-medium">{errors.email.message}</span>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="phone"
              className="text-sm font-semibold text-gray-700 flex items-center space-x-2"
            >
              <svg
                className="w-4 h-4 text-gray-500"
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
              <span>Phone Number (Optional)</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Enter your phone number"
              className="h-12 px-4 bg-gray-50 border-2 border-gray-200 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-xl transition-all duration-200 font-medium"
              {...register("phone")}
            />
            {errors.phone && (
              <p className="text-sm text-red-600 flex items-center space-x-2 mt-1">
                <span className="w-4 h-4 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-500 text-xs">✕</span>
                </span>
                <span className="font-medium">{errors.phone.message}</span>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="role"
              className="text-sm font-semibold text-gray-700 flex items-center space-x-2"
            >
              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
              <span>Account Type</span>
            </Label>
            <select
              id="role"
              className="flex h-12 w-full rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-900 px-4 py-3 text-sm focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none transition-all duration-200 font-medium"
              {...register("role")}
            >
              <option value="STUDENT">🎓 Student - Learn and grow</option>
              <option value="INSTRUCTOR">
                👨‍🏫 Instructor - Teach and inspire
              </option>
            </select>
            {errors.role && (
              <p className="text-sm text-red-600 flex items-center space-x-2 mt-1">
                <span className="w-4 h-4 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-500 text-xs">✕</span>
                </span>
                <span className="font-medium">{errors.role.message}</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-semibold text-gray-700 flex items-center space-x-2"
              >
                <svg
                  className="w-4 h-4 text-gray-500"
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
              <Input
                id="password"
                type="password"
                placeholder="Create password"
                className="h-12 px-4 bg-gray-50 border-2 border-gray-200 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-xl transition-all duration-200 font-medium"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-red-600 flex items-center space-x-2 mt-1">
                  <span className="w-4 h-4 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-500 text-xs">✕</span>
                  </span>
                  <span className="font-medium">{errors.password.message}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-sm font-semibold text-gray-700 flex items-center space-x-2"
              >
                <svg
                  className="w-4 h-4 text-gray-500"
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
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm password"
                className="h-12 px-4 bg-gray-50 border-2 border-gray-200 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-xl transition-all duration-200 font-medium"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-600 flex items-center space-x-2 mt-1">
                  <span className="w-4 h-4 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-500 text-xs">✕</span>
                  </span>
                  <span className="font-medium">
                    {errors.confirmPassword.message}
                  </span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="terms"
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-1"
              required
            />
            <label
              htmlFor="terms"
              className="text-sm text-gray-600 leading-relaxed"
            >
              I agree to the{" "}
              <a
                href="#"
                className="text-green-600 hover:text-green-700 font-medium transition-colors"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="#"
                className="text-green-600 hover:text-green-700 font-medium transition-colors"
              >
                Privacy Policy
              </a>
            </label>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating account...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
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
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
                <span>Create Account</span>
              </div>
            )}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">
                Secure Registration
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
