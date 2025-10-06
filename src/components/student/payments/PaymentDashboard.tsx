"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PaymentTransactions from "./PaymentTransactions";
import PaymentReminder from "./PaymentReminder";
import PaymentPlanManager from "./PaymentPlanManager";
import {
  CreditCard,
  Bell,
  Calculator,
  TrendingUp,
  DollarSign,
  BarChart3,
  PieChart,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  Download,
  Settings,
  HelpCircle,
} from "lucide-react";

interface PaymentDashboardProps {
  userId: string;
}

export default function PaymentDashboard({ userId }: PaymentDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-3 flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-2xl">
                  <CreditCard className="h-10 w-10" />
                </div>
                Payment Center
              </h1>
              <p className="text-blue-100 text-xl mb-4">
                Manage your payments, track transactions, and create flexible
                payment plans
              </p>
              <div className="flex gap-3">
                <Button className="bg-white text-blue-600 hover:bg-blue-50">
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Make Payment
                </Button>
                <Button
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="w-64 h-64 bg-white/10 rounded-full flex items-center justify-center">
                <div className="w-48 h-48 bg-white/20 rounded-full flex items-center justify-center">
                  <div className="w-32 h-32 bg-white/30 rounded-full flex items-center justify-center">
                    <CreditCard className="h-16 w-16" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600 mb-1">
                  Total Paid
                </p>
                <p className="text-2xl font-bold text-emerald-900">₵2,450</p>
                <p className="text-xs text-emerald-600 mt-1">+12% this month</p>
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
                <p className="text-2xl font-bold text-amber-900">₵1,200</p>
                <p className="text-xs text-amber-600 mt-1">3 payments due</p>
              </div>
              <div className="p-3 bg-amber-200 rounded-full">
                <Clock className="h-6 w-6 text-amber-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 mb-1">Overdue</p>
                <p className="text-2xl font-bold text-red-900">₵350</p>
                <p className="text-xs text-red-600 mt-1">1 payment overdue</p>
              </div>
              <div className="p-3 bg-red-200 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-indigo-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 mb-1">
                  Active Plans
                </p>
                <p className="text-2xl font-bold text-purple-900">2</p>
                <p className="text-xs text-purple-600 mt-1">Payment plans</p>
              </div>
              <div className="p-3 bg-purple-200 rounded-full">
                <Calculator className="h-6 w-6 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4 bg-white border shadow-sm">
          <TabsTrigger
            value="overview"
            className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="transactions"
            className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <CreditCard className="h-4 w-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger
            value="reminders"
            className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <Bell className="h-4 w-4" />
            Reminders
          </TabsTrigger>
          <TabsTrigger
            value="plans"
            className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <Calculator className="h-4 w-4" />
            Payment Plans
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Activity Chart */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Payment Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <PieChart className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      Payment activity chart will be displayed here
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-200 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-emerald-700" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Tuition Payment
                        </p>
                        <p className="text-sm text-gray-600">
                          Digital Marketing Course
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">₵1,200</p>
                      <p className="text-xs text-emerald-600">Completed</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-200 rounded-lg">
                        <Clock className="h-4 w-4 text-amber-700" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Application Fee
                        </p>
                        <p className="text-sm text-gray-600">
                          Video Production Course
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">₵50</p>
                      <p className="text-xs text-amber-600">Pending</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-200 rounded-lg">
                        <Calendar className="h-4 w-4 text-blue-700" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Installment #1
                        </p>
                        <p className="text-sm text-gray-600">
                          Photography Course
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">₵300</p>
                      <p className="text-xs text-blue-600">Scheduled</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Insights */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Payment Insights & Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center p-4">
                  <div className="p-3 bg-blue-200 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-blue-700" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Payment History
                  </h4>
                  <p className="text-sm text-gray-600">
                    You've made 12 successful payments this year. Keep up the
                    great work!
                  </p>
                </div>
                <div className="text-center p-4">
                  <div className="p-3 bg-emerald-200 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-emerald-700" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    On-Time Payments
                  </h4>
                  <p className="text-sm text-gray-600">
                    95% on-time payment rate. You're doing excellent with your
                    payment schedule!
                  </p>
                </div>
                <div className="text-center p-4">
                  <div className="p-3 bg-purple-200 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                    <Calculator className="h-6 w-6 text-purple-700" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Payment Plans
                  </h4>
                  <p className="text-sm text-gray-600">
                    Consider creating a payment plan for larger amounts to
                    manage your budget better.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <PaymentTransactions userId={userId} />
        </TabsContent>

        <TabsContent value="reminders">
          <PaymentReminder userId={userId} />
        </TabsContent>

        <TabsContent value="plans">
          <PaymentPlanManager userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

