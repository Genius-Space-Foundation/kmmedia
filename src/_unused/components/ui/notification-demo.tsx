"use client";

import React from "react";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { useNotificationContext } from "./notification-provider";

export function NotificationDemo() {
  const { showToast } = useNotificationContext();

  const handleTestNotifications = () => {
    // Test different types of notifications
    showToast(
      "Assignment Published",
      "New assignment 'React Fundamentals' has been published in Web Development course.",
      "info"
    );

    setTimeout(() => {
      showToast(
        "Assignment Due Soon",
        "Assignment 'React Fundamentals' is due in 24 hours!",
        "warning"
      );
    }, 1000);

    setTimeout(() => {
      showToast(
        "Assignment Graded",
        "Your submission for 'React Fundamentals' has been graded. Score: 85/100",
        "success"
      );
    }, 2000);

    setTimeout(() => {
      showToast(
        "Assignment Overdue",
        "Assignment 'React Fundamentals' is now overdue. Please submit as soon as possible.",
        "error"
      );
    }, 3000);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Notification System Demo</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          Test the in-app notification system with sample assignment
          notifications.
        </p>
        <Button onClick={handleTestNotifications} className="w-full">
          Test Notifications
        </Button>
      </CardContent>
    </Card>
  );
}
