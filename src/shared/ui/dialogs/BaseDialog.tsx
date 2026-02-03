"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

interface BaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  maxWidth?: string; // e.g., "max-w-md", "max-w-lg", "max-w-xl"
  fullScreen?: boolean;
}

export function BaseDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
  maxWidth = "max-w-md",
  fullScreen = false,
}: BaseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex flex-col p-0 gap-0 rounded-lg",
          fullScreen
            ? "w-screen h-screen max-w-none max-h-none rounded-none"
            : cn("max-h-[90vh]", maxWidth),
          className,
        )}
        showCloseButton={false}
      >
        <DialogHeader className="shrink-0 rounded-t-lg">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
        {footer && (
          <DialogFooter className="px-6 py-4 shrink-0 border-t bg-muted/30 rounded-b-lg">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Form Dialog - 기본 폼 다이어로그
interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  onSubmit?: () => void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  submitDisabled?: boolean;
  maxWidth?: string;
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSubmit,
  onCancel,
  submitLabel = "저장",
  cancelLabel = "취소",
  isSubmitting = false,
  submitDisabled = false,
  maxWidth = "max-w-md",
}: FormDialogProps) {
  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      maxWidth={maxWidth}
      footer={
        <>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            {cancelLabel}
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting || submitDisabled}>
            {isSubmitting ? "처리 중..." : submitLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-4">{children}</div>
    </BaseDialog>
  );
}

// Form Field - 폼 필드 컴포넌트
interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
  description?: string;
}

export function FormField({
  label,
  children,
  required,
  error,
  description,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium leading-none">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      {children}
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
