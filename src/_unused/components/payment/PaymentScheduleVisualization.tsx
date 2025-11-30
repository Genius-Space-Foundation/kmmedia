"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Bell,
  CreditCard,
  TrendingDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentScheduleItem {
  id: string;
  installmentNumber: number;
  amount: number;
  dueDate: Date;
  status: "PENDING" | "PAID" | "OVERDUE" | "UPCOMING";
  paidDate?: Date;
  paymentMethod?: string;
  transactionId?: string;
}

interface PaymentScheduleVisualizationProps {
  schedule: PaymentScheduleItem[];
  totalAmount: number;
  paidAmount: number;
  onPayNow?: (installmentId: string) => void;
  onSetReminder?: (installmentId: string) => void;
  onDownloadSchedule?: () => void;
  className?: string;
}

export default function PaymentScheduleVisualization({
  schedule,
  totalAmount,
  paidAmount,
  onPayNow,
  onSetReminder,
  onDownloadSchedule,
  className,
}: PaymentScheduleVisualizationProps) {
  const [selectedView, setSelectedView] = useState<"timeline" | "calendar">(
    "timeline"
  );

  const progressPercentage = (paidAmount / totalAmount) * 100;
  const remainingAmount = totalAmount - paidAmount;
  const paidInstallments = schedule.filter(
    (item) => item.status === "PAID"
  ).length;
  const overdueInstallments = schedule.filter(
    (item) => item.status === "OVERDUE"
  ).length;
  const upcomingInstallments = schedule.filter(
    (item) => item.status === "UPCOMING" || item.status === "PENDING"
  ).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800 border-green-200";
      case "PENDING":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "OVERDUE":
        return "bg-red-100 text-red-800 border-red-200";
      case "UPCOMING":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PAID":
        return <CheckCircle className="h-4 w-4" />;
      case "PENDING":
        return <Clock className="h-4 w-4" />;
      case "OVERDUE":
        return <AlertCircle className="h-4 w-4" />;
      case "UPCOMING":
        return <Calendar className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getDaysUntilDue = (dueDate: Date) => {
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const sortedSchedule = [...schedule].sort(
    (a, b) => a.installmentNumber - b.installmentNumber
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Progress Overview */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <TrendingDown className="h-5 w-5 text-blue-600" />
              <span className="text-blue-900">Payment Progress</span>
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={onDownloadSchedule}
              className="text-blue-700 border-blue-300"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Schedule
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-blue-700">Progress</span>
              <span className="font-medium text-blue-900">
                {progressPercentage.toFixed(1)}% Complete
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-900">
                GH₵{paidAmount.toLocaleString()}
              </p>
              <p className="text-sm text-blue-700">Paid</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-900">
                GH₵{remainingAmount.toLocaleString()}
              </p>
              <p className="text-sm text-blue-700">Remaining</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-900">
                {paidInstallments}
              </p>
              <p className="text-sm text-blue-700">Paid Installments</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-900">
                {upcomingInstallments}
              </p>
              <p className="text-sm text-blue-700">Remaining</p>
            </div>
          </div>

          {overdueInstallments > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-900">
                  {overdueInstallments} overdue payment
                  {overdueInstallments > 1 ? "s" : ""}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Tabs */}
      <Tabs
        value={selectedView}
        onValueChange={(value) =>
          setSelectedView(value as "timeline" | "calendar")
        }
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          {/* Timeline View */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedSchedule.map((item, index) => {
                  const daysUntilDue = getDaysUntilDue(item.dueDate);
                  const isLast = index === sortedSchedule.length - 1;

                  return (
                    <div key={item.id} className="relative">
                      {/* Timeline Line */}
                      {!isLast && (
                        <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200" />
                      )}

                      <div className="flex items-start space-x-4">
                        {/* Timeline Dot */}
                        <div
                          className={cn(
                            "flex items-center justify-center w-12 h-12 rounded-full border-2",
                            item.status === "PAID"
                              ? "bg-green-100 border-green-500"
                              : item.status === "OVERDUE"
                              ? "bg-red-100 border-red-500"
                              : item.status === "PENDING"
                              ? "bg-blue-100 border-blue-500"
                              : "bg-gray-100 border-gray-300"
                          )}
                        >
                          {getStatusIcon(item.status)}
                        </div>

                        {/* Payment Details */}
                        <div className="flex-1 min-w-0">
                          <Card
                            className={cn(
                              "border",
                              getStatusColor(item.status)
                            )}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-3">
                                  <h4 className="font-semibold">
                                    Payment {item.installmentNumber}
                                  </h4>
                                  <Badge
                                    className={getStatusColor(item.status)}
                                  >
                                    {item.status.toLowerCase()}
                                  </Badge>
                                </div>
                                <div className="text-right">
                                  <p className="text-xl font-bold">
                                    GH₵{item.amount.toLocaleString()}
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-600">Due Date:</p>
                                  <p className="font-medium">
                                    {formatDate(item.dueDate)}
                                  </p>

                                  {item.status === "UPCOMING" &&
                                    daysUntilDue > 0 && (
                                      <p className="text-blue-600 text-xs mt-1">
                                        {daysUntilDue} days remaining
                                      </p>
                                    )}

                                  {item.status === "OVERDUE" && (
                                    <p className="text-red-600 text-xs mt-1">
                                      {Math.abs(daysUntilDue)} days overdue
                                    </p>
                                  )}
                                </div>

                                <div>
                                  {item.status === "PAID" && item.paidDate && (
                                    <>
                                      <p className="text-gray-600">Paid On:</p>
                                      <p className="font-medium">
                                        {formatDate(item.paidDate)}
                                      </p>
                                      {item.paymentMethod && (
                                        <p className="text-xs text-gray-500 mt-1">
                                          via {item.paymentMethod}
                                        </p>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center space-x-2 mt-4">
                                {(item.status === "PENDING" ||
                                  item.status === "OVERDUE") &&
                                  onPayNow && (
                                    <Button
                                      size="sm"
                                      onClick={() => onPayNow(item.id)}
                                      className={
                                        item.status === "OVERDUE"
                                          ? "bg-red-600 hover:bg-red-700"
                                          : ""
                                      }
                                    >
                                      <CreditCard className="h-4 w-4 mr-2" />
                                      Pay Now
                                    </Button>
                                  )}

                                {item.status === "UPCOMING" &&
                                  onSetReminder && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => onSetReminder(item.id)}
                                    >
                                      <Bell className="h-4 w-4 mr-2" />
                                      Set Reminder
                                    </Button>
                                  )}

                                {item.status === "PAID" &&
                                  item.transactionId && (
                                    <Button variant="outline" size="sm">
                                      <Download className="h-4 w-4 mr-2" />
                                      Receipt
                                    </Button>
                                  )}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          {/* Calendar View */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedSchedule.map((item) => {
                  const daysUntilDue = getDaysUntilDue(item.dueDate);

                  return (
                    <Card
                      key={item.id}
                      className={cn("border-2", getStatusColor(item.status))}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <Badge className={getStatusColor(item.status)}>
                            {getStatusIcon(item.status)}
                            <span className="ml-1">
                              {item.status.toLowerCase()}
                            </span>
                          </Badge>
                          <span className="text-sm text-gray-600">
                            #{item.installmentNumber}
                          </span>
                        </div>

                        <div className="text-center mb-3">
                          <p className="text-2xl font-bold">
                            GH₵{item.amount.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDate(item.dueDate)}
                          </p>
                        </div>

                        {item.status === "UPCOMING" && daysUntilDue > 0 && (
                          <p className="text-center text-sm text-blue-600 mb-3">
                            {daysUntilDue} days remaining
                          </p>
                        )}

                        {item.status === "OVERDUE" && (
                          <p className="text-center text-sm text-red-600 mb-3">
                            {Math.abs(daysUntilDue)} days overdue
                          </p>
                        )}

                        {item.status === "PAID" && item.paidDate && (
                          <p className="text-center text-sm text-green-600 mb-3">
                            Paid on {formatDate(item.paidDate)}
                          </p>
                        )}

                        {/* Action Button */}
                        <div className="text-center">
                          {(item.status === "PENDING" ||
                            item.status === "OVERDUE") &&
                            onPayNow && (
                              <Button
                                size="sm"
                                onClick={() => onPayNow(item.id)}
                                className={cn(
                                  "w-full",
                                  item.status === "OVERDUE"
                                    ? "bg-red-600 hover:bg-red-700"
                                    : ""
                                )}
                              >
                                Pay Now
                              </Button>
                            )}

                          {item.status === "UPCOMING" && onSetReminder && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onSetReminder(item.id)}
                              className="w-full"
                            >
                              <Bell className="h-4 w-4 mr-2" />
                              Remind Me
                            </Button>
                          )}

                          {item.status === "PAID" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Receipt
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary Card */}
      <Card className="border-gray-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-gray-900 mb-2">
            Payment Plan Summary
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Total Amount:</p>
              <p className="font-semibold">GH₵{totalAmount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-600">Monthly Payment:</p>
              <p className="font-semibold">
                GH₵
                {schedule.length > 0
                  ? schedule[0].amount.toLocaleString()
                  : "0"}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Payment Period:</p>
              <p className="font-semibold">{schedule.length} months</p>
            </div>
            <div>
              <p className="text-gray-600">Next Payment:</p>
              <p className="font-semibold">
                {schedule.find(
                  (item) =>
                    item.status === "PENDING" || item.status === "UPCOMING"
                )
                  ? formatDate(
                      schedule.find(
                        (item) =>
                          item.status === "PENDING" ||
                          item.status === "UPCOMING"
                      )!.dueDate
                    )
                  : "Complete"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
