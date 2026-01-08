"use client";

import { useState, useEffect, useCallback } from "react";
// Removed useSWR as it was causing resolution issues in Turbopack
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { format } from "date-fns";
import { Loader2, Search, Filter, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Define AuditLog type
interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
  };
}

interface AuditLogResponse {
  success: boolean;
  data: {
    logs: AuditLog[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export default function AuditLogViewer() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("ALL");
  const [userIdFilter, setUserIdFilter] = useState("");
  const [data, setData] = useState<AuditLogResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const limit = 20;

  const fetchLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      const apiUrl = `/api/admin/audit-logs?page=${page}&limit=${limit}${
        actionFilter !== "ALL" ? `&action=${actionFilter}` : ""
      }${userIdFilter ? `&userId=${userIdFilter}` : ""}`;
      
      const response = await fetch(apiUrl);
      const json = await response.json();
      
      if (json.success) {
        setData(json);
        setError(null);
      } else {
        setError(json.message || "Failed to fetch logs");
      }
    } catch (err) {
      console.error("Fetch logs error:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, actionFilter, userIdFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const mutate = () => fetchLogs();

  const logs = data?.data?.logs || [];
  const pagination = data?.data?.pagination;

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && pagination && newPage <= pagination.pages) {
      setPage(newPage);
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes("CREATE")) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    if (action.includes("UPDATE")) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    if (action.includes("DELETE")) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    if (action.includes("LOGIN")) return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
    return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Audit Logs</CardTitle>
            <CardDescription>
              View system activities and security events
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => {
              const exportUrl = `/api/admin/audit-logs?format=csv${
                actionFilter !== "ALL" ? `&action=${actionFilter}` : ""
              }${userIdFilter ? `&userId=${userIdFilter}` : ""}`;
              window.location.href = exportUrl;
            }}>
              <Search className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => mutate()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
             <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter by User ID"
                value={userIdFilter}
                onChange={(e) => setUserIdFilter(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <div className="w-full md:w-48">
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Actions</SelectItem>
                <SelectItem value="USER_LOGIN">Logins</SelectItem>
                <SelectItem value="USER_REGISTER">Registrations</SelectItem>
                <SelectItem value="COURSE_CREATE">Course Created</SelectItem>
                <SelectItem value="APPLICATION_CREATE">App Submitted</SelectItem>
                <SelectItem value="PAYMENT_VERIFY">Payment Verified</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex justify-center items-center">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      Loading logs...
                    </div>
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No audit logs found.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(log.createdAt), "MMM d, HH:mm:ss")}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{log.user?.name || "Unknown"}</span>
                        <span className="text-xs text-muted-foreground">{log.user?.email || log.userId}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getActionColor(log.action)}>
                        {log.action.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{log.resourceType}</span>
                        {log.resourceId && (
                           <span className="text-xs text-muted-foreground font-mono truncate max-w-[100px]" title={log.resourceId}>
                             {log.resourceId}
                           </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs max-w-[200px] truncate" title={JSON.stringify(log.metadata, null, 2)}>
                        {log.metadata ? JSON.stringify(log.metadata) : "-"}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Page {page} of {pagination.pages}
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1 || isLoading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= pagination.pages || isLoading}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
