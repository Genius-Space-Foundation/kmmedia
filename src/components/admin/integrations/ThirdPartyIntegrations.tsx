"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox, CheckboxGroup } from "@/components/ui/checkbox";
import {
  Settings,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Zap,
  Shield,
  Mail,
  CreditCard,
  Users,
  BarChart3,
  Globe,
  Smartphone,
  Monitor,
  Database,
  Cloud,
  Key,
  Link,
  Activity,
  TrendingUp,
  TrendingDown,
  Download,
  Upload,
  Save,
  Send,
  Play,
  Pause,
  Square,
} from "lucide-react";

interface Integration {
  id: string;
  name: string;
  description: string;
  category:
    | "payment"
    | "email"
    | "analytics"
    | "storage"
    | "communication"
    | "marketing"
    | "security"
    | "productivity";
  provider: string;
  status: "active" | "inactive" | "error" | "pending";
  lastSync: string;
  nextSync?: string;
  config: {
    apiKey?: string;
    webhookUrl?: string;
    settings: Record<string, any>;
  };
  metrics: {
    requests: number;
    successRate: number;
    avgResponseTime: number;
    errors: number;
  };
  features: string[];
  pricing: {
    plan: string;
    cost: number;
    currency: string;
  };
}

interface IntegrationTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  provider: string;
  features: string[];
  pricing: {
    plan: string;
    cost: number;
    currency: string;
  };
  setup: {
    steps: string[];
    required: string[];
    optional: string[];
  };
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: "active" | "inactive" | "error";
  lastTriggered: string;
  successRate: number;
  responseTime: number;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  status: "active" | "inactive" | "expired";
  createdAt: string;
  lastUsed: string;
  usage: {
    requests: number;
    limit: number;
  };
}

const integrationTemplates: IntegrationTemplate[] = [
  {
    id: "1",
    name: "Stripe Payment Gateway",
    description: "Accept payments with Stripe's secure payment processing",
    category: "payment",
    icon: <CreditCard className="h-4 w-4" />,
    provider: "Stripe",
    features: ["payment_processing", "subscriptions", "refunds", "webhooks"],
    pricing: { plan: "Standard", cost: 2.9, currency: "%" },
    setup: {
      steps: [
        "Create Stripe account",
        "Get API keys",
        "Configure webhooks",
        "Test integration",
      ],
      required: ["publishable_key", "secret_key", "webhook_secret"],
      optional: ["test_mode", "currency", "country"],
    },
  },
  {
    id: "2",
    name: "SendGrid Email Service",
    description: "Reliable email delivery and marketing automation",
    category: "email",
    icon: <Mail className="h-4 w-4" />,
    provider: "SendGrid",
    features: ["email_delivery", "templates", "analytics", "automation"],
    pricing: { plan: "Essentials", cost: 19.95, currency: "$" },
    setup: {
      steps: [
        "Create SendGrid account",
        "Verify domain",
        "Get API key",
        "Configure templates",
      ],
      required: ["api_key", "from_email", "domain"],
      optional: ["templates", "tracking", "analytics"],
    },
  },
  {
    id: "3",
    name: "Google Analytics",
    description: "Comprehensive website and app analytics",
    category: "analytics",
    icon: <BarChart3 className="h-4 w-4" />,
    provider: "Google",
    features: ["tracking", "reports", "goals", "ecommerce"],
    pricing: { plan: "Free", cost: 0, currency: "$" },
    setup: {
      steps: [
        "Create GA account",
        "Get tracking ID",
        "Install code",
        "Configure goals",
      ],
      required: ["tracking_id", "property_id"],
      optional: ["goals", "ecommerce", "custom_dimensions"],
    },
  },
  {
    id: "4",
    name: "AWS S3 Storage",
    description: "Scalable cloud storage for files and media",
    category: "storage",
    icon: <Cloud className="h-4 w-4" />,
    provider: "Amazon",
    features: ["file_storage", "cdn", "backup", "versioning"],
    pricing: { plan: "Standard", cost: 0.023, currency: "$" },
    setup: {
      steps: [
        "Create AWS account",
        "Create S3 bucket",
        "Get credentials",
        "Configure permissions",
      ],
      required: ["access_key", "secret_key", "bucket_name", "region"],
      optional: ["cdn", "encryption", "lifecycle"],
    },
  },
  {
    id: "5",
    name: "Slack Notifications",
    description: "Team communication and notification system",
    category: "communication",
    icon: <Users className="h-4 w-4" />,
    provider: "Slack",
    features: ["notifications", "channels", "bots", "workflows"],
    pricing: { plan: "Pro", cost: 6.67, currency: "$" },
    setup: {
      steps: [
        "Create Slack app",
        "Get webhook URL",
        "Configure channels",
        "Test notifications",
      ],
      required: ["webhook_url", "channel"],
      optional: ["bot_token", "user_mentions", "custom_formatting"],
    },
  },
  {
    id: "6",
    name: "Mailchimp Marketing",
    description: "Email marketing and audience management",
    category: "marketing",
    icon: <Mail className="h-4 w-4" />,
    provider: "Mailchimp",
    features: [
      "email_campaigns",
      "audience_segmentation",
      "automation",
      "analytics",
    ],
    pricing: { plan: "Essentials", cost: 9.99, currency: "$" },
    setup: {
      steps: [
        "Create Mailchimp account",
        "Get API key",
        "Create audience",
        "Configure campaigns",
      ],
      required: ["api_key", "audience_id"],
      optional: ["templates", "automation", "segments"],
    },
  },
];

