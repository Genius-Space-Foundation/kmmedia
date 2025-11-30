"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  CreditCard,
  RefreshCw,
  Download,
  Eye,
  ArrowRight,
  Loader2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentStatus {
  id: string;
  reference: string;
  amount: number;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
  type: "APPLICATION_FEE" | "TUITION" | "INSTALLMENT";
  method: "PAYSTACK" | "BANK_TRANSFER" | "MOBILE_MONEY";
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  failureReason?: string;
  transactionId?: string;
  receiptUrl?: string;
  metadata?: any;
}

interface PaymentStep {
  id: string;
  title: string;
  description: string;
  status: "completed" | "current" | "pending" | "failed";
  timestamp?: Date;
  details?: string;
}

interface PaymentStatusTrackerProps {
  paymentId: string;
  onRetry?: () => void;
  onCancel?: () => void;
  onDownloadReceipt?: () => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
  className?: string;
}

export default function PaymentStatusTracker({
  paymentId,
  onRetry,
  onCancel,
  onDownloadReceipt,
  autoRefresh = true,
  refreshInterval = 5000,
  className,
}: PaymentStatusTrackerProps) {
  const [payment, setPayment] = useState<PaymentStatus | null>(null);
  const [steps, setSteps] = useState<PaymentStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentStatus();

    let interval: NodeJS.Timeout;
    if (autoRefresh && payment?.status === "PROCESSING") {
      interval = setInterval(fetchPaymentStatus, refreshInterval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [paymentId, autoRefresh, refreshInterval, payment?.status]);

  const fetchPaymentStatus = async () => {
    try {
      setIsRefreshing(true);
      setError(null);

      // Simulate API call - replace with actual API
      const response = await fetch(`/api/payments/${paymentId}/status`);
      if (!response.ok) {
        throw new Error("Failed to fetch payment status");
      }

      const data = await response.json();
      setPayment(data.payment);
      generateSteps(data.payment);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch payment status"
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const generateSteps = (paymentData: PaymentStatus) => {
    const baseSteps: PaymentStep[] = [
      {
        id: "initiated",
        title: "Payment Initiated",
        description: "Payment request created",
        status: "completed",
        timestamp: paymentData.createdAt,
        details: `Payment of GH₵${paymentData.amount.toLocaleString()} initiated`,
      },
      {
        id: "processing",
        title: "Processing Payment",
        description: "Verifying payment details",
        status:
          paymentData.status === "PENDING"
            ? "current"
            : paymentData.status === "PROCESSING"
            ? "current"
            : paymentData.status === "COMPLETED"
            ? "completed"
            : paymentData.status === "FAILED"
            ? "failed"
            : "pending",
        timestamp:
          paymentData.status !== "PENDING" ? paymentData.updatedAt : undefined,
        details: getProcessingDetails(paymentData),
      },
      {
        id: "verification",
        title: "Payment Verification",
        description: "Confirming transaction with payment provider",
        status:
          paymentData.status === "COMPLETED"
            ? "completed"
            : paymentData.status === "FAILED"
            ? "failed"
            : paymentData.status === "PROCESSING"
            ? "current"
            : "pending",
        timestamp:
          paymentData.status === "COMPLETED"
            ? paymentData.completedAt
            : undefined,
      },
      {
        id: "completion",
        title: "Payment Complete",
        description: "Payment successfully processed",
        status:
          paymentData.status === "COMPLETED"
            ? "completed"
            : paymentData.status === "FAILED"
            ? "failed"
            : "pending",
        timestamp: paymentData.completedAt,
        details:
          paymentData.status === "COMPLETED"
            ? `Transaction ID: ${paymentData.transactionId}`
            : paymentData.status === "FAILED"
            ? paymentData.failureReason
            : undefined,
      },
    ];

    setSteps(baseSteps);
  };

  const getProcessingDetails = (paymentData: PaymentStatus): string => {
    switch (paymentData.method) {
      case "PAYSTACK":
        return "Processing card payment through Paystack";
      case "BANK_TRANSFER":
        return "Verifying bank transfer";
      case "MOBILE_MONEY":
        return "Processing mobile money payment";
      default:
        return "Processing payment";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "text-green-600 bg-green-100 border-green-200";
      case "PROCESSING":
        return "text-blue-600 bg-blue-100 border-blue-200";
      case "PENDING":
        return "text-yellow-600 bg-yellow-100 border-yellow-200";
      case "FAILED":
        return "text-red-600 bg-red-100 border-red-200";
      case "CANCELLED":
        return "text-gray-600 bg-gray-100 border-gray-200";
      default:
        return "text-gray-600 bg-gray-100 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="h-5 w-5" />;
      case "PROCESSING":
        return <Loader2 className="h-5 w-5 animate-spin" />;
      case "PENDING":
        return <Clock className="h-5 w-5" />;
      case "FAILED":
        return <XCircle className="h-5 w-5" />;
      case "CANCELLED":
        return <XCircle className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getStepIcon = (stepStatus: string) => {
    switch (stepStatus) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "current":
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const calculateProgress = () => {
    const completedSteps = steps.filter(
      (step) => step.status === "completed"
    ).length;
    return (completedSteps / steps.length) * 100;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading payment status...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("border-red-200", className)}>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-4" />
          <p className="text-red-800 mb-4">{error}</p>
          <Button onClick={fetchPaymentStatus} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!payment) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <p>Payment not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Status Header */}
      <Card className={cn("border-2", getStatusColor(payment.status))}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-3">
              {getStatusIcon(payment.status)}
              <span>Payment {payment.status.toLowerCase()}</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              {isRefreshing && (
                <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={fetchPaymentStatus}
                disabled={isRefreshing}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Amount</p>
              <p className="text-2xl font-bold">
                GH₵{payment.amount.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Reference</p>
              <p className="font-mono text-sm">{payment.reference}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Method</p>
              <p className="font-medium">{payment.method.replace("_", " ")}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{calculateProgress().toFixed(0)}% Complete</span>
            </div>
            <Progress value={calculateProgress()} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Payment Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step, index) => {
              const isLast = index === steps.length - 1;

              return (
                <div key={step.id} className="relative">
                  {/* Timeline Line */}
                  {!isLast && (
                    <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200" />
                  )}

                  <div className="flex items-start space-x-4">
                    {/* Step Icon */}
                    <div
                      className={cn(
                        "flex items-center justify-center w-12 h-12 rounded-full border-2",
                        step.status === "completed"
                          ? "bg-green-100 border-green-500"
                          : step.status === "current"
                          ? "bg-blue-100 border-blue-500"
                          : step.status === "failed"
                          ? "bg-red-100 border-red-500"
                          : "bg-gray-100 border-gray-300"
                      )}
                    >
                      {getStepIcon(step.status)}
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-900">
                          {step.title}
                        </h4>
                        {step.timestamp && (
                          <span className="text-sm text-gray-500">
                            {step.timestamp.toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-2">
                        {step.description}
                      </p>
                      {step.details && (
                        <p className="text-xs text-gray-500">{step.details}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {payment.status === "COMPLETED" && payment.receiptUrl && (
          <Button onClick={onDownloadReceipt}>
            <Download className="h-4 w-4 mr-2" />
            Download Receipt
          </Button>
        )}

        {payment.status === "FAILED" && onRetry && (
          <Button onClick={onRetry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Payment
          </Button>
        )}

        {(payment.status === "PENDING" || payment.status === "PROCESSING") &&
          onCancel && (
            <Button variant="outline" onClick={onCancel}>
              <XCircle className="h-4 w-4 mr-2" />
              Cancel Payment
            </Button>
          )}

        <Button variant="outline">
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </Button>
      </div>

      {/* Additional Information */}
      {payment.status === "FAILED" && payment.failureReason && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-900 mb-1">
                  Payment Failed
                </h4>
                <p className="text-red-800 text-sm">{payment.failureReason}</p>
                <p className="text-red-700 text-xs mt-2">
                  Please try again or contact support if the problem persists.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {payment.status === "COMPLETED" && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900 mb-1">
                  Payment Successful
                </h4>
                <p className="text-green-800 text-sm">
                  Your payment has been processed successfully. A confirmation
                  email has been sent to your registered email address.
                </p>
                {payment.transactionId && (
                  <p className="text-green-700 text-xs mt-2">
                    Transaction ID: {payment.transactionId}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
