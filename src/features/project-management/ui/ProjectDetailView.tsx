"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useProjectTree } from "../model/useProjectTree";
import { useProjectContents } from "../model/useProjectContents";
import {
    useProjectFiles,
    useProjectFileMutations,
} from "../model/useProjectFiles";
import CommonFileUploader from "@/shared/ui/CommonFileUploader";
import CommonFileGrid from "@/shared/ui/CommonFileGrid";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import {
    ArrowLeft,
    Plus,
    Pencil,
    Trash2,
    FolderPlus,
    ChevronRight,
    ChevronDown,
    Folder,
    FolderOpen,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Label } from "@/shared/ui/label";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import { ConfirmDialog } from "@/shared/ui/dialogs/ConfirmDialog";
import { projectApi } from "../api/projectApi";
import dynamic from "next/dynamic";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableTreeItem } from "./SortableTreeItem";
import { SortableContentItem } from "./SortableContentItem";
import { GripVertical } from "lucide-react";

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
import { ContentTypeIcon } from "./ContentTypeIcon";
import { MermaidRenderer } from "@/shared/ui/MermaidRenderer";
import { MermaidEditor } from "@/shared/ui/MermaidEditor";
import { QARenderer } from "@/shared/ui/QARenderer";
import { QAEditor } from "@/shared/ui/QAEditor";

import type {
    ProjectCategory,
    ProjectContent,
    ContentType,
    ProjectType,
} from "@/entities/project/model/types";

