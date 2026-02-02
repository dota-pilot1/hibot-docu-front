"use client";

import { useState, useEffect } from "react";
import { favoriteApi } from "../api/favoriteApi";
import type { FavoriteContent } from "@/entities/favorite/model/types";

export const useFavoriteContents = (categoryId: number | null) => {
  const [contents, setContents] = useState<FavoriteContent[]>([]);
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
      const data = await favoriteApi.getContents(categoryId);
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
