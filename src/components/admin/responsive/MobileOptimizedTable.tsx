"use client";

import { useState } from "react";
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
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

interface MobileOptimizedTableProps {
  data: any[];
  columns: Column[];
  title: string;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  onFilter?: (filters: Record<string, any>) => void;
  onSort?: (column: string, direction: "asc" | "desc") => void;
  onRowClick?: (row: any) => void;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  actions?: Array<{
    label: string;
    onClick: (row: any) => void;
    variant?: "default" | "destructive";
  }>;
  className?: string;
}

export default function MobileOptimizedTable({
  data,
  columns,
  title,
  searchPlaceholder = "Search...",
  onSearch,
  onFilter,
  onSort,
  onRowClick,
  pagination,
  actions = [],
  className = "",
}: MobileOptimizedTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleSort = (column: string) => {
    if (!onSort) return;

    const newDirection =
      sortColumn === column && sortDirection === "asc" ? "desc" : "asc";
    setSortColumn(column);
    setSortDirection(newDirection);
    onSort(column, newDirection);
  };

  const handleRowClick = (row: any) => {
    onRowClick?.(row);
  };

  const renderMobileCard = (row: any, index: number) => (
    <Card key={index} className="mb-4 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          {columns.slice(0, 3).map((column) => (
            <div key={column.key} className="flex justify-between items-start">
              <span className="text-sm font-medium text-gray-600">
                {column.label}:
              </span>
              <div className="text-sm text-gray-900 text-right max-w-[60%]">
                {column.render
                  ? column.render(row[column.key], row)
                  : row[column.key]}
              </div>
            </div>
          ))}

          {columns.length > 3 && (
            <div className="pt-2 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-2">
                {columns.slice(3).map((column) => (
                  <div key={column.key} className="space-y-1">
                    <span className="text-xs text-gray-500">
                      {column.label}:
                    </span>
                    <div className="text-xs text-gray-900">
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {actions.length > 0 && (
            <div className="pt-3 border-t border-gray-100">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-center"
                  >
                    Actions
                    <MoreHorizontal className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {actions.map((action, actionIndex) => (
                    <DropdownMenuItem
                      key={actionIndex}
                      onClick={() => action.onClick(row)}
                      className={
                        action.variant === "destructive" ? "text-red-600" : ""
                      }
                    >
                      {action.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderDesktopTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-4 py-3 text-left text-sm font-medium text-gray-600 ${
                  column.sortable ? "cursor-pointer hover:bg-gray-50" : ""
                }`}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center space-x-1">
                  <span>{column.label}</span>
                  {column.sortable && sortColumn === column.key && (
                    <span className="text-blue-500">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
            ))}
            {actions.length > 0 && (
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={index}
              className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
              onClick={() => handleRowClick(row)}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className="px-4 py-3 text-sm text-gray-900"
                >
                  {column.render
                    ? column.render(row[column.key], row)
                    : row[column.key]}
                </td>
              ))}
              {actions.length > 0 && (
                <td className="px-4 py-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {actions.map((action, actionIndex) => (
                        <DropdownMenuItem
                          key={actionIndex}
                          onClick={() => action.onClick(row)}
                          className={
                            action.variant === "destructive"
                              ? "text-red-600"
                              : ""
                          }
                        >
                          {action.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <Card
      className={`bg-white/90 backdrop-blur-xl border-0 shadow-lg rounded-2xl overflow-hidden ${className}`}
    >
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <CardTitle className="text-lg font-semibold text-gray-900">
            {title}
          </CardTitle>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="instructor">Instructor</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                </SelectContent>
              </Select>

              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" className="w-full">
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {/* Mobile View */}
        <div className="block lg:hidden">
          {data.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No data available</p>
            </div>
          ) : (
            <div className="p-4">
              {data.map((row, index) => renderMobileCard(row, index))}
            </div>
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden lg:block">
          {data.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No data available</p>
            </div>
          ) : (
            renderDesktopTable()
          )}
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} results
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => pagination.onPageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <span className="text-sm text-gray-600">
                  Page {pagination.page} of{" "}
                  {Math.ceil(pagination.total / pagination.limit)}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => pagination.onPageChange(pagination.page + 1)}
                  disabled={
                    pagination.page >=
                    Math.ceil(pagination.total / pagination.limit)
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


