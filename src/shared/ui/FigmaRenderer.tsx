"use client";

import React, { useMemo, memo } from "react";

interface FigmaRendererProps {
  url: string;
  className?: string;
}

export const FigmaRenderer = memo(function FigmaRenderer({
  url,
  className = "",
}: FigmaRendererProps) {
  const embedUrl = useMemo(() => {
    // Figma URL을 embed URL로 변환
    // https://www.figma.com/file/xxx... -> https://www.figma.com/embed?embed_host=share&url=...
    // https://www.figma.com/design/xxx... -> https://www.figma.com/embed?embed_host=share&url=...
    if (!url) return null;

    try {
      const figmaUrl = new URL(url);
      if (
        figmaUrl.hostname === "www.figma.com" ||
        figmaUrl.hostname === "figma.com"
      ) {
        return `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(url)}`;
      }
      return null;
    } catch {
      return null;
    }
  }, [url]);

  if (!embedUrl) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg border border-gray-200">
        <p className="text-gray-500">유효하지 않은 Figma URL입니다.</p>
      </div>
    );
  }

  return (
    <div className={`figma-renderer ${className}`}>
      <iframe
        key={embedUrl}
        src={embedUrl}
        className="w-full h-[600px] border border-gray-200 rounded-lg"
        allowFullScreen
      />
    </div>
  );
});
