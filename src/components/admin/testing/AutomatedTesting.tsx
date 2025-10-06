"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox, CheckboxGroup } from "@/components/ui/checkbox";
import {
  Play,
  Pause,
  Square,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Zap,
  Shield,
  Bug,
  TestTube,
  BarChart3,
  Download,
  Settings,
  PlayCircle,
  StopCircle,
  Activity,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface TestSuite {
  id: string;
  name: string;
  description: string;
  type: "unit" | "integration" | "e2e" | "performance" | "security";
  status: "running" | "passed" | "failed" | "pending" | "skipped";
  duration: number;
  lastRun: string;
  passRate: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
}

interface TestCase {
  id: string;
  name: string;
  description: string;
  suite: string;
  status: "passed" | "failed" | "skipped" | "running";
  duration: number;
  error?: string;
  steps: string[];
  expectedResult: string;
  actualResult?: string;
}

interface TestRun {
  id: string;
  suite: string;
  status: "running" | "completed" | "failed";
  startTime: string;
  endTime?: string;
  duration?: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  coverage: number;
  environment: string;
  triggeredBy: string;
}

interface TestCoverage {
  file: string;
  statements: number;
  branches: number;
  functions: number;
  lines: number;
  uncoveredLines: number[];
}

interface PerformanceTest {
  id: string;
  name: string;
  endpoint: string;
  method: string;
  avgResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  requestsPerSecond: number;
  errorRate: number;
  status: "passed" | "failed" | "warning";
}

const statusColors = {
  passed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  running: "bg-blue-100 text-blue-800",
  pending: "bg-yellow-100 text-yellow-800",
  skipped: "bg-gray-100 text-gray-800",
  completed: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
};

const typeIcons = {
  unit: <TestTube className="h-4 w-4" />,
  integration: <Activity className="h-4 w-4" />,
  e2e: <PlayCircle className="h-4 w-4" />,
  performance: <Zap className="h-4 w-4" />,
  security: <Shield className="h-4 w-4" />,
};

export default function AutomatedTesting() {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);
  const [coverage, setCoverage] = useState<TestCoverage[]>([]);
  const [performanceTests, setPerformanceTests] = useState<PerformanceTest[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedSuites, setSelectedSuites] = useState<string[]>([]);
  const [environment, setEnvironment] = useState("staging");

  useEffect(() => {
    fetchTestingData();
    const interval = setInterval(fetchTestingData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [environment]);

  const fetchTestingData = async () => {
    try {
      setLoading(true);

      // Mock testing data
      const mockTestSuites: TestSuite[] = [
        {
          id: "1",
          name: "Authentication Tests",
          description: "Tests for user authentication and authorization",
          type: "unit",
          status: "passed",
          duration: 45,
          lastRun: new Date().toISOString(),
          passRate: 95.5,
          totalTests: 22,
          passedTests: 21,
          failedTests: 1,
          skippedTests: 0,
        },
        {
          id: "2",
          name: "API Integration Tests",
          description: "Integration tests for API endpoints",
          type: "integration",
          status: "running",
          duration: 120,
          lastRun: new Date().toISOString(),
          passRate: 88.2,
          totalTests: 34,
          passedTests: 30,
          failedTests: 4,
          skippedTests: 0,
        },
        {
          id: "3",
          name: "E2E User Journey",
          description: "End-to-end tests for complete user workflows",
          type: "e2e",
          status: "failed",
          duration: 300,
          lastRun: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          passRate: 75.0,
          totalTests: 12,
          passedTests: 9,
          failedTests: 3,
          skippedTests: 0,
        },
        {
          id: "4",
          name: "Performance Tests",
          description: "Load and stress testing for system performance",
          type: "performance",
          status: "passed",
          duration: 600,
          lastRun: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          passRate: 100.0,
          totalTests: 8,
          passedTests: 8,
          failedTests: 0,
          skippedTests: 0,
        },
        {
          id: "5",
          name: "Security Tests",
          description: "Security vulnerability and penetration tests",
          type: "security",
          status: "pending",
          duration: 0,
          lastRun: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          passRate: 92.3,
          totalTests: 13,
          passedTests: 12,
          failedTests: 1,
          skippedTests: 0,
        },
      ];

      const mockTestCases: TestCase[] = [
        {
          id: "1",
          name: "User Login with Valid Credentials",
          description: "Test user login with correct email and password",
          suite: "Authentication Tests",
          status: "passed",
          duration: 2.5,
          steps: [
            "Navigate to login page",
            "Enter valid credentials",
            "Click login button",
          ],
          expectedResult: "User should be redirected to dashboard",
          actualResult: "User successfully redirected to dashboard",
        },
        {
          id: "2",
          name: "User Login with Invalid Credentials",
          description: "Test user login with incorrect password",
          suite: "Authentication Tests",
          status: "passed",
          duration: 1.8,
          steps: [
            "Navigate to login page",
            "Enter invalid password",
            "Click login button",
          ],
          expectedResult: "Error message should be displayed",
          actualResult: "Error message displayed correctly",
        },
        {
          id: "3",
          name: "API Rate Limiting",
          description: "Test API rate limiting functionality",
          suite: "API Integration Tests",
          status: "failed",
          duration: 5.2,
          error: "Rate limit not enforced after 100 requests",
          steps: [
            "Send 100 requests to API",
            "Send 101st request",
            "Check response",
          ],
          expectedResult: "101st request should be rate limited",
          actualResult: "101st request was processed normally",
        },
        {
          id: "4",
          name: "Course Application Flow",
          description: "Test complete course application process",
          suite: "E2E User Journey",
          status: "failed",
          duration: 45.3,
          error: "Payment gateway timeout after 30 seconds",
          steps: [
            "Navigate to course page",
            "Fill application form",
            "Submit application",
            "Complete payment",
          ],
          expectedResult: "Application should be submitted successfully",
          actualResult: "Payment step failed due to timeout",
        },
      ];

      const mockTestRuns: TestRun[] = [
        {
          id: "1",
          suite: "Authentication Tests",
          status: "completed",
          startTime: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
          endTime: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          duration: 45,
          totalTests: 22,
          passedTests: 21,
          failedTests: 1,
          skippedTests: 0,
          coverage: 87.5,
          environment: "staging",
          triggeredBy: "scheduled",
        },
        {
          id: "2",
          suite: "API Integration Tests",
          status: "running",
          startTime: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
          totalTests: 34,
          passedTests: 15,
          failedTests: 2,
          skippedTests: 0,
          coverage: 0,
          environment: "staging",
          triggeredBy: "manual",
        },
        {
          id: "3",
          suite: "E2E User Journey",
          status: "failed",
          startTime: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
          endTime: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          duration: 300,
          totalTests: 12,
          passedTests: 9,
          failedTests: 3,
          skippedTests: 0,
          coverage: 92.3,
          environment: "staging",
          triggeredBy: "push",
        },
      ];

      const mockCoverage: TestCoverage[] = [
        {
          file: "src/app/api/auth/route.ts",
          statements: 95.2,
          branches: 88.5,
          functions: 92.1,
          lines: 94.8,
          uncoveredLines: [45, 67, 89],
        },
        {
          file: "src/app/api/courses/route.ts",
          statements: 87.3,
          branches: 82.1,
          functions: 89.7,
          lines: 86.5,
          uncoveredLines: [23, 45, 67, 89, 112],
        },
        {
          file: "src/app/api/payments/route.ts",
          statements: 76.8,
          branches: 71.2,
          functions: 79.4,
          lines: 75.3,
          uncoveredLines: [12, 34, 56, 78, 90, 123],
        },
        {
          file: "src/components/admin/dashboard/AdminDashboard.tsx",
          statements: 91.5,
          branches: 85.7,
          functions: 88.9,
          lines: 90.2,
          uncoveredLines: [156, 234],
        },
      ];

      const mockPerformanceTests: PerformanceTest[] = [
        {
          id: "1",
          name: "Login Endpoint Load Test",
          endpoint: "/api/auth/login",
          method: "POST",
          avgResponseTime: 120,
          p95ResponseTime: 250,
          p99ResponseTime: 450,
          requestsPerSecond: 100,
          errorRate: 0.1,
          status: "passed",
        },
        {
          id: "2",
          name: "Course List API Stress Test",
          endpoint: "/api/courses",
          method: "GET",
          avgResponseTime: 85,
          p95ResponseTime: 180,
          p99ResponseTime: 320,
          requestsPerSecond: 200,
          errorRate: 0.05,
          status: "passed",
        },
        {
          id: "3",
          name: "Payment Processing Load Test",
          endpoint: "/api/payments/process",
          method: "POST",
          avgResponseTime: 350,
          p95ResponseTime: 800,
          p99ResponseTime: 1200,
          requestsPerSecond: 50,
          errorRate: 2.5,
          status: "warning",
        },
        {
          id: "4",
          name: "Admin Dashboard Load Test",
          endpoint: "/api/admin/stats",
          method: "GET",
          avgResponseTime: 200,
          p95ResponseTime: 400,
          p99ResponseTime: 650,
          requestsPerSecond: 30,
          errorRate: 0.2,
          status: "passed",
        },
      ];

      setTestSuites(mockTestSuites);
      setTestCases(mockTestCases);
      setTestRuns(mockTestRuns);
      setCoverage(mockCoverage);
      setPerformanceTests(mockPerformanceTests);
    } catch (error) {
      console.error("Error fetching testing data:", error);
    } finally {
      setLoading(false);
    }
  };

  const runTestSuite = async (suiteId: string) => {
    try {
      // Mock running test suite
      console.log(`Running test suite: ${suiteId}`);
      // In real implementation, this would trigger the actual test suite
    } catch (error) {
      console.error("Error running test suite:", error);
    }
  };

  const runAllTests = async () => {
    try {
      // Mock running all tests
      console.log("Running all test suites");
      // In real implementation, this would trigger all test suites
    } catch (error) {
      console.error("Error running all tests:", error);
    }
  };

  const getOverallPassRate = () => {
    const totalTests = testSuites.reduce(
      (sum, suite) => sum + suite.totalTests,
      0
    );
    const passedTests = testSuites.reduce(
      (sum, suite) => sum + suite.passedTests,
      0
    );
    return totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
  };

  const getOverallCoverage = () => {
    const totalStatements = coverage.reduce(
      (sum, file) => sum + file.statements,
      0
    );
    return coverage.length > 0 ? totalStatements / coverage.length : 0;
  };

  const getRunningTests = () => {
    return testSuites.filter((suite) => suite.status === "running").length;
  };

  const getFailedTests = () => {
    return testSuites.filter((suite) => suite.status === "failed").length;
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
          <h1 className="text-2xl font-bold text-gray-900">
            Automated Testing
          </h1>
          <p className="text-gray-600">
            Comprehensive testing suite with real-time monitoring and reporting
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={environment} onValueChange={setEnvironment}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="development">Development</SelectItem>
              <SelectItem value="staging">Staging</SelectItem>
              <SelectItem value="production">Production</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchTestingData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Test Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Overall Pass Rate
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {getOverallPassRate().toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500">Test success rate</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Code Coverage
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {getOverallCoverage().toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500">Statement coverage</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Running Tests
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {getRunningTests()}
                </p>
                <p className="text-xs text-gray-500">Currently executing</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Failed Tests
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {getFailedTests()}
                </p>
                <p className="text-xs text-gray-500">Require attention</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Controls */}
      <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Test Controls
              </h3>
              <p className="text-sm text-gray-500">
                Run tests and monitor execution
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={runAllTests}
                className="bg-green-600 hover:bg-green-700"
              >
                <Play className="h-4 w-4 mr-2" />
                Run All Tests
              </Button>
              <Button variant="outline">
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
              <Button variant="outline">
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Testing */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="suites">Test Suites</TabsTrigger>
          <TabsTrigger value="cases">Test Cases</TabsTrigger>
          <TabsTrigger value="runs">Test Runs</TabsTrigger>
          <TabsTrigger value="coverage">Coverage</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Test Suites Summary */}
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Test Suites Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {testSuites.map((suite) => (
                  <div
                    key={suite.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      {typeIcons[suite.type]}
                      <div>
                        <p className="font-medium text-gray-900">
                          {suite.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {suite.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={statusColors[suite.status]}>
                        {suite.status}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {suite.passRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Test Runs */}
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Recent Test Runs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {testRuns.map((run) => (
                  <div
                    key={run.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{run.suite}</p>
                      <p className="text-sm text-gray-500">
                        {run.totalTests} tests • {run.coverage}% coverage
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={statusColors[run.status]}>
                        {run.status}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {run.duration ? `${run.duration}s` : "Running..."}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="suites" className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            {testSuites.map((suite) => (
              <Card
                key={suite.id}
                className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {typeIcons[suite.type]}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {suite.name}
                        </h3>
                        <p className="text-gray-600">{suite.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={statusColors[suite.status]}>
                        {suite.status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => runTestSuite(suite.id)}
                        disabled={suite.status === "running"}
                      >
                        {suite.status === "running" ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4 mr-2" />
                        )}
                        {suite.status === "running" ? "Running" : "Run"}
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Total Tests</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {suite.totalTests}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Passed</p>
                      <p className="text-lg font-semibold text-green-600">
                        {suite.passedTests}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Failed</p>
                      <p className="text-lg font-semibold text-red-600">
                        {suite.failedTests}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Pass Rate</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {suite.passRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Progress value={suite.passRate} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cases" className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            {testCases.map((testCase) => (
              <Card
                key={testCase.id}
                className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {testCase.name}
                      </h3>
                      <p className="text-gray-600">{testCase.description}</p>
                      <p className="text-sm text-gray-500">
                        Suite: {testCase.suite}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={statusColors[testCase.status]}>
                        {testCase.status}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {testCase.duration}s
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Steps:
                      </p>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {testCase.steps.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Expected Result:
                      </p>
                      <p className="text-sm text-gray-600">
                        {testCase.expectedResult}
                      </p>
                    </div>
                    {testCase.actualResult && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Actual Result:
                        </p>
                        <p className="text-sm text-gray-600">
                          {testCase.actualResult}
                        </p>
                      </div>
                    )}
                    {testCase.error && (
                      <div>
                        <p className="text-sm font-medium text-red-700">
                          Error:
                        </p>
                        <p className="text-sm text-red-600">{testCase.error}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="runs" className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            {testRuns.map((run) => (
              <Card
                key={run.id}
                className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {run.suite}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Started: {new Date(run.startTime).toLocaleString()}
                        {run.endTime &&
                          ` • Ended: ${new Date(run.endTime).toLocaleString()}`}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={statusColors[run.status]}>
                        {run.status}
                      </Badge>
                      <Badge className="bg-gray-100 text-gray-800">
                        {run.environment}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Total Tests</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {run.totalTests}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Passed</p>
                      <p className="text-lg font-semibold text-green-600">
                        {run.passedTests}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Failed</p>
                      <p className="text-lg font-semibold text-red-600">
                        {run.failedTests}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Coverage</p>
                      <p className="text-lg font-semibold text-blue-600">
                        {run.coverage}%
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Progress
                      value={(run.passedTests / run.totalTests) * 100}
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="coverage" className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            {coverage.map((file) => (
              <Card
                key={file.file}
                className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {file.file}
                    </h3>
                    <Badge className="bg-blue-100 text-blue-800">
                      {file.statements.toFixed(1)}% coverage
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Statements</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {file.statements.toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Branches</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {file.branches.toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Functions</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {file.functions.toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Lines</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {file.lines.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Progress value={file.statements} className="h-2" />
                  </div>
                  {file.uncoveredLines.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700">
                        Uncovered Lines:
                      </p>
                      <p className="text-sm text-gray-600">
                        {file.uncoveredLines.join(", ")}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            {performanceTests.map((test) => (
              <Card
                key={test.id}
                className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {test.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {test.method} {test.endpoint}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={statusColors[test.status]}>
                        {test.status}
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-800">
                        {test.requestsPerSecond} req/s
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Avg Response</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {test.avgResponseTime}ms
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">P95 Response</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {test.p95ResponseTime}ms
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">P99 Response</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {test.p99ResponseTime}ms
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Error Rate</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {test.errorRate}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}


