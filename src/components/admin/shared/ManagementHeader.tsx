"use client";

import { Button } from "@/components/ui/button";
import { CheckSquare, Download } from "lucide-react";

interface ManagementHeaderProps {
  title: string;
  description: string;
  selectedCount: number;
  onBulkAction: () => void;
  onRefresh: () => void;
  showBulkActions?: boolean;
  additionalButtons?: React.ReactNode;
}

export default function ManagementHeader({
  title,
  description,
  selectedCount,
  onBulkAction,
  onRefresh,
  showBulkActions = true,
  additionalButtons,
}: ManagementHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>
      <div className="flex gap-2">
        {additionalButtons}
        {showBulkActions && (
          <Button
            variant="outline"
            onClick={onBulkAction}
            disabled={selectedCount === 0}
          >
            <CheckSquare className="h-4 w-4 mr-2" />
            Bulk Actions ({selectedCount})
          </Button>
        )}
        <Button onClick={onRefresh} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    </div>
  );
}


