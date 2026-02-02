"use client";

import { useState, useEffect } from "react";
import { dbAdminApi } from "../api/dbAdminApi";
import type { DbAdminCategory, DbAdminType } from "@/entities/db-admin/model/types";

export const useDbAdminTree = (type?: DbAdminType) => {
  const [tree, setTree] = useState<DbAdminCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTree = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = type
        ? await dbAdminApi.getCategoriesByType(type)
        : await dbAdminApi.getTree();
      setTree(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch db-admin tree");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTree();
  }, [type]);

  return { tree, isLoading, error, refetch: fetchTree };
};
