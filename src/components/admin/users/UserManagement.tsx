"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Users,
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  Calendar,
  Shield,
  Edit,
  Trash2,
  UserPlus,
  UserCheck,
  UserX,
  AlertCircle,
  CheckSquare,
  X,
  Eye,
  Settings,
  Activity,
} from "lucide-react";
import { toast } from "sonner";
import { safeJsonParse } from "@/lib/api-utils";
import ManagementHeader from "../shared/ManagementHeader";
import BulkActionsModal from "../shared/BulkActionsModal";

interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "INSTRUCTOR" | "STUDENT";
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  createdAt: string;
  lastLogin?: string;
  avatar?: string;
  phone?: string;
  bio?: string;
  address?: string;
  _count?: {
    courses?: number;
    applications?: number;
    enrollments?: number;
  };
}

interface UserManagementProps {
  onRefresh?: () => void;
}

export default function UserManagement({ onRefresh }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [filterRole, setFilterRole] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/users");
      const data = await safeJsonParse(response, {
        success: false,
        data: { users: [] },
      });
      if (data.success) {
        setUsers(Array.isArray(data.data?.users) ? data.data.users : []);
      } else {
        console.error("API returned error:", data.message);
        toast.error(data.message || "Failed to fetch users");
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (
    userId: string,
    action: "ACTIVATE" | "SUSPEND" | "DELETE" | "CHANGE_ROLE",
    newRole?: string
  ) => {
    try {
      setProcessing(true);
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          newRole,
        }),
      });

      if (response.ok) {
        toast.success(`User ${action.toLowerCase()}d successfully`);
        fetchUsers();
        setShowDetails(false);
        if (onRefresh) onRefresh();
      } else {
        const error = await safeJsonParse(response, {
          message: "Unknown error",
        });
        toast.error(error.message || "Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkAction = async (action: string, comment: string) => {
    if (selectedUsers.length === 0) {
      toast.error("Please select users to process");
      return;
    }

    try {
      setProcessing(true);
      const response = await fetch("/api/admin/users/bulk", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userIds: selectedUsers,
          action,
          comments: comment,
        }),
      });

      if (response.ok) {
        toast.success(
          `Bulk action completed for ${selectedUsers.length} users`
        );
        setSelectedUsers([]);
        setShowBulkActions(false);
        fetchUsers();
        if (onRefresh) onRefresh();
      } else {
        const error = await safeJsonParse(response, {
          message: "Unknown error",
        });
        toast.error(error.message || "Failed to process bulk action");
      }
    } catch (error) {
      console.error("Error processing bulk action:", error);
      toast.error("Failed to process bulk action");
    } finally {
      setProcessing(false);
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    const filteredUsers = getFilteredUsers();
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((user) => user.id));
    }
  };

  const getFilteredUsers = () => {
    let filtered = users;

    if (filterRole !== "ALL") {
      filtered = filtered.filter((user) => user.role === filterRole);
    }

    if (filterStatus !== "ALL") {
      filtered = filtered.filter((user) => user.status === filterStatus);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800";
      case "INSTRUCTOR":
        return "bg-blue-100 text-blue-800";
      case "STUDENT":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "INACTIVE":
        return "bg-gray-100 text-gray-800";
      case "SUSPENDED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredUsers = getFilteredUsers();

  const userStats = {
    total: users.length,
    active: users.filter((u) => u.status === "ACTIVE").length,
    inactive: users.filter((u) => u.status === "INACTIVE").length,
    suspended: users.filter((u) => u.status === "SUSPENDED").length,
    admins: users.filter((u) => u.role === "ADMIN").length,
    instructors: users.filter((u) => u.role === "INSTRUCTOR").length,
    students: users.filter((u) => u.role === "STUDENT").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <ManagementHeader
        title="User Management"
        description="Manage system users and their permissions"
        selectedCount={selectedUsers.length}
        onBulkAction={() => setShowBulkActions(true)}
        onRefresh={fetchUsers}
        additionalButtons={
          <Button onClick={() => setShowCreateUser(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        }
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{userStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold">{userStats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Admins</p>
                <p className="text-2xl font-bold">{userStats.admins}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Instructors</p>
                <p className="text-2xl font-bold">{userStats.instructors}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Roles</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="INSTRUCTOR">Instructor</SelectItem>
                <SelectItem value="STUDENT">Student</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={
                  selectedUsers.length === filteredUsers.length &&
                  filteredUsers.length > 0
                }
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-gray-600">Select All</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No users found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <Card key={user.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={() => handleSelectUser(user.id)}
                        />
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{user.name}</h3>
                            <Badge className={getRoleColor(user.role)}>
                              {user.role}
                            </Badge>
                            <Badge className={getStatusColor(user.status)}>
                              {user.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            <Mail className="h-4 w-4 inline mr-1" />
                            {user.email}
                          </p>
                          {user.phone && (
                            <p className="text-sm text-gray-600 mb-1">
                              <Phone className="h-4 w-4 inline mr-1" />
                              {user.phone}
                            </p>
                          )}
                          <p className="text-sm text-gray-600 mb-1">
                            <Calendar className="h-4 w-4 inline mr-1" />
                            Joined:{" "}
                            {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                          {user.lastLogin && (
                            <p className="text-sm text-gray-600">
                              <Activity className="h-4 w-4 inline mr-1" />
                              Last Login:{" "}
                              {new Date(user.lastLogin).toLocaleDateString()}
                            </p>
                          )}
                          {user._count && (
                            <div className="flex gap-4 mt-2 text-sm text-gray-600">
                              {user._count.courses && (
                                <span>Courses: {user._count.courses}</span>
                              )}
                              {user._count.applications && (
                                <span>
                                  Applications: {user._count.applications}
                                </span>
                              )}
                              {user._count.enrollments && (
                                <span>
                                  Enrollments: {user._count.enrollments}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDetails(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // TODO: Implement edit user
                            toast.info("Edit user functionality coming soon");
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        {user.status === "ACTIVE" && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleUserAction(user.id, "SUSPEND")}
                            disabled={processing}
                          >
                            <UserX className="h-4 w-4 mr-1" />
                            Suspend
                          </Button>
                        )}
                        {user.status === "INACTIVE" && (
                          <Button
                            size="sm"
                            onClick={() =>
                              handleUserAction(user.id, "ACTIVATE")
                            }
                            disabled={processing}
                          >
                            <UserCheck className="h-4 w-4 mr-1" />
                            Activate
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* User Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={selectedUser.avatar} />
                      <AvatarFallback>
                        {selectedUser.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">
                        {selectedUser.name}
                      </h3>
                      <p className="text-gray-600">{selectedUser.email}</p>
                      {selectedUser.phone && (
                        <p className="text-gray-600">{selectedUser.phone}</p>
                      )}
                      <div className="flex gap-2 mt-2">
                        <Badge className={getRoleColor(selectedUser.role)}>
                          {selectedUser.role}
                        </Badge>
                        <Badge className={getStatusColor(selectedUser.status)}>
                          {selectedUser.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* User Statistics */}
              {selectedUser._count && (
                <Card>
                  <CardHeader>
                    <CardTitle>User Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      {selectedUser._count.courses && (
                        <div className="text-center">
                          <p className="text-2xl font-bold">
                            {selectedUser._count.courses}
                          </p>
                          <p className="text-sm text-gray-600">Courses</p>
                        </div>
                      )}
                      {selectedUser._count.applications && (
                        <div className="text-center">
                          <p className="text-2xl font-bold">
                            {selectedUser._count.applications}
                          </p>
                          <p className="text-sm text-gray-600">Applications</p>
                        </div>
                      )}
                      {selectedUser._count.enrollments && (
                        <div className="text-center">
                          <p className="text-2xl font-bold">
                            {selectedUser._count.enrollments}
                          </p>
                          <p className="text-sm text-gray-600">Enrollments</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* User Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>User Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    {selectedUser.status === "ACTIVE" && (
                      <Button
                        variant="destructive"
                        onClick={() =>
                          handleUserAction(selectedUser.id, "SUSPEND")
                        }
                        disabled={processing}
                      >
                        <UserX className="h-4 w-4 mr-2" />
                        Suspend User
                      </Button>
                    )}
                    {selectedUser.status === "INACTIVE" && (
                      <Button
                        onClick={() =>
                          handleUserAction(selectedUser.id, "ACTIVATE")
                        }
                        disabled={processing}
                      >
                        <UserCheck className="h-4 w-4 mr-2" />
                        Activate User
                      </Button>
                    )}
                    {selectedUser.status === "SUSPENDED" && (
                      <Button
                        onClick={() =>
                          handleUserAction(selectedUser.id, "ACTIVATE")
                        }
                        disabled={processing}
                      >
                        <UserCheck className="h-4 w-4 mr-2" />
                        Reactivate User
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => {
                        // TODO: Implement send email
                        toast.info("Send email functionality coming soon");
                      }}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Actions Modal */}
      <BulkActionsModal
        isOpen={showBulkActions}
        onClose={() => setShowBulkActions(false)}
        onConfirm={handleBulkAction}
        selectedCount={selectedUsers.length}
        loading={processing}
        actions={[
          { value: "ACTIVATE", label: "Activate All" },
          { value: "SUSPEND", label: "Suspend All" },
          { value: "SEND_EMAIL", label: "Send Email" },
        ]}
        commentPlaceholder="Add comments for bulk action (optional)..."
      />

      <CreateUserDialog 
        open={showCreateUser}
        onOpenChange={setShowCreateUser}
        onSuccess={() => {
          fetchUsers();
          setShowCreateUser(false);
        }}
      />
    </div>
  );
}

function CreateUserDialog({ open, onOpenChange, onSuccess }: { open: boolean; onOpenChange: (open: boolean) => void; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("STUDENT"); // Default to student
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "", // Temporary password for instructor
    phone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let endpoint = "/api/auth/register-student"; // Default for students (though ideally admin should just use one endpoint)
      
      // We will use the new specialized endpoint for instructors
      if (role === "INSTRUCTOR") {
        endpoint = "/api/admin/instructors/create";
      } else {
        // Fallback for students if needed, or implement admin-student-create
        // For now, let's assume we might implement admin-student-create later or reuse public register with adjustments 
        // BUT strict requirement is about INSTRUCTOR provisioning.
        // Let's implement logic just for INSTRUCTOR here as requested.
        toast.error("Student provisioning not yet implemented in this modal");
        setLoading(false);
        return;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`${role} provisioned successfully`);
        onSuccess();
      } else {
        toast.error(result.message || "Failed to create user");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Provision New User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STUDENT">Student</SelectItem>
                <SelectItem value="INSTRUCTOR">Instructor</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name" 
              required 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input 
              id="email" 
              type="email" 
              required 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          {role === "INSTRUCTOR" && (
            <div className="space-y-2">
              <Label htmlFor="password">Temporary Password</Label>
              <Input 
                id="password" 
                type="text" 
                required 
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="Set a temporary password"
              />
              <p className="text-xs text-muted-foreground">
                The instructor will be forced to change this on first login.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input 
              id="phone" 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Provisioning..." : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
