"use client";

import { Button } from "@/shared/ui/button";
import { OctagonXIcon } from "lucide-react";

interface ErrorBoundaryFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function ErrorBoundaryFallback({
  error,
  resetErrorBoundary,
}: ErrorBoundaryFallbackProps) {
  return (
    <div
      role="alert"
      className="flex h-full w-full flex-col items-center justify-center rounded-lg border border-destructive bg-red-50/20 p-4"
    >
      <div className="flex items-center space-x-2">
        <OctagonXIcon className="size-5 text-destructive" />
        <h3 className="font-semibold text-destructive">Component Error</h3>
      </div>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Something went wrong in this part of the application.
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={resetErrorBoundary}
        className="mt-4"
      >
        Try again
      </Button>
    </div>
  );
}
