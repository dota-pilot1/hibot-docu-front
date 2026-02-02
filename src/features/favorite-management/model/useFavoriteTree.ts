"use client";

import { useState, useEffect } from "react";
import { favoriteApi } from "../api/favoriteApi";
import type { FavoriteCategory } from "@/entities/favorite/model/types";

export const useFavoriteTree = () => {
  const [tree, setTree] = useState<FavoriteCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTree = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await favoriteApi.getTree();
      setTree(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch favorite tree");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTree();
  }, []);

  return { tree, isLoading, error, refetch: fetchTree };
};
