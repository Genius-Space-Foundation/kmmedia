"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  CreditCard,
  Download,
  Filter,
  Search,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  ArrowUpRight,
  ArrowDownLeft,
  MoreHorizontal,
  Eye,
  Receipt,
} from "lucide-react";

interface PaymentTransaction {
  id: string;
  amount: number;
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  type: "TUITION" | "APPLICATION_FEE" | "INSTALLMENT" | "LATE_FEE";
  description: string;
  createdAt: string;
  dueDate?: string;
  reference: string;
  application?: {
    course: {
      title: string;
    };
  };
  enrollment?: {
    course: {
      title: string;
    };
  };
}

interface PaymentTransactionsProps {
  userId: string;
}

export default function PaymentTransactions({
  userId,
}: PaymentTransactionsProps) {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [selectedTransaction, setSelectedTransaction] =
    useState<PaymentTransaction | null>(null);

  // Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/student/payments?userId=${userId}`);
        const data = await response.json();

        if (data.success) {
          setTransactions(data.data.transactions || []);
        } else {
          setError(data.message || "Failed to fetch payment transactions");
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setError("Failed to fetch payment transactions");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchTransactions();
    }
  }, [userId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "PENDING":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "FAILED":
        return "bg-red-100 text-red-800 border-red-200";
      case "REFUNDED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "TUITION":
        return <TrendingUp className="h-4 w-4" />;
      case "APPLICATION_FEE":
        return <FileText className="h-4 w-4" />;
      case "INSTALLMENT":
        return <Clock className="h-4 w-4" />;
      case "LATE_FEE":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case "PENDING":
        return <Clock className="h-4 w-4 text-amber-600" />;
      case "FAILED":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "REFUNDED":
        return <ArrowDownLeft className="h-4 w-4 text-blue-600" />;
      default:
        return <CreditCard className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || transaction.status === statusFilter;
    const matchesType = typeFilter === "ALL" || transaction.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const completedAmount = transactions
    .filter((t) => t.status === "COMPLETED")
    .reduce((sum, t) => sum + t.amount, 0);
  const pendingAmount = transactions
    .filter((t) => t.status === "PENDING")
    .reduce((sum, t) => sum + t.amount, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Professional Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-8 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <CreditCard className="h-8 w-8" />
              </div>
              Payment Center
            </h2>
            <p className="text-blue-100 text-lg">
              Manage your payments, track transactions, and view your payment
              history
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button className="bg-white text-blue-600 hover:bg-blue-50">
              <ArrowUpRight className="h-4 w-4 mr-2" />
              Make Payment
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600 mb-1">
                  Total Paid
                </p>
                <p className="text-2xl font-bold text-emerald-900">
                  {formatCurrency(completedAmount)}
                </p>
                <p className="text-xs text-emerald-600 mt-1">
                  {transactions.filter((t) => t.status === "COMPLETED").length}{" "}
                  completed payments
                </p>
              </div>
              <div className="p-3 bg-emerald-200 rounded-full">
                <CheckCircle className="h-6 w-6 text-emerald-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-yellow-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600 mb-1">
                  Pending
                </p>
                <p className="text-2xl font-bold text-amber-900">
                  {formatCurrency(pendingAmount)}
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  {transactions.filter((t) => t.status === "PENDING").length}{" "}
                  pending payments
                </p>
              </div>
              <div className="p-3 bg-amber-200 rounded-full">
                <Clock className="h-6 w-6 text-amber-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">
                  Total Transactions
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatCurrency(totalAmount)}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {transactions.length} total transactions
                </p>
              </div>
              <div className="p-3 bg-blue-200 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search transactions, references, or descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <option value="ALL">All Status</option>
                <option value="COMPLETED">Completed</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
                <option value="REFUNDED">Refunded</option>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <option value="ALL">All Types</option>
                <option value="TUITION">Tuition</option>
                <option value="APPLICATION_FEE">Application Fee</option>
                <option value="INSTALLMENT">Installment</option>
                <option value="LATE_FEE">Late Fee</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Transactions Found
              </h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== "ALL" || typeFilter !== "ALL"
                  ? "Try adjusting your filters to see more transactions."
                  : "You haven't made any payments yet."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedTransaction(transaction)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {getTypeIcon(transaction.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">
                            {transaction.description}
                          </h4>
                          <Badge className={getStatusColor(transaction.status)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(transaction.status)}
                              {transaction.status}
                            </span>
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {transaction.application?.course.title ||
                            transaction.enrollment?.course.title ||
                            "General Payment"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Reference: {transaction.reference} •{" "}
                          {formatDate(transaction.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {transaction.type.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Transaction Details
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTransaction(null)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Amount
                  </label>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(selectedTransaction.amount)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Status
                  </label>
                  <div className="mt-1">
                    <Badge
                      className={getStatusColor(selectedTransaction.status)}
                    >
                      <span className="flex items-center gap-1">
                        {getStatusIcon(selectedTransaction.status)}
                        {selectedTransaction.status}
                      </span>
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Type
                  </label>
                  <p className="text-gray-900">
                    {selectedTransaction.type.replace("_", " ")}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Reference
                  </label>
                  <p className="text-gray-900 font-mono">
                    {selectedTransaction.reference}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Date
                  </label>
                  <p className="text-gray-900">
                    {formatDate(selectedTransaction.createdAt)}
                  </p>
                </div>
                {selectedTransaction.dueDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Due Date
                    </label>
                    <p className="text-gray-900">
                      {formatDate(selectedTransaction.dueDate)}
                    </p>
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Description
                </label>
                <p className="text-gray-900 mt-1">
                  {selectedTransaction.description}
                </p>
              </div>
              <div className="flex gap-3 pt-4 border-t">
                <Button className="flex-1">
                  <Receipt className="h-4 w-4 mr-2" />
                  Download Receipt
                </Button>
                <Button variant="outline" className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
