"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Workflow,
  Settings,
  Play,
  Pause,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  BookOpen,
  FileText,
  DollarSign,
} from "lucide-react";

interface WorkflowRule {
  id: string;
  name: string;
  description: string;
  type:
    | "course_approval"
    | "user_verification"
    | "payment_processing"
    | "application_review";
  status: "active" | "inactive" | "paused";
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  createdAt: string;
  lastTriggered?: string;
  triggerCount: number;
}

interface WorkflowCondition {
  field: string;
  operator: "equals" | "not_equals" | "contains" | "greater_than" | "less_than";
  value: string;
}

interface WorkflowAction {
  type:
    | "send_email"
    | "send_notification"
    | "update_status"
    | "assign_role"
    | "create_task";
  parameters: Record<string, any>;
}

const workflowTypes = [
  {
    value: "course_approval",
    label: "Course Approval",
    icon: BookOpen,
    description: "Automatically approve courses based on criteria",
  },
  {
    value: "user_verification",
    label: "User Verification",
    icon: Users,
    description: "Verify users based on profile completeness",
  },
  {
    value: "payment_processing",
    label: "Payment Processing",
    icon: DollarSign,
    description: "Handle payment status updates",
  },
  {
    value: "application_review",
    label: "Application Review",
    icon: FileText,
    description: "Automatically review applications",
  },
];

export default function WorkflowManager() {
  const [workflows, setWorkflows] = useState<WorkflowRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);

      // Mock data - replace with actual API call
      const mockWorkflows: WorkflowRule[] = [
        {
          id: "1",
          name: "Auto-approve High-Quality Courses",
          description:
            "Automatically approve courses from verified instructors with complete profiles",
          type: "course_approval",
          status: "active",
          conditions: [
            { field: "instructor.verified", operator: "equals", value: "true" },
            {
              field: "course.completeness",
              operator: "greater_than",
              value: "90",
            },
          ],
          actions: [
            { type: "update_status", parameters: { status: "APPROVED" } },
            {
              type: "send_notification",
              parameters: { message: "Course approved automatically" },
            },
          ],
          createdAt: "2024-01-15T10:00:00Z",
          lastTriggered: "2024-01-20T14:30:00Z",
          triggerCount: 12,
        },
        {
          id: "2",
          name: "Payment Success Notification",
          description: "Send confirmation email when payment is successful",
          type: "payment_processing",
          status: "active",
          conditions: [
            { field: "payment.status", operator: "equals", value: "COMPLETED" },
          ],
          actions: [
            {
              type: "send_email",
              parameters: { template: "payment_success", to: "user.email" },
            },
            {
              type: "send_notification",
              parameters: { message: "Payment processed successfully" },
            },
          ],
          createdAt: "2024-01-10T09:00:00Z",
          lastTriggered: "2024-01-20T16:45:00Z",
          triggerCount: 45,
        },
        {
          id: "3",
          name: "Application Review Queue",
          description: "Assign applications to reviewers based on workload",
          type: "application_review",
          status: "paused",
          conditions: [
            {
              field: "application.status",
              operator: "equals",
              value: "PENDING",
            },
            {
              field: "application.priority",
              operator: "equals",
              value: "HIGH",
            },
          ],
          actions: [
            {
              type: "create_task",
              parameters: { assignee: "admin", priority: "HIGH" },
            },
            {
              type: "send_notification",
              parameters: { message: "New high-priority application" },
            },
          ],
          createdAt: "2024-01-05T11:00:00Z",
          triggerCount: 8,
        },
      ];

      setWorkflows(mockWorkflows);
    } catch (error) {
      console.error("Error fetching workflows:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleWorkflow = async (workflowId: string) => {
    try {
      setWorkflows((prev) =>
        prev.map((workflow) =>
          workflow.id === workflowId
            ? {
                ...workflow,
                status: workflow.status === "active" ? "inactive" : "active",
              }
            : workflow
        )
      );

      // Here you would make an API call to update the workflow status
      console.log(`Toggling workflow ${workflowId}`);
    } catch (error) {
      console.error("Error toggling workflow:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4" />;
      case "inactive":
        return <AlertCircle className="h-4 w-4" />;
      case "paused":
        return <Pause className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Workflow Management
          </h1>
          <p className="text-gray-600">
            Automate your admin processes with intelligent workflows
          </p>
        </div>
        <Button>
          <Workflow className="h-4 w-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      {/* Workflow Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Workflows
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {workflows.filter((w) => w.status === "active").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Play className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Triggers
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {workflows.reduce((sum, w) => sum + w.triggerCount, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Paused Workflows
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {workflows.filter((w) => w.status === "paused").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Pause className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Success Rate
                </p>
                <p className="text-2xl font-bold text-gray-900">94.2%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflow List */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="paused">Paused</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {workflows.map((workflow) => {
            const typeConfig = workflowTypes.find(
              (t) => t.value === workflow.type
            );
            const TypeIcon = typeConfig?.icon || Workflow;

            return (
              <Card
                key={workflow.id}
                className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <TypeIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {workflow.name}
                          </h3>
                          <Badge className={getStatusColor(workflow.status)}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(workflow.status)}
                              <span>{workflow.status}</span>
                            </div>
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-3">
                          {workflow.description}
                        </p>
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <span>Triggers: {workflow.triggerCount}</span>
                          <span>
                            Last run:{" "}
                            {workflow.lastTriggered
                              ? new Date(
                                  workflow.lastTriggered
                                ).toLocaleDateString()
                              : "Never"}
                          </span>
                          <span>
                            Created:{" "}
                            {new Date(workflow.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <Label
                          htmlFor={`workflow-${workflow.id}`}
                          className="text-sm"
                        >
                          {workflow.status === "active" ? "Active" : "Inactive"}
                        </Label>
                        <Switch
                          id={`workflow-${workflow.id}`}
                          checked={workflow.status === "active"}
                          onCheckedChange={() => toggleWorkflow(workflow.id)}
                        />
                      </div>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="active">
          <div className="space-y-4">
            {workflows
              .filter((w) => w.status === "active")
              .map((workflow) => (
                <Card
                  key={workflow.id}
                  className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {workflow.name}
                        </h3>
                        <p className="text-gray-600">{workflow.description}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Active
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="paused">
          <div className="space-y-4">
            {workflows
              .filter((w) => w.status === "paused")
              .map((workflow) => (
                <Card
                  key={workflow.id}
                  className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {workflow.name}
                        </h3>
                        <p className="text-gray-600">{workflow.description}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Pause className="h-4 w-4 mr-1" />
                          Paused
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Play className="h-4 w-4 mr-2" />
                          Resume
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {workflowTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Card
                  key={type.value}
                  className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl hover:shadow-xl transition-shadow cursor-pointer"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {type.label}
                        </h3>
                        <p className="text-gray-600 mb-4">{type.description}</p>
                        <Button size="sm">Create Workflow</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}


