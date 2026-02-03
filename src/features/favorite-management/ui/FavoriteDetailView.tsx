"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useFavoriteTree } from "../model/useFavoriteTree";
import { useFavoriteContents } from "../model/useFavoriteContents";
import {
  useFavoriteFiles,
  useFavoriteFileMutations,
} from "../model/useFavoriteFiles";
import CommonFileUploader from "@/shared/ui/CommonFileUploader";
import CommonFileGrid from "@/shared/ui/CommonFileGrid";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Copy,
  Check,
  ExternalLink,
  Terminal,
  Link as LinkIcon,
  FileText,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Label } from "@/shared/ui/label";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import { ConfirmDialog } from "@/shared/ui/dialogs/ConfirmDialog";
import { favoriteApi } from "../api/favoriteApi";
import dynamic from "next/dynamic";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  closestCenter,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableTreeItem } from "./SortableTreeItem";
import { SortableContentItem } from "./SortableContentItem";
import { GripVertical, X } from "lucide-react";

const LexicalEditor = dynamic(
  () => import("@/shared/ui/lexical/LexicalEditor"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[200px] w-full bg-gray-50 animate-pulse rounded-lg border border-gray-200" />
    ),
  },
);

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { MarkdownCodeBlock } from "@/shared/ui/MarkdownCodeBlock";
import { MarkdownImage } from "@/shared/ui/MarkdownImage";
import { ContentTypeIcon } from "./ContentTypeIcon";

import type {
  FavoriteCategory,
  FavoriteContent,
  FavoriteType,
} from "@/entities/favorite/model/types";

// 복사 버튼 컴포넌트
const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className={`transition-all ${copied ? "bg-green-50 border-green-300 text-green-600" : ""}`}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 mr-1" />
          복사됨
        </>
      ) : (
        <>
          <Copy className="h-4 w-4 mr-1" />
          복사
        </>
      )}
    </Button>
  );
};

