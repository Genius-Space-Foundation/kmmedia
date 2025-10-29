"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  CreditCard,
  Shield,
  Lock,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentFlowProps {
  amount: number;
  type: "APPLICATION_FEE" | "TUITION" | "INSTALLMENT";
  courseId?: string;
  courseName?: string;
  onPaymentComplete?: (paymentData: any) => void;
  onCancel?: () => void;
}

interface PaymentStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  active: boolean;
}

export default function PaymentFlow({
  amount,
  type,
  courseId,
  courseName,
  onPaymentComplete,
  onCancel,
}: PaymentFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>("");

  const steps: PaymentStep[] = [
    {
      id: 1,
      title: "Review Details",
      description: "Confirm payment information",
      completed: currentStep > 1,
      active: currentStep === 1,
    },
    {
      id: 2,
      title: "Payment Method",
      description: "Choose how to pay",
      completed: currentStep > 2,
      active: currentStep === 2,
    },
    {
      id: 3,
      title: "Secure Payment",
      description: "Complete your payment",
      completed: currentStep > 3,
      active: currentStep === 3,
    },
    {
      id: 4,
      title: "Confirmation",
      description: "Payment successful",
      completed: currentStep > 4,
      active: currentStep === 4,
    },
  ];

  const paymentMethods = [
    {
      id: "paystack",
      name: "Card Payment",
      description: "Pay with Visa, Mastercard, or Verve",
      icon: <CreditCard className="h-5 w-5" />,
      recommended: true,
    },
    {
      id: "bank_transfer",
      name: "Bank Transfer",
      description: "Direct bank transfer",
      icon: <CreditCard className="h-5 w-5" />,
      recommended: false,
    },
  ];

  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case "APPLICATION_FEE":
        return "Application Fee";
      case "TUITION":
        return "Tuition Payment";
      case "INSTALLMENT":
        return "Installment Payment";
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
      const response = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          courseId,
          amount,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPaymentData(data.data);
        if (selectedMethod === "paystack") {
          // Redirect to Paystack
          window.location.href = data.data.authorizationUrl;
        } else {
          // Handle other payment methods
          handleNext();
        }
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Payment initialization failed:", error);
      // Handle error
    } finally {
      setIsProcessing(false);
    }
  };

  const progressPercentage = (currentStep / steps.length) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Secure Payment</CardTitle>
            <Badge variant="outline" className="text-xs">
              Step {currentStep} of {steps.length}
            </Badge>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
                    step.completed
                      ? "bg-green-500 text-white"
                      : step.active
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  )}
                >
                  {step.completed ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    step.id
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "w-12 h-0.5 mx-2",
                      step.completed ? "bg-green-500" : "bg-gray-200"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-4">
            <h3 className="font-medium">{steps[currentStep - 1]?.title}</h3>
            <p className="text-sm text-gray-600">
              {steps[currentStep - 1]?.description}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{getPaymentTypeLabel(type)}</p>
                      {courseName && (
                        <p className="text-sm text-gray-600">{courseName}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        GH₵{amount.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Security Indicators */}
                  <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">
                        Secure Payment
                      </p>
                      <p className="text-sm text-blue-700">
                        Your payment is protected by 256-bit SSL encryption
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                    <Lock className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">
                        PCI Compliant
                      </p>
                      <p className="text-sm text-green-700">
                        We never store your card details
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Choose Payment Method
                </h3>
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={cn(
                        "p-4 border rounded-lg cursor-pointer transition-colors",
                        selectedMethod === method.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                      onClick={() => handlePaymentMethodSelect(method.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {method.icon}
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="font-medium">{method.name}</p>
                              {method.recommended && (
                                <Badge variant="secondary" className="text-xs">
                                  Recommended
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {method.description}
                            </p>
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
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
                  {isProcessing ? (
                    <Clock className="h-8 w-8 text-blue-600 animate-spin" />
                  ) : (
                    <CreditCard className="h-8 w-8 text-blue-600" />
                  )}
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {isProcessing ? "Processing Payment..." : "Ready to Pay"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {isProcessing
                    ? "Please wait while we process your payment"
                    : "Click the button below to proceed with your secure payment"}
                </p>

                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Amount:</span>
                    <span className="text-2xl font-bold">
                      GH₵{amount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {!isProcessing && (
                  <Button
                    onClick={handleInitializePayment}
                    disabled={!selectedMethod}
                    className="w-full"
                    size="lg"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Pay Securely
                  </Button>
                )}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  Payment Successful!
                </h3>
                <p className="text-gray-600">
                  Your payment has been processed successfully
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-800">
                  A confirmation email has been sent to your registered email
                  address
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={currentStep === 1 ? onCancel : handleBack}
          disabled={isProcessing}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {currentStep === 1 ? "Cancel" : "Back"}
        </Button>

        {currentStep < 3 && (
          <Button
            onClick={handleNext}
            disabled={currentStep === 2 && !selectedMethod}
          >
            Continue
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
