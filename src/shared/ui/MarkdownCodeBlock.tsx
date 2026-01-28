import React, { useState } from "react";
import {
  ClipboardDocumentIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";

interface MarkdownCodeBlockProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const MarkdownCodeBlock = ({
  inline,
  className,
  children,
  ...props
}: MarkdownCodeBlockProps) => {
  const [copied, setCopied] = useState(false);

  const match = /language-(\w+)/.exec(className || "");
  const lang = match ? match[1] : "";
  const code = String(children).replace(/\n$/, "");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code: ", err);
    }
  };

  if (inline) {
    return (
      <code
        className="text-blue-600 dark:text-blue-400 font-semibold px-0.5"
        {...props}
      >
        {children}
      </code>
    );
  }

  if (!lang || lang === "text") {
    const isSingleLine = !code.includes("\n") && code.length < 50;
    if (isSingleLine) {
      return (
        <span className="font-semibold text-blue-600 dark:text-blue-400 mx-0.5">
          {children}
        </span>
      );
    }
    return (
      <div
        className={`my-3 py-1 whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300 font-sans ${className || ""}`}
        {...props}
      >
        {children}
      </div>
    );
  }

  return (
    <div className="relative group my-3 overflow-hidden bg-gray-50 border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between !px-4 py-1.5 bg-sky-100 border-b border-sky-200">
        <span className="text-[10px] font-mono text-sky-700 uppercase tracking-wider">
          {lang}
        </span>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1 px-1.5 py-1 rounded transition-all text-[10px] border ${
            copied
              ? "text-green-600 bg-green-100 border-green-200"
              : "text-sky-700 border-sky-200 hover:bg-sky-100"
          }`}
        >
          {copied ? (
            <>
              <ClipboardDocumentCheckIcon className="w-3.5 h-3.5" />
              <span>COPIED!</span>
            </>
          ) : (
            <>
              <ClipboardDocumentIcon className="w-3.5 h-3.5" />
              <span>COPY</span>
            </>
          )}
        </button>
      </div>
      <pre
        className={`!py-3 !px-5 overflow-x-auto text-sm font-mono leading-relaxed text-gray-800 bg-transparent m-0 ${className || ""}`}
        {...props}
      >
        <code>{children}</code>
      </pre>
    </div>
  );
};
