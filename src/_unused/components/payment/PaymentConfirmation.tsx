"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  Download,
  Mail,
  Share2,
  Calendar,
  CreditCard,
  FileText,
  ArrowRight,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentDetails {
  id: string;
  reference: string;
  amount: number;
  type: "APPLICATION_FEE" | "TUITION" | "INSTALLMENT";
  method: string;
  transactionId: string;
  paidAt: Date;
  courseName?: string;
  receiptUrl?: string;
  nextSteps?: string[];
}

interface PaymentConfirmationProps {
  payment: PaymentDetails;
  onDownloadReceipt?: () => void;
  onContinue?: () => void;
  onShareReceipt?: () => void;
  className?: string;
}

export default function PaymentConfirmation({
  payment,
  onDownloadReceipt,
  onContinue,
  onShareReceipt,
  className,
}: PaymentConfirmationProps) {
  const [copied, setCopied] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const copyTransactionId = async () => {
    try {
      await navigator.clipboard.writeText(payment.transactionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy transaction ID:", err);
    }
  };

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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const defaultNextSteps = [
    "A confirmation email has been sent to your registered email address",
    "Your payment receipt is available for download",
    "You can now proceed to the next step in your application",
  ];

  const nextSteps = payment.nextSteps || defaultNextSteps;

  return (
    <div className={cn("max-w-2xl mx-auto space-y-6", className)}>
      {/* Success Header */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-8 text-center">
          <div className="flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-green-900 mb-2">
            Payment Successful!
          </h1>

          <p className="text-green-800 mb-4">
            Your {getPaymentTypeLabel(payment.type).toLowerCase()} has been
            processed successfully
          </p>

          <div className="bg-white p-4 rounded-lg border border-green-200">
            <p className="text-3xl font-bold text-green-900">
              GH₵{payment.amount.toLocaleString()}
            </p>
            <p className="text-sm text-green-700 mt-1">
              Paid on {formatDate(payment.paidAt)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Payment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Payment Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Payment Type</p>
                <p className="font-semibold">
                  {getPaymentTypeLabel(payment.type)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Amount Paid</p>
                <p className="font-semibold text-lg">
                  GH₵{payment.amount.toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Payment Method</p>
                <p className="font-semibold">{payment.method}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Reference Number</p>
                <p className="font-mono text-sm">{payment.reference}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Transaction ID</p>
                <div className="flex items-center space-x-2">
                  <p className="font-mono text-sm">{payment.transactionId}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyTransactionId}
                    className="h-6 w-6 p-0"
                  >
                    {copied ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">Date & Time</p>
                <p className="font-semibold">{formatDate(payment.paidAt)}</p>
              </div>
            </div>
          </div>

          {payment.courseName && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-gray-600">Course</p>
                <p className="font-semibold">{payment.courseName}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ArrowRight className="h-5 w-5" />
            <span>What's Next?</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {nextSteps.map((step, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full mt-0.5">
                  <span className="text-xs font-semibold text-blue-600">
                    {index + 1}
                  </span>
                </div>
                <p className="text-gray-700 text-sm">{step}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
          <CardContent className="p-4">
            <Button
              variant="outline"
              className="w-full h-auto p-4"
              onClick={onDownloadReceipt}
            >
              <div className="flex flex-col items-center space-y-2">
                <Download className="h-6 w-6" />
                <div className="text-center">
                  <p className="font-semibold">Download Receipt</p>
                  <p className="text-xs text-gray-600">
                    Get a PDF copy of your payment receipt
                  </p>
                </div>
              </div>
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
          <CardContent className="p-4">
            <Button
              variant="outline"
              className="w-full h-auto p-4"
              onClick={onShareReceipt}
            >
              <div className="flex flex-col items-center space-y-2">
                <Share2 className="h-6 w-6" />
                <div className="text-center">
                  <p className="font-semibold">Share Receipt</p>
                  <p className="text-xs text-gray-600">
                    Share payment confirmation via email or SMS
                  </p>
                </div>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Email Confirmation */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-blue-900 mb-1">
                Email Confirmation
              </h4>
              <p className="text-blue-800 text-sm mb-3">
                A detailed payment confirmation has been sent to your registered
                email address. Please check your inbox and spam folder.
              </p>
              {!emailSent && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEmailSent(true)}
                  className="text-blue-700 border-blue-300"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Resend Email
                </Button>
              )}
              {emailSent && (
                <div className="flex items-center space-x-2 text-sm text-blue-700">
                  <CheckCircle className="h-4 w-4" />
                  <span>Email sent successfully</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Continue Button */}
      <div className="text-center">
        <Button onClick={onContinue} size="lg" className="px-8">
          Continue
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Support Information */}
      <Card className="border-gray-200">
        <CardContent className="p-4 text-center">
          <p className="text-sm text-gray-600 mb-2">
            Need help or have questions about your payment?
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="link" size="sm">
              Contact Support
            </Button>
            <Button variant="link" size="sm">
              View FAQ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
