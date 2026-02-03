"use client";

import { useEffect } from "react";
import { Button } from "@/shared/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <h1 className="text-4xl font-bold text-destructive">
          Oops! Something went wrong.
        </h1>
        <p className="text-muted-foreground">
          An unexpected error has occurred. Please try again.
        </p>
        <div className="rounded-md bg-muted p-4 text-xs text-muted-foreground">
          <p>Error: {error.message}</p>
        </div>
        <Button onClick={() => reset()}>Try again</Button>
      </div>
    </div>
  );
}
