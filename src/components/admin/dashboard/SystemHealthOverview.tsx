"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Monitor,
  MemoryStick,
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
  description: string;
}

interface ServiceStatus {
  id: string;
  name: string;
  status: "online" | "offline" | "degraded";
  uptime: number;
  responseTime: number;
  lastCheck: string;
  description: string;
  endpoint?: string;
}

interface SystemAlert {
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

export default function SystemHealthOverview() {
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);
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
          value: Math.floor(Math.random() * 30) + 40,
          unit: "%",
          status: "healthy",
          trend: "stable",
          threshold: { warning: 70, critical: 90 },
          lastUpdated: new Date().toISOString(),
          description: "Overall CPU utilization across all cores",
        },
        {
          id: "2",
          name: "Memory Usage",
          value: Math.floor(Math.random() * 25) + 60,
          unit: "%",
          status: Math.random() > 0.7 ? "warning" : "healthy",
          trend: "up",
          threshold: { warning: 75, critical: 90 },
          lastUpdated: new Date().toISOString(),
          description: "RAM utilization including cache and buffers",
        },
        {
          id: "3",
          name: "Disk Usage",
          value: Math.floor(Math.random() * 15) + 75,
          unit: "%",
          status: "warning",
          trend: "up",
          threshold: { warning: 80, critical: 95 },
          lastUpdated: new Date().toISOString(),
          description: "Primary disk storage utilization",
        },
        {
          id: "4",
          name: "Network Latency",
          value: Math.floor(Math.random() * 20) + 5,
          unit: "ms",
          status: "healthy",
          trend: "down",
          threshold: { warning: 50, critical: 100 },
          lastUpdated: new Date().toISOString(),
          description: "Average network response time",
        },
        {
          id: "5",
          name: "Database Connections",
          value: Math.floor(Math.random() * 30) + 15,
          unit: "connections",
          status: "healthy",
          trend: "stable",
          threshold: { warning: 80, critical: 100 },
          lastUpdated: new Date().toISOString(),
          description: "Active database connection pool usage",
        },
        {
          id: "6",
          name: "API Response Time",
          value: Math.floor(Math.random() * 100) + 100,
          unit: "ms",
          status: "healthy",
          trend: "down",
          threshold: { warning: 500, critical: 1000 },
          lastUpdated: new Date().toISOString(),
          description: "Average API endpoint response time",
        },
      ];

      const mockServices: ServiceStatus[] = [
        {
          id: "1",
          name: "Web Application",
          status: "online",
          uptime: 99.9,
          responseTime: Math.floor(Math.random() * 50) + 30,
          lastCheck: new Date().toISOString(),
          description: "Main Next.js application server",
          endpoint: "https://app.kmmedia.com",
        },
        {
          id: "2",
          name: "Database Server",
          status: "online",
          uptime: 99.8,
          responseTime: Math.floor(Math.random() * 20) + 5,
          lastCheck: new Date().toISOString(),
          description: "PostgreSQL primary database",
        },
        {
          id: "3",
          name: "Payment Gateway",
          status: Math.random() > 0.8 ? "degraded" : "online",
          uptime: 98.5,
          responseTime: Math.floor(Math.random() * 200) + 150,
          lastCheck: new Date().toISOString(),
          description: "Paystack payment processing service",
          endpoint: "https://api.paystack.co",
        },
        {
          id: "4",
          name: "Email Service",
          status: "online",
          uptime: 99.7,
          responseTime: Math.floor(Math.random() * 100) + 50,
          lastCheck: new Date().toISOString(),
          description: "SMTP email delivery service",
        },
        {
          id: "5",
          name: "File Storage",
          status: "online",
          uptime: 99.9,
          responseTime: Math.floor(Math.random() * 50) + 10,
          lastCheck: new Date().toISOString(),
          description: "Cloud file storage and CDN",
        },
        {
          id: "6",
          name: "Redis Cache",
          status: "online",
          uptime: 99.95,
          responseTime: Math.floor(Math.random() * 10) + 2,
          lastCheck: new Date().toISOString(),
          description: "In-memory caching service",
        },
      ];

      const mockAlerts: SystemAlert[] = [
        {
          id: "1",
          type: "performance",
          severity: "medium",
          title: "High Disk Usage",
          description:
            "Disk usage has exceeded 80% threshold on primary storage",
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          resolved: false,
          service: "File Storage",
        },
        {
          id: "2",
          type: "system",
          severity: "low",
          title: "Scheduled Maintenance",
          description: "Database maintenance scheduled for tonight at 2:00 AM",
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          resolved: false,
        },
        {
          id: "3",
          type: "security",
          severity: "high",
          title: "Multiple Failed Login Attempts",
          description:
            "Detected 15 failed login attempts from IP 192.168.1.100",
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          resolved: true,
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

  const getMetricIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case "cpu usage":
        return <Cpu className="h-5 w-5" />;
      case "memory usage":
        return <MemoryStick className="h-5 w-5" />;
      case "disk usage":
        return <HardDrive className="h-5 w-5" />;
      case "network latency":
        return <Wifi className="h-5 w-5" />;
      case "database connections":
        return <Database className="h-5 w-5" />;
      case "api response time":
        return <Zap className="h-5 w-5" />;
      default:
        return <Monitor className="h-5 w-5" />;
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

  const getOverallSystemHealth = () => {
    const criticalMetrics = metrics.filter(
      (m) => m.status === "critical"
    ).length;
    const warningMetrics = metrics.filter((m) => m.status === "warning").length;
    const offlineServices = services.filter(
      (s) => s.status === "offline"
    ).length;
    const criticalAlerts = getCriticalAlerts().length;

    if (criticalMetrics > 0 || offlineServices > 0 || criticalAlerts > 0) {
      return {
        status: "critical",
        message: "System requires immediate attention",
      };
    }
    if (warningMetrics > 0) {
      return { status: "warning", message: "System performance degraded" };
    }
    return { status: "healthy", message: "All systems operational" };
  };

  const systemHealth = getOverallSystemHealth();

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
          <h2 className="text-2xl font-bold text-gray-900">
            System Health Overview
          </h2>
          <p className="text-gray-600">
            Real-time system monitoring and performance metrics
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

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card
          className={`${
            systemHealth.status === "healthy"
              ? "bg-gradient-to-br from-green-50 to-green-100 border-green-200"
              : systemHealth.status === "warning"
              ? "bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200"
              : "bg-gradient-to-br from-red-50 to-red-100 border-red-200"
          }`}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${
                    systemHealth.status === "healthy"
                      ? "text-green-600"
                      : systemHealth.status === "warning"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  System Status
                </p>
                <p
                  className={`text-2xl font-bold ${
                    systemHealth.status === "healthy"
                      ? "text-green-900"
                      : systemHealth.status === "warning"
                      ? "text-yellow-900"
                      : "text-red-900"
                  }`}
                >
                  {systemHealth.status === "healthy"
                    ? "Healthy"
                    : systemHealth.status === "warning"
                    ? "Warning"
                    : "Critical"}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {systemHealth.message}
                </p>
              </div>
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  systemHealth.status === "healthy"
                    ? "bg-green-200"
                    : systemHealth.status === "warning"
                    ? "bg-yellow-200"
                    : "bg-red-200"
                }`}
              >
                {getStatusIcon(systemHealth.status)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">
                  Active Alerts
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {getUnresolvedAlerts().length}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {getCriticalAlerts().length} critical
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Uptime</p>
                <p className="text-2xl font-bold text-purple-900">99.8%</p>
                <p className="text-xs text-gray-600 mt-1">Last 30 days</p>
              </div>
              <div className="w-12 h-12 bg-purple-200 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">
                  Avg Response
                </p>
                <p className="text-2xl font-bold text-orange-900">145ms</p>
                <p className="text-xs text-gray-600 mt-1">API endpoints</p>
              </div>
              <div className="w-12 h-12 bg-orange-200 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric) => (
          <Card
            key={metric.id}
            className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      metric.status === "healthy"
                        ? "bg-green-100"
                        : metric.status === "warning"
                        ? "bg-yellow-100"
                        : "bg-red-100"
                    }`}
                  >
                    {getMetricIcon(metric.name)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {metric.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {metric.description}
                    </p>
                  </div>
                </div>
                {getStatusIcon(metric.status)}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-3xl font-bold ${getMetricColor(metric)}`}
                  >
                    {metric.value}
                    {metric.unit}
                  </span>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(metric.trend)}
                    <Badge className={statusColors[metric.status]}>
                      {metric.status}
                    </Badge>
                  </div>
                </div>

                <Progress value={Math.min(metric.value, 100)} className="h-2" />

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

      {/* Services Status */}
      <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Server className="h-5 w-5" />
            Service Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="flex items-center justify-between p-4 rounded-lg bg-gray-50"
            >
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
                  {getStatusIcon(service.status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900">
                      {service.name}
                    </h3>
                    <Badge className={statusColors[service.status]}>
                      {service.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{service.description}</p>
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
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Test
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Alerts */}
      {getUnresolvedAlerts().length > 0 && (
        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Active Alerts ({getUnresolvedAlerts().length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {getUnresolvedAlerts()
              .slice(0, 5)
              .map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start justify-between p-4 rounded-lg bg-gray-50"
                >
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
                        <h3 className="font-semibold text-gray-900">
                          {alert.title}
                        </h3>
                        <Badge className={severityColors[alert.severity]}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {alert.description}
                      </p>
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
                    <Button size="sm">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Resolve
                    </Button>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
