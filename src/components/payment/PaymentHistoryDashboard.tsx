"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CreditCard,
  Download,
  Eye,
  Filter,
  Search,
  Calendar,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  RefreshCw,
  FileText,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentRecord {
  id: string;
  reference: string;
  amount: number;
  status: "COMPLETED" | "PENDING" | "FAILED" | "REFUNDED";
  type: "APPLICATION_FEE" | "TUITION" | "INSTALLMENT";
  method: "PAYSTACK" | "BANK_TRANSFER" | "MOBILE_MONEY";
  createdAt: Date;
  paidAt?: Date;
  courseName?: string;
  receiptUrl?: string;
  transactionId?: string;
  description?: string;
}

interface PaymentSummary {
  totalPaid: number;
  totalPending: number;
  totalRefunded: number;
  totalTransactions: number;
  thisMonthPaid: number;
  lastMonthPaid: number;
}

interface PaymentHistoryDashboardProps {
  userId?: string;
  className?: string;
}

export default function PaymentHistoryDashboard({
  userId,
  className,
}: PaymentHistoryDashboardProps) {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<PaymentRecord[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(
    null
  );
  const [showDetails, setShowDetails] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    status: "ALL",
    type: "ALL",
    method: "ALL",
    dateRange: "ALL",
  });

  useEffect(() => {
    fetchPaymentHistory();
  }, [userId]);

  useEffect(() => {
    applyFilters();
  }, [payments, filters]);

  const fetchPaymentHistory = async () => {
    try {
      setIsLoading(true);

      // Simulate API call - replace with actual API
      const response = await fetch(
        `/api/payments/history${userId ? `?userId=${userId}` : ""}`
      );
      const data = await response.json();

      setPayments(data.payments || []);
      setSummary(data.summary || null);
    } catch (error) {
      console.error("Failed to fetch payment history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...payments];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(
        (payment) =>
          payment.reference
            .toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          payment.courseName
            ?.toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          payment.transactionId
            ?.toLowerCase()
            .includes(filters.search.toLowerCase())
      );
    }

    // Status filter
    if (filters.status !== "ALL") {
      filtered = filtered.filter(
        (payment) => payment.status === filters.status
      );
    }

    // Type filter
    if (filters.type !== "ALL") {
      filtered = filtered.filter((payment) => payment.type === filters.type);
    }

    // Method filter
    if (filters.method !== "ALL") {
      filtered = filtered.filter(
        (payment) => payment.method === filters.method
      );
    }

    // Date range filter
    if (filters.dateRange !== "ALL") {
      const now = new Date();
      const filterDate = new Date();

      switch (filters.dateRange) {
        case "THIS_MONTH":
          filterDate.setMonth(now.getMonth(), 1);
          break;
        case "LAST_MONTH":
          filterDate.setMonth(now.getMonth() - 1, 1);
          break;
        case "THIS_YEAR":
          filterDate.setFullYear(now.getFullYear(), 0, 1);
          break;
        case "LAST_90_DAYS":
          filterDate.setDate(now.getDate() - 90);
          break;
      }

      filtered = filtered.filter((payment) => payment.createdAt >= filterDate);
    }

    setFilteredPayments(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "APPLICATION_FEE":
        return "Application Fee";
      case "TUITION":
        return "Tuition";
      case "INSTALLMENT":
        return "Installment";
      default:
        return type;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleDownloadReceipt = (payment: PaymentRecord) => {
    if (payment.receiptUrl) {
      window.open(payment.receiptUrl, "_blank");
    }
  };

  const handleViewDetails = (payment: PaymentRecord) => {
    setSelectedPayment(payment);
    setShowDetails(true);
  };

  const calculateMonthlyChange = () => {
    if (!summary) return 0;
    if (summary.lastMonthPaid === 0) return 100;
    return (
      ((summary.thisMonthPaid - summary.lastMonthPaid) /
        summary.lastMonthPaid) *
      100
    );
  };

  const monthlyChange = calculateMonthlyChange();

  return (
    <div className={cn("space-y-6", className)}>
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Paid</p>
                  <p className="text-2xl font-bold text-green-600">
                    GH₵{summary.totalPaid.toLocaleString()}
                  </p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    GH₵{summary.totalPending.toLocaleString()}
                  </p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <CreditCard className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-2xl font-bold">
                    GH₵{summary.thisMonthPaid.toLocaleString()}
                  </p>
                  <div className="flex items-center space-x-1 mt-1">
                    {monthlyChange >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span
                      className={cn(
                        "text-xs font-medium",
                        monthlyChange >= 0 ? "text-green-600" : "text-red-600"
                      )}
                    >
                      {Math.abs(monthlyChange).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-bold">
                    {summary.totalTransactions}
                  </p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle>Payment History</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPaymentHistory}
              disabled={isLoading}
            >
              <RefreshCw
                className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")}
              />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Reference, course, transaction..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label>Status</Label>
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
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="REFUNDED">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Type</Label>
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

            <div>
              <Label>Method</Label>
              <Select
                value={filters.method}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, method: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Methods</SelectItem>
                  <SelectItem value="PAYSTACK">Card Payment</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Date Range</Label>
              <Select
                value={filters.dateRange}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, dateRange: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Time</SelectItem>
                  <SelectItem value="THIS_MONTH">This Month</SelectItem>
                  <SelectItem value="LAST_MONTH">Last Month</SelectItem>
                  <SelectItem value="LAST_90_DAYS">Last 90 Days</SelectItem>
                  <SelectItem value="THIS_YEAR">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading payment history...</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-8 w-8 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No payments found</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {payment.courseName || getTypeLabel(payment.type)}
                        </h4>
                        <Badge className={getStatusColor(payment.status)}>
                          {payment.status.toLowerCase()}
                        </Badge>
                        <Badge variant="outline">
                          {getTypeLabel(payment.type)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Reference:</span>{" "}
                          {payment.reference}
                        </div>
                        <div>
                          <span className="font-medium">Method:</span>{" "}
                          {payment.method.replace("_", " ")}
                        </div>
                        <div>
                          <span className="font-medium">Date:</span>{" "}
                          {formatDate(payment.createdAt)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-xl font-bold">
                          GH₵{payment.amount.toLocaleString()}
                        </p>
                        {payment.paidAt && (
                          <p className="text-sm text-gray-500">
                            Paid {formatDate(payment.paidAt)}
                          </p>
                        )}
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleViewDetails(payment)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {payment.receiptUrl && (
                            <DropdownMenuItem
                              onClick={() => handleDownloadReceipt(payment)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download Receipt
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
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
                    {selectedPayment.status.toLowerCase()}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <p>{getTypeLabel(selectedPayment.type)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Method</Label>
                  <p>{selectedPayment.method.replace("_", " ")}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Reference</Label>
                  <p className="font-mono text-sm">
                    {selectedPayment.reference}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p>{selectedPayment.createdAt.toLocaleString()}</p>
                </div>
                {selectedPayment.paidAt && (
                  <div>
                    <Label className="text-sm font-medium">Paid At</Label>
                    <p>{selectedPayment.paidAt.toLocaleString()}</p>
                  </div>
                )}
                {selectedPayment.transactionId && (
                  <div>
                    <Label className="text-sm font-medium">
                      Transaction ID
                    </Label>
                    <p className="font-mono text-sm">
                      {selectedPayment.transactionId}
                    </p>
                  </div>
                )}
              </div>

              {selectedPayment.courseName && (
                <div>
                  <Label className="text-sm font-medium">Course</Label>
                  <p>{selectedPayment.courseName}</p>
                </div>
              )}

              {selectedPayment.description && (
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p>{selectedPayment.description}</p>
                </div>
              )}

              <div className="flex space-x-2 pt-4">
                {selectedPayment.receiptUrl && (
                  <Button
                    onClick={() => handleDownloadReceipt(selectedPayment)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Receipt
                  </Button>
                )}
                <Button variant="outline" onClick={() => setShowDetails(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
