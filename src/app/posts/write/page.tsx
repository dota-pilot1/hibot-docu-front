import { Suspense } from "react";
import PostWriteClient from "./PostWriteClient";

export default function PostWritePage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto py-8 px-4 max-w-4xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-24" />
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </div>
      }
    >
      <PostWriteClient />
    </Suspense>
  );
}
