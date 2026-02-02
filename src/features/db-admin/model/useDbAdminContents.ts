"use client";

import { useState, useEffect } from "react";
import { dbAdminApi } from "../api/dbAdminApi";
import type { DbAdminContent } from "@/entities/db-admin/model/types";

export const useDbAdminContents = (categoryId: number | null) => {
  const [contents, setContents] = useState<DbAdminContent[]>([]);
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
      const data = await dbAdminApi.getContents(categoryId);
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