export const FavoriteDetailView = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const {
    tree,
    isLoading: treeLoading,
    refetch: refetchTree,
  } = useFavoriteTree();
  const {
    contents,
    isLoading: contentsLoading,
    refetch: refetchContents,
  } = useFavoriteContents(selectedCategory);

  // File hooks
  const {
    files,
    isLoading: filesLoading,
    refetch: refetchFiles,
  } = useFavoriteFiles(selectedCategory);
  const { isUploading, uploadFile, deleteFile, renameFile, downloadFile } =
    useFavoriteFileMutations();

  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  // 드래그 중 임시 상태
  const [tempTree, setTempTree] = useState<FavoriteCategory[] | null>(null);
  const [tempContents, setTempContents] = useState<FavoriteContent[] | null>(
    null,
  );

  const displayTree = tempTree ?? tree;
  const displayContents = tempContents ?? contents;

  // Modal states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryModalMode, setCategoryModalMode] = useState<"create" | "edit">(
    "create",
  );
  const [editingCategory, setEditingCategory] =
    useState<FavoriteCategory | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    parentId: null as number | null,
    favoriteType: "COMMAND" as FavoriteType,
  });

  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [contentModalMode, setContentModalMode] = useState<"create" | "edit">(
    "create",
  );
  const [editingContent, setEditingContent] = useState<FavoriteContent | null>(
    null,
  );
  const [contentForm, setContentForm] = useState<{
    title: string;
    content: string;
    contentType: FavoriteType;
    metadata: { url?: string; language?: string; tags?: string[] };
  }>({
    title: "",
    content: "",
    contentType: "COMMAND",
    metadata: {},
  });

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingContent, setViewingContent] = useState<FavoriteContent | null>(
    null,
  );

  // Confirm Modal states
  const [confirmDeleteCategoryOpen, setConfirmDeleteCategoryOpen] =
    useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [confirmDeleteContentOpen, setConfirmDeleteContentOpen] =
    useState(false);
  const [contentToDelete, setContentToDelete] = useState<number | null>(null);

  // URL 파라미터로 카테고리 선택
  useEffect(() => {
    if (categoryParam && tree.length > 0) {
      const catId = parseInt(categoryParam);
      if (!isNaN(catId)) {
        setSelectedCategory(catId);
        // 부모 카테고리도 확장
        const findParents = (
          nodes: FavoriteCategory[],
          targetId: number,
          parents: number[] = [],
        ): number[] => {
          for (const node of nodes) {
            if (node.id === targetId) return parents;
            if (node.children) {
              const found = findParents(node.children, targetId, [
                ...parents,
                node.id,
              ]);
              if (found.length > 0) return found;
            }
          }
          return [];
        };
        const parents = findParents(tree, catId);
        setExpandedIds(new Set([...parents, catId]));
      }
    }
  }, [categoryParam, tree]);

  // Filter tree: find the selected project and show it as root
  const getFilteredTree = (
    sourceTree: FavoriteCategory[],
  ): FavoriteCategory[] => {
    if (categoryParam && sourceTree.length > 0) {
      const catId = parseInt(categoryParam);
      const findCategory = (
        categories: FavoriteCategory[],
      ): FavoriteCategory | null => {
        for (const cat of categories) {
          if (cat.id === catId) return cat;
          if (cat.children && cat.children.length > 0) {
            const found = findCategory(cat.children);
            if (found) return found;
          }
        }
        return null;
      };
      const category = findCategory(sourceTree);
      if (category) return [category];
      return [];
    }
    return sourceTree;
  };

  const filteredTree = getFilteredTree(displayTree);

  useEffect(() => {
    if (filteredTree.length > 0 && !categoryParam) {
      const collectIds = (categories: FavoriteCategory[]): number[] => {
        const ids: number[] = [];
        for (const cat of categories) {
          ids.push(cat.id);
          if (cat.children && cat.children.length > 0) {
            ids.push(...collectIds(cat.children));
          }
        }
        return ids;
      };
      setExpandedIds(new Set(collectIds(filteredTree)));
    }
  }, [filteredTree.length, categoryParam]);

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Helper to find selected category
  const findCategoryById = (
    nodes: FavoriteCategory[],
    id: number,
  ): FavoriteCategory | undefined => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findCategoryById(node.children, id);
        if (found) return found;
      }
    }
    return undefined;
  };

  const selectedCategoryData = selectedCategory
    ? findCategoryById(tree, selectedCategory)
    : null;

  // File handlers
  const handleFileUpload = async (file: File) => {
    if (!selectedCategory) return;
    await uploadFile(selectedCategory, file);
    refetchFiles();
  };

  const handleFileDelete = async (fileId: number) => {
    if (!confirm("파일을 삭제하시겠습니까?")) return;
    await deleteFile(fileId);
    refetchFiles();
  };

  const handleFileRename = async (fileId: number, newName: string) => {
    await renameFile(fileId, newName);
    refetchFiles();
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // 트리 드래그 핸들러
  const findSiblings = (
    nodes: FavoriteCategory[],
    targetId: number,
  ): FavoriteCategory[] | null => {
    for (const node of nodes) {
      if (node.id === targetId) return nodes;
      if (node.children) {
        const found = findSiblings(node.children, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  const replaceSiblings = (
    nodes: FavoriteCategory[],
    targetId: number,
    newSiblings: FavoriteCategory[],
  ): FavoriteCategory[] => {
    if (nodes.some((n) => n.id === targetId)) return newSiblings;
    return nodes.map((node) => {
      if (node.children) {
        const found = node.children.some((c) => c.id === targetId);
        if (found) return { ...node, children: newSiblings };
        return {
          ...node,
          children: replaceSiblings(node.children, targetId, newSiblings),
        };
      }
      return node;
    });
  };

  const handleCategoryDragStart = () => {
    setTempTree(JSON.parse(JSON.stringify(tree)));
  };

  const handleCategoryDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !tempTree || active.id === over.id) return;

    const activeId = active.id as number;
    const overId = over.id as number;

    const activeSiblings = findSiblings(tempTree, activeId);
    const overSiblings = findSiblings(tempTree, overId);
    if (!activeSiblings || !overSiblings || activeSiblings !== overSiblings)
      return;

    const oldIndex = activeSiblings.findIndex((s) => s.id === activeId);
    const newIndex = activeSiblings.findIndex((s) => s.id === overId);
    if (newIndex === -1 || oldIndex === newIndex) return;

    const newSiblings = arrayMove(activeSiblings, oldIndex, newIndex);
    const newTree = replaceSiblings(tempTree, activeId, newSiblings);
    setTempTree(newTree);
  };

  const handleCategoryDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !tempTree) {
      setTempTree(null);
      return;
    }

    const activeId = active.id as number;
    const siblings = findSiblings(tempTree, activeId);
    if (!siblings) {
      setTempTree(null);
      return;
    }

    const categoryIds = siblings.map((c) => c.id);
    const parentId = siblings[0].parentId ?? null;

    try {
      await favoriteApi.reorderCategories(categoryIds, parentId);
      refetchTree();
    } catch (error) {
      console.error("Failed to reorder categories:", error);
    } finally {
      setTempTree(null);
    }
  };

  // Content 드래그 핸들러
  const handleContentDragStart = () => {
    setTempContents([...contents]);
  };

  const handleContentDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !tempContents || active.id === over.id) return;

    const oldIndex = tempContents.findIndex((c) => c.id === active.id);
    const newIndex = tempContents.findIndex((c) => c.id === over.id);
    if (newIndex === -1 || oldIndex === newIndex) return;

    setTempContents(arrayMove(tempContents, oldIndex, newIndex));
  };

  const handleContentDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !selectedCategory || !tempContents) {
      setTempContents(null);
      return;
    }

    const contentIds = tempContents.map((c) => c.id);
    try {
      await favoriteApi.reorderContents(selectedCategory, contentIds);
      refetchContents();
    } catch (error) {
      console.error("Failed to reorder contents:", error);
    } finally {
      setTempContents(null);
    }
  };

  // 트리 플랫 배열 변환
  const flattenTree = (
    categories: FavoriteCategory[],
    result: FavoriteCategory[] = [],
  ): FavoriteCategory[] => {
    for (const cat of categories) {
      result.push(cat);
      if (cat.children && cat.children.length > 0 && expandedIds.has(cat.id)) {
        flattenTree(cat.children, result);
      }
    }
    return result;
  };

  const flatCategories = flattenTree(filteredTree);

  const renderTreeItem = (cat: FavoriteCategory) => (
    <SortableTreeItem key={cat.id} id={cat.id} isAdminMode={isAdminMode}>
      {({ attributes, listeners }) => (
        <div
          style={{ marginLeft: `${cat.depth * 20}px` }}
          className={`group flex items-center gap-1 rounded-md transition-colors ${selectedCategory === cat.id ? "bg-purple-100" : "hover:bg-gray-100"}`}
        >
          {cat.children && cat.children.length > 0 ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleExpand(cat.id)}
              className="h-8 w-6 p-0 hover:bg-transparent shrink-0"
            >
              {expandedIds.has(cat.id) ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <div className="w-6 shrink-0" />
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex-1 justify-start h-8 px-2 hover:bg-transparent ${selectedCategory === cat.id ? "text-purple-900" : ""}`}
          >
            {cat.children && cat.children.length > 0 ? (
              expandedIds.has(cat.id) ? (
                <FolderOpen className="h-4 w-4 mr-2 text-purple-500" />
              ) : (
                <Folder className="h-4 w-4 mr-2 text-purple-500" />
              )
            ) : (
              <div className="mr-2">
                <ContentTypeIcon
                  type={cat.favoriteType}
                  className="h-4 w-4 text-gray-400"
                />
              </div>
            )}
            <span className="truncate">{cat.name}</span>
          </Button>

          {isAdminMode && (
            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity pr-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  setCategoryModalMode("create");
                  setCategoryForm({
                    name: "",
                    parentId: cat.id,
                    favoriteType: "COMMAND",
                  });
                  setIsCategoryModalOpen(true);
                }}
              >
                <Plus className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  setCategoryModalMode("edit");
                  setEditingCategory(cat);
                  setCategoryForm({
                    name: cat.name,
                    parentId: cat.parentId ?? null,
                    favoriteType: cat.favoriteType,
                  });
                  setIsCategoryModalOpen(true);
                }}
              >
                <Pencil className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  setCategoryToDelete(cat.id);
                  setConfirmDeleteCategoryOpen(true);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
              <div
                {...attributes}
                {...listeners}
                className="h-7 w-7 flex items-center justify-center hover:bg-gray-200/50 rounded cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
              >
                <GripVertical className="h-4 w-4" />
              </div>
            </div>
          )}
        </div>
      )}
    </SortableTreeItem>
  );

  // 콘텐츠 타입별 렌더링
  const renderContentPreview = (content: FavoriteContent) => {
    switch (content.contentType) {
      case "COMMAND":
        return (
          <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-green-400 overflow-x-auto">
            <pre className="whitespace-pre-wrap">{content.content}</pre>
          </div>
        );
      case "LINK":
        return (
          <a
            href={content.content || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            {content.content || "링크 없음"}
          </a>
        );
      case "DOCUMENT":
        return (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkBreaks]}
              components={{
                code: MarkdownCodeBlock as any,
                img: MarkdownImage as any,
              }}
            >
              {content.content || ""}
            </ReactMarkdown>
          </div>
        );
      default:
        return <p className="text-gray-500">{content.content}</p>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/favorites")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">즐찾 관리</h1>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full shadow-sm hover:border-purple-200 transition-all cursor-pointer select-none"
          onClick={() => setIsAdminMode(!isAdminMode)}
        >
          <span
            className={`text-xs font-medium ${isAdminMode ? "text-purple-600" : "text-gray-400"}`}
          >
            Admin
          </span>
          <div
            className={`w-8 h-4 rounded-full p-0.5 transition-colors ${isAdminMode ? "bg-purple-600" : "bg-gray-200"}`}
          >
            <div
              className={`w-3 h-3 bg-white rounded-full transition-transform ${isAdminMode ? "translate-x-4" : "translate-x-0"}`}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3 bg-purple-100">
            <CardTitle>카테고리</CardTitle>
            {isAdminMode && (
              <Button
                size="sm"
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => {
                  setCategoryModalMode("create");
                  setCategoryForm({
                    name: "",
                    parentId: null,
                    favoriteType: "COMMAND",
                  });
                  setIsCategoryModalOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent className="px-2 py-3">
            {treeLoading ? (
              <p className="text-sm text-muted-foreground px-2">Loading...</p>
            ) : filteredTree.length === 0 ? (
              <p className="text-sm text-muted-foreground px-2">
                카테고리가 없습니다
              </p>
            ) : (
              <div className="space-y-1">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleCategoryDragStart}
                  onDragOver={handleCategoryDragOver}
                  onDragEnd={handleCategoryDragEnd}
                >
                  <SortableContext
                    items={flatCategories.map((c) => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {flatCategories.map((cat) => renderTreeItem(cat))}
                  </SortableContext>
                </DndContext>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3 bg-purple-100">
            <CardTitle>콘텐츠</CardTitle>
            {isAdminMode && selectedCategory && (
              <Button
                size="sm"
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => {
                  setContentModalMode("create");
                  setContentForm({
                    title: "",
                    content: "",
                    contentType: "COMMAND",
                    metadata: {},
                  });
                  setIsContentModalOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-1" /> 추가
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {!selectedCategory ? (
              <p className="text-sm text-muted-foreground">
                카테고리를 선택하세요
              </p>
            ) : contentsLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : displayContents.length === 0 ? (
              <p className="text-sm text-muted-foreground">콘텐츠가 없습니다</p>
            ) : (
              <div className="space-y-4">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleContentDragStart}
                  onDragOver={handleContentDragOver}
                  onDragEnd={handleContentDragEnd}
                >
                  <SortableContext
                    items={displayContents.map((c) => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {displayContents.map((content) => (
                      <SortableContentItem
                        key={content.id}
                        id={content.id}
                        isAdminMode={isAdminMode}
                      >
                        {({ attributes, listeners }) => (
                          <Card className="group/card relative w-full overflow-hidden hover:shadow-md transition-shadow">
                            <CardHeader className="p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <ContentTypeIcon
                                    type={content.contentType}
                                    className="h-4 w-4 text-purple-500"
                                  />
                                  <CardTitle
                                    className="text-lg cursor-pointer hover:text-purple-600 transition-colors truncate"
                                    onClick={() => {
                                      setViewingContent(content);
                                      setIsViewModalOpen(true);
                                    }}
                                  >
                                    {content.title}
                                  </CardTitle>
                                </div>
                                <div className="flex items-center gap-2">
                                  {content.contentType === "COMMAND" &&
                                    content.content && (
                                      <CopyButton text={content.content} />
                                    )}
                                  {content.contentType === "LINK" &&
                                    content.content && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          window.open(content.content, "_blank")
                                        }
                                      >
                                        <ExternalLink className="h-4 w-4 mr-1" />
                                        열기
                                      </Button>
                                    )}
                                  {isAdminMode && (
                                    <div className="flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => {
                                          setContentModalMode("edit");
                                          setEditingContent(content);
                                          setContentForm({
                                            title: content.title,
                                            content: content.content || "",
                                            contentType: content.contentType,
                                            metadata: content.metadata || {},
                                          });
                                          setIsContentModalOpen(true);
                                        }}
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                        onClick={() => {
                                          setContentToDelete(content.id);
                                          setConfirmDeleteContentOpen(true);
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                      <div
                                        {...attributes}
                                        {...listeners}
                                        className="h-8 w-8 flex items-center justify-center hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
                                      >
                                        <GripVertical className="h-4 w-4" />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardHeader>
                            {content.content && (
                              <CardContent className="p-3 pt-3">
                                <div className="max-h-[120px] overflow-hidden">
                                  {renderContentPreview(content)}
                                </div>
                              </CardContent>
                            )}
                          </Card>
                        )}
                      </SortableContentItem>
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            )}

            {/* 파일 섹션 */}
            {selectedCategory && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">
                  첨부 파일
                </h3>
                {isAdminMode && (
                  <CommonFileUploader
                    onUpload={handleFileUpload}
                    isUploading={isUploading}
                  />
                )}
                {filesLoading ? (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                ) : files.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    파일이 없습니다
                  </p>
                ) : (
                  <CommonFileGrid
                    files={files}
                    onDownload={downloadFile}
                    onDelete={isAdminMode ? handleFileDelete : undefined}
                    onRename={isAdminMode ? handleFileRename : undefined}
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category Modal */}
      <FormDialog
        open={isCategoryModalOpen}
        onOpenChange={setIsCategoryModalOpen}
        title={
          categoryModalMode === "create" ? "카테고리 추가" : "카테고리 수정"
        }
        submitLabel={categoryModalMode === "create" ? "생성" : "저장"}
        onSubmit={async () => {
          if (categoryModalMode === "create") {
            await favoriteApi.createCategory({
              name: categoryForm.name,
              parentId: categoryForm.parentId ?? undefined,
              favoriteType: categoryForm.favoriteType,
            });
          } else if (editingCategory) {
            await favoriteApi.updateCategory(editingCategory.id, {
              name: categoryForm.name,
              favoriteType: categoryForm.favoriteType,
            });
          }
          setIsCategoryModalOpen(false);
          refetchTree();
        }}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 rounded-lg">
            {(["COMMAND", "LINK", "DOCUMENT"] as FavoriteType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() =>
                  setCategoryForm({ ...categoryForm, favoriteType: type })
                }
                className={`flex items-center justify-center gap-1 py-1.5 rounded-md transition-all ${
                  categoryForm.favoriteType === type
                    ? "bg-white text-purple-600 shadow-sm font-semibold"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <ContentTypeIcon type={type} className="h-3.5 w-3.5" />
                <span className="text-xs">
                  {type === "COMMAND" ? "CODE" : type}
                </span>
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cat-name">이름</Label>
            <Input
              id="cat-name"
              value={categoryForm.name}
              onChange={(e) =>
                setCategoryForm({ ...categoryForm, name: e.target.value })
              }
              placeholder="카테고리 이름 입력"
            />
          </div>
        </div>
      </FormDialog>

      {/* Content Modal */}
      <FormDialog
        open={isContentModalOpen}
        onOpenChange={setIsContentModalOpen}
        title={contentModalMode === "create" ? "콘텐츠 추가" : "콘텐츠 수정"}
        submitLabel={contentModalMode === "create" ? "추가" : "저장"}
        fullScreen={contentForm.contentType === "DOCUMENT"}
        onSubmit={async () => {
          if (contentModalMode === "create" && selectedCategory) {
            await favoriteApi.createContent({
              categoryId: selectedCategory,
              title: contentForm.title,
              content: contentForm.content,
              contentType: contentForm.contentType,
              metadata: contentForm.metadata,
            });
          } else if (editingContent) {
            await favoriteApi.updateContent(editingContent.id, {
              title: contentForm.title,
              content: contentForm.content,
              contentType: contentForm.contentType,
              metadata: contentForm.metadata,
            });
          }
          setIsContentModalOpen(false);
          refetchContents();
        }}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 rounded-lg">
            {(["COMMAND", "LINK", "DOCUMENT"] as FavoriteType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() =>
                  setContentForm({ ...contentForm, contentType: type })
                }
                className={`flex items-center justify-center gap-2 py-2 rounded-md transition-all ${
                  contentForm.contentType === type
                    ? "bg-white text-purple-600 shadow-sm font-semibold"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <ContentTypeIcon type={type} />
                <span className="text-sm">
                  {type === "COMMAND" ? "CODE" : type}
                </span>
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <Label>제목</Label>
            <Input
              value={contentForm.title}
              onChange={(e) =>
                setContentForm({ ...contentForm, title: e.target.value })
              }
              placeholder="제목 입력"
            />
          </div>

          <div className="space-y-2">
            <Label>
              {contentForm.contentType === "COMMAND" && "코드"}
              {contentForm.contentType === "LINK" && "URL"}
              {contentForm.contentType === "DOCUMENT" && "내용"}
            </Label>
            {contentForm.contentType === "COMMAND" && (
              <Textarea
                value={contentForm.content}
                onChange={(e) =>
                  setContentForm({ ...contentForm, content: e.target.value })
                }
                placeholder="코드를 입력하세요"
                rows={6}
                className="font-mono bg-gray-900 text-green-400"
              />
            )}
            {contentForm.contentType === "LINK" && (
              <Input
                value={contentForm.content}
                onChange={(e) =>
                  setContentForm({ ...contentForm, content: e.target.value })
                }
                placeholder="https://..."
              />
            )}
            {contentForm.contentType === "DOCUMENT" && (
              <LexicalEditor
                value={contentForm.content}
                onChange={(text) =>
                  setContentForm({ ...contentForm, content: text })
                }
                placeholder="내용을 입력하세요"
              />
            )}
          </div>

          {contentForm.contentType === "COMMAND" && (
            <div className="space-y-2">
              <Label>언어 (선택)</Label>
              <Input
                value={contentForm.metadata?.language || ""}
                onChange={(e) =>
                  setContentForm({
                    ...contentForm,
                    metadata: {
                      ...contentForm.metadata,
                      language: e.target.value,
                    },
                  })
                }
                placeholder="sql, bash, javascript..."
              />
            </div>
          )}
        </div>
      </FormDialog>

      {/* Delete Confirmations */}
      <ConfirmDialog
        open={confirmDeleteCategoryOpen}
        onOpenChange={setConfirmDeleteCategoryOpen}
        title="카테고리 삭제"
        description="이 카테고리를 삭제하시겠습니까? 하위 항목들도 모두 삭제됩니다."
        variant="destructive"
        onConfirm={async () => {
          if (categoryToDelete) {
            await favoriteApi.deleteCategory(categoryToDelete);
            if (selectedCategory === categoryToDelete)
              setSelectedCategory(null);
            refetchTree();
            setCategoryToDelete(null);
          }
        }}
      />

      <ConfirmDialog
        open={confirmDeleteContentOpen}
        onOpenChange={setConfirmDeleteContentOpen}
        title="콘텐츠 삭제"
        description="이 콘텐츠를 삭제하시겠습니까?"
        variant="destructive"
        onConfirm={async () => {
          if (contentToDelete) {
            await favoriteApi.deleteContent(contentToDelete);
            refetchContents();
            setContentToDelete(null);
          }
        }}
      />

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent
          className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 border-none shadow-2xl"
          showCloseButton={false}
        >
          <DialogHeader className="px-6 py-3 bg-purple-100 border-b border-purple-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ContentTypeIcon
                  type={viewingContent?.contentType || "COMMAND"}
                  className="h-5 w-5 text-purple-600"
                />
                <DialogTitle className="text-lg font-bold text-gray-900">
                  {viewingContent?.title}
                </DialogTitle>
              </div>
              <div className="flex items-center gap-2">
                {viewingContent?.contentType === "COMMAND" &&
                  viewingContent?.content && (
                    <CopyButton text={viewingContent.content} />
                  )}
                {viewingContent?.contentType === "LINK" &&
                  viewingContent?.content && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        window.open(viewingContent.content, "_blank")
                      }
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      열기
                    </Button>
                  )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsViewModalOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-8 py-6 bg-white">
            {viewingContent?.contentType === "COMMAND" && (
              <div className="bg-gray-900 rounded-lg p-6 font-mono text-base text-green-400">
                <pre className="whitespace-pre-wrap">
                  {viewingContent?.content}
                </pre>
              </div>
            )}
            {viewingContent?.contentType === "LINK" && (
              <div className="space-y-4">
                <a
                  href={viewingContent?.content || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-lg text-purple-600 hover:text-purple-700 hover:underline"
                >
                  <ExternalLink className="h-5 w-5" />
                  {viewingContent?.content}
                </a>
              </div>
            )}
            {viewingContent?.contentType === "DOCUMENT" && (
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkBreaks]}
                  components={{
                    code: MarkdownCodeBlock as any,
                    img: MarkdownImage as any,
                  }}
                >
                  {viewingContent?.content || ""}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
