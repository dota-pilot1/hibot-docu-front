"use client";

import * as React from "react";
import { BaseDialog } from "./BaseDialog";
import { Button } from "@/shared/ui/button";

interface AlertDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    confirmLabel?: string;
    variant?: "default" | "destructive";
}

export function AlertDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel = "확인",
    variant = "default",
}: AlertDialogProps) {
    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={title}
            description={description}
        >
            <div className="flex justify-end gap-2 mt-4">
                <Button
                    variant={variant}
                    onClick={() => onOpenChange(false)}
                >
                    {confirmLabel}
                </Button>
            </div>
        </BaseDialog>
    );
}
