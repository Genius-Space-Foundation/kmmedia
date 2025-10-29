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
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentPlan {
  id: string;
  name: string;
  description: string;
  totalAmount: number;
  installments: number;
  monthlyAmount: number;
  processingFee: number;
  totalWithFees: number;
  recommended?: boolean;
  features: string[];
  savings?: number;
}

interface PaymentPlanSelectorProps {
  amount: number;
  courseId?: string;
  selectedPlan: string;
  onPlanSelect: (planId: string) => void;
  onCalculate?: (plan: PaymentPlan) => void;
  className?: string;
}

export default function PaymentPlanSelector({
  amount,
  courseId,
  selectedPlan,
  onPlanSelect,
  onCalculate,
  className,
}: PaymentPlanSelectorProps) {
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    generatePaymentPlans();
  }, [amount]);

  const generatePaymentPlans = () => {
    const plans: PaymentPlan[] = [
      {
        id: "full_payment",
        name: "Full Payment",
        description: "Pay the complete amount now",
        totalAmount: amount,
        installments: 1,
        monthlyAmount: amount,
        processingFee: 0,
        totalWithFees: amount,
        recommended: amount < 2000,
        features: [
          "No additional fees",
          "Immediate access",
          "One-time payment",
          "Best value",
        ],
        savings: amount >= 2000 ? Math.round(amount * 0.05) : 0,
      },
    ];

    // Add installment plans for amounts >= 1000
    if (amount >= 1000) {
      const installmentPlans = [
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

      installmentPlans.forEach((plan) => {
        const processingFee = Math.round(amount * plan.processingFeeRate);
        const totalWithFees = amount + processingFee;
        const monthlyAmount = Math.round(totalWithFees / plan.installments);

        plans.push({
          id: `installment_${plan.installments}`,
          name: plan.name,
          description: plan.description,
          totalAmount: amount,
          installments: plan.installments,
          monthlyAmount,
          processingFee,
          totalWithFees,
          recommended: plan.recommended,
          features: [
            "Automatic monthly deductions",
            "Flexible payment schedule",
            "Budget-friendly option",
            `${plan.installments} equal payments`,
          ],
        });
      });
    }

    setPaymentPlans(plans);
  };

  const handlePlanSelect = (planId: string) => {
    onPlanSelect(planId);
    const selectedPlanData = paymentPlans.find((plan) => plan.id === planId);
    if (selectedPlanData && onCalculate) {
      onCalculate(selectedPlanData);
    }
  };

  const calculateSavings = (plan: PaymentPlan) => {
    if (plan.id === "full_payment") {
      const installmentPlan = paymentPlans.find((p) => p.installments === 3);
      if (installmentPlan) {
        return installmentPlan.totalWithFees - plan.totalWithFees;
      }
    }
    return 0;
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Choose Your Payment Plan</h3>
        <p className="text-gray-600">
          Select the payment option that works best for your budget
        </p>
      </div>

      {/* Payment Calculator Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-blue-900">
            <Calculator className="h-5 w-5" />
            <span>Payment Calculator</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-blue-700">Course Amount:</p>
              <p className="font-semibold text-blue-900">
                GH₵{amount.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-blue-700">Available Plans:</p>
              <p className="font-semibold text-blue-900">
                {paymentPlans.length} options
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Plans */}
      <RadioGroup value={selectedPlan} onValueChange={handlePlanSelect}>
        <div className="space-y-4">
          {paymentPlans.map((plan) => {
            const savings = calculateSavings(plan);

            return (
              <div key={plan.id} className="relative">
                <Label
                  htmlFor={plan.id}
                  className={cn(
                    "block p-6 border rounded-lg cursor-pointer transition-all hover:border-gray-300",
                    selectedPlan === plan.id
                      ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                      : "border-gray-200 bg-white"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <RadioGroupItem
                        value={plan.id}
                        id={plan.id}
                        className="mt-1"
                      />

                      <div className="flex-1 space-y-3">
                        {/* Plan Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <h4 className="font-semibold text-gray-900">
                              {plan.name}
                            </h4>
                            {plan.recommended && (
                              <Badge className="bg-green-100 text-green-800">
                                <Zap className="h-3 w-3 mr-1" />
                                Recommended
                              </Badge>
                            )}
                            {savings > 0 && (
                              <Badge variant="secondary">
                                <TrendingDown className="h-3 w-3 mr-1" />
                                Save GH₵{savings}
                              </Badge>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">
                              GH₵{plan.monthlyAmount.toLocaleString()}
                            </p>
                            {plan.installments > 1 && (
                              <p className="text-sm text-gray-600">per month</p>
                            )}
                          </div>
                        </div>

                        <p className="text-gray-600">{plan.description}</p>

                        {/* Payment Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">
                                Course Amount:
                              </span>
                              <span className="font-medium">
                                GH₵{plan.totalAmount.toLocaleString()}
                              </span>
                            </div>

                            {plan.processingFee > 0 && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">
                                  Processing Fee:
                                </span>
                                <span className="font-medium">
                                  GH₵{plan.processingFee.toLocaleString()}
                                </span>
                              </div>
                            )}

                            <Separator />

                            <div className="flex items-center justify-between text-sm font-semibold">
                              <span>Total Amount:</span>
                              <span>
                                GH₵{plan.totalWithFees.toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-sm">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">
                                {plan.installments === 1
                                  ? "One-time payment"
                                  : `${plan.installments} monthly payments`}
                              </span>
                            </div>

                            {plan.installments > 1 && (
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
                          {plan.features.map((feature, index) => (
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

                        {/* Payment Schedule Preview */}
                        {selectedPlan === plan.id && plan.installments > 1 && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <h5 className="font-medium text-gray-900 mb-3">
                              Payment Schedule
                            </h5>
                            <div className="space-y-2">
                              {Array.from(
                                { length: plan.installments },
                                (_, i) => {
                                  const paymentDate = new Date();
                                  paymentDate.setMonth(
                                    paymentDate.getMonth() + i
                                  );

                                  return (
                                    <div
                                      key={i}
                                      className="flex items-center justify-between text-sm"
                                    >
                                      <span className="text-gray-600">
                                        Payment {i + 1}:
                                      </span>
                                      <div className="text-right">
                                        <span className="font-medium">
                                          GH₵
                                          {plan.monthlyAmount.toLocaleString()}
                                        </span>
                                        <span className="text-gray-500 ml-2">
                                          {paymentDate.toLocaleDateString(
                                            "en-GB",
                                            {
                                              month: "short",
                                              year: "numeric",
                                            }
                                          )}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Label>
              </div>
            );
          })}
        </div>
      </RadioGroup>

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

      {/* Contact Support */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Need help choosing a payment plan?{" "}
          <button className="text-blue-600 hover:text-blue-800 font-medium">
            Contact our support team
          </button>
        </p>
      </div>
    </div>
  );
}
