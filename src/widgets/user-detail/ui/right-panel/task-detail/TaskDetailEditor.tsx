"use client";

import { useState, useEffect, useRef } from "react";
import { useUpdateTaskDetail } from "@/entities/task/hooks/useTaskDetail";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { Textarea } from "@/shared/ui/textarea";
import { MarkdownCodeBlock } from "@/shared/ui/MarkdownCodeBlock";

interface TaskDetailEditorProps {
  taskId: number;
  value: string;
}

export function TaskDetailEditor({ taskId, value }: TaskDetailEditorProps) {
  const { mutate: updateDetail } = useUpdateTaskDetail(taskId);
  const [content, setContent] = useState(value);
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setContent(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (content !== value) {
      updateDetail({ description: content });
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-2">
        <h4 className="font-medium text-sm flex items-center gap-2">
          📋 업무 상세 설명
        </h4>
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={handleBlur}
          placeholder="업무에 대한 상세 설명을 작성하세요...&#10;&#10;Markdown 문법을 사용할 수 있습니다.&#10;- 목록&#10;- **굵게**&#10;- `코드`"
          className="min-h-[200px] font-mono text-sm"
        />
        <p className="text-xs text-gray-500">
          Markdown 문법을 지원합니다. 바깥을 클릭하면 자동 저장됩니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="font-medium text-sm flex items-center gap-2">
        📋 업무 상세 설명
      </h4>
      <div
        onClick={() => setIsEditing(true)}
        className="cursor-pointer rounded-lg border border-transparent hover:border-gray-200 hover:bg-gray-50 transition-colors p-2 -m-2"
      >
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
            클릭하여 상세 설명을 추가하세요...
          </p>
        )}
      </div>
    </div>
  );
}
