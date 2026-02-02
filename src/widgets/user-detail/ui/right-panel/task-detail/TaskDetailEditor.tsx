"use client";

import { useState, useEffect } from "react";
import { useUpdateTaskDetail } from "@/entities/task/hooks/useTaskDetail";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { Textarea } from "@/shared/ui/textarea";
import { MarkdownCodeBlock } from "@/shared/ui/MarkdownCodeBlock";

interface TaskDetailEditorProps {
  taskId: number;
  value: string;
  isEditing: boolean;
}

export function TaskDetailEditor({
  taskId,
  value,
  isEditing,
}: TaskDetailEditorProps) {
  const { mutate: updateDetail } = useUpdateTaskDetail(taskId);
  const [content, setContent] = useState(value);

  useEffect(() => {
    setContent(value);
  }, [value]);

  const handleBlur = () => {
    if (content !== value) {
      updateDetail({ description: content });
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          상세 설명 (Markdown)
        </label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={handleBlur}
          placeholder="업무에 대한 상세 설명을 작성하세요...&#10;&#10;Markdown 문법을 사용할 수 있습니다.&#10;- 목록&#10;- **굵게**&#10;- `코드`"
          className="min-h-[200px] font-mono text-sm"
        />
        <p className="text-xs text-gray-500">
          Markdown 문법을 지원합니다. 변경 사항은 자동으로 저장됩니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {content ? (
        <div className="prose prose-sm max-w-none prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            components={{
              code: MarkdownCodeBlock as any,
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      ) : (
        <p className="text-gray-400 italic text-sm py-4">
          상세 설명이 없습니다. 편집 버튼을 눌러 추가하세요.
        </p>
      )}
    </div>
  );
}
