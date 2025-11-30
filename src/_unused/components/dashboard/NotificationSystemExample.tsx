"use client";

/**
 * Example usage of the RealTimeNotificationSystem component
 *
 * This file demonstrates how to integrate the notification system
 * into a student dashboard.
 */

import React from "react";
import { RealTimeNotificationSystem } from "./RealTimeNotificationSystem";
import { NotificationProvider } from "@/components/ui/notification-provider";
import type { Notification } from "@/types/dashboard";

interface StudentDashboardProps {
  userId: string;
}

export function StudentDashboardWithNotifications({
  userId,
}: StudentDashboardProps) {
  // Handle notification clicks
  const handleNotificationClick = (notification: Notification) => {
    console.log("Notification clicked:", notification);

    // Example: Navigate based on notification type
    switch (notification.type) {
      case "assignment":
        // Navigate to assignment page
        if (notification.actionUrl) {
          window.location.href = notification.actionUrl;
        }
        break;
      case "grade":
        // Navigate to grades page
        window.location.href = "/dashboards/student/grades";
        break;
      case "deadline":
        // Navigate to deadlines page
        window.location.href = "/dashboards/student/deadlines";
        break;
      case "message":
        // Navigate to messages page
        window.location.href = "/dashboards/student/messages";
        break;
      case "achievement":
        // Navigate to achievements page
        window.location.href = "/dashboards/student/achievements";
        break;
      default:
        // Default action
        if (notification.actionUrl) {
          window.location.href = notification.actionUrl;
        }
    }
  };

  return (
    <NotificationProvider>
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content area */}
          <div className="lg:col-span-2">
            <h1 className="text-2xl font-bold mb-6">Student Dashboard</h1>
            {/* Other dashboard components would go here */}
          </div>

          {/* Notification sidebar */}
          <div className="lg:col-span-1">
            <RealTimeNotificationSystem
              userId={userId}
              maxVisible={8}
              onNotificationClick={handleNotificationClick}
            />
          </div>
        </div>
      </div>
    </NotificationProvider>
  );
}

/**
 * Example: Notification System in a Modal/Drawer
 */
export function NotificationDrawerExample({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <NotificationProvider>
      <div>
        {/* Trigger button */}
        <button
          onClick={() => setIsOpen(true)}
          className="relative p-2 rounded-lg hover:bg-gray-100"
        >
          <span className="sr-only">Open notifications</span>
          {/* Bell icon would go here */}
        </button>

        {/* Drawer/Modal */}
        {isOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setIsOpen(false)}
          >
            <div
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4">
                <button
                  onClick={() => setIsOpen(false)}
                  className="mb-4 text-gray-500 hover:text-gray-700"
                >
                  Close
                </button>
                <RealTimeNotificationSystem
                  userId={userId}
                  maxVisible={20}
                  onNotificationClick={(notification) => {
                    console.log("Notification clicked:", notification);
                    setIsOpen(false);
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </NotificationProvider>
  );
}

/**
 * Example: Compact Notification Widget
 */
export function CompactNotificationWidget({ userId }: { userId: string }) {
  return (
    <NotificationProvider>
      <div className="max-w-sm">
        <RealTimeNotificationSystem
          userId={userId}
          maxVisible={3}
          className="shadow-sm"
        />
      </div>
    </NotificationProvider>
  );
}
