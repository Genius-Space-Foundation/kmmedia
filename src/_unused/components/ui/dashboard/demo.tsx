"use client";

import React from "react";
import { DashboardCard } from "../dashboard-card";
import { StatWidget } from "../stat-widget";
import { ProgressBar } from "../progress-bar";
import { Badge } from "../badge";
import { Button } from "../button";
import {
  BookOpen,
  TrendingUp,
  Award,
  Clock,
  MoreVertical,
  RefreshCw,
} from "lucide-react";

/**
 * Demo component showcasing all dashboard UI components
 * This is for development and documentation purposes
 */
export function DashboardComponentsDemo() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | undefined>();

  const handleLoadingDemo = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  const handleErrorDemo = () => {
    setError(new Error("This is a demo error message"));
    setTimeout(() => setError(undefined), 3000);
  };

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Dashboard Components Demo</h1>
        <p className="text-gray-600 mb-8">
          Showcase of all shared UI components for the student dashboard
        </p>

        {/* StatWidget Examples */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">StatWidget</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatWidget
              label="Active Courses"
              value={5}
              icon={<BookOpen />}
              color="blue"
              trend={{ value: 12, direction: "up" }}
            />
            <StatWidget
              label="Average Progress"
              value="78%"
              icon={<TrendingUp />}
              color="green"
              trend={{ value: 5, direction: "up" }}
            />
            <StatWidget
              label="Achievements"
              value={24}
              icon={<Award />}
              color="purple"
            />
            <StatWidget
              label="Study Time"
              value="42h"
              icon={<Clock />}
              color="orange"
              trend={{ value: 3, direction: "down" }}
            />
          </div>
        </section>

        {/* DashboardCard Examples */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">DashboardCard</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DashboardCard
              title="Course Progress"
              subtitle="Your learning journey"
              icon={<BookOpen className="w-6 h-6 text-blue-600" />}
              actions={
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              }
            >
              <div className="space-y-4">
                <ProgressBar
                  value={75}
                  label="Introduction to React"
                  showPercentage
                />
                <ProgressBar
                  value={45}
                  label="Advanced TypeScript"
                  showPercentage
                />
                <ProgressBar
                  value={90}
                  label="Web Design Fundamentals"
                  showPercentage
                />
              </div>
            </DashboardCard>

            <DashboardCard
              title="Loading State Demo"
              subtitle="Click the button to see loading state"
              loading={loading}
              error={error}
            >
              <div className="space-y-4">
                <p className="text-gray-600">
                  This card demonstrates loading and error states.
                </p>
                <div className="flex gap-2">
                  <Button onClick={handleLoadingDemo} disabled={loading}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Show Loading
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleErrorDemo}
                    disabled={!!error}
                  >
                    Show Error
                  </Button>
                </div>
              </div>
            </DashboardCard>
          </div>
        </section>

        {/* ProgressBar Examples */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">ProgressBar</h2>
          <DashboardCard title="Progress Bar Variants">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-3">
                  With Label and Percentage
                </h3>
                <ProgressBar
                  value={75}
                  label="Course Completion"
                  showPercentage
                />
              </div>

              <div>
                <h3 className="text-sm font-medium mb-3">Different Sizes</h3>
                <div className="space-y-3">
                  <ProgressBar value={60} size="sm" label="Small" />
                  <ProgressBar value={70} size="md" label="Medium" />
                  <ProgressBar value={80} size="lg" label="Large" />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-3">Custom Colors</h3>
                <div className="space-y-3">
                  <ProgressBar
                    value={90}
                    color="bg-green-500"
                    label="Excellent"
                    showPercentage
                  />
                  <ProgressBar
                    value={60}
                    color="bg-blue-500"
                    label="Good"
                    showPercentage
                  />
                  <ProgressBar
                    value={30}
                    color="bg-orange-500"
                    label="Needs Work"
                    showPercentage
                  />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-3">Without Animation</h3>
                <ProgressBar
                  value={50}
                  animated={false}
                  label="Static Progress"
                  showPercentage
                />
              </div>
            </div>
          </DashboardCard>
        </section>

        {/* Badge Examples */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Badge</h2>
          <DashboardCard title="Badge Variants">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Standard Variants</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="accent">Accent</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge variant="outline">Outline</Badge>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Status Variants</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="info">Info</Badge>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Color Variants</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="blue">Blue</Badge>
                  <Badge variant="green">Green</Badge>
                  <Badge variant="orange">Orange</Badge>
                  <Badge variant="purple">Purple</Badge>
                  <Badge variant="red">Red</Badge>
                </div>
              </div>
            </div>
          </DashboardCard>
        </section>

        {/* Button Examples */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Button</h2>
          <DashboardCard title="Button Variants">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-3">Variants</h3>
                <div className="flex flex-wrap gap-2">
                  <Button variant="default">Default</Button>
                  <Button variant="accent">Accent</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-3">Sizes</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                  <Button size="icon">
                    <BookOpen className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-3">States</h3>
                <div className="flex flex-wrap gap-2">
                  <Button loading>Loading</Button>
                  <Button loading loadingText="Processing...">
                    Submit
                  </Button>
                  <Button disabled>Disabled</Button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-3">With Icons</h3>
                <div className="flex flex-wrap gap-2">
                  <Button>
                    <BookOpen className="w-4 h-4 mr-2" />
                    Continue Learning
                  </Button>
                  <Button variant="outline">
                    <Award className="w-4 h-4 mr-2" />
                    View Achievements
                  </Button>
                </div>
              </div>
            </div>
          </DashboardCard>
        </section>

        {/* Combined Example */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Combined Example</h2>
          <DashboardCard
            title="My Learning Dashboard"
            subtitle="Track your progress and achievements"
            icon={<TrendingUp className="w-6 h-6 text-blue-600" />}
            actions={
              <div className="flex gap-2">
                <Badge variant="success">Active</Badge>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            }
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatWidget
                  label="Courses"
                  value={5}
                  icon={<BookOpen />}
                  color="blue"
                  trend={{ value: 12, direction: "up" }}
                />
                <StatWidget
                  label="Progress"
                  value="78%"
                  icon={<TrendingUp />}
                  color="green"
                />
                <StatWidget
                  label="Achievements"
                  value={24}
                  icon={<Award />}
                  color="purple"
                />
              </div>

              <div className="space-y-3">
                <ProgressBar
                  value={85}
                  label="React Fundamentals"
                  showPercentage
                />
                <ProgressBar
                  value={60}
                  label="TypeScript Advanced"
                  showPercentage
                />
                <ProgressBar
                  value={40}
                  label="Node.js Backend"
                  showPercentage
                />
              </div>

              <div className="flex gap-2">
                <Button>
                  <BookOpen className="w-4 h-4 mr-2" />
                  Continue Learning
                </Button>
                <Button variant="outline">View All Courses</Button>
              </div>
            </div>
          </DashboardCard>
        </section>
      </div>
    </div>
  );
}
