"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { ExternalLink, ChevronDown, ChevronUp } from "lucide-react";

interface TaskDetailFigmaProps {
  url: string;
}

export function TaskDetailFigma({ url }: TaskDetailFigmaProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Figma URL을 임베드 URL로 변환
  const getEmbedUrl = (figmaUrl: string) => {
    try {
      return `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(figmaUrl)}`;
    } catch {
      return "";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm flex items-center gap-2">
          🎨 피그마 디자인
        </h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              접기
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              펼치기
            </>
          )}
        </Button>
      </div>

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-blue-600 hover:underline flex items-center gap-1 break-all"
      >
        <ExternalLink className="h-3 w-3 flex-shrink-0" />
        {url}
      </a>

      {isExpanded && (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          <iframe
            src={getEmbedUrl(url)}
            className="w-full h-96"
            allowFullScreen
            title="Figma Design"
          />
        </div>
      )}
    </div>
  );
}
