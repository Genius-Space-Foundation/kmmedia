"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Calculator,
  Plus,
  Edit,
  Trash2,
  TrendingUp,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  CalendarDays,
  FileText,
  Smartphone,
  Target,
  Shield,
  Zap,
  ArrowRight,
  PieChart,
  BarChart3,
  CreditCard,
  Bell,
  Settings,
} from "lucide-react";

interface PaymentPlan {
  id: string;
  userId: string;
  courseId?: string;
  courseTitle?: string;
  totalAmount: number;
  installmentCount: number;
  monthlyAmount: number;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "COMPLETED" | "PAUSED" | "CANCELLED";
  description: string;
  smsNotifications: boolean;
  installments: PaymentInstallment[];
  createdAt: string;
  updatedAt: string;
}

interface PaymentInstallment {
  id: string;
  installmentNumber: number;
  amount: number;
  dueDate: string;
  status: "PENDING" | "PAID" | "OVERDUE";
  paidAt?: string;
  paymentId?: string;
}

interface PaymentPlanManagerProps {
  userId: string;
}

export default function PaymentPlanManager({
  userId,
}: PaymentPlanManagerProps) {
  const [plans, setPlans] = useState<PaymentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PaymentPlan | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    courseId: "",
    totalAmount: "",
    installmentCount: "3",
    startDate: "",
    description: "",
    smsNotifications: true,
  });

  // Fetch payment plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/student/payment-plans?userId=${userId}`
        );
        const data = await response.json();

        if (data.success) {
          setPlans(data.data.plans || []);
        } else {
          setError(data.message || "Failed to fetch payment plans");
        }
      } catch (error) {
        console.error("Error fetching payment plans:", error);
        setError("Failed to fetch payment plans");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchPlans();
    }
  }, [userId]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const calculateEndDate = (startDate: string, installmentCount: number) => {
    if (!startDate) return "";
    const start = new Date(startDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + installmentCount - 1);
    return end.toISOString().split("T")[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const monthlyAmount =
        parseFloat(formData.totalAmount) / parseInt(formData.installmentCount);
      const endDate = calculateEndDate(
        formData.startDate,
        parseInt(formData.installmentCount)
      );

      const response = await fetch("/api/student/payment-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          courseId: formData.courseId || null,
          totalAmount: parseFloat(formData.totalAmount),
          installmentCount: parseInt(formData.installmentCount),
          monthlyAmount,
          startDate: formData.startDate,
          endDate,
          description: formData.description,
          smsNotifications: formData.smsNotifications,
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Refresh plans
        window.location.reload();
        setShowCreateForm(false);
        setFormData({
          courseId: "",
          totalAmount: "",
          installmentCount: "3",
          startDate: "",
          description: "",
          smsNotifications: true,
        });
      } else {
        setError(data.message || "Failed to create payment plan");
      }
    } catch (error) {
      console.error("Error creating payment plan:", error);
      setError("Failed to create payment plan");
    }
  };

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
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "PAUSED":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getInstallmentStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-emerald-100 text-emerald-800";
      case "OVERDUE":
        return "bg-red-100 text-red-800";
      case "PENDING":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calculateProgress = (plan: PaymentPlan) => {
    const paidInstallments = plan.installments.filter(
      (i) => i.status === "PAID"
    ).length;
    const totalPaid = plan.installments
      .filter((i) => i.status === "PAID")
      .reduce((sum, i) => sum + i.amount, 0);

    return {
      percentage: (paidInstallments / plan.installmentCount) * 100,
      paidAmount: totalPaid,
      remainingAmount: plan.totalAmount - totalPaid,
    };
  };

  const activePlans = plans.filter((p) => p.status === "ACTIVE").length;
  const completedPlans = plans.filter((p) => p.status === "COMPLETED").length;
  const totalPlans = plans.length;
  const totalAmount = plans.reduce((sum, p) => sum + p.totalAmount, 0);

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
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
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
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-700 rounded-2xl p-8 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Calculator className="h-8 w-8" />
              </div>
              Payment Plans
            </h2>
            <p className="text-purple-100 text-lg">
              Create flexible payment plans and manage your installments with
              ease
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-white text-purple-600 hover:bg-purple-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Plan
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
                  Active Plans
                </p>
                <p className="text-2xl font-bold text-emerald-900">
                  {activePlans}
                </p>
                <p className="text-xs text-emerald-600 mt-1">
                  Currently active payment plans
                </p>
              </div>
              <div className="p-3 bg-emerald-200 rounded-full">
                <TrendingUp className="h-6 w-6 text-emerald-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">
                  Completed
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {completedPlans}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Successfully completed plans
                </p>
              </div>
              <div className="p-3 bg-blue-200 rounded-full">
                <CheckCircle className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 mb-1">
                  Total Value
                </p>
                <p className="text-2xl font-bold text-purple-900">
                  {formatCurrency(totalAmount)}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  Across {totalPlans} payment plans
                </p>
              </div>
              <div className="p-3 bg-purple-200 rounded-full">
                <DollarSign className="h-6 w-6 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Payment Plan Form */}
      {showCreateForm && (
        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-100">
          <CardHeader className="border-b border-blue-200">
            <CardTitle className="text-xl font-semibold text-blue-900 flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New Payment Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="totalAmount"
                    className="text-sm font-medium text-gray-700"
                  >
                    Total Amount (₵)
                  </Label>
                  <Input
                    id="totalAmount"
                    type="number"
                    value={formData.totalAmount}
                    onChange={(e) =>
                      handleInputChange("totalAmount", e.target.value)
                    }
                    placeholder="Enter total amount"
                    required
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="installmentCount"
                    className="text-sm font-medium text-gray-700"
                  >
                    Number of Installments
                  </Label>
                  <Select
                    value={formData.installmentCount}
                    onValueChange={(value) =>
                      handleInputChange("installmentCount", value)
                    }
                  >
                    <option value="3">3 months</option>
                    <option value="6">6 months</option>
                    <option value="9">9 months</option>
                    <option value="12">12 months</option>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="startDate"
                    className="text-sm font-medium text-gray-700"
                  >
                    Start Date
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      handleInputChange("startDate", e.target.value)
                    }
                    required
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="monthlyAmount"
                    className="text-sm font-medium text-gray-700"
                  >
                    Monthly Amount (₵)
                  </Label>
                  <Input
                    id="monthlyAmount"
                    type="number"
                    value={
                      formData.totalAmount && formData.installmentCount
                        ? (
                            parseFloat(formData.totalAmount) /
                            parseInt(formData.installmentCount)
                          ).toFixed(2)
                        : ""
                    }
                    disabled
                    className="bg-gray-100 border-gray-300 text-gray-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-sm font-medium text-gray-700"
                >
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Describe this payment plan..."
                  rows={3}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center space-x-3 p-4 bg-white/50 rounded-lg">
                <input
                  type="checkbox"
                  id="smsNotifications"
                  checked={formData.smsNotifications}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      smsNotifications: e.target.checked,
                    }))
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label
                  htmlFor="smsNotifications"
                  className="flex items-center gap-2 text-sm font-medium text-gray-700"
                >
                  <Smartphone className="h-4 w-4" />
                  Enable SMS reminders for installments
                </Label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Create Payment Plan
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Plans */}
      {plans.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="p-4 bg-purple-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <Calculator className="h-10 w-10 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              No Payment Plans Yet
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Create your first payment plan to break down large payments into
              manageable monthly installments.
            </p>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {plans.map((plan) => {
            const progress = calculateProgress(plan);

            return (
              <Card
                key={plan.id}
                className="border-0 shadow-lg hover:shadow-xl transition-shadow"
              >
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <CardTitle className="text-xl font-semibold text-gray-900">
                          Payment Plan
                        </CardTitle>
                        <Badge className={getStatusColor(plan.status)}>
                          {plan.status}
                        </Badge>
                        {plan.smsNotifications && (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                            <Bell className="h-3 w-3 mr-1" />
                            SMS Enabled
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Total Amount:</span>
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(plan.totalAmount)}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Monthly Amount:</span>
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(plan.monthlyAmount)}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Duration:</span>
                          <p className="font-semibold text-gray-900">
                            {plan.installmentCount} months
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Progress:</span>
                          <p className="font-semibold text-gray-900">
                            {progress.percentage.toFixed(0)}% complete
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-300 hover:bg-gray-50"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Payment Progress</span>
                      <span>
                        {formatCurrency(progress.paidAmount)} /{" "}
                        {formatCurrency(plan.totalAmount)}
                      </span>
                    </div>
                    <Progress value={progress.percentage} className="h-3" />
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      Installment Schedule
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {plan.installments.map((installment) => (
                        <div
                          key={installment.id}
                          className={`p-4 rounded-xl border-2 ${
                            installment.status === "PAID"
                              ? "bg-emerald-50 border-emerald-200"
                              : installment.status === "OVERDUE"
                              ? "bg-red-50 border-red-200"
                              : "bg-amber-50 border-amber-200"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-semibold text-gray-900">
                              Installment {installment.installmentNumber}
                            </span>
                            <Badge
                              className={getInstallmentStatusColor(
                                installment.status
                              )}
                            >
                              {installment.status}
                            </Badge>
                          </div>

                          <div className="space-y-2">
                            <p className="text-lg font-bold text-gray-900">
                              {formatCurrency(installment.amount)}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Due: {formatDate(installment.dueDate)}
                            </p>
                            {installment.paidAt && (
                              <p className="text-sm text-emerald-600 flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Paid: {formatDate(installment.paidAt)}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Payment Plan Benefits */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-emerald-900 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Why Choose Payment Plans?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="p-3 bg-emerald-200 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-emerald-700" />
              </div>
              <h4 className="font-medium text-emerald-900 mb-2">
                Budget Friendly
              </h4>
              <p className="text-sm text-emerald-700">
                Break large payments into manageable monthly installments that
                fit your budget.
              </p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-blue-200 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <Smartphone className="h-6 w-6 text-blue-700" />
              </div>
              <h4 className="font-medium text-emerald-900 mb-2">
                SMS Reminders
              </h4>
              <p className="text-sm text-emerald-700">
                Receive automatic SMS reminders before each installment due
                date.
              </p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-purple-200 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <Target className="h-6 w-6 text-purple-700" />
              </div>
              <h4 className="font-medium text-emerald-900 mb-2">
                Stay on Track
              </h4>
              <p className="text-sm text-emerald-700">
                Visual progress tracking helps you stay motivated and complete
                your payments.
              </p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-amber-200 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <Shield className="h-6 w-6 text-amber-700" />
              </div>
              <h4 className="font-medium text-emerald-900 mb-2">Secure</h4>
              <p className="text-sm text-emerald-700">
                All payment plans are secure and backed by our payment
                protection guarantee.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
