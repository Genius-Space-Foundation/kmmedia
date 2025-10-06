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
  Users,
  MousePointer,
  Eye,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
} from "lucide-react";

interface UserBehavior {
  id: string;
  userId: string;
  userName: string;
  action: string;
  page: string;
  timestamp: string;
  duration: number;
  device: string;
  browser: string;
  location: string;
  sessionId: string;
}

interface UserJourney {
  userId: string;
  userName: string;
  steps: {
    page: string;
    timestamp: string;
    duration: number;
    action: string;
  }[];
  totalDuration: number;
  conversion: boolean;
  goal: string;
}

interface HeatmapData {
  page: string;
  clicks: number;
  scrolls: number;
  hovers: number;
  exits: number;
  coordinates: {
    x: number;
    y: number;
    clicks: number;
  }[];
}

interface FunnelData {
  step: string;
  users: number;
  conversion: number;
  dropoff: number;
}

interface CohortData {
  cohort: string;
  size: number;
  retention: {
    week1: number;
    week2: number;
    week3: number;
    week4: number;
  };
}

interface DeviceAnalytics {
  device: string;
  users: number;
  sessions: number;
  avgSessionDuration: number;
  bounceRate: number;
  conversionRate: number;
  icon: React.ReactNode;
}

interface LocationAnalytics {
  country: string;
  users: number;
  sessions: number;
  avgSessionDuration: number;
  bounceRate: number;
  conversionRate: number;
}

const deviceIcons = {
  Desktop: <Monitor className="h-4 w-4" />,
  Mobile: <Smartphone className="h-4 w-4" />,
  Tablet: <Tablet className="h-4 w-4" />,
};

