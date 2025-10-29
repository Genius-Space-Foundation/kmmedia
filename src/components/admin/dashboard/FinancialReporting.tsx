"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Wallet,
  BarChart3,
  PieChart,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface FinancialMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  averageTransactionValue: number;
  successfulPayments: number;
  failedPayments: number;
  refundedPayments: number;
  pendingPayments: number;
  paymentSuccessRate: number;
  topPaymentMethods: Array<{
    method: string;
    count: number;
    amount: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    revenue: number;
    transactions: number;
  }>;
}

export default function FinancialReporting() {
  const [metrics, setMetrics] = useState<FinancialMetrics>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    revenueGrowth: 0,
    averageTransactionValue: 0,
    successfulPayments: 0,
    failedPayments: 0,
    refundedPayments: 0,
    pendingPayments: 0,
    paymentSuccessRate: 0,
    topPaymentMethods: [],
    monthlyTrends: [],
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");

  useEffect(() => {
    fetchFinancialMetrics();
  }, [timeRange]);

  const fetchFinancialMetrics = async () => {
    try {
      setLoading(true);

      // Mock data - replace with actual API call
      const mockMetrics: FinancialMetrics = {
        totalRevenue: 2450000,
        monthlyRevenue: 185000,
        revenueGrowth: 15.2,
        averageTransactionValue: 1335,
        successfulPayments: 1834,
        failedPayments: 67,
        refundedPayments: 23,
        pendingPayments: 12,
        paymentSuccessRate: 96.2,
        topPaymentMethods: [
          { method: "Paystack", count: 1456, amount: 1950000 },
          { method: "Bank Transfer", count: 378, amount: 500000 },
          { method: "Mobile Money", count: 67, amount: 89000 },
        ],
        monthlyTrends: [
          { month: "Jan", revenue: 145000, transactions: 234 },
          { month: "Feb", revenue: 167000, transactions: 267 },
          { month: "Mar", revenue: 189000, transactions: 298 },
          { month: "Apr", revenue: 156000, transactions: 245 },
          { month: "May", revenue: 178000, transactions: 289 },
          { month: "Jun", revenue: 185000, transactions: 301 },
        ],
      };

      setMetrics(mockMetrics);
    } catch (error) {
      console.error("Error fetching financial metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `GH₵${amount.toLocaleString()}`;
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (growth < 0) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return <BarChart3 className="h-4 w-4 text-gray-600" />;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return "text-green-600";
    if (growth < 0) return "text-red-600";
    return "text-gray-600";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Financial Reporting
          </h2>
          <p className="text-gray-600">
            Comprehensive financial analytics and insights
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchFinancialMetrics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">
                  Total Revenue
                </p>
                <p className="text-3xl font-bold text-green-900">
                  {formatCurrency(metrics.totalRevenue)}
                </p>
                <div className="flex items-center mt-2">
                  {getGrowthIcon(metrics.revenueGrowth)}
                  <span
                    className={`text-sm font-medium ml-1 ${getGrowthColor(
                      metrics.revenueGrowth
                    )}`}
                  >
                    {metrics.revenueGrowth > 0 ? "+" : ""}
                    {metrics.revenueGrowth}%
                  </span>
                  <span className="text-sm text-gray-600 ml-1">
                    vs last period
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">
                  Monthly Revenue
                </p>
                <p className="text-3xl font-bold text-blue-900">
                  {formatCurrency(metrics.monthlyRevenue)}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Avg: {formatCurrency(metrics.averageTransactionValue)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">
                  Success Rate
                </p>
                <p className="text-3xl font-bold text-purple-900">
                  {metrics.paymentSuccessRate}%
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  {metrics.successfulPayments} successful
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-200 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">
                  Failed Payments
                </p>
                <p className="text-3xl font-bold text-orange-900">
                  {metrics.failedPayments}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  {metrics.pendingPayments} pending
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-200 rounded-lg flex items-center justify-center">
                <XCircle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods and Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods Breakdown */}
        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {metrics.topPaymentMethods.map((method, index) => {
              const percentage = (method.amount / metrics.totalRevenue) * 100;
              return (
                <div key={method.method} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {method.method}
                    </span>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(method.amount)}
                      </span>
                      <p className="text-xs text-gray-500">
                        {method.count} transactions
                      </p>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <p className="text-xs text-gray-500 text-right">
                    {percentage.toFixed(1)}% of total revenue
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Monthly Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.monthlyTrends.map((trend, index) => {
                const maxRevenue = Math.max(
                  ...metrics.monthlyTrends.map((t) => t.revenue)
                );
                const percentage = (trend.revenue / maxRevenue) * 100;

                return (
                  <div key={trend.month} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        {trend.month}
                      </span>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(trend.revenue)}
                        </span>
                        <p className="text-xs text-gray-500">
                          {trend.transactions} transactions
                        </p>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Status Overview */}
      <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Payment Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">
                {metrics.successfulPayments}
              </p>
              <p className="text-sm text-gray-600">Successful</p>
              <p className="text-xs text-gray-500 mt-1">
                {(
                  (metrics.successfulPayments /
                    (metrics.successfulPayments +
                      metrics.failedPayments +
                      metrics.pendingPayments)) *
                  100
                ).toFixed(1)}
                %
              </p>
            </div>

            <div className="text-center p-4 bg-red-50 rounded-lg">
              <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-600">
                {metrics.failedPayments}
              </p>
              <p className="text-sm text-gray-600">Failed</p>
              <p className="text-xs text-gray-500 mt-1">
                {(
                  (metrics.failedPayments /
                    (metrics.successfulPayments +
                      metrics.failedPayments +
                      metrics.pendingPayments)) *
                  100
                ).toFixed(1)}
                %
              </p>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <AlertCircle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-600">
                {metrics.pendingPayments}
              </p>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-xs text-gray-500 mt-1">
                {(
                  (metrics.pendingPayments /
                    (metrics.successfulPayments +
                      metrics.failedPayments +
                      metrics.pendingPayments)) *
                  100
                ).toFixed(1)}
                %
              </p>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <RefreshCw className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-600">
                {metrics.refundedPayments}
              </p>
              <p className="text-sm text-gray-600">Refunded</p>
              <p className="text-xs text-gray-500 mt-1">
                {(
                  (metrics.refundedPayments / metrics.successfulPayments) *
                  100
                ).toFixed(1)}
                % of successful
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
