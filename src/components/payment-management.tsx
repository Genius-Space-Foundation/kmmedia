"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Payment {
  id: string;
  amount: number;
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  type: "APPLICATION_FEE" | "TUITION" | "INSTALLMENT";
  method: "PAYSTACK" | "BANK_TRANSFER" | "CASH";
  reference: string;
  createdAt: string;
  paidAt?: string;
  course?: {
    title: string;
  };
}

interface PaymentManagementProps {
  payments: Payment[];
  onPaymentInitiate: (paymentData: any) => void;
  onPaymentRetry: (paymentId: string) => void;
}

export default function PaymentManagement({
  payments,
  onPaymentInitiate,
  onPaymentRetry,
}: PaymentManagementProps) {
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>(payments);
  const [filters, setFilters] = useState({
    status: "ALL",
    type: "ALL",
    search: "",
  });
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);

  useEffect(() => {
    let filtered = payments;

    if (filters.status !== "ALL") {
      filtered = filtered.filter(
        (payment) => payment.status === filters.status
      );
    }

    if (filters.type !== "ALL") {
      filtered = filtered.filter((payment) => payment.type === filters.type);
    }

    if (filters.search) {
      filtered = filtered.filter(
        (payment) =>
          payment.reference
            .toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          payment.course?.title
            .toLowerCase()
            .includes(filters.search.toLowerCase())
      );
    }

    setFilteredPayments(filtered);
  }, [payments, filters]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      case "REFUNDED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "APPLICATION_FEE":
        return "bg-purple-100 text-purple-800";
      case "TUITION":
        return "bg-blue-100 text-blue-800";
      case "INSTALLMENT":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handlePaymentDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowPaymentDetails(true);
  };

  const handleRetryPayment = (paymentId: string) => {
    onPaymentRetry(paymentId);
  };

  const totalPaid = payments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = payments
    .filter((p) => p.status === "PENDING")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Payment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              GH₵{totalPaid.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              GH₵{totalPending.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>
            View and manage your payment history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-4">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search by reference or course..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="REFUNDED">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select
                value={filters.type}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="APPLICATION_FEE">
                    Application Fee
                  </SelectItem>
                  <SelectItem value="TUITION">Tuition</SelectItem>
                  <SelectItem value="INSTALLMENT">Installment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Payment List */}
          <div className="space-y-2">
            {filteredPayments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-4 bg-white border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h4 className="font-medium">
                        {payment.course?.title || "Payment"}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Reference: {payment.reference}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-semibold">
                      GH₵{payment.amount.toLocaleString()}
                    </div>
                    <div className="flex space-x-2">
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status}
                      </Badge>
                      <Badge className={getTypeColor(payment.type)}>
                        {payment.type.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePaymentDetails(payment)}
                    >
                      View
                    </Button>
                    {payment.status === "FAILED" && (
                      <Button
                        size="sm"
                        onClick={() => handleRetryPayment(payment.id)}
                      >
                        Retry
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filteredPayments.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No payments found
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Details Modal */}
      <Dialog open={showPaymentDetails} onOpenChange={setShowPaymentDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Amount</Label>
                  <p className="text-lg font-semibold">
                    GH₵{selectedPayment.amount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge className={getStatusColor(selectedPayment.status)}>
                    {selectedPayment.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <Badge className={getTypeColor(selectedPayment.type)}>
                    {selectedPayment.type.replace("_", " ")}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Method</Label>
                  <p className="text-sm">{selectedPayment.method}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Reference</Label>
                  <p className="text-sm font-mono">
                    {selectedPayment.reference}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p className="text-sm">
                    {new Date(selectedPayment.createdAt).toLocaleString()}
                  </p>
                </div>
                {selectedPayment.paidAt && (
                  <div>
                    <Label className="text-sm font-medium">Paid At</Label>
                    <p className="text-sm">
                      {new Date(selectedPayment.paidAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
              {selectedPayment.course && (
                <div>
                  <Label className="text-sm font-medium">Course</Label>
                  <p className="text-sm">{selectedPayment.course.title}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
