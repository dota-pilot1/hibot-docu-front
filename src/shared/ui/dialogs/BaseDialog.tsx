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
import { cn } from "@/shared/lib/utils";

interface BaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  maxWidth?: string; // e.g., "max-w-2xl", "max-w-5xl"
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
  maxWidth = "sm:max-w-lg",
  fullScreen = false,
}: BaseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex flex-col p-0 gap-0",
          fullScreen
            ? "w-screen h-screen max-w-none max-h-none rounded-none"
            : cn("max-h-[90vh]", maxWidth),
          className,
        )}
      >
        <DialogHeader className="shrink-0">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 py-2">{children}</div>
        {footer && (
          <DialogFooter className="p-6 pt-2 shrink-0 border-t border-gray-100">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
