"use client";

import * as React from "react";
import { BaseDialog } from "./BaseDialog";
import { Button } from "@/shared/ui/button";

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void | Promise<void>;
    isLoading?: boolean;
    variant?: "default" | "destructive";
}

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel = "확인",
    cancelLabel = "취소",
    onConfirm,
    isLoading = false,
    variant = "default",
}: ConfirmDialogProps) {
    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={title}
            description={description}
        >
            <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                    {cancelLabel}
                </Button>
                <Button
                    variant={variant}
                    onClick={async () => {
                        await onConfirm();
                        onOpenChange(false);
                    }}
                    isLoading={isLoading}
                >
                    {confirmLabel}
                </Button>
            </div>
        </BaseDialog>
    );
}