export const ProjectDetailView = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const tech = searchParams.get("tech");

    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [isAdminMode, setIsAdminMode] = useState(false);
    const {
        tree,
        isLoading: treeLoading,
        refetch: refetchTree,
    } = useProjectTree();
    const {
        contents,
        isLoading: contentsLoading,
        refetch: refetchContents,
    } = useProjectContents(selectedCategory);

    // File hooks
    const {
        files,
        isLoading: filesLoading,
        refetch: refetchFiles,
    } = useProjectFiles(selectedCategory);
    const { isUploading, uploadFile, deleteFile, renameFile, downloadFile } =
        useProjectFileMutations();

    const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

    // Modal states
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [categoryModalMode, setCategoryModalMode] = useState<"create" | "edit">(
        "create",
    );
    const [editingCategory, setEditingCategory] =
        useState<ProjectCategory | null>(null);
    const [categoryForm, setCategoryForm] = useState({
        name: "",
        parentId: null as number | null,
        projectType: "NOTE" as ProjectType,
    });

    const [isContentModalOpen, setIsContentModalOpen] = useState(false);
    const [contentModalMode, setContentModalMode] = useState<"create" | "edit">(
        "create",
    );
    const [editingContent, setEditingContent] = useState<ProjectContent | null>(
        null,
    );
    const [contentForm, setContentForm] = useState<{
        title: string;
        content: string;
        contentType: ContentType;
        metadata: Record<string, any>;
    }>({
        title: "",
        content: "",
        contentType: "NOTE",
        metadata: {},
    });

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewingContent, setViewingContent] = useState<any | null>(null);

    // Confirm Modal states
    const [confirmDeleteCategoryOpen, setConfirmDeleteCategoryOpen] =
        useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
    const [confirmDeleteContentOpen, setConfirmDeleteContentOpen] =
        useState(false);
    const [contentToDelete, setContentToDelete] = useState<number | null>(null);

    // Filter tree: find the selected tech and show it as root (including its children)
    let filteredTree: ProjectCategory[] = [];
    if (tech && tree.length > 0) {
        // Find the tech category in the tree
        const findTech = (
            categories: ProjectCategory[],
        ): ProjectCategory | null => {
            for (const cat of categories) {
                if (cat.techType === tech || cat.id.toString() === tech) {
                    return cat;
                }
                if (cat.children && cat.children.length > 0) {
                    const found = findTech(cat.children);
                    if (found) return found;
                }
            }
            return null;
        };

        const techCategory = findTech(tree);
        if (techCategory) {
            filteredTree = [techCategory]; // Show the tech category itself as root
        }
    } else {
        // Show all depth >= 1 categories
        const getAllChildren = (
            categories: ProjectCategory[],
        ): ProjectCategory[] => {
            let result: ProjectCategory[] = [];
            for (const cat of categories) {
                if (cat.children && cat.children.length > 0) {
                    result = [...result, ...cat.children];
                }
            }
            return result;
        };
        filteredTree = getAllChildren(tree);
    }

    // Initialize expandedIds with depth 1 items when filteredTree changes
    useEffect(() => {
        if (filteredTree.length > 0) {
            const collectDepth1 = (categories: ProjectCategory[]): number[] => {
                const ids: number[] = [];
                for (const cat of categories) {
                    if (cat.depth === 1) {
                        ids.push(cat.id);
                    }
                    if (cat.children && cat.children.length > 0) {
                        ids.push(...collectDepth1(cat.children));
                    }
                }
                return ids;
            };
            setExpandedIds(new Set(collectDepth1(filteredTree)));
        }
    }, [filteredTree.length]);

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

    // Helper to find selected category and its type
    const findCategoryById = (
        nodes: ProjectCategory[],
        id: number,
    ): ProjectCategory | undefined => {
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
    const isFileCategory = selectedCategoryData?.projectType === "FILE";

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
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const handleCategoryDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        // Find sibling nodes to determine new order
        // This is a simplified version: it only supports reordering within the same parent
        const findSiblings = (
            nodes: ProjectCategory[],
        ): ProjectCategory[] | null => {
            for (const node of nodes) {
                if (node.id === active.id) return nodes;
                if (node.children) {
                    const found = findSiblings(node.children);
                    if (found) return found;
                }
            }
            return null;
        };

        const siblings = findSiblings(tree);
        if (!siblings) return;

        const oldIndex = siblings.findIndex((s) => s.id === active.id);
        const newIndex = siblings.findIndex((s) => s.id === over.id);

        const newOrder = arrayMove(siblings, oldIndex, newIndex);
        const categoryIds = newOrder.map((c) => c.id);

        // Get parentId from any sibling (they all share the same parent)
        const parentId = siblings[0].parentId;

        try {
            await projectApi.reorderCategories(categoryIds, parentId);
            refetchTree();
        } catch (error) {
            console.error("Failed to reorder categories:", error);
        }
    };

    const handleContentDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        if (!selectedCategory) return;

        const oldIndex = contents.findIndex((c) => c.id === active.id);
        const newIndex = contents.findIndex((c) => c.id === over.id);

        const newOrder = arrayMove(contents, oldIndex, newIndex);
        const contentIds = newOrder.map((c) => c.id);

        try {
            await projectApi.reorderContents(selectedCategory, contentIds);
            refetchContents();
        } catch (error) {
            console.error("Failed to reorder contents:", error);
        }
    };

    const renderTree = (categories: ProjectCategory[]) => {
        return (
            <SortableContext
                items={categories.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
            >
                {categories.map((cat) => (
                    <div key={cat.id} className="my-1">
                        <SortableTreeItem id={cat.id} isAdminMode={isAdminMode}>
                            {({ attributes, listeners }) => (
                                <div
                                    style={{ marginLeft: `${(cat.depth - 1) * 20}px` }}
                                    className={`group flex items-center gap-1 rounded-md transition-colors ${selectedCategory === cat.id ? "bg-blue-100" : "hover:bg-gray-100"}`}
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
                                        className={`flex-1 justify-start h-8 px-2 hover:bg-transparent ${selectedCategory === cat.id ? "text-blue-900" : ""}`}
                                    >
                                        {cat.children && cat.children.length > 0 ? (
                                            expandedIds.has(cat.id) ? (
                                                <FolderOpen className="h-4 w-4 mr-2 text-blue-500" />
                                            ) : (
                                                <Folder className="h-4 w-4 mr-2 text-blue-500" />
                                            )
                                        ) : (
                                            <div className="mr-2">
                                                <ContentTypeIcon
                                                    type={cat.projectType}
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
                                                        projectType: "FILE",
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
                                                        parentId: cat.parentId,
                                                        projectType: cat.projectType,
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
                                                className="h-7 w-7 flex items-center justify-center hover:bg-gray-200/50 rounded cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors"
                                                title="Reorder"
                                            >
                                                <GripVertical className="h-4 w-4" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </SortableTreeItem>
                        {cat.children &&
                            cat.children.length > 0 &&
                            expandedIds.has(cat.id) &&
                            renderTree(cat.children)}
                    </div>
                ))}
            </SortableContext>
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push("/projects")}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <h1 className="text-2xl font-bold">
                        {tech ? `${tech} Projects` : "All Projects"}
                    </h1>
                </div>
                <div
                    className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full shadow-sm hover:border-blue-200 transition-all cursor-pointer select-none"
                    onClick={() => setIsAdminMode(!isAdminMode)}
                >
                    <span
                        className={`text-xs font-medium ${isAdminMode ? "text-blue-600" : "text-gray-400"}`}
                    >
                        Admin
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Project Tree (Padding Test)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {treeLoading ? (
                            <p className="text-sm text-muted-foreground">Loading...</p>
                        ) : filteredTree.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No categories found
                            </p>
                        ) : (
                            <div className="space-y-1">
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleCategoryDragEnd}
                                >
                                    {renderTree(filteredTree)}
                                </DndContext>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle>
                            {isFileCategory ? "Files" : "Contents"} (Padding Test)
                        </CardTitle>
                        {isAdminMode && selectedCategory && !isFileCategory && (
                            <Button
                                size="sm"
                                onClick={() => {
                                    setContentModalMode("create");
                                    setContentForm({
                                        title: "",
                                        content: "",
                                        contentType:
                                            (selectedCategoryData?.projectType as any) || "NOTE",
                                        metadata: {},
                                    });
                                    setIsContentModalOpen(true);
                                }}
                            >
                                <Plus className="h-4 w-4 mr-1" /> Add Content
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        {!selectedCategory ? (
                            <p className="text-sm text-muted-foreground">
                                Select a category to view contents
                            </p>
                        ) : isFileCategory ? (
                            // FILE 타입: 파일 업로드 UI
                            <div className="space-y-4">
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
                                        No files found
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
                        ) : contentsLoading ? (
                            <p className="text-sm text-muted-foreground">Loading...</p>
                        ) : contents.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No contents found</p>
                        ) : (
                            <div className="space-y-4">
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleContentDragEnd}
                                >
                                    <SortableContext
                                        items={contents.map((c) => c.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {contents.map((content) => (
                                            <SortableContentItem
                                                key={content.id}
                                                id={content.id}
                                                isAdminMode={isAdminMode}
                                            >
                                                {({ attributes, listeners }) => (
                                                    <Card className="group/card relative w-full overflow-hidden hover:shadow-md transition-shadow">
                                                        <CardHeader className="pb-2">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                    <CardTitle
                                                                        className="text-lg cursor-pointer hover:text-blue-600 transition-colors flex items-center gap-2 truncate"
                                                                        onClick={() => {
                                                                            setViewingContent(content);
                                                                            setIsViewModalOpen(true);
                                                                        }}
                                                                    >
                                                                        <ContentTypeIcon
                                                                            type={content.contentType}
                                                                            className="h-4 w-4 text-gray-400"
                                                                        />
                                                                        {content.title}
                                                                    </CardTitle>
                                                                </div>
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
                                                                            className="h-8 w-8 flex items-center justify-center hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors"
                                                                            title="Reorder"
                                                                        >
                                                                            <GripVertical className="h-4 w-4" />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </CardHeader>
                                                        {content.content && (
                                                            <CardContent>
                                                                <div className="relative max-h-[160px] overflow-hidden transition-all duration-300">
                                                                    {content.contentType === "NOTE" && (
                                                                        <div className="prose prose-sm max-w-none dark:prose-invert prose-pre:bg-transparent prose-pre:p-0 prose-code:before:content-none prose-code:after:content-none prose-code:bg-transparent prose-code:border-none prose-code:p-0">
                                                                            <ReactMarkdown
                                                                                remarkPlugins={[
                                                                                    remarkGfm,
                                                                                    remarkBreaks,
                                                                                ]}
                                                                                components={{
                                                                                    code: MarkdownCodeBlock as any,
                                                                                }}
                                                                            >
                                                                                {content.content}
                                                                            </ReactMarkdown>
                                                                        </div>
                                                                    )}
                                                                    {content.contentType === "MERMAID" && (
                                                                        <MermaidRenderer
                                                                            content={content.content || ""}
                                                                        />
                                                                    )}
                                                                    {content.contentType === "QA" && (
                                                                        <QARenderer
                                                                            question={content.title}
                                                                            answer={content.content || ""}
                                                                            tags={content.metadata?.tags}
                                                                        />
                                                                    )}
                                                                    {/* Gradient Overlay for Fade Out */}
                                                                    <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white dark:from-slate-950 to-transparent pointer-events-none" />
                                                                </div>
                                                                <div className="mt-2 flex justify-center border-t border-gray-50 dark:border-gray-800 pt-2">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="text-blue-600 hover:text-blue-700 font-medium h-8 w-full"
                                                                        onClick={() => {
                                                                            setViewingContent(content);
                                                                            setIsViewModalOpen(true);
                                                                        }}
                                                                    >
                                                                        View Detail
                                                                    </Button>
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
                    </CardContent>
                </Card>
            </div>

            {/* Category Modal */}
            <FormDialog
                open={isCategoryModalOpen}
                onOpenChange={setIsCategoryModalOpen}
                title={
                    categoryModalMode === "create" ? "Add Category" : "Edit Category"
                }
                submitLabel={categoryModalMode === "create" ? "Create" : "Save"}
                onSubmit={async () => {
                    if (categoryModalMode === "create") {
                        await projectApi.createCategory({
                            name: categoryForm.name,
                            parentId: categoryForm.parentId ?? undefined,
                            projectType: categoryForm.projectType,
                            techType: tech || undefined,
                        });
                    } else if (editingCategory) {
                        await projectApi.updateCategory(editingCategory.id, {
                            name: categoryForm.name,
                            projectType: categoryForm.projectType,
                        });
                    }
                    setIsCategoryModalOpen(false);
                    refetchTree();
                }}
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-2 p-1 bg-gray-100 rounded-lg">
                        {(["FILE", "NOTE", "MERMAID", "QA"] as const).map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() =>
                                    setCategoryForm({ ...categoryForm, projectType: type })
                                }
                                className={`flex items-center justify-center gap-1 py-1.5 rounded-md transition-all ${categoryForm.projectType === type
                                    ? "bg-white text-blue-600 shadow-sm font-semibold"
                                    : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                <ContentTypeIcon type={type} className="h-3.5 w-3.5" />
                                <span className="text-xs">{type}</span>
                            </button>
                        ))}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cat-name">Name</Label>
                        <Input
                            id="cat-name"
                            value={categoryForm.name}
                            onChange={(e) =>
                                setCategoryForm({ ...categoryForm, name: e.target.value })
                            }
                            placeholder="Enter category name"
                        />
                    </div>
                </div>
            </FormDialog>

            {/* Content Modal */}
            <FormDialog
                open={isContentModalOpen}
                onOpenChange={setIsContentModalOpen}
                title={contentModalMode === "create" ? "Add Content" : "Edit Content"}
                description={
                    contentModalMode === "create"
                        ? "새로운 콘텐츠를 추가합니다. 제목과 내용을 입력하세요."
                        : "콘텐츠를 수정합니다."
                }
                submitLabel={contentModalMode === "create" ? "Add" : "Save"}
                maxWidth="sm:max-w-4xl"
                onSubmit={async () => {
                    if (contentModalMode === "create" && selectedCategory) {
                        await projectApi.createContent({
                            categoryId: selectedCategory,
                            title: contentForm.title,
                            content: contentForm.content,
                            contentType: contentForm.contentType,
                            metadata: contentForm.metadata,
                        });
                    } else if (editingContent) {
                        await projectApi.updateContent(editingContent.id, {
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
                <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 rounded-lg">
                    {(["NOTE", "MERMAID", "QA"] as const).map((type) => (
                        <button
                            key={type}
                            type="button"
                            onClick={() =>
                                setContentForm({ ...contentForm, contentType: type })
                            }
                            className={`flex items-center justify-center gap-2 py-2 rounded-md transition-all ${contentForm.contentType === type
                                ? "bg-white text-blue-600 shadow-sm font-semibold"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            <ContentTypeIcon type={type} />
                            <span className="text-sm">{type}</span>
                        </button>
                    ))}
                </div>

                <div className="space-y-12 pt-8">
                    <div className="space-y-3">
                        <Label
                            htmlFor="content-title"
                            className={
                                contentForm.contentType === "QA"
                                    ? "text-blue-600 font-bold text-base block"
                                    : "block text-gray-700 font-semibold"
                            }
                        >
                            {contentForm.contentType === "QA" ? "질문" : "제목"}
                        </Label>
                        <div className="mt-2">
                            {contentForm.contentType === "QA" ? (
                                <Textarea
                                    id="content-title"
                                    value={contentForm.title}
                                    onChange={(e) =>
                                        setContentForm({ ...contentForm, title: e.target.value })
                                    }
                                    placeholder="질문을 입력하세요"
                                    rows={4}
                                    className="bg-white border-gray-300 focus:border-blue-500 text-lg p-4"
                                />
                            ) : (
                                <Input
                                    id="content-title"
                                    value={contentForm.title}
                                    onChange={(e) =>
                                        setContentForm({ ...contentForm, title: e.target.value })
                                    }
                                    placeholder="제목을 입력하세요"
                                    className="bg-white border-gray-300 focus:border-blue-500 h-10"
                                />
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label
                            htmlFor="content-body"
                            className={
                                contentForm.contentType === "QA"
                                    ? "text-blue-600 font-bold text-base block"
                                    : "block text-gray-700 font-semibold"
                            }
                        >
                            {contentForm.contentType === "QA" ? "답변" : "내용"}
                        </Label>
                        <div className="mt-2">
                            {contentForm.contentType === "NOTE" && (
                                <LexicalEditor
                                    value={contentForm.content}
                                    onChange={(text) =>
                                        setContentForm({ ...contentForm, content: text })
                                    }
                                    placeholder="내용을 입력하세요 (AI assisted rich text supported)"
                                />
                            )}
                            {contentForm.contentType === "MERMAID" && (
                                <MermaidEditor
                                    content={contentForm.content}
                                    onChange={(text) =>
                                        setContentForm({ ...contentForm, content: text })
                                    }
                                />
                            )}
                            {contentForm.contentType === "QA" && (
                                <QAEditor
                                    answer={contentForm.content}
                                    tags={contentForm.metadata?.tags || []}
                                    onAnswerChange={(val) =>
                                        setContentForm({ ...contentForm, content: val })
                                    }
                                    onTagsChange={(tags) =>
                                        setContentForm({
                                            ...contentForm,
                                            metadata: { ...contentForm.metadata, tags },
                                        })
                                    }
                                />
                            )}
                        </div>
                    </div>
                </div>
            </FormDialog>

            {/* Delete Category Confirmation */}
            <ConfirmDialog
                open={confirmDeleteCategoryOpen}
                onOpenChange={setConfirmDeleteCategoryOpen}
                title="카테고리 삭제"
                description="이 카테고리를 삭제하시겠습니까? 하위 항목들도 모두 삭제될 수 있습니다."
                variant="destructive"
                onConfirm={async () => {
                    if (categoryToDelete) {
                        await projectApi.deleteCategory(categoryToDelete);
                        if (selectedCategory === categoryToDelete)
                            setSelectedCategory(null);
                        refetchTree();
                        setCategoryToDelete(null);
                    }
                }}
            />

            {/* Delete Content Confirmation */}
            <ConfirmDialog
                open={confirmDeleteContentOpen}
                onOpenChange={setConfirmDeleteContentOpen}
                title="콘텐츠 삭제"
                description="이 콘텐츠를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
                variant="destructive"
                onConfirm={async () => {
                    if (contentToDelete) {
                        await projectApi.deleteContent(contentToDelete);
                        refetchContents();
                        setContentToDelete(null);
                    }
                }}
            />

            {/* Content View Modal */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0 border-none shadow-2xl">
                    <DialogHeader className="p-6 bg-gray-50/50 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <ContentTypeIcon
                                type={viewingContent?.contentType}
                                className="h-5 w-5 text-blue-600"
                            />
                            <DialogTitle className="text-xl font-bold text-gray-900">
                                {viewingContent?.contentType === "QA"
                                    ? "Q&A Detail"
                                    : viewingContent?.title}
                            </DialogTitle>
                        </div>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto p-8 bg-white">
                        {viewingContent?.contentType === "NOTE" && (
                            <div className="prose prose-lg max-w-none dark:prose-invert prose-pre:bg-gray-900 prose-pre:p-4 prose-code:text-blue-600 font-sans">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm, remarkBreaks]}
                                    components={{
                                        code: MarkdownCodeBlock as any,
                                    }}
                                >
                                    {viewingContent?.content || ""}
                                </ReactMarkdown>
                            </div>
                        )}
                        {viewingContent?.contentType === "MERMAID" && (
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                                <MermaidRenderer content={viewingContent.content || ""} />
                            </div>
                        )}
                        {viewingContent?.contentType === "QA" && (
                            <QARenderer
                                question={viewingContent.title}
                                answer={viewingContent.content || ""}
                                tags={viewingContent.metadata?.tags}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
