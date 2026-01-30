"use client";

import { useState, useEffect } from "react";
import { noteApi } from "../api/noteApi";
import type { NoteCategory, NoteType } from "@/entities/note/model/types";

export const useNoteTree = (type?: NoteType) => {
  const [tree, setTree] = useState<NoteCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTree = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = type
        ? await noteApi.getCategoriesByType(type)
        : await noteApi.getTree();
      setTree(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch note tree");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTree();
  }, [type]);

  return { tree, isLoading, error, refetch: fetchTree };
};
