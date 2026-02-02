"use client";

import { useState, useEffect } from "react";
import { reviewApi } from "../api/reviewApi";
import type { ReviewContent } from "@/entities/review/model/types";

export const useReviewContents = (categoryId: number | null) => {
  const [contents, setContents] = useState<ReviewContent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContents = async () => {
    if (!categoryId) {
      setContents([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await reviewApi.getContents(categoryId);
      setContents(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch contents");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, [categoryId]);

  return { contents, isLoading, error, refetch: fetchContents };
};
