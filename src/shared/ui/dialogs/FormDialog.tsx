"use client";

import * as React from "react";
import { BaseDialog } from "./BaseDialog";
import { Button } from "@/shared/ui/button";

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  submitLabel?: string;
  cancelLabel?: string;
  onSubmit: (e: React.FormEvent) => void | Promise<void>;
  children: React.ReactNode;
  isLoading?: boolean;
  maxWidth?: string;
  fullScreen?: boolean;
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  submitLabel = "저장",
  cancelLabel = "취소",
  onSubmit,
  children,
  isLoading = false,
  maxWidth,
  fullScreen = false,
}: FormDialogProps) {
  const handleOnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(e);
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      maxWidth={maxWidth}
      fullScreen={fullScreen}
      footer={
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button type="submit" isLoading={isLoading} onClick={handleOnSubmit}>
            {submitLabel}
          </Button>
        </div>
      }
    >
      <form
        onSubmit={handleOnSubmit}
        className={fullScreen ? "h-full flex flex-col" : "space-y-4"}
      >
        <div className={fullScreen ? "flex-1 min-h-0" : "py-2"}>{children}</div>
      </form>
    </BaseDialog>
  );
}
