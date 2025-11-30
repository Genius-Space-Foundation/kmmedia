"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  RefreshCw,
  CreditCard,
  Phone,
  Mail,
  HelpCircle,
  CheckCircle,
  XCircle,
  ArrowRight,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FailedPayment {
  id: string;
  reference: string;
  amount: number;
  type: "APPLICATION_FEE" | "TUITION" | "INSTALLMENT";
  method: string;
  failureReason: string;
  failureCode?: string;
  createdAt: Date;
  courseName?: string;
  retryCount: number;
  maxRetries: number;
}

interface RecoveryOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: string;
  recommended?: boolean;
  available: boolean;
}

interface PaymentFailureRecoveryProps {
  payment: FailedPayment;
  onRetryPayment?: (method?: string) => void;
  onContactSupport?: () => void;
  onChangeMethod?: () => void;
  onCancel?: () => void;
  className?: string;
}

export default function PaymentFailureRecovery({
  payment,
  onRetryPayment,
  onContactSupport,
  onChangeMethod,
  onCancel,
  className,
}: PaymentFailureRecoveryProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>("");

  const getFailureCategory = (
    reason: string,
    code?: string
  ): {
    category: string;
    severity: "low" | "medium" | "high";
    userFriendlyMessage: string;
    suggestedActions: string[];
  } => {
    const lowerReason = reason.toLowerCase();

    if (
      lowerReason.includes("insufficient") ||
      lowerReason.includes("balance")
    ) {
      return {
        category: "insufficient_funds",
        severity: "medium",
        userFriendlyMessage:
          "Your account doesn't have enough funds for this transaction.",
        suggestedActions: [
          "Check your account balance",
          "Add funds to your account",
          "Try a different payment method",
        ],
      };
    }

    if (lowerReason.includes("declined") || lowerReason.includes("rejected")) {
      return {
        category: "card_declined",
        severity: "medium",
        userFriendlyMessage: "Your card was declined by your bank.",
        suggestedActions: [
          "Contact your bank to authorize the transaction",
          "Check if your card is active and not expired",
          "Try a different card",
        ],
      };
    }

    if (lowerReason.includes("expired") || lowerReason.includes("invalid")) {
      return {
        category: "card_invalid",
        severity: "high",
        userFriendlyMessage: "There's an issue with your card details.",
        suggestedActions: [
          "Check your card number and expiry date",
          "Verify your CVV code",
          "Try a different card",
        ],
      };
    }

    if (lowerReason.includes("network") || lowerReason.includes("timeout")) {
      return {
        category: "network_error",
        severity: "low",
        userFriendlyMessage:
          "There was a network issue during payment processing.",
        suggestedActions: [
          "Check your internet connection",
          "Try again in a few minutes",
          "Use a different device or browser",
        ],
      };
    }

    return {
      category: "general_error",
      severity: "medium",
      userFriendlyMessage:
        "An unexpected error occurred during payment processing.",
      suggestedActions: [
        "Try the payment again",
        "Use a different payment method",
        "Contact support if the issue persists",
      ],
    };
  };

  const failureInfo = getFailureCategory(
    payment.failureReason,
    payment.failureCode
  );
  const canRetry = payment.retryCount < payment.maxRetries;

  const recoveryOptions: RecoveryOption[] = [
    {
      id: "retry_same",
      title: "Try Again",
      description: "Retry the payment with the same method",
      icon: <RefreshCw className="h-5 w-5" />,
      action: "retry",
      recommended: failureInfo.category === "network_error" && canRetry,
      available: canRetry,
    },
    {
      id: "change_method",
      title: "Different Payment Method",
      description: "Use a different card or payment option",
      icon: <CreditCard className="h-5 w-5" />,
      action: "change_method",
      recommended:
        failureInfo.category === "card_declined" ||
        failureInfo.category === "card_invalid",
      available: true,
    },
    {
      id: "contact_support",
      title: "Contact Support",
      description: "Get help from our support team",
      icon: <HelpCircle className="h-5 w-5" />,
      action: "support",
      recommended: failureInfo.severity === "high",
      available: true,
    },
  ];

  const handleRetry = async () => {
    if (!canRetry) return;

    setIsRetrying(true);
    try {
      if (onRetryPayment) {
        await onRetryPayment();
      }
    } catch (error) {
      console.error("Retry failed:", error);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleOptionSelect = (option: RecoveryOption) => {
    setSelectedOption(option.id);

    switch (option.action) {
      case "retry":
        handleRetry();
        break;
      case "change_method":
        if (onChangeMethod) onChangeMethod();
        break;
      case "support":
        if (onContactSupport) onContactSupport();
        break;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "border-yellow-200 bg-yellow-50";
      case "medium":
        return "border-orange-200 bg-orange-50";
      case "high":
        return "border-red-200 bg-red-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  const getSeverityTextColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "text-yellow-800";
      case "medium":
        return "text-orange-800";
      case "high":
        return "text-red-800";
      default:
        return "text-gray-800";
    }
  };

  return (
    <div className={cn("max-w-2xl mx-auto space-y-6", className)}>
      {/* Failure Header */}
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>

          <h1 className="text-xl font-bold text-red-900 mb-2">
            Payment Failed
          </h1>

          <p className="text-red-800 mb-4">{failureInfo.userFriendlyMessage}</p>

          <div className="bg-white p-4 rounded-lg border border-red-200">
            <p className="text-2xl font-bold text-red-900">
              GH₵{payment.amount.toLocaleString()}
            </p>
            <p className="text-sm text-red-700 mt-1">
              {payment.courseName || "Payment"} -{" "}
              {payment.type.replace("_", " ")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Error Details */}
      <Card className={cn("border-2", getSeverityColor(failureInfo.severity))}>
        <CardHeader>
          <CardTitle
            className={cn(
              "flex items-center space-x-2",
              getSeverityTextColor(failureInfo.severity)
            )}
          >
            <AlertCircle className="h-5 w-5" />
            <span>What went wrong?</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Payment Reference</p>
              <p className="font-mono text-sm">{payment.reference}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Method</p>
              <p className="font-medium">{payment.method}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Failed At</p>
              <p className="font-medium">
                {payment.createdAt.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Retry Attempts</p>
              <p className="font-medium">
                {payment.retryCount} of {payment.maxRetries}
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium text-gray-900 mb-2">
              Suggested Actions
            </h4>
            <ul className="space-y-1">
              {failureInfo.suggestedActions.map((action, index) => (
                <li key={index} className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Recovery Options */}
      <Card>
        <CardHeader>
          <CardTitle>How would you like to proceed?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recoveryOptions.map((option) => (
            <div
              key={option.id}
              className={cn(
                "p-4 border rounded-lg cursor-pointer transition-all hover:border-gray-300",
                !option.available && "opacity-50 cursor-not-allowed",
                option.recommended &&
                  "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
              )}
              onClick={() => option.available && handleOptionSelect(option)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-gray-600">{option.icon}</div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900">
                        {option.title}
                      </h4>
                      {option.recommended && (
                        <Badge variant="secondary" className="text-xs">
                          Recommended
                        </Badge>
                      )}
                      {!option.available && (
                        <Badge variant="outline" className="text-xs">
                          Not Available
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {option.description}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Retry Limit Warning */}
      {!canRetry && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            You've reached the maximum number of retry attempts for this
            payment. Please try a different payment method or contact support
            for assistance.
          </AlertDescription>
        </Alert>
      )}

      {/* Support Information */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <HelpCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-2">
                Need Additional Help?
              </h4>
              <p className="text-blue-800 text-sm mb-3">
                Our support team is available to help you resolve payment
                issues.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onContactSupport}
                  className="text-blue-700 border-blue-300"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email Support
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-700 border-blue-300"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call Support
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel Payment
        </Button>

        <div className="space-x-2">
          {canRetry && (
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </>
              )}
            </Button>
          )}

          <Button onClick={onChangeMethod}>
            <CreditCard className="h-4 w-4 mr-2" />
            Change Method
          </Button>
        </div>
      </div>
    </div>
  );
}
