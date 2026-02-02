"use client";

import { useState, useEffect } from "react";
import { pilotApi } from "../api/pilotApi";
import type { PilotCategory, PilotType } from "@/entities/pilot/model/types";

export const usePilotTree = (type?: PilotType) => {
  const [tree, setTree] = useState<PilotCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTree = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = type
        ? await pilotApi.getCategoriesByType(type)
        : await pilotApi.getTree();
      setTree(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch pilot tree");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTree();
  }, [type]);

  return { tree, isLoading, error, refetch: fetchTree };
};
