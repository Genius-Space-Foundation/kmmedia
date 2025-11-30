"use client";

import React from "react";
import { RealTimeNotificationSystem } from "@/components/dashboard/RealTimeNotificationSystem";
import { NotificationProvider } from "@/components/ui/notification-provider";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestNotificationsPage() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="container mx-auto p-8">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Please log in to view notifications.
            </p>
            <Button onClick={() => (window.location.href = "/auth/login")}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <NotificationProvider>
      <div className="container mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Real-Time Notification System Test
          </h1>
          <p className="text-gray-600">
            Testing the comprehensive notification system with all features
          </p>
        </div>

        <div className="grid gap-6">
          {/* Main Notification System */}
          <RealTimeNotificationSystem
            userId={user.userId}
            maxVisible={10}
            onNotificationClick={(notification) => {
              console.log("Notification clicked:", notification);
            }}
          />

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Features Implemented</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  ✅ Real-time notification display with toast notifications
                </li>
                <li>
                  ✅ Notification list with filtering by type and priority
                </li>
                <li>✅ Mark as read, dismiss, and navigate actions</li>
                <li>
                  ✅ Notification preferences UI (sound, vibration, types,
                  priorities)
                </li>
                <li>✅ Sound and vibration controls</li>
                <li>✅ Unread count badge</li>
                <li>✅ Tab switching between all and unread notifications</li>
                <li>✅ Responsive design with proper styling</li>
                <li>
                  ✅ Integration with existing notification infrastructure
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Test Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Test Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600 mb-4">
                  Use these actions to test the notification system:
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      // This would typically be done via API
                      console.log("Create test notification");
                    }}
                  >
                    Create Test Notification
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      window.location.reload();
                    }}
                  >
                    Refresh Page
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </NotificationProvider>
  );
}
