"use client";

import * as React from "react";
import { BaseDialog } from "./BaseDialog";
import { Button } from "@/shared/ui/button";

interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  variant?: "default" | "destructive";
  disabled?: boolean;
}

export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "확인",
  cancelText = "취소",
  onConfirm,
  variant = "default",
  disabled = false,
}: AlertDialogProps) {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onOpenChange(false);
    }
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
    >
      <div className="flex justify-end gap-2 mt-4">
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={disabled}
        >
          {cancelText}
        </Button>
        <Button variant={variant} onClick={handleConfirm} disabled={disabled}>
          {confirmText}
        </Button>
      </div>
    </BaseDialog>
  );
}
