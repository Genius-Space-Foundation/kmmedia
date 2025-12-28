"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const pages = [];
    const showEllipsisStart = currentPage > 3;
    const showEllipsisEnd = currentPage < totalPages - 2;

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (showEllipsisStart) pages.push("ellipsis-1");
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      
      if (showEllipsisEnd) pages.push("ellipsis-2");
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }

    return pages.map((page, index) => {
      if (typeof page === "string") {
        return (
          <div key={page} className="flex h-10 w-10 items-center justify-center text-gray-400">
            <MoreHorizontal className="h-4 w-4" />
          </div>
        );
      }

      return (
        <Button
          key={page}
          variant={currentPage === page ? "default" : "outline"}
          size="icon"
          className={`h-10 w-10 rounded-xl font-bold transition-all duration-300 ${
            currentPage === page 
              ? "bg-brand-primary text-white shadow-brand-sm border-0" 
              : "border-2 border-gray-100 text-gray-600 hover:border-brand-primary/40 hover:text-brand-primary"
          }`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </Button>
      );
    });
  };

  return (
    <div className={`flex items-center justify-center gap-2 mt-8 ${className}`}>
      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10 rounded-xl border-2 border-gray-100 text-gray-600 hover:border-brand-primary/40 hover:text-brand-primary disabled:opacity-50"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      
      <div className="flex items-center gap-2 mx-2">
        {renderPageNumbers()}
      </div>

      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10 rounded-xl border-2 border-gray-100 text-gray-600 hover:border-brand-primary/40 hover:text-brand-primary disabled:opacity-50"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}