export default function UserBehaviorAnalytics() {
  const [behaviors, setBehaviors] = useState<UserBehavior[]>([]);
  const [journeys, setJourneys] = useState<UserJourney[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [funnelData, setFunnelData] = useState<FunnelData[]>([]);
  const [cohortData, setCohortData] = useState<CohortData[]>([]);
  const [deviceAnalytics, setDeviceAnalytics] = useState<DeviceAnalytics[]>([]);
  const [locationAnalytics, setLocationAnalytics] = useState<
    LocationAnalytics[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedPage, setSelectedPage] = useState("all");

  useEffect(() => {
    fetchBehaviorData();
    const interval = setInterval(fetchBehaviorData, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, [timeRange, selectedPage]);

  const fetchBehaviorData = async () => {
    try {
      setLoading(true);

      // Mock behavior data
      const mockBehaviors: UserBehavior[] = [
        {
          id: "1",
          userId: "user1",
          userName: "John Doe",
          action: "click",
          page: "/dashboard",
          timestamp: new Date().toISOString(),
          duration: 2.5,
          device: "Desktop",
          browser: "Chrome",
          location: "Nigeria",
          sessionId: "session1",
        },
        {
          id: "2",
          userId: "user2",
          userName: "Jane Smith",
          action: "scroll",
          page: "/courses",
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          duration: 1.2,
          device: "Mobile",
          browser: "Safari",
          location: "Ghana",
          sessionId: "session2",
        },
        {
          id: "3",
          userId: "user3",
          userName: "Mike Johnson",
          action: "hover",
          page: "/apply",
          timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
          duration: 0.8,
          device: "Tablet",
          browser: "Firefox",
          location: "Kenya",
          sessionId: "session3",
        },
      ];

      const mockJourneys: UserJourney[] = [
        {
          userId: "user1",
          userName: "John Doe",
          steps: [
            {
              page: "/",
              timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
              duration: 5,
              action: "view",
            },
            {
              page: "/courses",
              timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
              duration: 120,
              action: "browse",
            },
            {
              page: "/apply",
              timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
              duration: 300,
              action: "form_fill",
            },
            {
              page: "/payment",
              timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
              duration: 180,
              action: "payment",
            },
          ],
          totalDuration: 605,
          conversion: true,
          goal: "course_application",
        },
        {
          userId: "user2",
          userName: "Jane Smith",
          steps: [
            {
              page: "/",
              timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
              duration: 3,
              action: "view",
            },
            {
              page: "/courses",
              timestamp: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
              duration: 60,
              action: "browse",
            },
            {
              page: "/about",
              timestamp: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
              duration: 30,
              action: "view",
            },
          ],
          totalDuration: 93,
          conversion: false,
          goal: "course_application",
        },
      ];

      const mockHeatmapData: HeatmapData[] = [
        {
          page: "/dashboard",
          clicks: 1250,
          scrolls: 2100,
          hovers: 850,
          exits: 120,
          coordinates: [
            { x: 100, y: 200, clicks: 45 },
            { x: 300, y: 150, clicks: 32 },
            { x: 500, y: 300, clicks: 28 },
          ],
        },
        {
          page: "/courses",
          clicks: 2100,
          scrolls: 3200,
          hovers: 1200,
          exits: 180,
          coordinates: [
            { x: 200, y: 250, clicks: 78 },
            { x: 400, y: 180, clicks: 65 },
            { x: 600, y: 350, clicks: 42 },
          ],
        },
      ];

      const mockFunnelData: FunnelData[] = [
        { step: "Landing Page", users: 1000, conversion: 100, dropoff: 0 },
        { step: "Course Browse", users: 750, conversion: 75, dropoff: 25 },
        { step: "Application Form", users: 450, conversion: 45, dropoff: 30 },
        { step: "Payment", users: 320, conversion: 32, dropoff: 13 },
        { step: "Completion", users: 280, conversion: 28, dropoff: 4 },
      ];

      const mockCohortData: CohortData[] = [
        {
          cohort: "Week 1",
          size: 100,
          retention: { week1: 100, week2: 85, week3: 72, week4: 68 },
        },
        {
          cohort: "Week 2",
          size: 120,
          retention: { week1: 100, week2: 90, week3: 78, week4: 70 },
        },
        {
          cohort: "Week 3",
          size: 95,
          retention: { week1: 100, week2: 88, week3: 82, week4: 75 },
        },
      ];

      const mockDeviceAnalytics: DeviceAnalytics[] = [
        {
          device: "Desktop",
          users: 1250,
          sessions: 2100,
          avgSessionDuration: 8.5,
          bounceRate: 12.5,
          conversionRate: 8.3,
          icon: deviceIcons.Desktop,
        },
        {
          device: "Mobile",
          users: 2100,
          sessions: 3200,
          avgSessionDuration: 6.2,
          bounceRate: 18.7,
          conversionRate: 6.1,
          icon: deviceIcons.Mobile,
        },
        {
          device: "Tablet",
          users: 450,
          sessions: 680,
          avgSessionDuration: 7.8,
          bounceRate: 15.3,
          conversionRate: 7.2,
          icon: deviceIcons.Tablet,
        },
      ];

      const mockLocationAnalytics: LocationAnalytics[] = [
        {
          country: "Nigeria",
          users: 2800,
          sessions: 4200,
          avgSessionDuration: 7.8,
          bounceRate: 15.2,
          conversionRate: 7.5,
        },
        {
          country: "Ghana",
          users: 1200,
          sessions: 1800,
          avgSessionDuration: 6.5,
          bounceRate: 18.3,
          conversionRate: 6.8,
        },
        {
          country: "Kenya",
          users: 800,
          sessions: 1200,
          avgSessionDuration: 8.2,
          bounceRate: 12.7,
          conversionRate: 9.1,
        },
      ];

      setBehaviors(mockBehaviors);
      setJourneys(mockJourneys);
      setHeatmapData(mockHeatmapData);
      setFunnelData(mockFunnelData);
      setCohortData(mockCohortData);
      setDeviceAnalytics(mockDeviceAnalytics);
      setLocationAnalytics(mockLocationAnalytics);
    } catch (error) {
      console.error("Error fetching behavior data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getConversionRate = () => {
    const totalUsers = journeys.length;
    const convertedUsers = journeys.filter(
      (journey) => journey.conversion
    ).length;
    return totalUsers > 0 ? (convertedUsers / totalUsers) * 100 : 0;
  };

  const getAverageSessionDuration = () => {
    const totalDuration = journeys.reduce(
      (sum, journey) => sum + journey.totalDuration,
      0
    );
    return journeys.length > 0 ? totalDuration / journeys.length : 0;
  };

  const getBounceRate = () => {
    const singlePageSessions = journeys.filter(
      (journey) => journey.steps.length === 1
    ).length;
    return journeys.length > 0
      ? (singlePageSessions / journeys.length) * 100
      : 0;
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
            User Behavior Analytics
          </h1>
          <p className="text-gray-600">
            Deep insights into user interactions and journey patterns
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last Day</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedPage} onValueChange={setSelectedPage}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Pages</SelectItem>
              <SelectItem value="/dashboard">Dashboard</SelectItem>
              <SelectItem value="/courses">Courses</SelectItem>
              <SelectItem value="/apply">Apply</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchBehaviorData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Conversion Rate
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {getConversionRate().toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500">Goal completion rate</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Avg Session Duration
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {(getAverageSessionDuration() / 60).toFixed(1)}m
                </p>
                <p className="text-xs text-gray-500">Time spent per session</p>
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
                <p className="text-sm font-medium text-gray-600">Bounce Rate</p>
                <p className="text-2xl font-bold text-orange-600">
                  {getBounceRate().toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500">Single-page sessions</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Users
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {behaviors.length}
                </p>
                <p className="text-xs text-gray-500">Currently tracked</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="journeys">Journeys</TabsTrigger>
          <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
          <TabsTrigger value="funnel">Funnel</TabsTrigger>
          <TabsTrigger value="cohort">Cohort</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Behaviors */}
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Recent User Behaviors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {behaviors.map((behavior) => (
                  <div
                    key={behavior.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Activity className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {behavior.userName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {behavior.action} on {behavior.page}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-blue-100 text-blue-800">
                        {behavior.device}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {behavior.duration}s
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Device Analytics */}
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Device Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {deviceAnalytics.map((device) => (
                  <div key={device.device} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {device.icon}
                        <span className="font-medium text-gray-900">
                          {device.device}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {device.users} users
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="text-center">
                        <p className="text-gray-500">Sessions</p>
                        <p className="font-semibold">{device.sessions}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500">Duration</p>
                        <p className="font-semibold">
                          {device.avgSessionDuration}m
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500">Conversion</p>
                        <p className="font-semibold">
                          {device.conversionRate}%
                        </p>
                      </div>
                    </div>
                    <Progress value={device.conversionRate} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="journeys" className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            {journeys.map((journey) => (
              <Card
                key={journey.userId}
                className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {journey.userName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Goal: {journey.goal}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        className={
                          journey.conversion
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {journey.conversion ? "Converted" : "Abandoned"}
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-800">
                        {(journey.totalDuration / 60).toFixed(1)}m
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {journey.steps.map((step, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {step.page}
                          </p>
                          <p className="text-sm text-gray-500">
                            {step.action} • {step.duration}s
                          </p>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(step.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="heatmap" className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            {heatmapData.map((heatmap) => (
              <Card
                key={heatmap.page}
                className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {heatmap.page}
                    </h3>
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Clicks</p>
                        <p className="font-semibold text-gray-900">
                          {heatmap.clicks}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Scrolls</p>
                        <p className="font-semibold text-gray-900">
                          {heatmap.scrolls}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Hovers</p>
                        <p className="font-semibold text-gray-900">
                          {heatmap.hovers}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MousePointer className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-400">
                        Interactive heatmap visualization
                      </p>
                      <p className="text-sm text-gray-500">
                        Click coordinates: {heatmap.coordinates.length} points
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="funnel" className="space-y-4">
          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Conversion Funnel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {funnelData.map((step, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">
                      {step.step}
                    </span>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">
                        {step.users} users
                      </span>
                      <span className="text-sm text-gray-600">
                        {step.conversion}% conversion
                      </span>
                      {step.dropoff > 0 && (
                        <span className="text-sm text-red-600">
                          {step.dropoff}% dropoff
                        </span>
                      )}
                    </div>
                  </div>
                  <Progress value={step.conversion} className="h-3" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cohort" className="space-y-4">
          <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Cohort Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Cohort</th>
                      <th className="text-center py-2">Size</th>
                      <th className="text-center py-2">Week 1</th>
                      <th className="text-center py-2">Week 2</th>
                      <th className="text-center py-2">Week 3</th>
                      <th className="text-center py-2">Week 4</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cohortData.map((cohort, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 font-medium">{cohort.cohort}</td>
                        <td className="py-2 text-center">{cohort.size}</td>
                        <td className="py-2 text-center">
                          {cohort.retention.week1}%
                        </td>
                        <td className="py-2 text-center">
                          {cohort.retention.week2}%
                        </td>
                        <td className="py-2 text-center">
                          {cohort.retention.week3}%
                        </td>
                        <td className="py-2 text-center">
                          {cohort.retention.week4}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Device Performance */}
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Device Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {deviceAnalytics.map((device) => (
                  <div key={device.device} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {device.icon}
                        <span className="font-medium text-gray-900">
                          {device.device}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {device.users} users
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Sessions</p>
                        <p className="font-semibold">{device.sessions}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Duration</p>
                        <p className="font-semibold">
                          {device.avgSessionDuration}m
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Bounce Rate</p>
                        <p className="font-semibold">{device.bounceRate}%</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Conversion</p>
                        <p className="font-semibold">
                          {device.conversionRate}%
                        </p>
                      </div>
                    </div>
                    <Progress value={device.conversionRate} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Location Analytics */}
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Location Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {locationAnalytics.map((location) => (
                  <div key={location.country} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-gray-600" />
                        <span className="font-medium text-gray-900">
                          {location.country}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {location.users} users
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Sessions</p>
                        <p className="font-semibold">{location.sessions}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Duration</p>
                        <p className="font-semibold">
                          {location.avgSessionDuration}m
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Bounce Rate</p>
                        <p className="font-semibold">{location.bounceRate}%</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Conversion</p>
                        <p className="font-semibold">
                          {location.conversionRate}%
                        </p>
                      </div>
                    </div>
                    <Progress value={location.conversionRate} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}


