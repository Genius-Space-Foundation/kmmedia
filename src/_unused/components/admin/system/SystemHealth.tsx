"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Server,
  Database,
  Cpu,
  HardDrive,
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Zap,
  Cloud,
  Wifi,
} from "lucide-react";

interface SystemHealth {
  database: {
    status: "healthy" | "warning" | "critical";
    responseTime: number;
    connections: number;
    maxConnections: number;
  };
  server: {
    status: "healthy" | "warning" | "critical";
    uptime: number;
    memory: {
      used: number;
      total: number;
    };
    cpu: {
      usage: number;
    };
  };
  storage: {
    used: number;
    total: number;
    status: "healthy" | "warning" | "critical";
  };
  api: {
    status: "healthy" | "warning" | "critical";
    averageResponseTime: number;
    requests24h: number;
    errors24h: number;
  };
}

export default function SystemHealth() {
  const [health, setHealth] = useState<SystemHealth>({
    database: {
      status: "healthy",
      responseTime: 45,
      connections: 12,
      maxConnections: 100,
    },
    server: {
      status: "healthy",
      uptime: 156000,
      memory: {
        used: 2.4,
        total: 8,
      },
      cpu: {
        usage: 35,
      },
    },
    storage: {
      used: 45,
      total: 200,
      status: "healthy",
    },
    api: {
      status: "healthy",
      averageResponseTime: 125,
      requests24h: 15420,
      errors24h: 23,
    },
  });
  const [loading, setLoading] = useState(false);

  const refreshHealthStatus = async () => {
    setLoading(true);
    try {
      // TODO: Implement actual health check API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Update with real data
    } catch (error) {
      console.error("Error fetching health status:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshHealthStatus();
    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshHealthStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "critical":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="h-8 w-8" />
            System Health
          </h2>
          <p className="text-gray-600 mt-1">
            Monitor system performance and health metrics
          </p>
        </div>
        <Button onClick={refreshHealthStatus} disabled={loading}>
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh Status
        </Button>
      </div>

      {/* Overall Status */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">System Status</h3>
              <p className="text-gray-600">All systems operational</p>
            </div>
            <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">
              <CheckCircle className="h-5 w-5 mr-2" />
              Healthy
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Component Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Database */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database
              </CardTitle>
              {getStatusIcon(health.database.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Connections</span>
                <span className="font-medium">
                  {health.database.connections} /{" "}
                  {health.database.maxConnections}
                </span>
              </div>
              <Progress
                value={
                  (health.database.connections /
                    health.database.maxConnections) *
                  100
                }
              />
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Response Time</span>
              <span className="text-sm font-medium">
                {health.database.responseTime}ms
              </span>
            </div>
            <Badge className={getStatusColor(health.database.status)}>
              {health.database.status.toUpperCase()}
            </Badge>
          </CardContent>
        </Card>

        {/* Server */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Server
              </CardTitle>
              {getStatusIcon(health.server.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Memory Usage</span>
                <span className="font-medium">
                  {health.server.memory.used}GB / {health.server.memory.total}GB
                </span>
              </div>
              <Progress
                value={
                  (health.server.memory.used / health.server.memory.total) * 100
                }
              />
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">CPU Usage</span>
              <span className="text-sm font-medium">
                {health.server.cpu.usage}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Uptime</span>
              <span className="text-sm font-medium">
                {formatUptime(health.server.uptime)}
              </span>
            </div>
            <Badge className={getStatusColor(health.server.status)}>
              {health.server.status.toUpperCase()}
            </Badge>
          </CardContent>
        </Card>

        {/* Storage */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                Storage
              </CardTitle>
              {getStatusIcon(health.storage.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Disk Usage</span>
                <span className="font-medium">
                  {health.storage.used}GB / {health.storage.total}GB
                </span>
              </div>
              <Progress
                value={(health.storage.used / health.storage.total) * 100}
              />
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Available Space</span>
              <span className="text-sm font-medium">
                {(health.storage.total - health.storage.used).toFixed(1)}GB
              </span>
            </div>
            <Badge className={getStatusColor(health.storage.status)}>
              {health.storage.status.toUpperCase()}
            </Badge>
          </CardContent>
        </Card>

        {/* API */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                API Performance
              </CardTitle>
              {getStatusIcon(health.api.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Avg Response Time</span>
              <span className="text-sm font-medium">
                {health.api.averageResponseTime}ms
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Requests (24h)</span>
              <span className="text-sm font-medium">
                {health.api.requests24h.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Errors (24h)</span>
              <span className="text-sm font-medium text-red-600">
                {health.api.errors24h}
              </span>
            </div>
            <Badge className={getStatusColor(health.api.status)}>
              {health.api.status.toUpperCase()}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Services Status */}
      <Card>
        <CardHeader>
          <CardTitle>External Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Wifi className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-medium">Paystack</p>
                  <p className="text-sm text-gray-600">Payment Gateway</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Online
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Cloud className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-medium">Email Service</p>
                  <p className="text-sm text-gray-600">SMTP</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Online
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Server className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="font-medium">CDN</p>
                  <p className="text-sm text-gray-600">Content Delivery</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Online
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent System Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="font-medium text-green-900">
                  All systems operational
                </p>
                <p className="text-sm text-green-700">
                  No issues detected in the last 24 hours
                </p>
              </div>
              <span className="text-sm text-gray-600">Just now</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
