"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  Activity,
  Search,
  Filter,
  Download,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  UserPlus,
  LogIn,
  LogOut,
  Settings,
  FileText,
  Shield,
  Eye,
} from "lucide-react";
import { format } from "date-fns";

interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  actionType:
    | "CREATE"
    | "UPDATE"
    | "DELETE"
    | "LOGIN"
    | "LOGOUT"
    | "VIEW"
    | "DOWNLOAD";
  resource: string;
  resourceId?: string;
  ipAddress: string;
  userAgent: string;
  status: "SUCCESS" | "FAILED" | "WARNING";
  details?: string;
  timestamp: string;
}

export default function ActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAction, setFilterAction] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      // TODO: Implement actual API call
      // Simulated data for now
      const mockLogs: ActivityLog[] = [
        {
          id: "1",
          userId: "admin-1",
          userName: "KM Media Admin",
          userRole: "ADMIN",
          action: "Approved course application",
          actionType: "UPDATE",
          resource: "Application",
          resourceId: "app-123",
          ipAddress: "192.168.1.1",
          userAgent: "Mozilla/5.0...",
          status: "SUCCESS",
          details: "Application for Film Production course approved",
          timestamp: new Date().toISOString(),
        },
        {
          id: "2",
          userId: "admin-1",
          userName: "KM Media Admin",
          userRole: "ADMIN",
          action: "Created new user",
          actionType: "CREATE",
          resource: "User",
          resourceId: "user-456",
          ipAddress: "192.168.1.1",
          userAgent: "Mozilla/5.0...",
          status: "SUCCESS",
          details: "New instructor account created",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: "3",
          userId: "instructor-1",
          userName: "John Film Director",
          userRole: "INSTRUCTOR",
          action: "Published course",
          actionType: "UPDATE",
          resource: "Course",
          resourceId: "course-789",
          ipAddress: "192.168.1.2",
          userAgent: "Mozilla/5.0...",
          status: "SUCCESS",
          details: "Advanced Cinematography course published",
          timestamp: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: "4",
          userId: "admin-1",
          userName: "KM Media Admin",
          userRole: "ADMIN",
          action: "Failed login attempt",
          actionType: "LOGIN",
          resource: "Authentication",
          ipAddress: "192.168.1.5",
          userAgent: "Mozilla/5.0...",
          status: "FAILED",
          details: "Invalid password",
          timestamp: new Date(Date.now() - 10800000).toISOString(),
        },
        {
          id: "5",
          userId: "admin-1",
          userName: "KM Media Admin",
          userRole: "ADMIN",
          action: "Updated system settings",
          actionType: "UPDATE",
          resource: "Settings",
          ipAddress: "192.168.1.1",
          userAgent: "Mozilla/5.0...",
          status: "SUCCESS",
          details: "Email configuration updated",
          timestamp: new Date(Date.now() - 14400000).toISOString(),
        },
      ];
      setLogs(mockLogs);
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast.error("Failed to fetch activity logs");
    } finally {
      setLoading(false);
    }
  };

  const handleExportLogs = async () => {
    try {
      toast.success("Activity logs exported successfully");
    } catch (error) {
      toast.error("Failed to export logs");
    }
  };

  const getFilteredLogs = () => {
    let filtered = logs;

    if (filterAction !== "ALL") {
      filtered = filtered.filter((log) => log.actionType === filterAction);
    }

    if (filterStatus !== "ALL") {
      filtered = filtered.filter((log) => log.status === filterStatus);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (log) =>
          log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.resource.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "bg-green-100 text-green-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      case "WARNING":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case "CREATE":
        return <UserPlus className="h-4 w-4" />;
      case "UPDATE":
        return <Edit className="h-4 w-4" />;
      case "DELETE":
        return <Trash2 className="h-4 w-4" />;
      case "LOGIN":
        return <LogIn className="h-4 w-4" />;
      case "LOGOUT":
        return <LogOut className="h-4 w-4" />;
      case "VIEW":
        return <Eye className="h-4 w-4" />;
      case "DOWNLOAD":
        return <Download className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const filteredLogs = getFilteredLogs();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="h-8 w-8" />
            Activity Logs
          </h2>
          <p className="text-gray-600 mt-1">
            Monitor all system activities and user actions
          </p>
        </div>
        <Button onClick={handleExportLogs}>
          <Download className="h-4 w-4 mr-2" />
          Export Logs
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Actions</SelectItem>
                <SelectItem value="CREATE">Create</SelectItem>
                <SelectItem value="UPDATE">Update</SelectItem>
                <SelectItem value="DELETE">Delete</SelectItem>
                <SelectItem value="LOGIN">Login</SelectItem>
                <SelectItem value="LOGOUT">Logout</SelectItem>
                <SelectItem value="VIEW">View</SelectItem>
                <SelectItem value="DOWNLOAD">Download</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="SUCCESS">Success</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="WARNING">Warning</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Activities</p>
                <p className="text-2xl font-bold">{logs.length}</p>
              </div>
              <Activity className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Successful</p>
                <p className="text-2xl font-bold">
                  {logs.filter((l) => l.status === "SUCCESS").length}
                </p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold">
                  {logs.filter((l) => l.status === "FAILED").length}
                </p>
              </div>
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Warnings</p>
                <p className="text-2xl font-bold">
                  {logs.filter((l) => l.status === "WARNING").length}
                </p>
              </div>
              <AlertCircle className="h-10 w-10 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity ({filteredLogs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No activity logs found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{log.userName}</div>
                          <div className="text-sm text-gray-600">
                            {log.userRole}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getActionIcon(log.actionType)}
                          <span>{log.action}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.resource}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(log.status)}>
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm">{log.ipAddress}</code>
                      </TableCell>
                      <TableCell>
                        {format(new Date(log.timestamp), "PPp")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedLog(log);
                            setShowDetails(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Details Modal */}
      {showDetails && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Activity Log Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">User</p>
                  <p className="font-medium">{selectedLog.userName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Role</p>
                  <Badge>{selectedLog.userRole}</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Action</p>
                  <p className="font-medium">{selectedLog.action}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Resource</p>
                  <Badge variant="outline">{selectedLog.resource}</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge className={getStatusColor(selectedLog.status)}>
                    {selectedLog.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Timestamp</p>
                  <p className="font-medium">
                    {format(new Date(selectedLog.timestamp), "PPpp")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">IP Address</p>
                  <code className="text-sm">{selectedLog.ipAddress}</code>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Resource ID</p>
                  <code className="text-sm">
                    {selectedLog.resourceId || "N/A"}
                  </code>
                </div>
              </div>
              {selectedLog.details && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Details</p>
                  <p className="text-sm bg-gray-50 p-3 rounded-lg">
                    {selectedLog.details}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600 mb-2">User Agent</p>
                <code className="text-xs bg-gray-50 p-2 rounded block overflow-x-auto">
                  {selectedLog.userAgent}
                </code>
              </div>
            </CardContent>
            <div className="p-4 border-t flex justify-end">
              <Button onClick={() => setShowDetails(false)}>Close</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
