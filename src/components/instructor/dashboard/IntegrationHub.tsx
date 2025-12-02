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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Zap,
  Video,
  FileText,
  Calendar,
  Mail,
  Cloud,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Plus,
  Trash2,
  Edit,
  RefreshCw,
} from "lucide-react";

interface Integration {
  id: string;
  name: string;
  type:
    | "VIDEO_CONFERENCING"
    | "CLOUD_STORAGE"
    | "CALENDAR"
    | "EMAIL"
    | "ANALYTICS"
    | "ASSESSMENT"
    | "COMMUNICATION";
  provider: string;
  status: "CONNECTED" | "DISCONNECTED" | "PENDING" | "ERROR";
  lastSync: string;
  features: string[];
  icon: string;
  description: string;
  setupUrl?: string;
  settings?: Record<string, any>;
}

interface IntegrationUsage {
  integrationId: string;
  name: string;
  usageCount: number;
  lastUsed: string;
  features: string[];
}

interface IntegrationStats {
  totalIntegrations: number;
  activeIntegrations: number;
  totalUsage: number;
  mostUsed: string;
  lastSync: string;
}

export default function IntegrationHub() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [usage, setUsage] = useState<IntegrationUsage[]>([]);
  const [stats, setStats] = useState<IntegrationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [selectedIntegration, setSelectedIntegration] =
    useState<Integration | null>(null);
  const [setupData, setSetupData] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchIntegrationData();
  }, []);

  const fetchIntegrationData = async () => {
    try {
      // Check if we're on the client side
      if (typeof window === "undefined") {
        return;
      }

      const [integrationsResponse, usageResponse, statsResponse] =
        await Promise.all([
          fetch("/api/instructor/integrations", { credentials: "include" }),
          fetch("/api/instructor/integrations/usage", { credentials: "include" }),
          fetch("/api/instructor/integrations/stats", { credentials: "include" }),
        ]);

      if (integrationsResponse.success)
        setIntegrations(integrationsResponse.data);
      if (usageResponse.success) setUsage(usageResponse.data);
      if (statsResponse.success) setStats(statsResponse.data);
    } catch (error) {
      console.error("Error fetching integration data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectIntegration = async (integrationId: string) => {
    try {
      const response = await fetch(
        `/api/instructor/integrations/${integrationId}/connect`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(setupData),
        }
      );

      if (response.success) {
        setShowSetupDialog(false);
        setSetupData({});
        fetchIntegrationData();
      }
    } catch (error) {
      console.error("Error connecting integration:", error);
    }
  };

  const handleDisconnectIntegration = async (integrationId: string) => {
    try {
      const response = await fetch(
        `/api/instructor/integrations/${integrationId}/disconnect`,
        {
          method: "POST",
        }
      );

      if (response.success) {
        fetchIntegrationData();
      }
    } catch (error) {
      console.error("Error disconnecting integration:", error);
    }
  };

  const handleSyncIntegration = async (integrationId: string) => {
    try {
      const response = await fetch(
        `/api/instructor/integrations/${integrationId}/sync`,
        {
          method: "POST",
        }
      );

      if (response.success) {
        fetchIntegrationData();
      }
    } catch (error) {
      console.error("Error syncing integration:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONNECTED":
        return "bg-green-100 text-green-800";
      case "DISCONNECTED":
        return "bg-gray-100 text-gray-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "ERROR":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "CONNECTED":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "DISCONNECTED":
        return <XCircle className="h-4 w-4 text-gray-600" />;
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "ERROR":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "VIDEO_CONFERENCING":
        return <Video className="h-5 w-5 text-blue-600" />;
      case "CLOUD_STORAGE":
        return <Cloud className="h-5 w-5 text-purple-600" />;
      case "CALENDAR":
        return <Calendar className="h-5 w-5 text-green-600" />;
      case "EMAIL":
        return <Mail className="h-5 w-5 text-red-600" />;
      case "ANALYTICS":
        return <FileText className="h-5 w-5 text-orange-600" />;
      case "ASSESSMENT":
        return <FileText className="h-5 w-5 text-indigo-600" />;
      case "COMMUNICATION":
        return <Mail className="h-5 w-5 text-teal-600" />;
      default:
        return <Zap className="h-5 w-5 text-gray-600" />;
    }
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
            <Zap className="h-5 w-5 text-blue-600" />
            Integration Hub
          </CardTitle>
          <CardDescription>
            Connect and manage third-party tools to enhance your teaching
            experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Integrations
                      </p>
                      <p className="text-2xl font-bold">
                        {stats.totalIntegrations}
                      </p>
                    </div>
                    <Zap className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Active
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        {stats.activeIntegrations}
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
                        Total Usage
                      </p>
                      <p className="text-2xl font-bold">{stats.totalUsage}</p>
                    </div>
                    <RefreshCw className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Most Used
                      </p>
                      <p className="text-lg font-bold">{stats.mostUsed}</p>
                    </div>
                    <ExternalLink className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Available Integrations</TabsTrigger>
              <TabsTrigger value="connected">Connected</TabsTrigger>
              <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {integrations.map((integration) => (
                  <Card key={integration.id} className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(integration.type)}
                        <div>
                          <h4 className="font-medium">{integration.name}</h4>
                          <p className="text-sm text-gray-600">
                            {integration.provider}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(integration.status)}>
                        {integration.status}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">
                      {integration.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <p className="text-sm font-medium">Features:</p>
                      <div className="flex flex-wrap gap-1">
                        {integration.features.map((feature, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-xs"
                          >
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(integration.status)}
                        <span className="text-sm text-gray-600">
                          {integration.status === "CONNECTED"
                            ? "Connected"
                            : "Not Connected"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {integration.status === "CONNECTED" ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleSyncIntegration(integration.id)
                              }
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleDisconnectIntegration(integration.id)
                              }
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedIntegration(integration);
                              setShowSetupDialog(true);
                            }}
                          >
                            Connect
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="connected" className="space-y-4">
              <div className="space-y-4">
                {integrations
                  .filter((i) => i.status === "CONNECTED")
                  .map((integration) => (
                    <Card key={integration.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getTypeIcon(integration.type)}
                          <div>
                            <h4 className="font-medium">{integration.name}</h4>
                            <p className="text-sm text-gray-600">
                              Last sync:{" "}
                              {new Date(integration.lastSync).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleSyncIntegration(integration.id)
                            }
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Sync
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleDisconnectIntegration(integration.id)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="usage" className="space-y-4">
              <div className="space-y-4">
                {usage.map((item) => (
                  <Card key={item.integrationId} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Zap className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-gray-600">
                            Used {item.usageCount} times | Last used:{" "}
                            {new Date(item.lastUsed).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{item.usageCount}</p>
                        <p className="text-sm text-gray-600">uses</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm font-medium mb-2">Features Used:</p>
                      <div className="flex flex-wrap gap-1">
                        {item.features.map((feature, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-xs"
                          >
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Integration Settings</CardTitle>
                  <CardDescription>
                    Configure global settings for your integrations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="autoSync">Auto-sync Frequency</Label>
                    <select className="w-full p-2 border rounded-md">
                      <option value="realtime">Real-time</option>
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="notifications">
                      Notification Preferences
                    </Label>
                    <div className="space-y-2 mt-2">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked />
                        <span className="text-sm">
                          Sync completion notifications
                        </span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked />
                        <span className="text-sm">
                          Integration error alerts
                        </span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" />
                        <span className="text-sm">Usage analytics reports</span>
                      </label>
                    </div>
                  </div>
                  <Button>
                    <Settings className="h-4 w-4 mr-2" />
                    Save Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Setup Dialog */}
      <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect {selectedIntegration?.name}</DialogTitle>
          </DialogHeader>
          {selectedIntegration && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                {selectedIntegration.description}
              </p>

              {selectedIntegration.name === "Zoom" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      value={setupData.apiKey || ""}
                      onChange={(e) =>
                        setSetupData((prev) => ({
                          ...prev,
                          apiKey: e.target.value,
                        }))
                      }
                      placeholder="Enter your Zoom API key"
                    />
                  </div>
                  <div>
                    <Label htmlFor="apiSecret">API Secret</Label>
                    <Input
                      id="apiSecret"
                      type="password"
                      value={setupData.apiSecret || ""}
                      onChange={(e) =>
                        setSetupData((prev) => ({
                          ...prev,
                          apiSecret: e.target.value,
                        }))
                      }
                      placeholder="Enter your Zoom API secret"
                    />
                  </div>
                </div>
              )}

              {selectedIntegration.name === "Google Drive" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="clientId">Client ID</Label>
                    <Input
                      id="clientId"
                      value={setupData.clientId || ""}
                      onChange={(e) =>
                        setSetupData((prev) => ({
                          ...prev,
                          clientId: e.target.value,
                        }))
                      }
                      placeholder="Enter your Google Client ID"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientSecret">Client Secret</Label>
                    <Input
                      id="clientSecret"
                      type="password"
                      value={setupData.clientSecret || ""}
                      onChange={(e) =>
                        setSetupData((prev) => ({
                          ...prev,
                          clientSecret: e.target.value,
                        }))
                      }
                      placeholder="Enter your Google Client Secret"
                    />
                  </div>
                </div>
              )}

              {selectedIntegration.name === "Google Calendar" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="calendarId">Calendar ID</Label>
                    <Input
                      id="calendarId"
                      value={setupData.calendarId || ""}
                      onChange={(e) =>
                        setSetupData((prev) => ({
                          ...prev,
                          calendarId: e.target.value,
                        }))
                      }
                      placeholder="Enter your Google Calendar ID"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowSetupDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() =>
                    handleConnectIntegration(selectedIntegration.id)
                  }
                >
                  Connect
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
