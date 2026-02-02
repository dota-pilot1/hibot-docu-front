"use client";

import { useState, useEffect } from "react";
import { reviewApi } from "../api/reviewApi";
import type { ReviewCategory, ReviewType } from "@/entities/review/model/types";

export const useReviewTree = (type?: ReviewType) => {
  const [tree, setTree] = useState<ReviewCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTree = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = type
        ? await reviewApi.getCategoriesByType(type)
        : await reviewApi.getTree();
      setTree(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch review tree");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTree();
  }, [type]);

  return { tree, isLoading, error, refetch: fetchTree };
};
