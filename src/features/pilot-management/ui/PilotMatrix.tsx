"use client";

import { useState, useEffect } from "react";
import { pilotApi } from "../api/pilotApi";
import { usePilotMutations } from "../model/usePilotMutations";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import { ConfirmDialog } from "@/shared/ui/dialogs/ConfirmDialog";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { PilotCard } from "./PilotCard";
import type { PilotCategory } from "@/entities/pilot/model/types";
import { PlusIcon, TrashIcon } from "lucide-react";

export const PilotMatrix = () => {
  const [tree, setTree] = useState<PilotCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [projectData, setProjectData] = useState({
    name: "",
    projectType: "",
    description: "",
    parentId: null as number | null,
  });

  // Confirm Modal states
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);

  const { createCategory, deleteCategory } = usePilotMutations();

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Fetching pilot tree...");
      const data = await pilotApi.getTree();
      console.log("Received tree:", data);
      setTree(data);
    } catch (err: any) {
      console.error("Failed to fetch pilots:", err);
      setError(err.message || "Failed to load pilots");
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
      await createCategory({ name: groupName, pilotType: "NOTE" });
      setShowGroupModal(false);
      setGroupName("");
      fetchData();
    } catch (err) {
      console.error("Failed to create group:", err);
    }
  };

  const handleAddProject = async () => {
    if (!projectData.name.trim() || !projectData.projectType.trim()) return;
    try {
      await createCategory({
        name: projectData.name,
        projectType: projectData.projectType,
        description: projectData.description,
        parentId: projectData.parentId ?? undefined,
        pilotType: "NOTE",
      });
      setShowProjectModal(false);
      setProjectData({
        name: "",
        projectType: "",
        description: "",
        parentId: null,
      });
      fetchData();
    } catch (err) {
      console.error("Failed to create project:", err);
    }
  };

  const handleDeleteCategory = (id: number) => {
    setCategoryToDelete(id);
    setConfirmDeleteOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <p className="text-center text-gray-500">Loading pilots...</p>
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

  // Render tree recursively
  const renderCategory = (category: PilotCategory) => {
    const hasChildren = category.children && category.children.length > 0;
    const isTopLevel = category.depth === 0;

    if (isTopLevel) {
      // Top level - render as a card group
      return (
        <Card
          key={category.id}
          className="border-none shadow-md bg-white dark:bg-zinc-900 overflow-hidden"
        >
          <CardHeader className="border-b border-gray-200 dark:border-zinc-800 pb-4 bg-green-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-green-500" />
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {category.name}
                </CardTitle>
                <Badge
                  variant="secondary"
                  className="bg-green-50 text-green-600 border-green-100 px-2.5 py-0.5 text-xs"
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
                  className="shadow-sm bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setProjectData({ ...projectData, parentId: category.id });
                    setShowProjectModal(true);
                  }}
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  추가
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {!hasChildren ? (
              <p className="text-sm text-gray-400 text-center py-12">
                아직 항목이 없습니다
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.children!.map((child) => (
                  <PilotCard
                    key={child.id}
                    project={child}
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Pilot Project Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">파일럿 프로젝트 관리</p>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full shadow-sm hover:border-green-200 transition-all cursor-pointer select-none"
          onClick={() => setIsAdminMode(!isAdminMode)}
        >
          <span
            className={`text-xs font-medium ${isAdminMode ? "text-green-600" : "text-gray-400"}`}
          >
            Admin
          </span>
          <div
            className={`w-8 h-4 rounded-full p-0.5 transition-colors ${isAdminMode ? "bg-green-600" : "bg-gray-200"}`}
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
              파일럿 프로젝트가 없습니다. Admin 모드를 켜고 그룹을 추가해주세요.
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
          className="w-full py-8 border-dashed border-green-300 hover:border-green-500 hover:bg-green-50"
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

      {/* Project Modal */}
      <FormDialog
        open={showProjectModal}
        onOpenChange={setShowProjectModal}
        title="새 파일럿 프로젝트 추가"
        submitLabel="추가"
        onSubmit={handleAddProject}
      >
        <div className="space-y-4">
          <Input
            placeholder="프로젝트 이름 (예: 결제 시스템 POC)"
            value={projectData.name}
            onChange={(e) =>
              setProjectData({ ...projectData, name: e.target.value })
            }
          />
          <Input
            placeholder="프로젝트 코드 (예: payment-poc)"
            value={projectData.projectType}
            onChange={(e) =>
              setProjectData({ ...projectData, projectType: e.target.value })
            }
          />
          <Textarea
            placeholder="설명 (선택)"
            value={projectData.description}
            onChange={(e) =>
              setProjectData({ ...projectData, description: e.target.value })
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
