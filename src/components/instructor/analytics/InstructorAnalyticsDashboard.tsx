"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  Users,
  BookOpen,
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Calendar,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { AnalyticsSkeletons } from "@/components/ui/DashboardSkeletons";


const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

interface AnalyticsData {
  overview: {
    totalStudents: number;
    totalCourses: number;
    completionRate: number;
    avgRating: number;
    totalRevenue: number;
  };
  enrollmentTrends: Array<{ date: string; count: number }>;
  coursePerformance: Array<{ name: string; students: number; completion: number }>;
  assessmentStats: {
    avgScore: number;
    passRate: number;
    distribution: Array<{ range: string; count: number }>;
  };
}

export default function InstructorAnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/instructor/analytics/detailed?range=${timeRange}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        toast.error("Failed to load analytics data");
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("An error occurred while fetching analytics");
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const date = new Date().toLocaleDateString();

      // Header
      doc.setFontSize(22);
      doc.setTextColor(59, 130, 246); // Brand Primary
      doc.text("Instructor Analytics Report", 20, 20);
      
      doc.setFontSize(12);
      doc.setTextColor(100, 116, 139); // Gray 500
      doc.text(`Generated on: ${date}`, 20, 30);
      doc.text(`Time Range: ${timeRange === '7d' ? 'Last 7 Days' : timeRange === '30d' ? 'Last 30 Days' : timeRange === '90d' ? 'Last 90 Days' : 'Last Year'}`, 20, 37);

      // Section 1: Overview
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text("Performance Overview", 20, 50);

      autoTable(doc, {
        startY: 55,
        head: [["Metric", "Value"]],
        body: [
          ["Total Students", data.overview.totalStudents.toString()],
          ["Course Completion Rate", `${data.overview.completionRate}%`],
          ["Average Course Rating", data.overview.avgRating.toString()],
          ["Total Revenue", `GH₵${data.overview.totalRevenue.toLocaleString()}`],
        ],
        theme: 'striped',
        headStyles: { fillStyle: 'F', fillColor: [59, 130, 246] },
      });

      // Section 2: Course Performance
      doc.text("Course Performance Comparison", 20, (doc as any).lastAutoTable.finalY + 15);

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 20,
        head: [["Course Name", "Students", "Completion %"]],
        body: data.coursePerformance.map(c => [
          c.name,
          c.students.toString(),
          `${c.completion}%`
        ]),
        theme: 'striped',
        headStyles: { fillStyle: 'F', fillColor: [16, 185, 129] }, // Emerald
      });

      // Section 3: Assessment Distribution
      doc.text("Assessment Grade Distribution", 20, (doc as any).lastAutoTable.finalY + 15);

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 20,
        head: [["Score Range", "Student Count"]],
        body: data.assessmentStats.distribution.map(d => [
          d.range,
          d.count.toString()
        ]),
        theme: 'striped',
        headStyles: { fillStyle: 'F', fillColor: [139, 92, 246] }, // Purple
      });

      // Footer
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(
          `KM Media Training Institute - Analytics Report - Page ${i} of ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      doc.save(`KM-Media-Analytics-${date.replace(/\//g, '-')}.pdf`);
      toast.success("Professional report generated successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to generate PDF report");
    }
  };

  if (loading) {
    return <AnalyticsSkeletons />;
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Time Range Selector & Export */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-brand">Performance Overview</h2>
          <p className="text-gray-500">Real-time insights across your courses</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-white border-2 border-brand-primary/20 rounded-xl px-4 py-2 text-sm font-semibold text-gray-700 outline-none focus:border-brand-primary"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="year">Last Year</option>
          </select>
          <Button onClick={exportData} className="bg-brand-primary hover:bg-brand-secondary rounded-xl font-bold">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Students</p>
                <h3 className="text-3xl font-bold mt-1 font-brand">{data.overview.totalStudents}</h3>
              </div>
              <div className="p-2 bg-white/20 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-blue-100">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+12.5% vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Completion Rate</p>
                <h3 className="text-3xl font-bold mt-1 font-brand">{data.overview.completionRate}%</h3>
              </div>
              <div className="p-2 bg-white/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-emerald-100">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+5.2% vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-purple-100 text-sm font-medium">Avg Course Rating</p>
                <h3 className="text-3xl font-bold mt-1 font-brand">{data.overview.avgRating}</h3>
              </div>
              <div className="p-2 bg-white/20 rounded-lg">
                <Award className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-purple-100">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+0.3 since launch</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-amber-100 text-sm font-medium">Total Revenue</p>
                <h3 className="text-3xl font-bold mt-1 font-brand">GH₵{data.overview.totalRevenue.toLocaleString()}</h3>
              </div>
              <div className="p-2 bg-white/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-amber-100">
              <Calendar className="w-4 h-4 mr-1" />
              <span>Current {timeRange === "30d" ? "Month" : "Period"}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment Trend */}
        <Card className="border-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-brand">Enrollment Trends</CardTitle>
            <CardDescription>Daily enrollment activity over the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.enrollmentTrends}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorCount)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Course Performance Bar Chart */}
        <Card className="border-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-brand">Course Performance Comparison</CardTitle>
            <CardDescription>Completion rates across your published courses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.coursePerformance}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="completion" 
                    name="Completion %" 
                    fill="#10b981" 
                    radius={[4, 4, 0, 0]} 
                  />
                  <Bar 
                    dataKey="students" 
                    name="Student Count" 
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assessment Distribution */}
        <Card className="border-2 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl font-brand">Assessment Grade Distribution</CardTitle>
            <CardDescription>Spread of student scores across all assessments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.assessmentStats.distribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                  <XAxis type="number" axisLine={false} tickLine={false} hide />
                  <YAxis 
                    dataKey="range" 
                    type="category" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    width={80}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#8b5cf6" 
                    radius={[0, 4, 4, 0]} 
                    background={{ fill: '#f8fafc', radius: [0, 4, 4, 0] }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Metrics */}
        <Card className="border-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-brand">Overall Evaluation</CardTitle>
            <CardDescription>Avg. metrics across all evaluations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-full space-y-8 pt-4">
              <div className="text-center">
                <p className="text-gray-500 text-sm">Avg. Assessment Score</p>
                <div className="text-5xl font-bold text-brand-primary mt-2 font-brand">{data.assessmentStats.avgScore}%</div>
              </div>
              
              <div className="w-full space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Overall Pass Rate</span>
                    <span>{data.assessmentStats.passRate}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className="bg-brand-primary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${data.assessmentStats.passRate}%` }}
                    ></div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Students</p>
                    <p className="text-lg font-bold text-gray-900">{data.overview.totalStudents}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Courses</p>
                    <p className="text-lg font-bold text-gray-900">{data.overview.totalCourses}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
