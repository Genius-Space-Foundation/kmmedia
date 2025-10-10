"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BulkActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (action: string, comment: string) => void;
  selectedCount: number;
  actions: Array<{
    value: string;
    label: string;
  }>;
  loading?: boolean;
  commentLabel?: string;
  commentPlaceholder?: string;
}

export default function BulkActionsModal({
  isOpen,
  onClose,
  onConfirm,
  selectedCount,
  actions,
  loading = false,
  commentLabel = "Comments (Optional)",
  commentPlaceholder = "Add comments for all selected items...",
}: BulkActionsModalProps) {
  const [action, setAction] = useState("");
  const [comment, setComment] = useState("");

  const handleConfirm = () => {
    if (!action) return;
    onConfirm(action, comment);
    setAction("");
    setComment("");
  };

  const handleClose = () => {
    setAction("");
    setComment("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Actions</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Action</Label>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger>
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                {actions.map((actionItem) => (
                  <SelectItem key={actionItem.value} value={actionItem.value}>
                    {actionItem.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="bulk-comment">{commentLabel}</Label>
            <Textarea
              id="bulk-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={commentPlaceholder}
              rows={3}
            />
          </div>
          <p className="text-sm text-gray-600">
            This action will be applied to {selectedCount} selected items.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!action || loading}>
            {loading ? "Processing..." : "Apply Action"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


