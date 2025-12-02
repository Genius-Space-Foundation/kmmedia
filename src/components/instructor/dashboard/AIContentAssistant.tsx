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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Sparkles,
  BookOpen,
  Users,
  Target,
  TrendingUp,
  Lightbulb,
  Copy,
  Check,
} from "lucide-react";

interface ContentSuggestion {
  id: string;
  type: "lesson" | "assessment" | "activity" | "resource";
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTime: number;
  learningObjectives: string[];
  suggestedContent: string;
  confidence: number;
  tags: string[];
}

interface AISuggestions {
  courseOutline: ContentSuggestion[];
  learningObjectives: string[];
  assessmentIdeas: ContentSuggestion[];
  engagementActivities: ContentSuggestion[];
  industryTrends: string[];
  competitorAnalysis: string[];
}

export default function AIContentAssistant() {
  const [suggestions, setSuggestions] = useState<AISuggestions | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("outline");
  const [courseInput, setCourseInput] = useState({
    title: "",
    description: "",
    targetAudience: "",
    duration: "",
    level: "",
    industry: "",
  });
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());

  const generateSuggestions = async () => {
    if (!courseInput.title || !courseInput.description) {
      alert("Please provide at least a course title and description");
      return;
    }

    // Check if we're on the client side
    if (typeof window === "undefined") {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        "/api/instructor/ai-suggestions",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(courseInput),
        }
      );

      if (response.success) {
        setSuggestions(response.data);
      } else {
        throw new Error(response.error || "Failed to generate suggestions");
      }
    } catch (error) {
      console.error("Error generating AI suggestions:", error);
      alert("Failed to generate suggestions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems((prev) => new Set([...prev, itemId]));
      setTimeout(() => {
        setCopiedItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600";
    if (confidence >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI Content Assistant
          </CardTitle>
          <CardDescription>
            Get intelligent suggestions for your course content, structure, and
            activities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Course Title</Label>
              <Input
                id="title"
                value={courseInput.title}
                onChange={(e) =>
                  setCourseInput((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="e.g., Digital Marketing Fundamentals"
              />
            </div>
            <div>
              <Label htmlFor="duration">Course Duration</Label>
              <Input
                id="duration"
                value={courseInput.duration}
                onChange={(e) =>
                  setCourseInput((prev) => ({
                    ...prev,
                    duration: e.target.value,
                  }))
                }
                placeholder="e.g., 4 weeks, 8 hours"
              />
            </div>
            <div>
              <Label htmlFor="level">Difficulty Level</Label>
              <Input
                id="level"
                value={courseInput.level}
                onChange={(e) =>
                  setCourseInput((prev) => ({ ...prev, level: e.target.value }))
                }
                placeholder="e.g., Beginner, Intermediate, Advanced"
              />
            </div>
            <div>
              <Label htmlFor="industry">Industry/Sector</Label>
              <Input
                id="industry"
                value={courseInput.industry}
                onChange={(e) =>
                  setCourseInput((prev) => ({
                    ...prev,
                    industry: e.target.value,
                  }))
                }
                placeholder="e.g., Technology, Healthcare, Finance"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Course Description</Label>
            <Textarea
              id="description"
              value={courseInput.description}
              onChange={(e) =>
                setCourseInput((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Describe what students will learn, the target audience, and key outcomes..."
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="audience">Target Audience</Label>
            <Input
              id="audience"
              value={courseInput.targetAudience}
              onChange={(e) =>
                setCourseInput((prev) => ({
                  ...prev,
                  targetAudience: e.target.value,
                }))
              }
              placeholder="e.g., Marketing professionals, Small business owners, Students"
            />
          </div>

          <Button
            onClick={generateSuggestions}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Generating Suggestions..." : "Generate AI Suggestions"}
          </Button>
        </CardContent>
      </Card>

      {suggestions && (
        <Card>
          <CardHeader>
            <CardTitle>AI-Generated Suggestions</CardTitle>
            <CardDescription>
              Based on your course details, here are personalized
              recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="outline">Course Outline</TabsTrigger>
                <TabsTrigger value="objectives">
                  Learning Objectives
                </TabsTrigger>
                <TabsTrigger value="assessments">Assessments</TabsTrigger>
                <TabsTrigger value="activities">Activities</TabsTrigger>
              </TabsList>

              <TabsContent value="outline" className="space-y-4">
                <div className="space-y-3">
                  {suggestions.courseOutline.map((item, index) => (
                    <Card key={item.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <BookOpen className="h-4 w-4 text-blue-600" />
                            <h4 className="font-medium">{item.title}</h4>
                            <Badge
                              className={getDifficultyColor(item.difficulty)}
                            >
                              {item.difficulty}
                            </Badge>
                            <Badge variant="outline">
                              {item.estimatedTime} min
                            </Badge>
                            <span
                              className={`text-sm ${getConfidenceColor(
                                item.confidence
                              )}`}
                            >
                              {Math.round(item.confidence * 100)}% confidence
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {item.description}
                          </p>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">
                              Learning Objectives:
                            </p>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {item.learningObjectives.map((objective, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2"
                                >
                                  <Target className="h-3 w-3 mt-1 text-green-600" />
                                  {objective}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="mt-2">
                            <p className="text-sm font-medium">
                              Suggested Content:
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {item.suggestedContent}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.tags.map((tag, idx) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(
                              `${item.title}\n\n${
                                item.description
                              }\n\nLearning Objectives:\n${item.learningObjectives
                                .map((obj) => `• ${obj}`)
                                .join("\n")}\n\nSuggested Content:\n${
                                item.suggestedContent
                              }`,
                              `outline-${item.id}`
                            )
                          }
                        >
                          {copiedItems.has(`outline-${item.id}`) ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="objectives" className="space-y-4">
                <div className="space-y-3">
                  {suggestions.learningObjectives.map((objective, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2">
                          <Target className="h-4 w-4 text-green-600 mt-1" />
                          <p className="text-sm">{objective}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(objective, `objective-${index}`)
                          }
                        >
                          {copiedItems.has(`objective-${index}`) ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="assessments" className="space-y-4">
                <div className="space-y-3">
                  {suggestions.assessmentIdeas.map((item, index) => (
                    <Card key={item.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-purple-600" />
                            <h4 className="font-medium">{item.title}</h4>
                            <Badge
                              className={getDifficultyColor(item.difficulty)}
                            >
                              {item.difficulty}
                            </Badge>
                            <Badge variant="outline">
                              {item.estimatedTime} min
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {item.description}
                          </p>
                          <p className="text-sm text-gray-600">
                            {item.suggestedContent}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(
                              `${item.title}\n\n${item.description}\n\n${item.suggestedContent}`,
                              `assessment-${item.id}`
                            )
                          }
                        >
                          {copiedItems.has(`assessment-${item.id}`) ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="activities" className="space-y-4">
                <div className="space-y-3">
                  {suggestions.engagementActivities.map((item, index) => (
                    <Card key={item.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="h-4 w-4 text-orange-600" />
                            <h4 className="font-medium">{item.title}</h4>
                            <Badge
                              className={getDifficultyColor(item.difficulty)}
                            >
                              {item.difficulty}
                            </Badge>
                            <Badge variant="outline">
                              {item.estimatedTime} min
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {item.description}
                          </p>
                          <p className="text-sm text-gray-600">
                            {item.suggestedContent}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(
                              `${item.title}\n\n${item.description}\n\n${item.suggestedContent}`,
                              `activity-${item.id}`
                            )
                          }
                        >
                          {copiedItems.has(`activity-${item.id}`) ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {suggestions && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Industry Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {suggestions.industryTrends.map((trend, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-600 mt-1" />
                    <p className="text-sm">{trend}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                Competitor Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {suggestions.competitorAnalysis.map((insight, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <BookOpen className="h-4 w-4 text-purple-600 mt-1" />
                    <p className="text-sm">{insight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
