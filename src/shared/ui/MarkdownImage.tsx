"use client";

import React from "react";

interface MarkdownImageProps {
  src?: string;
  alt?: string;
}

/**
 * 마크다운 이미지 렌더러
 * alt 텍스트에서 width, align 정보를 파싱하여 적용
 * 형식: ![altText|width=300|align=center](src)
 */
export const MarkdownImage: React.FC<MarkdownImageProps> = ({ src, alt }) => {
  if (!src) return null;

  let altText = alt || "";
  let width: number | undefined;
  let alignment: "left" | "center" | "right" = "left";

  // alt 텍스트에서 width, align 파싱
  if (alt && alt.includes("|")) {
    const parts = alt.split("|");
    altText = parts[0];
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i].trim();
      if (part.startsWith("width=")) {
        width = parseInt(part.replace("width=", ""), 10);
      } else if (part.startsWith("align=")) {
        alignment = part.replace("align=", "") as "left" | "center" | "right";
      }
    }
  }

  const alignmentClass = {
    left: "mr-auto",
    center: "mx-auto",
    right: "ml-auto",
  }[alignment];

  return (
    <img
      src={src}
      alt={altText}
      className={`rounded my-2 ${alignmentClass}`}
      style={{
        width: width ? `${width}px` : "auto",
        maxWidth: "100%",
        display: "block",
      }}
    />
  );
};