const statusColors = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  error: "bg-red-100 text-red-800",
  pending: "bg-yellow-100 text-yellow-800",
};

const categoryIcons = {
  payment: <CreditCard className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  analytics: <BarChart3 className="h-4 w-4" />,
  storage: <Cloud className="h-4 w-4" />,
  communication: <Users className="h-4 w-4" />,
  marketing: <Mail className="h-4 w-4" />,
  security: <Shield className="h-4 w-4" />,
  productivity: <Zap className="h-4 w-4" />,
};

export default function ThirdPartyIntegrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedIntegration, setSelectedIntegration] =
    useState<Integration | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [newIntegration, setNewIntegration] = useState<Partial<Integration>>(
    {}
  );

  useEffect(() => {
    fetchIntegrations();
    fetchWebhooks();
    fetchApiKeys();
  }, []);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);

      // Mock integrations data
      const mockIntegrations: Integration[] = [
        {
          id: "1",
          name: "Stripe Payment Gateway",
          description:
            "Accept payments with Stripe's secure payment processing",
          category: "payment",
          provider: "Stripe",
          status: "active",
          lastSync: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          nextSync: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
          config: {
            apiKey: "sk_test_...",
            webhookUrl: "https://api.kmmedia.com/webhooks/stripe",
            settings: {
              currency: "USD",
              country: "US",
              testMode: true,
            },
          },
          metrics: {
            requests: 1250,
            successRate: 99.2,
            avgResponseTime: 145,
            errors: 10,
          },
          features: [
            "payment_processing",
            "subscriptions",
            "refunds",
            "webhooks",
          ],
          pricing: { plan: "Standard", cost: 2.9, currency: "%" },
        },
        {
          id: "2",
          name: "SendGrid Email Service",
          description: "Reliable email delivery and marketing automation",
          category: "email",
          provider: "SendGrid",
          status: "active",
          lastSync: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          nextSync: new Date(Date.now() + 1000 * 60 * 45).toISOString(),
          config: {
            apiKey: "SG.xxx...",
            webhookUrl: "https://api.kmmedia.com/webhooks/sendgrid",
            settings: {
              fromEmail: "noreply@kmmedia.com",
              domain: "kmmedia.com",
              tracking: true,
            },
          },
          metrics: {
            requests: 850,
            successRate: 98.5,
            avgResponseTime: 89,
            errors: 13,
          },
          features: ["email_delivery", "templates", "analytics", "automation"],
          pricing: { plan: "Essentials", cost: 19.95, currency: "$" },
        },
        {
          id: "3",
          name: "Google Analytics",
          description: "Comprehensive website and app analytics",
          category: "analytics",
          provider: "Google",
          status: "active",
          lastSync: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          nextSync: new Date(Date.now() + 1000 * 60 * 55).toISOString(),
          config: {
            apiKey: "AIza...",
            webhookUrl: "https://api.kmmedia.com/webhooks/ga",
            settings: {
              trackingId: "GA-123456789",
              propertyId: "123456789",
              goals: ["course_completion", "payment_success"],
            },
          },
          metrics: {
            requests: 2100,
            successRate: 99.8,
            avgResponseTime: 67,
            errors: 4,
          },
          features: ["tracking", "reports", "goals", "ecommerce"],
          pricing: { plan: "Free", cost: 0, currency: "$" },
        },
        {
          id: "4",
          name: "AWS S3 Storage",
          description: "Scalable cloud storage for files and media",
          category: "storage",
          provider: "Amazon",
          status: "error",
          lastSync: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          config: {
            apiKey: "AKIA...",
            webhookUrl: "https://api.kmmedia.com/webhooks/s3",
            settings: {
              bucketName: "kmmedia-files",
              region: "us-east-1",
              encryption: true,
            },
          },
          metrics: {
            requests: 450,
            successRate: 85.2,
            avgResponseTime: 234,
            errors: 67,
          },
          features: ["file_storage", "cdn", "backup", "versioning"],
          pricing: { plan: "Standard", cost: 0.023, currency: "$" },
        },
        {
          id: "5",
          name: "Slack Notifications",
          description: "Team communication and notification system",
          category: "communication",
          provider: "Slack",
          status: "inactive",
          lastSync: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          config: {
            apiKey: "xoxb-...",
            webhookUrl: "https://hooks.slack.com/services/...",
            settings: {
              channel: "#notifications",
              botName: "KM Media Bot",
              mentions: true,
            },
          },
          metrics: {
            requests: 120,
            successRate: 95.0,
            avgResponseTime: 156,
            errors: 6,
          },
          features: ["notifications", "channels", "bots", "workflows"],
          pricing: { plan: "Pro", cost: 6.67, currency: "$" },
        },
      ];

      setIntegrations(mockIntegrations);
    } catch (error) {
      console.error("Error fetching integrations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWebhooks = async () => {
    try {
      // Mock webhooks data
      const mockWebhooks: Webhook[] = [
        {
          id: "1",
          name: "Stripe Payment Webhook",
          url: "https://api.kmmedia.com/webhooks/stripe",
          events: [
            "payment.succeeded",
            "payment.failed",
            "invoice.payment_succeeded",
          ],
          status: "active",
          lastTriggered: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
          successRate: 99.2,
          responseTime: 145,
        },
        {
          id: "2",
          name: "SendGrid Email Webhook",
          url: "https://api.kmmedia.com/webhooks/sendgrid",
          events: ["delivered", "bounced", "opened", "clicked"],
          status: "active",
          lastTriggered: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          successRate: 98.5,
          responseTime: 89,
        },
        {
          id: "3",
          name: "Google Analytics Webhook",
          url: "https://api.kmmedia.com/webhooks/ga",
          events: ["goal_completion", "ecommerce_purchase"],
          status: "error",
          lastTriggered: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          successRate: 85.0,
          responseTime: 234,
        },
      ];

      setWebhooks(mockWebhooks);
    } catch (error) {
      console.error("Error fetching webhooks:", error);
    }
  };

  const fetchApiKeys = async () => {
    try {
      // Mock API keys data
      const mockApiKeys: ApiKey[] = [
        {
          id: "1",
          name: "Stripe API Key",
          key: "sk_test_...",
          permissions: ["payments", "refunds", "subscriptions"],
          status: "active",
          createdAt: new Date(
            Date.now() - 1000 * 60 * 60 * 24 * 30
          ).toISOString(),
          lastUsed: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          usage: { requests: 1250, limit: 10000 },
        },
        {
          id: "2",
          name: "SendGrid API Key",
          key: "SG.xxx...",
          permissions: ["email", "templates", "analytics"],
          status: "active",
          createdAt: new Date(
            Date.now() - 1000 * 60 * 60 * 24 * 15
          ).toISOString(),
          lastUsed: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          usage: { requests: 850, limit: 5000 },
        },
        {
          id: "3",
          name: "Google Analytics API Key",
          key: "AIza...",
          permissions: ["analytics", "reporting"],
          status: "active",
          createdAt: new Date(
            Date.now() - 1000 * 60 * 60 * 24 * 7
          ).toISOString(),
          lastUsed: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          usage: { requests: 2100, limit: 25000 },
        },
        {
          id: "4",
          name: "AWS S3 API Key",
          key: "AKIA...",
          permissions: ["storage", "files"],
          status: "expired",
          createdAt: new Date(
            Date.now() - 1000 * 60 * 60 * 24 * 60
          ).toISOString(),
          lastUsed: new Date(
            Date.now() - 1000 * 60 * 60 * 24 * 2
          ).toISOString(),
          usage: { requests: 450, limit: 1000 },
        },
      ];

      setApiKeys(mockApiKeys);
    } catch (error) {
      console.error("Error fetching API keys:", error);
    }
  };

  const testIntegration = async (integrationId: string) => {
    try {
      // Mock testing integration
      console.log(`Testing integration: ${integrationId}`);
      // In real implementation, this would test the integration
    } catch (error) {
      console.error("Error testing integration:", error);
    }
  };

  const syncIntegration = async (integrationId: string) => {
    try {
      // Mock syncing integration
      console.log(`Syncing integration: ${integrationId}`);
      // In real implementation, this would sync the integration
    } catch (error) {
      console.error("Error syncing integration:", error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "inactive":
        return <XCircle className="h-4 w-4 text-gray-600" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
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
            Third-Party Integrations
          </h1>
          <p className="text-gray-600">
            Manage external service connections and API integrations
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={fetchIntegrations}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Integration
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Add New Integration</DialogTitle>
                <DialogDescription>
                  Choose from our pre-configured integration templates or create
                  a custom one.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {integrationTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setNewIntegration({
                        name: template.name,
                        description: template.description,
                        category: template.category as any,
                        provider: template.provider,
                        features: template.features,
                        pricing: template.pricing,
                      });
                      setShowCreateDialog(false);
                      setShowConfigDialog(true);
                    }}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      {template.icon}
                      <h3 className="font-medium text-gray-900">
                        {template.name}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {template.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge className="bg-blue-100 text-blue-800">
                        {template.category}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {template.pricing.cost}
                        {template.pricing.currency}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Integration Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Integrations
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {integrations.length}
                </p>
                <p className="text-xs text-gray-500">All services</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Link className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {integrations.filter((i) => i.status === "active").length}
                </p>
                <p className="text-xs text-gray-500">Working properly</p>
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
                <p className="text-sm font-medium text-gray-600">Errors</p>
                <p className="text-2xl font-bold text-red-600">
                  {integrations.filter((i) => i.status === "error").length}
                </p>
                <p className="text-xs text-gray-500">Need attention</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Webhooks</p>
                <p className="text-2xl font-bold text-purple-600">
                  {webhooks.length}
                </p>
                <p className="text-xs text-gray-500">Event handlers</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Integrations */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Integrations */}
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Recent Integrations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {integrations.slice(0, 3).map((integration) => (
                  <div
                    key={integration.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      {categoryIcons[integration.category]}
                      <div>
                        <p className="font-medium text-gray-900">
                          {integration.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {integration.provider}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={statusColors[integration.status]}>
                        {integration.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Integration Health */}
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Integration Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {integrations.map((integration) => (
                  <div key={integration.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        {integration.name}
                      </span>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(integration.status)}
                        <span className="text-sm text-gray-600">
                          {integration.metrics.successRate}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          integration.metrics.successRate >= 95
                            ? "bg-green-500"
                            : integration.metrics.successRate >= 85
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${integration.metrics.successRate}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            {integrations.map((integration) => (
              <Card
                key={integration.id}
                className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {categoryIcons[integration.category]}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {integration.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {integration.description}
                        </p>
                        <p className="text-xs text-gray-400">
                          {integration.provider} • Last sync:{" "}
                          {new Date(integration.lastSync).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={statusColors[integration.status]}>
                        {integration.status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testIntegration(integration.id)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Test
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => syncIntegration(integration.id)}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Sync
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Requests</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {integration.metrics.requests}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Success Rate</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {integration.metrics.successRate}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Avg Response</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {integration.metrics.avgResponseTime}ms
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Errors</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {integration.metrics.errors}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500">
                        Features: {integration.features.join(", ")}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {integration.pricing.cost}
                        {integration.pricing.currency}
                      </span>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            {webhooks.map((webhook) => (
              <Card
                key={webhook.id}
                className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {webhook.name}
                      </h3>
                      <p className="text-sm text-gray-500">{webhook.url}</p>
                      <p className="text-xs text-gray-400">
                        Last triggered:{" "}
                        {new Date(webhook.lastTriggered).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={statusColors[webhook.status]}>
                        {webhook.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Play className="h-4 w-4 mr-2" />
                        Test
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Events</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {webhook.events.length}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Success Rate</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {webhook.successRate}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Response Time</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {webhook.responseTime}ms
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="text-lg font-semibold text-gray-900 capitalize">
                        {webhook.status}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Events:</span>
                      <div className="flex flex-wrap gap-1">
                        {webhook.events.map((event, index) => (
                          <Badge
                            key={index}
                            className="bg-blue-100 text-blue-800 text-xs"
                          >
                            {event}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Logs
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="api-keys" className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            {apiKeys.map((apiKey) => (
              <Card
                key={apiKey.id}
                className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {apiKey.name}
                      </h3>
                      <p className="text-sm text-gray-500">{apiKey.key}</p>
                      <p className="text-xs text-gray-400">
                        Created:{" "}
                        {new Date(apiKey.createdAt).toLocaleDateString()} • Last
                        used: {new Date(apiKey.lastUsed).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={statusColors[apiKey.status]}>
                        {apiKey.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Key className="h-4 w-4 mr-2" />
                        Regenerate
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Requests</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {apiKey.usage.requests}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Limit</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {apiKey.usage.limit}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Usage</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {(
                          (apiKey.usage.requests / apiKey.usage.limit) *
                          100
                        ).toFixed(1)}
                        %
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Permissions</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {apiKey.permissions.length}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        Permissions:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {apiKey.permissions.map((permission, index) => (
                          <Badge
                            key={index}
                            className="bg-green-100 text-green-800 text-xs"
                          >
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Usage
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
