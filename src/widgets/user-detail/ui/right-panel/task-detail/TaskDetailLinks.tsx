"use client";

import { useState } from "react";
import { useUpdateTaskDetail } from "@/entities/task/hooks/useTaskDetail";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { LinkItem } from "@/entities/task/model/types";
import { ExternalLink, Trash2, Plus, Link as LinkIcon } from "lucide-react";

interface TaskDetailLinksProps {
  taskId: number;
  links: LinkItem[];
}

export function TaskDetailLinks({ taskId, links }: TaskDetailLinksProps) {
  const { mutate: updateDetail } = useUpdateTaskDetail(taskId);
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddLink = () => {
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) {
      alert("제목과 URL을 모두 입력해주세요.");
      return;
    }

    // URL 유효성 검사
    try {
      new URL(newLinkUrl);
    } catch {
      alert("올바른 URL 형식이 아닙니다.");
      return;
    }

    const newLinks = [
      ...links,
      {
        title: newLinkTitle,
        url: newLinkUrl,
      },
    ];

    updateDetail({ links: newLinks });
    setNewLinkTitle("");
    setNewLinkUrl("");
    setIsAdding(false);
  };

  const handleDeleteLink = (index: number) => {
    const newLinks = links.filter((_, i) => i !== index);
    updateDetail({ links: newLinks });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-sm flex items-center gap-2">
          🔗 관련 링크 ({links.length})
        </h4>
      </div>

      {/* 링크 목록 */}
      {links.length > 0 && (
        <div className="space-y-2">
          {links.map((link, index) => (
            <div
              key={index}
              className="flex items-center gap-2 group py-2 px-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <LinkIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  {link.title}
                  <ExternalLink className="h-3 w-3" />
                </a>
                <p className="text-xs text-gray-500 truncate">{link.url}</p>
              </div>
              <button
                onClick={() => handleDeleteLink(index)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 새 링크 추가 폼 */}
      {isAdding && (
        <div className="border border-gray-200 rounded-lg p-3 space-y-3 bg-gray-50">
          <div>
            <label className="text-xs text-gray-600 block mb-1">제목</label>
            <Input
              placeholder="링크 제목 (예: 참고 문서)"
              value={newLinkTitle}
              onChange={(e) => setNewLinkTitle(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 block mb-1">URL</label>
            <Input
              placeholder="https://example.com"
              value={newLinkUrl}
              onChange={(e) => setNewLinkUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddLink()}
              className="h-8 text-sm"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsAdding(false);
                setNewLinkTitle("");
                setNewLinkUrl("");
              }}
            >
              취소
            </Button>
            <Button
              size="sm"
              onClick={handleAddLink}
              disabled={!newLinkTitle.trim() || !newLinkUrl.trim()}
            >
              추가
            </Button>
          </div>
        </div>
      )}

      {/* 클릭하면 추가 폼 열기 */}
      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full border-2 border-dashed border-gray-200 rounded-lg p-4 text-center transition-colors cursor-pointer hover:border-blue-300"
        >
          <LinkIcon className="h-5 w-5 text-gray-400 mx-auto mb-1" />
          <p className="text-xs text-gray-500">클릭하여 링크를 추가하세요</p>
        </button>
      )}
    </div>
  );
}
