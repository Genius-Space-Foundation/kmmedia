"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AssignmentCountdown,
  InlineCountdown,
  CountdownBadge,
} from "@/components/assignments/AssignmentCountdown";
import { addDays, addHours, addMinutes } from "date-fns";

export default function AssignmentsPage() {
  // Sample due dates for testing different urgency levels
  const sampleDueDates = {
    overdue: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    critical: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
    urgent: addHours(new Date(), 12), // 12 hours from now
    warning: addDays(new Date(), 1), // 1 day from now
    normal: addDays(new Date(), 7), // 1 week from now
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Assignment Countdown Demo
        </h1>
        <p className="text-gray-600">
          Demonstrating countdown timers with different urgency levels
        </p>
      </div>

      {/* Full Countdown Examples */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AssignmentCountdown
          dueDate={sampleDueDates.urgent}
          title="Urgent Assignment"
          showNotifications={true}
          onReminder={(type) => {
            console.log(`Reminder triggered: ${type}`);
            if (Notification.permission === "granted") {
              new Notification("Assignment Reminder", {
                body: `Assignment due soon! (${type})`,
                icon: "/favicon.ico",
              });
            }
          }}
        />

        <AssignmentCountdown
          dueDate={sampleDueDates.warning}
          title="Upcoming Assignment"
          showNotifications={true}
        />

        <AssignmentCountdown
          dueDate={sampleDueDates.normal}
          title="Future Assignment"
        />

        <AssignmentCountdown
          dueDate={sampleDueDates.overdue}
          title="Overdue Assignment"
        />
      </div>

      {/* Compact Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Compact Countdown Examples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium">Inline Countdowns</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 border rounded">
                  <span>Critical Assignment</span>
                  <InlineCountdown dueDate={sampleDueDates.critical} />
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <span>Urgent Assignment</span>
                  <InlineCountdown dueDate={sampleDueDates.urgent} />
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <span>Warning Assignment</span>
                  <InlineCountdown dueDate={sampleDueDates.warning} />
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <span>Normal Assignment</span>
                  <InlineCountdown dueDate={sampleDueDates.normal} />
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <span>Overdue Assignment</span>
                  <InlineCountdown dueDate={sampleDueDates.overdue} />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Countdown Badges</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 border rounded">
                  <span>Critical Assignment</span>
                  <CountdownBadge dueDate={sampleDueDates.critical} />
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <span>Urgent Assignment</span>
                  <CountdownBadge dueDate={sampleDueDates.urgent} />
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <span>Warning Assignment</span>
                  <CountdownBadge dueDate={sampleDueDates.warning} />
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <span>Normal Assignment</span>
                  <CountdownBadge dueDate={sampleDueDates.normal} />
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <span>Overdue Assignment</span>
                  <CountdownBadge dueDate={sampleDueDates.overdue} />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compact Countdown Examples */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AssignmentCountdown
          dueDate={sampleDueDates.critical}
          title="Critical"
          compact={true}
        />
        <AssignmentCountdown
          dueDate={sampleDueDates.urgent}
          title="Urgent"
          compact={true}
        />
        <AssignmentCountdown
          dueDate={sampleDueDates.warning}
          title="Warning"
          compact={true}
        />
      </div>

      {/* Features List */}
      <Card>
        <CardHeader>
          <CardTitle>Countdown Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Visual Indicators</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  • Color-coded urgency levels (normal, warning, urgent,
                  critical, overdue)
                </li>
                <li>• Real-time countdown with seconds precision</li>
                <li>• Digital clock display for full countdown</li>
                <li>• Compact inline and badge variants</li>
                <li>• Responsive design for mobile devices</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">Smart Features</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Automatic reminder notifications (48h, 24h, 1h)</li>
                <li>• Browser notification support</li>
                <li>• Handles browser tab visibility changes</li>
                <li>• Human-readable time formatting</li>
                <li>• Overdue detection and display</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
