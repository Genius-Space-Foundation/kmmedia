"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  CreditCard,
  Building2,
  Smartphone,
  Shield,
  Clock,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  processingTime: string;
  fees?: string;
  recommended?: boolean;
  available: boolean;
  features: string[];
}

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onMethodSelect: (methodId: string) => void;
  amount: number;
  className?: string;
}

export default function PaymentMethodSelector({
  selectedMethod,
  onMethodSelect,
  amount,
  className,
}: PaymentMethodSelectorProps) {
  const paymentMethods: PaymentMethod[] = [
    {
      id: "paystack_card",
      name: "Debit/Credit Card",
      description: "Pay with Visa, Mastercard, or Verve cards",
      icon: <CreditCard className="h-6 w-6" />,
      processingTime: "Instant",
      recommended: true,
      available: true,
      features: [
        "Instant confirmation",
        "Secure encryption",
        "Mobile friendly",
      ],
    },
    {
      id: "paystack_bank",
      name: "Bank Transfer",
      description: "Direct transfer from your bank account",
      icon: <Building2 className="h-6 w-6" />,
      processingTime: "1-2 business days",
      available: true,
      features: ["Lower fees", "Bank-level security", "No card required"],
    },
    {
      id: "paystack_ussd",
      name: "USSD Payment",
      description: "Pay using your mobile phone",
      icon: <Smartphone className="h-6 w-6" />,
      processingTime: "Instant",
      available: true,
      features: ["No internet required", "Works on any phone", "Instant"],
    },
    {
      id: "installment",
      name: "Payment Plan",
      description: "Split payment into installments",
      icon: <Clock className="h-6 w-6" />,
      processingTime: "Setup instantly",
      fees: "Small processing fee",
      available: amount >= 1000, // Only for amounts >= 1000
      features: ["Flexible terms", "Automatic deductions", "Budget friendly"],
    },
  ];

  const availableMethods = paymentMethods.filter((method) => method.available);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center space-x-2 mb-4">
        <Shield className="h-5 w-5 text-green-600" />
        <span className="text-sm text-green-700 font-medium">
          All payments are secured with 256-bit SSL encryption
        </span>
      </div>

      <RadioGroup value={selectedMethod} onValueChange={onMethodSelect}>
        <div className="space-y-3">
          {availableMethods.map((method) => (
            <div key={method.id} className="relative">
              <Label
                htmlFor={method.id}
                className={cn(
                  "flex items-start space-x-4 p-4 border rounded-lg cursor-pointer transition-all hover:border-gray-300",
                  selectedMethod === method.id
                    ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                    : "border-gray-200"
                )}
              >
                <RadioGroupItem
                  value={method.id}
                  id={method.id}
                  className="mt-1"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="flex-shrink-0 text-gray-600">
                      {method.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">
                          {method.name}
                        </h3>
                        {method.recommended && (
                          <Badge variant="secondary" className="text-xs">
                            Recommended
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {method.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Processing: {method.processingTime}
                        </span>
                      </div>
                      {method.fees && (
                        <div className="flex items-center space-x-2">
                          <CreditCard className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {method.fees}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      {method.features.map((feature, index) => (
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
                  </div>
                </div>
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>

      {/* Security Notice */}
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-gray-900 mb-1">
                Your payment is secure
              </p>
              <p className="text-gray-600">
                We use industry-standard encryption and never store your payment
                details. All transactions are processed through our certified
                payment partners.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Amount Summary */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <span className="font-medium text-blue-900">Total Amount:</span>
            <span className="text-2xl font-bold text-blue-900">
              GH₵{amount.toLocaleString()}
            </span>
          </div>
          {selectedMethod === "installment" && (
            <div className="mt-2 pt-2 border-t border-blue-200">
              <p className="text-sm text-blue-700">
                Available installment options will be shown in the next step
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
