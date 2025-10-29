"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calculator,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface InstallmentOption {
  months: number;
  monthlyAmount: number;
  totalAmount: number;
  processingFee: number;
  interestRate: number;
  totalInterest: number;
}

interface InstallmentCalculatorProps {
  baseAmount: number;
  onCalculationChange?: (calculation: InstallmentOption) => void;
  className?: string;
}

export default function InstallmentCalculator({
  baseAmount,
  onCalculationChange,
  className,
}: InstallmentCalculatorProps) {
  const [selectedMonths, setSelectedMonths] = useState([3]);
  const [customAmount, setCustomAmount] = useState(baseAmount);
  const [calculations, setCalculations] = useState<InstallmentOption[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  const monthOptions = [2, 3, 6, 9, 12];
  const maxMonths = 12;
  const minAmount = 500;

  useEffect(() => {
    calculateInstallments();
  }, [customAmount, selectedMonths]);

  const calculateInstallments = () => {
    setIsCalculating(true);

    const months = selectedMonths[0];
    const processingFeeRate = getProcessingFeeRate(months);
    const interestRate = getInterestRate(months);

    const processingFee = Math.round(customAmount * processingFeeRate);
    const totalInterest = Math.round(customAmount * interestRate);
    const totalAmount = customAmount + processingFee + totalInterest;
    const monthlyAmount = Math.round(totalAmount / months);

    const calculation: InstallmentOption = {
      months,
      monthlyAmount,
      totalAmount,
      processingFee,
      interestRate: interestRate * 100,
      totalInterest,
    };

    setCalculations([calculation]);

    if (onCalculationChange) {
      onCalculationChange(calculation);
    }

    setIsCalculating(false);
  };

  const getProcessingFeeRate = (months: number): number => {
    if (months <= 2) return 0.02;
    if (months <= 3) return 0.03;
    if (months <= 6) return 0.05;
    if (months <= 9) return 0.07;
    return 0.1;
  };

  const getInterestRate = (months: number): number => {
    if (months <= 2) return 0.0;
    if (months <= 3) return 0.02;
    if (months <= 6) return 0.05;
    if (months <= 9) return 0.08;
    return 0.12;
  };

  const handleMonthsChange = (value: number[]) => {
    setSelectedMonths(value);
  };

  const handleAmountChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    if (numValue >= minAmount) {
      setCustomAmount(numValue);
    }
  };

  const getAffordabilityLevel = (
    monthlyAmount: number
  ): {
    level: string;
    color: string;
    description: string;
  } => {
    if (monthlyAmount <= 200) {
      return {
        level: "Very Affordable",
        color: "text-green-600",
        description: "Easy on your budget",
      };
    } else if (monthlyAmount <= 500) {
      return {
        level: "Affordable",
        color: "text-blue-600",
        description: "Manageable monthly payment",
      };
    } else if (monthlyAmount <= 1000) {
      return {
        level: "Moderate",
        color: "text-yellow-600",
        description: "Consider your budget carefully",
      };
    } else {
      return {
        level: "High",
        color: "text-red-600",
        description: "Significant monthly commitment",
      };
    }
  };

  const currentCalculation = calculations[0];
  const affordability = currentCalculation
    ? getAffordabilityLevel(currentCalculation.monthlyAmount)
    : null;

  const totalSavingsVsFullPayment = currentCalculation
    ? currentCalculation.totalAmount - customAmount
    : 0;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-blue-900">
            <Calculator className="h-5 w-5" />
            <span>Installment Calculator</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-800 text-sm">
            Calculate your monthly payments and see the total cost breakdown
          </p>
        </CardContent>
      </Card>

      {/* Input Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Customize Your Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Payment Amount (GH₵)</Label>
            <Input
              id="amount"
              type="number"
              value={customAmount}
              onChange={(e) => handleAmountChange(e.target.value)}
              min={minAmount}
              className="text-lg font-semibold"
            />
            <p className="text-sm text-gray-600">
              Minimum amount: GH₵{minAmount.toLocaleString()}
            </p>
          </div>

          {/* Months Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Payment Period</Label>
              <Badge variant="outline">
                {selectedMonths[0]} month{selectedMonths[0] > 1 ? "s" : ""}
              </Badge>
            </div>

            <Slider
              value={selectedMonths}
              onValueChange={handleMonthsChange}
              max={maxMonths}
              min={2}
              step={1}
              className="w-full"
            />

            <div className="flex justify-between text-sm text-gray-600">
              <span>2 months</span>
              <span>12 months</span>
            </div>

            {/* Quick Select Buttons */}
            <div className="flex flex-wrap gap-2">
              {monthOptions.map((months) => (
                <Button
                  key={months}
                  variant={selectedMonths[0] === months ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedMonths([months])}
                >
                  {months} months
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calculation Results */}
      {currentCalculation && (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Payment Breakdown</span>
              </span>
              {affordability && (
                <Badge
                  variant="outline"
                  className={cn("font-medium", affordability.color)}
                >
                  {affordability.level}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Monthly Payment Highlight */}
            <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-700 mb-1">Monthly Payment</p>
              <p className="text-4xl font-bold text-green-900">
                GH₵{currentCalculation.monthlyAmount.toLocaleString()}
              </p>
              <p className="text-sm text-green-700 mt-1">
                for {currentCalculation.months} months
              </p>
              {affordability && (
                <p className="text-xs text-green-600 mt-2">
                  {affordability.description}
                </p>
              )}
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Cost Breakdown</h4>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Base Amount:</span>
                  <span className="font-medium">
                    GH₵{customAmount.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Processing Fee:</span>
                  <span className="font-medium">
                    GH₵{currentCalculation.processingFee.toLocaleString()}
                  </span>
                </div>

                {currentCalculation.totalInterest > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      Interest ({currentCalculation.interestRate.toFixed(1)}%):
                    </span>
                    <span className="font-medium">
                      GH₵{currentCalculation.totalInterest.toLocaleString()}
                    </span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between items-center font-semibold">
                  <span>Total Amount:</span>
                  <span>
                    GH₵{currentCalculation.totalAmount.toLocaleString()}
                  </span>
                </div>

                {totalSavingsVsFullPayment > 0 && (
                  <div className="flex justify-between items-center text-red-600">
                    <span className="flex items-center space-x-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>Additional Cost:</span>
                    </span>
                    <span className="font-medium">
                      +GH₵{totalSavingsVsFullPayment.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Schedule Preview */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Payment Schedule</span>
              </h4>

              <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                <div className="space-y-2">
                  {Array.from({ length: currentCalculation.months }, (_, i) => {
                    const paymentDate = new Date();
                    paymentDate.setMonth(paymentDate.getMonth() + i + 1);

                    return (
                      <div
                        key={i}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="text-gray-600">Payment {i + 1}:</span>
                        <div className="text-right">
                          <span className="font-medium">
                            GH₵
                            {currentCalculation.monthlyAmount.toLocaleString()}
                          </span>
                          <span className="text-gray-500 ml-2">
                            {paymentDate.toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Comparison with Full Payment */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <h5 className="font-medium text-blue-900 mb-1">
                      Comparison with Full Payment
                    </h5>
                    <div className="space-y-1 text-blue-800">
                      <p>
                        Full payment now: GH₵{customAmount.toLocaleString()}
                      </p>
                      <p>
                        Installment plan: GH₵
                        {currentCalculation.totalAmount.toLocaleString()}
                      </p>
                      {totalSavingsVsFullPayment > 0 && (
                        <p className="font-medium">
                          You'll pay GH₵
                          {totalSavingsVsFullPayment.toLocaleString()} more with
                          installments
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      )}

      {/* Terms and Conditions */}
      <Card className="border-gray-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-gray-900 mb-2">
            Installment Plan Terms
          </h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>
              • Payments are automatically deducted on the 1st of each month
            </li>
            <li>• You can pay off your balance early without penalties</li>
            <li>• Late payment fees may apply for missed payments</li>
            <li>• Processing fees and interest are non-refundable</li>
            <li>• Course access begins after the first payment is confirmed</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
