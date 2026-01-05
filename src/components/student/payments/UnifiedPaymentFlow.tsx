"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Calculator,
  Calendar,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingDown,
  Zap,
  Wallet,
  Banknote,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentOption {
  id: string;
  name: string;
  description: string;
  totalAmount: number;
  installments?: number;
  monthlyAmount?: number;
  processingFee?: number;
  totalWithFees: number;
  recommended?: boolean;
  features: string[];
  savings?: number;
  icon: React.ReactNode;
}

interface UnifiedPaymentFlowProps {
  amount: number;
  courseId?: string;
  courseName?: string;
  applicationId?: string;
  enrollmentId?: string;
  type: "APPLICATION_FEE" | "TUITION" | "INSTALLMENT";
  onSuccess?: (paymentData: any) => void;
  onCancel?: () => void;
  className?: string;
}

export default function UnifiedPaymentFlow({
  amount,
  courseId,
  courseName,
  applicationId,
  enrollmentId,
  type,
  onSuccess,
  onCancel,
  className,
}: UnifiedPaymentFlowProps) {
  const [selectedOption, setSelectedOption] = useState<string>("full_payment");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generatePaymentOptions();
  }, [amount]);

  const generatePaymentOptions = () => {
    const options: PaymentOption[] = [
      {
        id: "full_payment",
        name: "Full Payment",
        description: "Pay the complete amount now",
        totalAmount: amount,
        totalWithFees: amount,
        recommended: amount < 2000,
        features: [
          "No additional fees",
          "Immediate access",
          "One-time payment",
          "Best value",
        ],
        savings: amount >= 2000 ? Math.round(amount * 0.05) : 0,
        icon: <Banknote className="h-5 w-5" />,
      },
    ];

    // Add installment plans for amounts >= 1000
    if (amount >= 1000) {
      const installmentOptions = [
        {
          installments: 2,
          processingFeeRate: 0.02,
          name: "2-Month Plan",
          description: "Split into 2 monthly payments",
        },
        {
          installments: 3,
          processingFeeRate: 0.03,
          name: "3-Month Plan",
          description: "Split into 3 monthly payments",
          recommended: amount >= 2000 && amount < 5000,
        },
        {
          installments: 6,
          processingFeeRate: 0.05,
          name: "6-Month Plan",
          description: "Split into 6 monthly payments",
          recommended: amount >= 5000,
        },
      ];

      installmentOptions.forEach((option) => {
        const processingFee = Math.round(amount * option.processingFeeRate);
        const totalWithFees = amount + processingFee;
        const monthlyAmount = Math.round(totalWithFees / option.installments);

        options.push({
          id: `installment_${option.installments}`,
          name: option.name,
          description: option.description,
          totalAmount: amount,
          installments: option.installments,
          monthlyAmount,
          processingFee,
          totalWithFees,
          recommended: option.recommended,
          features: [
            "Automatic monthly deductions",
            "Flexible payment schedule",
            "Budget-friendly option",
            `${option.installments} equal payments`,
          ],
          icon: <Wallet className="h-5 w-5" />,
        });
      });
    }

    setPaymentOptions(options);
    // Set default selection to recommended option or full payment
    const recommendedOption = options.find(option => option.recommended);
    if (recommendedOption) {
      setSelectedOption(recommendedOption.id);
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // Prepare payment data based on selected option
      let paymentData: any = {
        type,
        amount,
        courseId,
        applicationId,
      };

      // Add installment-specific data if needed
      if (selectedOption.startsWith("installment_")) {
        const installments = parseInt(selectedOption.split("_")[1]);
        paymentData.installments = installments;
      }

      // Call the appropriate payment endpoint
      let endpoint = "/api/payments/initialize";
      
      // Use specific endpoints for tuition and installment payments
      if (type === "TUITION") {
        if (enrollmentId) {
          // This case might not be common if tuition is always tied to application
          // but we support it for completeness if the backend does
          endpoint = "/api/payments/tuition/initialize";
          paymentData = { enrollmentId };
        } else if (applicationId) {
          endpoint = "/api/payments/tuition/initialize";
          paymentData = { applicationId };
        }
      } else if (type === "INSTALLMENT") {
        if (enrollmentId) {
          endpoint = "/api/payments/installment/initialize";
          paymentData = { enrollmentId };
        } else if (applicationId) {
          endpoint = "/api/payments/installment/initialize";
          paymentData = { applicationId };
        }
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      });

      const result = await response.json();

      if (result.success) {
        // Redirect to payment gateway
        if (result.data?.authorizationUrl) {
          window.location.href = result.data.authorizationUrl;
        } else {
          throw new Error("Payment initialization failed: No authorization URL received");
        }
      } else {
        throw new Error(result.message || "Payment initialization failed");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(err instanceof Error ? err.message : "An error occurred during payment processing");
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateSavings = (option: PaymentOption) => {
    if (option.id === "full_payment") {
      const installmentOption = paymentOptions.find((p) => p.installments === 3);
      if (installmentOption) {
        return installmentOption.totalWithFees - option.totalWithFees;
      }
    }
    return 0;
  };

  const selectedPaymentOption = paymentOptions.find(option => option.id === selectedOption);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold">Complete Your Payment</h3>
        {courseName && (
          <p className="text-gray-600">
            For: <span className="font-semibold">{courseName}</span>
          </p>
        )}
        <p className="text-gray-600">
          Select the payment option that works best for your budget
        </p>
      </div>

      {/* Payment Summary Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-blue-900">
            <Calculator className="h-5 w-5" />
            <span>Payment Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-blue-700">Total Amount:</p>
              <p className="font-semibold text-blue-900 text-lg">
                GH₵{amount.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-blue-700">Payment Options:</p>
              <p className="font-semibold text-blue-900">
                {paymentOptions.length} available
              </p>
            </div>
            <div>
              <p className="text-blue-700">Payment Type:</p>
              <p className="font-semibold text-blue-900">
                {type.replace("_", " ")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Options */}
      <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
        <div className="space-y-4">
          {paymentOptions.map((option) => {
            const savings = calculateSavings(option);

            return (
              <div key={option.id} className="relative">
                <Label
                  htmlFor={option.id}
                  className={cn(
                    "block p-6 border rounded-xl cursor-pointer transition-all hover:border-gray-300",
                    selectedOption === option.id
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500"
                      : "border-gray-200 bg-white"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <RadioGroupItem
                        value={option.id}
                        id={option.id}
                        className="mt-1"
                      />

                      <div className="flex-1 space-y-3">
                        {/* Option Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              {option.icon}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {option.name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {option.description}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">
                              GH₵
                              {option.installments
                                ? option.monthlyAmount?.toLocaleString()
                                : option.totalWithFees.toLocaleString()}
                            </p>
                            {option.installments && (
                              <p className="text-sm text-gray-600">per month</p>
                            )}
                          </div>
                        </div>

                        {/* Payment Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">
                                Course Amount:
                              </span>
                              <span className="font-medium">
                                GH₵{option.totalAmount.toLocaleString()}
                              </span>
                            </div>

                            {option.processingFee && option.processingFee > 0 && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">
                                  Processing Fee:
                                </span>
                                <span className="font-medium">
                                  GH₵{option.processingFee.toLocaleString()}
                                </span>
                              </div>
                            )}

                            <Separator />

                            <div className="flex items-center justify-between text-sm font-semibold">
                              <span>Total Amount:</span>
                              <span>
                                GH₵{option.totalWithFees.toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-sm">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">
                                {option.installments === 1
                                  ? "One-time payment"
                                  : `${option.installments} monthly payments`}
                              </span>
                            </div>

                            {option.installments && (
                              <div className="flex items-center space-x-2 text-sm">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-600">
                                  Auto-debit on the 1st of each month
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-2 gap-2">
                          {option.features.map((feature, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2"
                            >
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              <span className="text-xs text-gray-600">
                                {feature}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2">
                          {option.recommended && (
                            <Badge className="bg-green-100 text-green-800">
                              <Zap className="h-3 w-3 mr-1" />
                              Recommended
                            </Badge>
                          )}
                          {savings && savings > 0 && (
                            <Badge variant="secondary">
                              <TrendingDown className="h-3 w-3 mr-1" />
                              Save GH₵{savings.toLocaleString()}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Label>
              </div>
            );
          })}
        </div>
      </RadioGroup>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={handlePayment}
          disabled={isProcessing}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Processing...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span>Proceed to Payment</span>
            </div>
          )}
        </Button>
      </div>

      {/* Important Notes */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="text-sm">
              <h4 className="font-medium text-amber-900 mb-2">
                Important Information
              </h4>
              <ul className="text-amber-800 space-y-1">
                <li>
                  • Installment payments are automatically deducted monthly
                </li>
                <li>• You can pay off your balance early without penalties</li>
                <li>• Processing fees are non-refundable</li>
                <li>• Course access begins after the first payment</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}