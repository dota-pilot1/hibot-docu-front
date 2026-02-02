"use client";

import { useState, useEffect } from "react";
import { pilotApi } from "../api/pilotApi";
import type { PilotContent } from "@/entities/pilot/model/types";

export const usePilotContents = (categoryId: number | null) => {
  const [contents, setContents] = useState<PilotContent[]>([]);
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
      const data = await pilotApi.getContents(categoryId);
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
