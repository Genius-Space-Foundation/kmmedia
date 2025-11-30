"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  CreditCard,
  Shield,
  ArrowLeft,
  ArrowRight,
  Smartphone,
  Wifi,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import PaymentSecurityIndicators from "./PaymentSecurityIndicators";

interface MobilePaymentFlowProps {
  amount: number;
  type: "APPLICATION_FEE" | "TUITION" | "INSTALLMENT";
  courseId?: string;
  courseName?: string;
  onPaymentComplete?: (paymentData: any) => void;
  onCancel?: () => void;
}

export default function MobilePaymentFlow({
  amount,
  type,
  courseId,
  courseName,
  onPaymentComplete,
  onCancel,
}: MobilePaymentFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const steps = [
    { id: 1, title: "Review", icon: <CheckCircle className="h-4 w-4" /> },
    { id: 2, title: "Method", icon: <CreditCard className="h-4 w-4" /> },
    { id: 3, title: "Pay", icon: <Shield className="h-4 w-4" /> },
    { id: 4, title: "Done", icon: <CheckCircle className="h-4 w-4" /> },
  ];

  const mobilePaymentMethods = [
    {
      id: "mobile_money",
      name: "Mobile Money",
      description: "MTN, Vodafone, AirtelTigo",
      icon: <Smartphone className="h-5 w-5" />,
      recommended: true,
      requiresInternet: false,
    },
    {
      id: "ussd",
      name: "USSD Payment",
      description: "Dial *code# on any phone",
      icon: <Smartphone className="h-5 w-5" />,
      recommended: false,
      requiresInternet: false,
    },
    {
      id: "card",
      name: "Card Payment",
      description: "Debit/Credit cards",
      icon: <CreditCard className="h-5 w-5" />,
      recommended: false,
      requiresInternet: true,
    },
  ];

  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case "APPLICATION_FEE":
        return "Application Fee";
      case "TUITION":
        return "Tuition";
      case "INSTALLMENT":
        return "Installment";
      default:
        return "Payment";
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
  };

  const handleInitializePayment = async () => {
    if (!selectedMethod) return;

    setIsProcessing(true);
    try {
      // Simulate payment initialization
      await new Promise((resolve) => setTimeout(resolve, 2000));
      handleNext();
    } catch (error) {
      console.error("Payment initialization failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const progressPercentage = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={currentStep === 1 ? onCancel : handleBack}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="text-center">
            <h1 className="font-semibold text-gray-900">Secure Payment</h1>
            <p className="text-sm text-gray-600">
              Step {currentStep} of {steps.length}
            </p>
          </div>
          <div className="w-9" /> {/* Spacer */}
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <Progress value={progressPercentage} className="h-1" />
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between mt-3">
          {steps.map((step) => (
            <div
              key={step.id}
              className={cn(
                "flex flex-col items-center space-y-1",
                currentStep >= step.id ? "text-blue-600" : "text-gray-400"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-full text-xs",
                  currentStep >= step.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200"
                )}
              >
                {step.icon}
              </div>
              <span className="text-xs font-medium">{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Connection Status */}
      {!isOnline && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
          <div className="flex items-center space-x-2">
            <Wifi className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              You're offline. Some payment methods may not be available.
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 p-4 space-y-4">
        {currentStep === 1 && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <h2 className="font-semibold">Payment Summary</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{getPaymentTypeLabel(type)}</p>
                    {courseName && (
                      <p className="text-sm text-gray-600">{courseName}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">
                      GH₵{amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <PaymentSecurityIndicators compact />

            <Button onClick={handleNext} className="w-full" size="lg">
              Continue to Payment Method
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <h2 className="font-semibold">Choose Payment Method</h2>
              </CardHeader>
              <CardContent className="space-y-3">
                {mobilePaymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={cn(
                      "p-4 border rounded-lg transition-colors",
                      selectedMethod === method.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200",
                      !isOnline && method.requiresInternet
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    )}
                    onClick={() => {
                      if (isOnline || !method.requiresInternet) {
                        handlePaymentMethodSelect(method.id);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-gray-600">{method.icon}</div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium">{method.name}</p>
                            {method.recommended && (
                              <Badge variant="secondary" className="text-xs">
                                Popular
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {method.description}
                          </p>
                          {!isOnline && method.requiresInternet && (
                            <p className="text-xs text-red-600 mt-1">
                              Requires internet connection
                            </p>
                          )}
                        </div>
                      </div>
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full border-2",
                          selectedMethod === method.id
                            ? "border-blue-500 bg-blue-500"
                            : "border-gray-300"
                        )}
                      >
                        {selectedMethod === method.id && (
                          <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Button
              onClick={handleNext}
              disabled={!selectedMethod}
              className="w-full"
              size="lg"
            >
              Continue to Payment
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6 text-center space-y-4">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto">
                  {isProcessing ? (
                    <Clock className="h-8 w-8 text-blue-600 animate-spin" />
                  ) : (
                    <CreditCard className="h-8 w-8 text-blue-600" />
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    {isProcessing ? "Processing..." : "Ready to Pay"}
                  </h3>
                  <p className="text-gray-600">
                    {isProcessing
                      ? "Please wait while we process your payment"
                      : "Tap the button below to complete your payment"}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total:</span>
                    <span className="text-2xl font-bold">
                      GH₵{amount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {!isProcessing && (
                  <Button
                    onClick={handleInitializePayment}
                    className="w-full"
                    size="lg"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Pay Securely
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6 text-center space-y-4">
                <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>

                <div>
                  <h3 className="font-semibold text-lg text-green-900 mb-2">
                    Payment Successful!
                  </h3>
                  <p className="text-gray-600">
                    Your payment has been processed successfully
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-800">
                    A confirmation SMS and email have been sent to you
                  </p>
                </div>

                <Button
                  onClick={onPaymentComplete}
                  className="w-full"
                  size="lg"
                >
                  Continue
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
