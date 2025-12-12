"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const courseId = params.id as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "processing" | "success" | "failed"
  >("pending");

  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === "unauthenticated") {
      const callbackUrl = typeof window !== "undefined" 
        ? encodeURIComponent(window.location.pathname)
        : encodeURIComponent(`/courses/${courseId}/apply/payment`);
      router.push(`/auth/login?callbackUrl=${callbackUrl}`);
      return;
    }

    // Wait for session to load
    if (status === "loading") {
      return;
    }

    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch course data (cookies are sent automatically)
        const response = await fetch(`/api/courses/${courseId}`, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.status === 401) {
          router.push(`/auth/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
          return;
        }

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

    if (courseId && status === "authenticated") {
      fetchCourse();
    }
  }, [courseId, status, router]);

  const handlePayment = async () => {
    if (status !== "authenticated" || !session) {
      setError("You must be logged in to make payments");
      const callbackUrl = typeof window !== "undefined" 
        ? encodeURIComponent(window.location.pathname)
        : encodeURIComponent(`/courses/${courseId}/apply/payment`);
      router.push(`/auth/login?callbackUrl=${callbackUrl}`);
      return;
    }

    setPaymentStatus("processing");

    try {
      // Initialize payment with Paystack (cookies are sent automatically)
      const response = await fetch("/api/payments/initialize", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "APPLICATION_FEE",
          courseId: courseId,
          amount: course?.applicationFee || 0,
        }),
      });

      if (response.status === 401) {
        setError("You must be logged in to make payments");
        setPaymentStatus("failed");
        const callbackUrl = typeof window !== "undefined" 
          ? encodeURIComponent(window.location.pathname)
          : encodeURIComponent(`/courses/${courseId}/apply/payment`);
        router.push(`/auth/login?callbackUrl=${callbackUrl}`);
        return;
      }

      const data = await response.json();

      if (data.success && data.data.authorizationUrl) {
        // Redirect to Paystack payment page
        window.location.href = data.data.authorizationUrl;
      } else if (data.success && data.data.authorization_url) {
        // Fallback for old API response format
        window.location.href = data.data.authorization_url;
      } else {
        setError(data.message || "Failed to initialize payment");
        setPaymentStatus("failed");
      }
    } catch (error) {
      console.error("Payment error:", error);
      setError("An error occurred while processing payment");
      setPaymentStatus("failed");
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
            Loading Payment Page...
          </div>
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
              {status === "unauthenticated"
                ? "Authentication Required"
                : "Error Loading Course"}
            </CardTitle>
            <CardDescription className="text-gray-600">{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-4">
              {status === "unauthenticated" ? (
                <div className="space-y-3">
                  <p className="text-gray-600">
                    You need to be logged in to make payments.
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
              The course you're trying to pay for doesn't exist.
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

  if (paymentStatus === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-lg w-full mx-4 shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-3xl">🎉</span>
            </div>
            <CardTitle className="text-2xl text-gray-900">
              Application Successful!
            </CardTitle>
            <CardDescription className="text-gray-600">
              Your application for {course.title} has been submitted
              successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What happens next?
              </h3>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-center space-x-2">
                  <span className="text-blue-500">1️⃣</span>
                  <span>
                    We'll review your application within 2-3 business days
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">2️⃣</span>
                  <span>
                    You'll receive an email notification about the status
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-purple-500">3️⃣</span>
                  <span>If approved, you can proceed with tuition payment</span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Check your email for a confirmation receipt and next steps.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/auth/login" className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    🏠 Go to Dashboard
                  </Button>
                </Link>
                <Link href="/courses" className="flex-1">
                  <Button variant="outline" className="w-full">
                    📚 Browse More Courses
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentStatus === "failed") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-lg w-full mx-4 shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-3xl">❌</span>
            </div>
            <CardTitle className="text-2xl text-gray-900">
              Payment Failed
            </CardTitle>
            <CardDescription className="text-gray-600">
              There was an issue processing your payment. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Don't worry, your application data has been saved. You can retry
                the payment.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => setPaymentStatus("pending")}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  🔄 Retry Payment
                </Button>
                <Link href="/contact" className="flex-1">
                  <Button variant="outline" className="w-full">
                    💬 Contact Support
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

          <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-sm font-medium mb-4">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            Payment Processing
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Application
          </h2>
          <p className="text-gray-600">
            Pay the application fee to submit your course application
          </p>
        </div>

        {/* Payment Card */}
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                <span className="text-3xl">📚</span>
              </div>
              <div>
                <CardTitle className="text-xl text-gray-900">
                  {course.title}
                </CardTitle>
                <CardDescription className="text-blue-600">
                  Application Fee Payment
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-red-500">❌</span>
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </div>
            )}
            {paymentStatus === "pending" && (
              <>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    💳 Payment Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Course:</span>
                      <span className="font-medium text-gray-900">
                        {course.title}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Application Fee:</span>
                      <span className="font-medium text-gray-900">
                        ₵{course.applicationFee.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-3">
                      <span className="text-lg font-semibold text-gray-900">
                        Total Amount:
                      </span>
                      <span className="text-2xl font-bold text-blue-600">
                        ₵{course.applicationFee.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    🔒 Secure Payment Options
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border-2 border-blue-200 rounded-xl p-4 hover:bg-blue-50 transition-colors cursor-pointer">
                      <div className="text-center">
                        <div className="text-2xl mb-2">💳</div>
                        <h4 className="font-semibold text-gray-900">
                          Card Payment
                        </h4>
                        <p className="text-sm text-gray-600">
                          Visa, Mastercard, Verve
                        </p>
                      </div>
                    </div>
                    <div className="border-2 border-green-200 rounded-xl p-4 hover:bg-green-50 transition-colors cursor-pointer">
                      <div className="text-center">
                        <div className="text-2xl mb-2">📱</div>
                        <h4 className="font-semibold text-gray-900">
                          Mobile Money
                        </h4>
                        <p className="text-sm text-gray-600">
                          MTN, Vodafone, AirtelTigo
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <span className="text-yellow-600 text-xl">ℹ️</span>
                    <div>
                      <h4 className="font-semibold text-yellow-800 mb-1">
                        Important Notes:
                      </h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Application fee is non-refundable</li>
                        <li>• Payment confirms your application submission</li>
                        <li>
                          • You'll receive email confirmation after payment
                        </li>
                        <li>
                          • Admin will review your application within 2-3
                          business days
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <Button
                    onClick={handlePayment}
                    className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 text-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <span>💳</span>
                      <span>
                        Pay ₵{course.applicationFee.toLocaleString()} Now
                      </span>
                    </div>
                  </Button>

                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center space-x-1">
                      <span>🔒</span>
                      <span>Secure Payment</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <span>⚡</span>
                      <span>Instant Confirmation</span>
                    </span>
                  </div>
                </div>
              </>
            )}

            {paymentStatus === "processing" && (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Processing Payment...
                </h3>
                <p className="text-gray-600 mb-4">
                  Please don't close this window while we process your payment.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    🔒 Your payment is being processed securely. This may take a
                    few moments.
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6 border-t">
              <Link href={`/courses/${courseId}/apply`}>
                <Button variant="outline" className="px-6 py-3">
                  ← Back to Application
                </Button>
              </Link>

              <Link href="/contact">
                <Button variant="ghost" className="px-6 py-3">
                  💬 Need Help?
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Security Information */}
        <div className="mt-8 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🔒 Your Security is Our Priority
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl mb-2">🛡️</div>
                <h4 className="font-semibold text-gray-900">SSL Encrypted</h4>
                <p className="text-gray-600">All data is encrypted</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🏦</div>
                <h4 className="font-semibold text-gray-900">
                  Bank Grade Security
                </h4>
                <p className="text-gray-600">Industry standard protection</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🚫</div>
                <h4 className="font-semibold text-gray-900">No Card Storage</h4>
                <p className="text-gray-600">We don't store card details</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
