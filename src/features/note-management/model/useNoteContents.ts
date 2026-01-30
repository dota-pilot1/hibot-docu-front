"use client";

import { useState, useEffect } from "react";
import { noteApi } from "../api/noteApi";
import type { NoteContent } from "@/entities/note/model/types";

export const useNoteContents = (categoryId: number | null) => {
  const [contents, setContents] = useState<NoteContent[]>([]);
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
      const data = await noteApi.getContents(categoryId);
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
