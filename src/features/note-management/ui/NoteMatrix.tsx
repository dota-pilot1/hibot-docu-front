"use client";

import { useState, useEffect } from "react";
import { noteApi } from "../api/noteApi";
import { useNoteMutations } from "../model/useNoteMutations";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import { ConfirmDialog } from "@/shared/ui/dialogs/ConfirmDialog";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { NoteCard } from "./NoteCard";
import type { NoteCategory } from "@/entities/note/model/types";
import { PlusIcon, TrashIcon, BookOpen } from "lucide-react";

export const NoteMatrix = () => {
  const [tree, setTree] = useState<NoteCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(true); // 개인 노트이므로 기본 Edit 모드
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [topicData, setTopicData] = useState({
    name: "",
    description: "",
    parentId: null as number | null,
  });

  // Confirm Modal states
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);

  const { createCategory, deleteCategory } = useNoteMutations();

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await noteApi.getTree();
      setTree(data);
    } catch (err: any) {
      console.error("Failed to fetch notes:", err);
      setError(err.message || "Failed to load notes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddGroup = async () => {
    if (!groupName.trim()) return;
    try {
      await createCategory({ name: groupName, noteType: "NOTE" });
      setShowGroupModal(false);
      setGroupName("");
      fetchData();
    } catch (err) {
      console.error("Failed to create group:", err);
    }
  };

  const handleAddTopic = async () => {
    if (!topicData.name.trim()) return;
    try {
      await createCategory({
        name: topicData.name,
        description: topicData.description,
        parentId: topicData.parentId ?? undefined,
        noteType: "NOTE",
      });
      setShowTopicModal(false);
      setTopicData({ name: "", description: "", parentId: null });
      fetchData();
    } catch (err) {
      console.error("Failed to create topic:", err);
    }
  };

  const handleDeleteCategory = (id: number) => {
    setCategoryToDelete(id);
    setConfirmDeleteOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <p className="text-center text-gray-500">Loading notes...</p>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center text-red-500">
          <p>Error: {error}</p>
          <Button onClick={fetchData} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Render tree recursively - top level groups
  const renderCategory = (category: NoteCategory) => {
    const hasChildren = category.children && category.children.length > 0;
    const isTopLevel = category.depth === 0;

    if (isTopLevel) {
      return (
        <Card
          key={category.id}
          className="border-none shadow-md bg-white dark:bg-zinc-900 overflow-hidden"
        >
          <CardHeader className="border-b border-gray-200 dark:border-zinc-800 pb-4 bg-blue-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-blue-500" />
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {category.name}
                </CardTitle>
                <Badge
                  variant="secondary"
                  className="bg-blue-50 text-blue-600 border-blue-100 px-2.5 py-0.5 text-xs"
                >
                  {hasChildren ? category.children!.length : 0}
                </Badge>
                {isAdminMode && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCategory(category.id)}
                    className="h-8 w-8 p-0"
                  >
                    <TrashIcon className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
              {isAdminMode && (
                <Button
                  size="sm"
                  className="shadow-sm"
                  onClick={() => {
                    setTopicData({ ...topicData, parentId: category.id });
                    setShowTopicModal(true);
                  }}
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  주제 추가
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {!hasChildren ? (
              <p className="text-sm text-gray-400 text-center py-12">
                아직 주제가 없습니다
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.children!.map((child) => (
                  <NoteCard
                    key={child.id}
                    note={child}
                    isAdminMode={isAdminMode}
                    onDelete={handleDeleteCategory}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BookOpen className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Notes</h1>
            <p className="text-sm text-gray-500 mt-1">개인 노트 관리</p>
          </div>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full shadow-sm hover:border-blue-200 transition-all cursor-pointer select-none"
          onClick={() => setIsAdminMode(!isAdminMode)}
        >
          <span
            className={`text-xs font-medium ${isAdminMode ? "text-blue-600" : "text-gray-400"}`}
          >
            Edit
          </span>
          <div
            className={`w-8 h-4 rounded-full p-0.5 transition-colors ${isAdminMode ? "bg-blue-600" : "bg-gray-200"}`}
          >
            <div
              className={`w-3 h-3 bg-white rounded-full transition-transform ${isAdminMode ? "translate-x-4" : "translate-x-0"}`}
            />
          </div>
        </div>
      </div>

      {tree.length === 0 ? (
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="py-12">
            <p className="text-center text-gray-400">
              노트가 없습니다. 그룹을 추가해주세요.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">{tree.map(renderCategory)}</div>
      )}

      {isAdminMode && (
        <Button
          onClick={() => setShowGroupModal(true)}
          variant="outline"
          className="w-full py-8 border-dashed"
        >
          <PlusIcon className="h-4 w-4 mr-2" />새 그룹 추가
        </Button>
      )}

      {/* Group Modal */}
      <FormDialog
        open={showGroupModal}
        onOpenChange={setShowGroupModal}
        title="새 그룹 추가"
        submitLabel="생성"
        onSubmit={handleAddGroup}
      >
        <div className="space-y-4">
          <Input
            placeholder="그룹 이름"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
        </div>
      </FormDialog>

      {/* Topic Modal */}
      <FormDialog
        open={showTopicModal}
        onOpenChange={setShowTopicModal}
        title="새 주제 추가"
        submitLabel="추가"
        onSubmit={handleAddTopic}
      >
        <div className="space-y-4">
          <Input
            placeholder="주제 이름"
            value={topicData.name}
            onChange={(e) =>
              setTopicData({ ...topicData, name: e.target.value })
            }
          />
          <Textarea
            placeholder="설명 (선택)"
            value={topicData.description}
            onChange={(e) =>
              setTopicData({ ...topicData, description: e.target.value })
            }
            rows={3}
          />
        </div>
      </FormDialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="삭제 확인"
        description="정말로 삭제하시겠습니까?"
        variant="destructive"
        onConfirm={async () => {
          if (categoryToDelete) {
            await deleteCategory(categoryToDelete);
            fetchData();
            setCategoryToDelete(null);
          }
        }}
      />
    </div>
  );
};
