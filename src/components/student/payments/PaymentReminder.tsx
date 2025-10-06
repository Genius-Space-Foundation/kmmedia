"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Bell,
  CreditCard,
  AlertTriangle,
  Clock,
  Calendar,
  DollarSign,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Phone,
  Mail,
  Send,
  AlertCircle,
  Zap,
  Target,
  Shield,
} from "lucide-react";

interface PaymentReminder {
  id: string;
  paymentId: string;
  amount: number;
  dueDate: string;
  type: string;
  description: string;
  daysUntilDue: number;
  isOverdue: boolean;
  urgency: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  courseTitle?: string;
}

interface PaymentReminderProps {
  userId: string;
}

export default function PaymentReminder({ userId }: PaymentReminderProps) {
  const [reminders, setReminders] = useState<PaymentReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);

  // Fetch reminders
  useEffect(() => {
    const fetchReminders = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/student/payment-reminders?userId=${userId}`
        );
        const data = await response.json();

        if (data.success) {
          setReminders(data.data.reminders || []);
        } else {
          setError(data.message || "Failed to fetch payment reminders");
        }
      } catch (error) {
        console.error("Error fetching reminders:", error);
        setError("Failed to fetch payment reminders");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchReminders();
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
    });
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "CRITICAL":
        return "bg-red-100 text-red-800 border-red-200";
      case "HIGH":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "LOW":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case "CRITICAL":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "HIGH":
        return <Zap className="h-4 w-4 text-orange-600" />;
      case "MEDIUM":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "LOW":
        return <Target className="h-4 w-4 text-green-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleSendReminder = async (reminderId: string) => {
    try {
      setSendingReminder(reminderId);
      const response = await fetch(
        `/api/student/payment-reminders/${reminderId}/remind`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            reminderType: "MANUAL",
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        // Refresh reminders
        window.location.reload();
      } else {
        setError(data.message || "Failed to send reminder");
      }
    } catch (error) {
      console.error("Error sending reminder:", error);
      setError("Failed to send reminder");
    } finally {
      setSendingReminder(null);
    }
  };

  const totalOverdue = reminders.filter((r) => r.isOverdue).length;
  const totalDueSoon = reminders.filter(
    (r) => r.daysUntilDue <= 3 && !r.isOverdue
  ).length;
  const totalPending = reminders.length;
  const totalAmount = reminders.reduce((sum, r) => sum + r.amount, 0);

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
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
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
      <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 rounded-2xl p-8 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Bell className="h-8 w-8" />
              </div>
              Payment Reminders
            </h2>
            <p className="text-orange-100 text-lg">
              Stay on top of your payments with smart reminders and
              notifications
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Phone className="h-4 w-4 mr-2" />
              SMS Settings
            </Button>
            <Button className="bg-white text-orange-600 hover:bg-orange-50">
              <Mail className="h-4 w-4 mr-2" />
              Email Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-pink-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 mb-1">
                  Overdue Payments
                </p>
                <p className="text-2xl font-bold text-red-900">
                  {totalOverdue}
                </p>
                <p className="text-xs text-red-600 mt-1">
                  {totalOverdue > 0
                    ? "Requires immediate attention"
                    : "All payments on track"}
                </p>
              </div>
              <div className="p-3 bg-red-200 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-yellow-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600 mb-1">
                  Due Soon
                </p>
                <p className="text-2xl font-bold text-amber-900">
                  {totalDueSoon}
                </p>
                <p className="text-xs text-amber-600 mt-1">Due within 3 days</p>
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
                  Total Pending
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatCurrency(totalAmount)}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {totalPending} pending payments
                </p>
              </div>
              <div className="p-3 bg-blue-200 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reminders List */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Payment Reminders
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {reminders.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                All Caught Up!
              </h3>
              <p className="text-gray-500">
                You have no pending payment reminders at the moment.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-xl ${
                          reminder.isOverdue
                            ? "bg-red-100"
                            : reminder.daysUntilDue <= 3
                            ? "bg-amber-100"
                            : "bg-blue-100"
                        }`}
                      >
                        {getUrgencyIcon(reminder.urgency)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900">
                            {reminder.description}
                          </h4>
                          <Badge className={getUrgencyColor(reminder.urgency)}>
                            <span className="flex items-center gap-1">
                              {getUrgencyIcon(reminder.urgency)}
                              {reminder.urgency}
                            </span>
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {reminder.courseTitle || "General Payment"}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Due: {formatDate(reminder.dueDate)}
                          </span>
                          <span
                            className={`flex items-center gap-1 ${
                              reminder.isOverdue
                                ? "text-red-600"
                                : reminder.daysUntilDue <= 3
                                ? "text-amber-600"
                                : "text-gray-500"
                            }`}
                          >
                            <Clock className="h-3 w-3" />
                            {reminder.isOverdue
                              ? `${Math.abs(
                                  reminder.daysUntilDue
                                )} days overdue`
                              : `${reminder.daysUntilDue} days remaining`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900 mb-2">
                        {formatCurrency(reminder.amount)}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <CreditCard className="h-4 w-4 mr-1" />
                          Pay Now
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSendReminder(reminder.id)}
                          disabled={sendingReminder === reminder.id}
                          className="border-gray-300 hover:bg-gray-50"
                        >
                          {sendingReminder === reminder.id ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-1" />
                              Remind Me
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Tips */}
      <Card className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-green-900 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Payment Tips & Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-green-900">💡 Smart Reminders</h4>
              <p className="text-sm text-green-700">
                Get SMS and email reminders before due dates to avoid late fees
                and maintain your payment history.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium text-green-900">⚡ Quick Actions</h4>
              <p className="text-sm text-green-700">
                Pay directly from reminders with secure payment processing and
                instant confirmation.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium text-green-900">
                📱 Multiple Channels
              </h4>
              <p className="text-sm text-green-700">
                Receive reminders via SMS, email, and in-app notifications to
                never miss a payment.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium text-green-900">🎯 Personalized</h4>
              <p className="text-sm text-green-700">
                Reminders are tailored to your payment history and preferences
                for the best experience.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
