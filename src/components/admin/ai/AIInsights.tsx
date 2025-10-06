"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Target,
  BarChart3,
  Users,
  DollarSign,
  BookOpen,
  RefreshCw,
  Sparkles,
} from "lucide-react";

interface AIInsight {
  id: string;
  type: "opportunity" | "risk" | "optimization" | "prediction";
  category: "revenue" | "users" | "courses" | "performance";
  title: string;
  description: string;
  confidence: number;
  impact: "high" | "medium" | "low";
  priority: "urgent" | "high" | "medium" | "low";
  actionable: boolean;
  recommendations: string[];
  metrics: {
    current: number;
    predicted: number;
    change: number;
  };
  createdAt: string;
  expiresAt?: string;
}

const insightTypes = {
  opportunity: {
    icon: Lightbulb,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  risk: { icon: AlertTriangle, color: "text-red-600", bgColor: "bg-red-100" },
  optimization: {
    icon: Target,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  prediction: {
    icon: Brain,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
};

const impactColors = {
  high: "bg-red-100 text-red-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-green-100 text-green-800",
};

const priorityColors = {
  urgent: "bg-red-100 text-red-800",
  high: "bg-orange-100 text-orange-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-green-100 text-green-800",
};

export default function AIInsights() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      setLoading(true);

      // Mock AI insights data - replace with actual AI service
      const mockInsights: AIInsight[] = [
        {
          id: "1",
          type: "opportunity",
          category: "revenue",
          title: "Revenue Growth Opportunity",
          description:
            "Based on user behavior patterns, implementing a premium tier could increase revenue by 35%",
          confidence: 87,
          impact: "high",
          priority: "high",
          actionable: true,
          recommendations: [
            "Create premium course bundles",
            "Implement tiered pricing",
            "Add exclusive content for premium users",
          ],
          metrics: {
            current: 250000,
            predicted: 337500,
            change: 35,
          },
          createdAt: "2024-01-20T10:00:00Z",
        },
        {
          id: "2",
          type: "risk",
          category: "users",
          title: "User Churn Risk Detected",
          description:
            "15% of active users show signs of potential churn based on engagement patterns",
          confidence: 92,
          impact: "high",
          priority: "urgent",
          actionable: true,
          recommendations: [
            "Send personalized re-engagement emails",
            "Offer special discounts to at-risk users",
            "Implement gamification features",
          ],
          metrics: {
            current: 420,
            predicted: 357,
            change: -15,
          },
          createdAt: "2024-01-20T09:30:00Z",
        },
        {
          id: "3",
          type: "optimization",
          category: "courses",
          title: "Course Completion Rate Optimization",
          description:
            "Interactive content and shorter modules could improve completion rates by 25%",
          confidence: 78,
          impact: "medium",
          priority: "medium",
          actionable: true,
          recommendations: [
            "Break down long courses into shorter modules",
            "Add interactive quizzes and assessments",
            "Implement progress tracking features",
          ],
          metrics: {
            current: 65,
            predicted: 81,
            change: 25,
          },
          createdAt: "2024-01-20T08:45:00Z",
        },
        {
          id: "4",
          type: "prediction",
          category: "performance",
          title: "Peak Usage Prediction",
          description:
            "System load is predicted to increase by 40% during the next enrollment period",
          confidence: 85,
          impact: "medium",
          priority: "medium",
          actionable: true,
          recommendations: [
            "Scale server resources",
            "Implement load balancing",
            "Prepare for increased support requests",
          ],
          metrics: {
            current: 1000,
            predicted: 1400,
            change: 40,
          },
          createdAt: "2024-01-19T16:20:00Z",
          expiresAt: "2024-02-15T00:00:00Z",
        },
        {
          id: "5",
          type: "opportunity",
          category: "users",
          title: "User Engagement Boost",
          description:
            "Implementing push notifications could increase daily active users by 20%",
          confidence: 73,
          impact: "medium",
          priority: "medium",
          actionable: true,
          recommendations: [
            "Set up automated notification campaigns",
            "Create personalized content recommendations",
            "Implement social learning features",
          ],
          metrics: {
            current: 280,
            predicted: 336,
            change: 20,
          },
          createdAt: "2024-01-19T14:10:00Z",
        },
      ];

      setInsights(mockInsights);
    } catch (error) {
      console.error("Error fetching AI insights:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredInsights = () => {
    let filtered = insights;

    if (activeTab !== "all") {
      filtered = filtered.filter((insight) => insight.type === activeTab);
    }

    if (filter !== "all") {
      filtered = filtered.filter((insight) => insight.priority === filter);
    }

    return filtered;
  };

  const getInsightCount = (type: string) => {
    return insights.filter((insight) => insight.type === type).length;
  };

  const getHighPriorityCount = () => {
    return insights.filter(
      (insight) => insight.priority === "urgent" || insight.priority === "high"
    ).length;
  };

  const getActionableCount = () => {
    return insights.filter((insight) => insight.actionable).length;
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
          <h1 className="text-2xl font-bold text-gray-900">AI Insights</h1>
          <p className="text-gray-600">
            Intelligent recommendations powered by machine learning
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={fetchInsights}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Insight Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Insights
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {insights.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  High Priority
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {getHighPriorityCount()}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Actionable</p>
                <p className="text-2xl font-bold text-gray-900">
                  {getActionableCount()}
                </p>
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
                  Avg Confidence
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(
                    insights.reduce(
                      (sum, insight) => sum + insight.confidence,
                      0
                    ) / insights.length
                  )}
                  %
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Brain className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            Filter by priority:
          </span>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Insights List */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({insights.length})</TabsTrigger>
          <TabsTrigger value="opportunity">
            Opportunities ({getInsightCount("opportunity")})
          </TabsTrigger>
          <TabsTrigger value="risk">
            Risks ({getInsightCount("risk")})
          </TabsTrigger>
          <TabsTrigger value="optimization">
            Optimizations ({getInsightCount("optimization")})
          </TabsTrigger>
          <TabsTrigger value="prediction">
            Predictions ({getInsightCount("prediction")})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {getFilteredInsights().length === 0 ? (
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
              <CardContent className="p-8 text-center">
                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Insights Available
                </h3>
                <p className="text-gray-600">
                  AI is analyzing your data. Check back soon for insights.
                </p>
              </CardContent>
            </Card>
          ) : (
            getFilteredInsights().map((insight) => {
              const typeConfig = insightTypes[insight.type];
              const TypeIcon = typeConfig.icon;

              return (
                <Card
                  key={insight.id}
                  className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl hover:shadow-xl transition-all"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${typeConfig.bgColor}`}
                      >
                        <TypeIcon className={`h-6 w-6 ${typeConfig.color}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {insight.title}
                              </h3>
                              <Badge
                                className={priorityColors[insight.priority]}
                              >
                                {insight.priority}
                              </Badge>
                              <Badge className={impactColors[insight.impact]}>
                                {insight.impact} impact
                              </Badge>
                              <Badge variant="outline">
                                {insight.confidence}% confidence
                              </Badge>
                            </div>
                            <p className="text-gray-600 mb-4">
                              {insight.description}
                            </p>

                            {/* Metrics */}
                            <div className="grid grid-cols-3 gap-4 mb-4">
                              <div className="text-center">
                                <p className="text-sm text-gray-500">Current</p>
                                <p className="text-lg font-semibold">
                                  {insight.metrics.current.toLocaleString()}
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-gray-500">
                                  Predicted
                                </p>
                                <p className="text-lg font-semibold">
                                  {insight.metrics.predicted.toLocaleString()}
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-gray-500">Change</p>
                                <p
                                  className={`text-lg font-semibold ${
                                    insight.metrics.change > 0
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {insight.metrics.change > 0 ? "+" : ""}
                                  {insight.metrics.change}%
                                </p>
                              </div>
                            </div>

                            {/* Recommendations */}
                            {insight.recommendations.length > 0 && (
                              <div className="mb-4">
                                <h4 className="text-sm font-medium text-gray-900 mb-2">
                                  Recommendations:
                                </h4>
                                <ul className="list-disc list-inside space-y-1">
                                  {insight.recommendations.map((rec, index) => (
                                    <li
                                      key={index}
                                      className="text-sm text-gray-600"
                                    >
                                      {rec}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>
                                Created:{" "}
                                {new Date(
                                  insight.createdAt
                                ).toLocaleDateString()}
                              </span>
                              {insight.expiresAt && (
                                <span>
                                  Expires:{" "}
                                  {new Date(
                                    insight.expiresAt
                                  ).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {insight.actionable && (
                              <Button size="sm">
                                <Target className="h-4 w-4 mr-2" />
                                Take Action
                              </Button>
                            )}
                            <Button variant="outline" size="sm">
                              <Brain className="h-4 w-4 mr-2" />
                              Learn More
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}


