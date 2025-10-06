"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { makeAuthenticatedRequest } from "@/lib/token-utils";
import {
  TrendingUp,
  AlertTriangle,
  Users,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  Brain,
  Lightbulb,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";

interface StudentPrediction {
  id: string;
  name: string;
  email: string;
  course: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  successProbability: number;
  engagementScore: number;
  progressRate: number;
  lastActivity: string;
  predictedOutcome: "SUCCESS" | "AT_RISK" | "LIKELY_FAIL";
  keyFactors: string[];
  recommendations: string[];
  interventionNeeded: boolean;
}

interface CoursePrediction {
  id: string;
  title: string;
  completionRate: number;
  averageEngagement: number;
  predictedCompletion: number;
  riskFactors: string[];
  improvementSuggestions: string[];
}

interface InterventionAlert {
  id: string;
  type: "ENGAGEMENT" | "PROGRESS" | "ASSESSMENT" | "ATTENDANCE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  student: string;
  course: string;
  description: string;
  suggestedAction: string;
  timeframe: string;
  status: "NEW" | "IN_PROGRESS" | "RESOLVED";
  createdAt: string;
}

interface AnalyticsInsights {
  totalStudents: number;
  atRiskStudents: number;
  highPerformingStudents: number;
  averageEngagement: number;
  predictedCompletionRate: number;
  interventionAlerts: number;
  successTrends: string[];
  riskPatterns: string[];
}

export default function PredictiveAnalytics() {
  const [studentPredictions, setStudentPredictions] = useState<
    StudentPrediction[]
  >([]);
  const [coursePredictions, setCoursePredictions] = useState<
    CoursePrediction[]
  >([]);
  const [interventionAlerts, setInterventionAlerts] = useState<
    InterventionAlert[]
  >([]);
  const [insights, setInsights] = useState<AnalyticsInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchPredictiveData();
  }, []);

  const fetchPredictiveData = async () => {
    try {
      // Check if we're on the client side
      if (typeof window === "undefined") {
        return;
      }

      const [
        predictionsResponse,
        coursesResponse,
        alertsResponse,
        insightsResponse,
      ] = await Promise.all([
        makeAuthenticatedRequest(
          "/api/instructor/predictive-analytics/students"
        ),
        makeAuthenticatedRequest(
          "/api/instructor/predictive-analytics/courses"
        ),
        makeAuthenticatedRequest("/api/instructor/predictive-analytics/alerts"),
        makeAuthenticatedRequest(
          "/api/instructor/predictive-analytics/insights"
        ),
      ]);

      if (predictionsResponse.success) {
        setStudentPredictions(predictionsResponse.data);
      }
      if (coursesResponse.success) {
        setCoursePredictions(coursesResponse.data);
      }
      if (alertsResponse.success) {
        setInterventionAlerts(alertsResponse.data);
      }
      if (insightsResponse.success) {
        setInsights(insightsResponse.data);
      }
    } catch (error) {
      console.error("Error fetching predictive analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "LOW":
        return "bg-green-100 text-green-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      case "HIGH":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "LOW":
        return "bg-blue-100 text-blue-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      case "HIGH":
        return "bg-orange-100 text-orange-800";
      case "CRITICAL":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case "SUCCESS":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "AT_RISK":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "LIKELY_FAIL":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendIcon = (value: number, threshold: number = 0) => {
    if (value > threshold)
      return <ArrowUp className="h-4 w-4 text-green-600" />;
    if (value < threshold)
      return <ArrowDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Predictive Analytics Dashboard
          </CardTitle>
          <CardDescription>
            AI-powered insights to predict student success and identify
            intervention opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="students">Student Predictions</TabsTrigger>
              <TabsTrigger value="courses">Course Analytics</TabsTrigger>
              <TabsTrigger value="alerts">Intervention Alerts</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {insights && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Total Students
                          </p>
                          <p className="text-2xl font-bold">
                            {insights.totalStudents}
                          </p>
                        </div>
                        <Users className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            At Risk
                          </p>
                          <p className="text-2xl font-bold text-red-600">
                            {insights.atRiskStudents}
                          </p>
                        </div>
                        <AlertTriangle className="h-8 w-8 text-red-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            High Performers
                          </p>
                          <p className="text-2xl font-bold text-green-600">
                            {insights.highPerformingStudents}
                          </p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Predicted Completion
                          </p>
                          <p className="text-2xl font-bold">
                            {Math.round(insights.predictedCompletionRate)}%
                          </p>
                        </div>
                        <Target className="h-8 w-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      Success Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {insights?.successTrends.map((trend, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                          <p className="text-sm">{trend}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      Risk Patterns
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {insights?.riskPatterns.map((pattern, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-600 mt-1" />
                          <p className="text-sm">{pattern}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="students" className="space-y-4">
              <div className="space-y-4">
                {studentPredictions.map((student) => (
                  <Card key={student.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getOutcomeIcon(student.predictedOutcome)}
                          <h4 className="font-medium">{student.name}</h4>
                          <Badge className={getRiskColor(student.riskLevel)}>
                            {student.riskLevel} RISK
                          </Badge>
                          <Badge variant="outline">{student.course}</Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium text-gray-600">
                              Success Probability
                            </p>
                            <div className="flex items-center gap-2">
                              <Progress
                                value={student.successProbability}
                                className="flex-1"
                              />
                              <span className="text-sm font-medium">
                                {Math.round(student.successProbability)}%
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">
                              Engagement Score
                            </p>
                            <div className="flex items-center gap-2">
                              <Progress
                                value={student.engagementScore}
                                className="flex-1"
                              />
                              <span className="text-sm font-medium">
                                {Math.round(student.engagementScore)}%
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">
                              Progress Rate
                            </p>
                            <div className="flex items-center gap-2">
                              <Progress
                                value={student.progressRate}
                                className="flex-1"
                              />
                              <span className="text-sm font-medium">
                                {Math.round(student.progressRate)}%
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <p className="text-sm font-medium text-gray-600">
                              Key Factors:
                            </p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {student.keyFactors.map((factor, idx) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {factor}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">
                              Recommendations:
                            </p>
                            <ul className="text-sm text-gray-600 mt-1 space-y-1">
                              {student.recommendations.map((rec, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2"
                                >
                                  <Lightbulb className="h-3 w-3 mt-1 text-yellow-600" />
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        {student.interventionNeeded && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200"
                          >
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Intervention Needed
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="courses" className="space-y-4">
              <div className="space-y-4">
                {coursePredictions.map((course) => (
                  <Card key={course.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-4">
                          <BarChart3 className="h-5 w-5 text-blue-600" />
                          <h4 className="font-medium text-lg">
                            {course.title}
                          </h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium text-gray-600">
                              Current Completion
                            </p>
                            <div className="flex items-center gap-2">
                              <Progress
                                value={course.completionRate}
                                className="flex-1"
                              />
                              <span className="text-sm font-medium">
                                {Math.round(course.completionRate)}%
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">
                              Average Engagement
                            </p>
                            <div className="flex items-center gap-2">
                              <Progress
                                value={course.averageEngagement}
                                className="flex-1"
                              />
                              <span className="text-sm font-medium">
                                {Math.round(course.averageEngagement)}%
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">
                              Predicted Completion
                            </p>
                            <div className="flex items-center gap-2">
                              <Progress
                                value={course.predictedCompletion}
                                className="flex-1"
                              />
                              <span className="text-sm font-medium">
                                {Math.round(course.predictedCompletion)}%
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-gray-600">
                              Risk Factors:
                            </p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {course.riskFactors.map((factor, idx) => (
                                <Badge
                                  key={idx}
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  {factor}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">
                              Improvement Suggestions:
                            </p>
                            <ul className="text-sm text-gray-600 mt-1 space-y-1">
                              {course.improvementSuggestions.map(
                                (suggestion, idx) => (
                                  <li
                                    key={idx}
                                    className="flex items-start gap-2"
                                  >
                                    <Lightbulb className="h-3 w-3 mt-1 text-yellow-600" />
                                    {suggestion}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-4">
              <div className="space-y-4">
                {interventionAlerts.map((alert) => (
                  <Card key={alert.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <h4 className="font-medium">
                            {alert.student} - {alert.course}
                          </h4>
                          <Badge className={getPriorityColor(alert.priority)}>
                            {alert.priority}
                          </Badge>
                          <Badge variant="outline">{alert.type}</Badge>
                        </div>

                        <p className="text-sm text-gray-600 mb-2">
                          {alert.description}
                        </p>

                        <div className="space-y-2">
                          <div>
                            <p className="text-sm font-medium text-gray-600">
                              Suggested Action:
                            </p>
                            <p className="text-sm text-gray-600">
                              {alert.suggestedAction}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Timeframe: {alert.timeframe}</span>
                            <span>
                              Created:{" "}
                              {new Date(alert.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        <Button
                          variant={
                            alert.status === "RESOLVED" ? "outline" : "default"
                          }
                          size="sm"
                        >
                          {alert.status === "RESOLVED"
                            ? "Resolved"
                            : "Take Action"}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
