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
import {
  Activity,
  Server,
  Database,
  Cpu,
  HardDrive,
  Wifi,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock,
  Zap,
  Shield,
  Globe,
} from "lucide-react";

interface SystemMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: "healthy" | "warning" | "critical";
  trend: "up" | "down" | "stable";
  threshold: {
    warning: number;
    critical: number;
  };
  lastUpdated: string;
}

interface ServiceStatus {
  id: string;
  name: string;
  status: "online" | "offline" | "degraded";
  uptime: number;
  responseTime: number;
  lastCheck: string;
  description: string;
}

interface Alert {
  id: string;
  type: "system" | "performance" | "security" | "maintenance";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  timestamp: string;
  resolved: boolean;
  service?: string;
}

const statusColors = {
  healthy: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  critical: "bg-red-100 text-red-800",
  online: "bg-green-100 text-green-800",
  offline: "bg-red-100 text-red-800",
  degraded: "bg-yellow-100 text-yellow-800",
};

const severityColors = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

export default function SystemHealth() {
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("1h");

  useEffect(() => {
    fetchSystemData();
    const interval = setInterval(fetchSystemData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchSystemData = async () => {
    try {
      setLoading(true);

      // Mock system data - replace with actual monitoring API
      const mockMetrics: SystemMetric[] = [
        {
          id: "1",
          name: "CPU Usage",
          value: 45,
          unit: "%",
          status: "healthy",
          trend: "stable",
          threshold: { warning: 70, critical: 90 },
          lastUpdated: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Memory Usage",
          value: 68,
          unit: "%",
          status: "warning",
          trend: "up",
          threshold: { warning: 75, critical: 90 },
          lastUpdated: new Date().toISOString(),
        },
        {
          id: "3",
          name: "Disk Usage",
          value: 82,
          unit: "%",
          status: "warning",
          trend: "up",
          threshold: { warning: 80, critical: 95 },
          lastUpdated: new Date().toISOString(),
        },
        {
          id: "4",
          name: "Network Latency",
          value: 12,
          unit: "ms",
          status: "healthy",
          trend: "down",
          threshold: { warning: 50, critical: 100 },
          lastUpdated: new Date().toISOString(),
        },
        {
          id: "5",
          name: "Database Connections",
          value: 23,
          unit: "connections",
          status: "healthy",
          trend: "stable",
          threshold: { warning: 80, critical: 100 },
          lastUpdated: new Date().toISOString(),
        },
        {
          id: "6",
          name: "API Response Time",
          value: 145,
          unit: "ms",
          status: "healthy",
          trend: "down",
          threshold: { warning: 500, critical: 1000 },
          lastUpdated: new Date().toISOString(),
        },
      ];

      const mockServices: ServiceStatus[] = [
        {
          id: "1",
          name: "Web Server",
          status: "online",
          uptime: 99.9,
          responseTime: 45,
          lastCheck: new Date().toISOString(),
          description: "Main web application server",
        },
        {
          id: "2",
          name: "Database",
          status: "online",
          uptime: 99.8,
          responseTime: 12,
          lastCheck: new Date().toISOString(),
          description: "Primary database server",
        },
        {
          id: "3",
          name: "Payment Gateway",
          status: "degraded",
          uptime: 98.5,
          responseTime: 250,
          lastCheck: new Date().toISOString(),
          description: "Third-party payment processing",
        },
        {
          id: "4",
          name: "Email Service",
          status: "online",
          uptime: 99.7,
          responseTime: 89,
          lastCheck: new Date().toISOString(),
          description: "Email delivery service",
        },
        {
          id: "5",
          name: "File Storage",
          status: "online",
          uptime: 99.9,
          responseTime: 23,
          lastCheck: new Date().toISOString(),
          description: "Cloud file storage service",
        },
      ];

      const mockAlerts: Alert[] = [
        {
          id: "1",
          type: "performance",
          severity: "medium",
          title: "High Memory Usage",
          description: "Memory usage has exceeded 75% threshold",
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          resolved: false,
          service: "Web Server",
        },
        {
          id: "2",
          type: "system",
          severity: "low",
          title: "Scheduled Maintenance",
          description: "Database maintenance scheduled for tonight",
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          resolved: false,
        },
        {
          id: "3",
          type: "security",
          severity: "high",
          title: "Failed Login Attempts",
          description: "Multiple failed login attempts detected",
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          resolved: true,
        },
        {
          id: "4",
          type: "performance",
          severity: "critical",
          title: "Payment Gateway Slow",
          description: "Payment gateway response time exceeds 200ms",
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          resolved: false,
          service: "Payment Gateway",
        },
      ];

      setMetrics(mockMetrics);
      setServices(mockServices);
      setAlerts(mockAlerts);
    } catch (error) {
      console.error("Error fetching system data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
      case "online":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "warning":
      case "degraded":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "critical":
      case "offline":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getMetricColor = (metric: SystemMetric) => {
    if (metric.value >= metric.threshold.critical) return "text-red-600";
    if (metric.value >= metric.threshold.warning) return "text-yellow-600";
    return "text-green-600";
  };

  const getUnresolvedAlerts = () => {
    return alerts.filter((alert) => !alert.resolved);
  };

  const getCriticalAlerts = () => {
    return alerts.filter(
      (alert) => alert.severity === "critical" && !alert.resolved
    );
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
          <h1 className="text-2xl font-bold text-gray-900">System Health</h1>
          <p className="text-gray-600">
            Real-time monitoring of system performance and services
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="6h">Last 6 Hours</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchSystemData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  System Status
                </p>
                <p className="text-2xl font-bold text-green-600">Healthy</p>
                <p className="text-xs text-gray-500">All systems operational</p>
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
                  Active Alerts
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {getUnresolvedAlerts().length}
                </p>
                <p className="text-xs text-gray-500">
                  {getCriticalAlerts().length} critical
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
                <p className="text-sm font-medium text-gray-600">Uptime</p>
                <p className="text-2xl font-bold text-gray-900">99.9%</p>
                <p className="text-xs text-gray-500">Last 30 days</p>
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
                  Response Time
                </p>
                <p className="text-2xl font-bold text-gray-900">145ms</p>
                <p className="text-xs text-gray-500">Average</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Monitoring */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Key Metrics */}
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Key Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {metrics.slice(0, 4).map((metric) => (
                  <div key={metric.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">
                        {metric.name}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-lg font-semibold ${getMetricColor(
                            metric
                          )}`}
                        >
                          {metric.value}
                          {metric.unit}
                        </span>
                        {getTrendIcon(metric.trend)}
                      </div>
                    </div>
                    <Progress
                      value={metric.value}
                      className="h-2"
                      style={{
                        background:
                          metric.value >= metric.threshold.critical
                            ? "#ef4444"
                            : metric.value >= metric.threshold.warning
                            ? "#f59e0b"
                            : "#10b981",
                      }}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Service Status */}
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Service Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(service.status)}
                      <div>
                        <p className="font-medium text-gray-900">
                          {service.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {service.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={statusColors[service.status]}>
                        {service.status}
                      </Badge>
                      <p className="text-sm text-gray-500 mt-1">
                        {service.responseTime}ms
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {metrics.map((metric) => (
              <Card
                key={metric.id}
                className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {metric.name}
                    </h3>
                    {getStatusIcon(metric.status)}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-bold text-gray-900">
                        {metric.value}
                        {metric.unit}
                      </span>
                      {getTrendIcon(metric.trend)}
                    </div>
                    <Progress value={metric.value} className="h-2" />
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>
                        Warning: {metric.threshold.warning}
                        {metric.unit}
                      </span>
                      <span>
                        Critical: {metric.threshold.critical}
                        {metric.unit}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Last updated:{" "}
                      {new Date(metric.lastUpdated).toLocaleTimeString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          {services.map((service) => (
            <Card
              key={service.id}
              className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        service.status === "online"
                          ? "bg-green-100"
                          : service.status === "degraded"
                          ? "bg-yellow-100"
                          : "bg-red-100"
                      }`}
                    >
                      {service.status === "online" ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : service.status === "degraded" ? (
                        <AlertTriangle className="h-6 w-6 text-yellow-600" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {service.name}
                      </h3>
                      <p className="text-gray-600">{service.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <span>Uptime: {service.uptime}%</span>
                        <span>Response: {service.responseTime}ms</span>
                        <span>
                          Last Check:{" "}
                          {new Date(service.lastCheck).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={statusColors[service.status]}>
                      {service.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Test
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          {alerts.map((alert) => (
            <Card
              key={alert.id}
              className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        alert.severity === "critical"
                          ? "bg-red-100"
                          : alert.severity === "high"
                          ? "bg-orange-100"
                          : alert.severity === "medium"
                          ? "bg-yellow-100"
                          : "bg-blue-100"
                      }`}
                    >
                      {alert.severity === "critical" ? (
                        <XCircle className="h-5 w-5 text-red-600" />
                      ) : alert.severity === "high" ? (
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                      ) : alert.severity === "medium" ? (
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      ) : (
                        <Activity className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {alert.title}
                        </h3>
                        <Badge className={severityColors[alert.severity]}>
                          {alert.severity}
                        </Badge>
                        {alert.resolved && (
                          <Badge className="bg-green-100 text-green-800">
                            Resolved
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{alert.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Type: {alert.type}</span>
                        {alert.service && <span>Service: {alert.service}</span>}
                        <span>
                          Time: {new Date(alert.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!alert.resolved && (
                      <Button size="sm">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Resolve
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <Activity className="h-4 w-4 mr-2" />
                      Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}


