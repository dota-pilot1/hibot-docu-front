"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProjectTree } from '../model/useProjectTree';
import { useProjectContents } from '../model/useProjectContents';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { ArrowLeft, Plus, Pencil, Trash2, FolderPlus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { projectApi } from '../api/projectApi';

import type { ProjectCategory } from '@/entities/project/model/types';

export const ProjectDetailView = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const tech = searchParams.get('tech');

    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [isAdminMode, setIsAdminMode] = useState(false);
    const { tree, isLoading: treeLoading, refetch: refetchTree } = useProjectTree();
    const { contents, isLoading: contentsLoading, refetch: refetchContents } = useProjectContents(selectedCategory);

    // Modal states
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [categoryModalMode, setCategoryModalMode] = useState<'create' | 'edit'>('create');
    const [editingCategory, setEditingCategory] = useState<ProjectCategory | null>(null);
    const [categoryForm, setCategoryForm] = useState({ name: '', parentId: null as number | null });

    const [isContentModalOpen, setIsContentModalOpen] = useState(false);
    const [contentModalMode, setContentModalMode] = useState<'create' | 'edit'>('create');
    const [editingContent, setEditingContent] = useState<any | null>(null);
    const [contentForm, setContentForm] = useState({ title: '', content: '' });

    // Filter tree: find the selected tech and show it as root (including its children)
    let filteredTree: ProjectCategory[] = [];
    if (tech && tree.length > 0) {
        // Find the tech category in the tree
        const findTech = (categories: ProjectCategory[]): ProjectCategory | null => {
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
        const getAllChildren = (categories: ProjectCategory[]): ProjectCategory[] => {
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

    const renderTree = (categories: ProjectCategory[]) => {
        return categories.map((cat) => (
            <div key={cat.id} className="my-1">
                <div
                    style={{ marginLeft: `${(cat.depth - 1) * 20}px` }}
                    className={`group flex items-center gap-1 rounded-md transition-colors ${selectedCategory === cat.id ? 'bg-secondary' : 'hover:bg-ghost'}`}
                >
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedCategory(cat.id)}
                        className="flex-1 justify-start h-8 px-2"
                    >
                        {cat.icon && <span className="mr-2">{cat.icon}</span>}
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
                                    setCategoryModalMode('create');
                                    setCategoryForm({ name: '', parentId: cat.id });
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
                                    setCategoryModalMode('edit');
                                    setEditingCategory(cat);
                                    setCategoryForm({ name: cat.name, parentId: cat.parentId });
                                    setIsCategoryModalOpen(true);
                                }}
                            >
                                <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    if (confirm('Are you sure you want to delete this category?')) {
                                        await projectApi.deleteCategory(cat.id);
                                        if (selectedCategory === cat.id) setSelectedCategory(null);
                                        refetchTree();
                                    }
                                }}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>
                    )}
                </div>
                {cat.children && cat.children.length > 0 && renderTree(cat.children)}
            </div>
        ));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => router.push('/projects')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Matrix
                    </Button>
                    <h1 className="text-2xl font-bold">{tech ? `${tech} Projects` : 'All Projects'}</h1>
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
                        <CardTitle>Project Tree</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {treeLoading ? (
                            <p className="text-sm text-muted-foreground">Loading...</p>
                        ) : filteredTree.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No categories found</p>
                        ) : (
                            <div className="space-y-1">{renderTree(filteredTree)}</div>
                        )}
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle>Contents</CardTitle>
                        {isAdminMode && selectedCategory && (
                            <Button size="sm" onClick={() => {
                                setContentModalMode('create');
                                setContentForm({ title: '', content: '' });
                                setIsContentModalOpen(true);
                            }}>
                                <Plus className="h-4 w-4 mr-1" /> Add Content
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        {!selectedCategory ? (
                            <p className="text-sm text-muted-foreground">Select a category to view contents</p>
                        ) : contentsLoading ? (
                            <p className="text-sm text-muted-foreground">Loading...</p>
                        ) : contents.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No contents found</p>
                        ) : (
                            <div className="space-y-4">
                                {contents.map((content) => (
                                    <Card key={content.id} className="group relative">
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-lg">{content.title}</CardTitle>
                                                {isAdminMode && (
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => {
                                                                setContentModalMode('edit');
                                                                setEditingContent(content);
                                                                setContentForm({ title: content.title, content: content.content || '' });
                                                                setIsContentModalOpen(true);
                                                            }}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                                            onClick={async () => {
                                                                if (confirm('Are you sure you want to delete this content?')) {
                                                                    await projectApi.deleteContent(content.id);
                                                                    refetchContents();
                                                                }
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </CardHeader>
                                        {content.content && (
                                            <CardContent>
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                    {content.content}
                                                </p>
                                            </CardContent>
                                        )}
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Category Modal */}
            <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{categoryModalMode === 'create' ? 'Add Category' : 'Edit Category'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="cat-name">Name</Label>
                            <Input
                                id="cat-name"
                                value={categoryForm.name}
                                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                                placeholder="Enter category name"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCategoryModalOpen(false)}>Cancel</Button>
                        <Button onClick={async () => {
                            if (categoryModalMode === 'create') {
                                await projectApi.createCategory({
                                    name: categoryForm.name,
                                    parentId: categoryForm.parentId ?? undefined,
                                    projectType: 'NOTE', // Default for now
                                    techType: tech || undefined
                                });
                            } else if (editingCategory) {
                                await projectApi.updateCategory(editingCategory.id, {
                                    name: categoryForm.name
                                });
                            }
                            setIsCategoryModalOpen(false);
                            refetchTree();
                        }}>
                            {categoryModalMode === 'create' ? 'Create' : 'Save'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Content Modal */}
            <Dialog open={isContentModalOpen} onOpenChange={setIsContentModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{contentModalMode === 'create' ? 'Add Content' : 'Edit Content'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="content-title">Title</Label>
                            <Input
                                id="content-title"
                                value={contentForm.title}
                                onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
                                placeholder="Enter content title"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="content-body">Content</Label>
                            <Textarea
                                id="content-body"
                                value={contentForm.content}
                                onChange={(e) => setContentForm({ ...contentForm, content: e.target.value })}
                                placeholder="Enter content (Markdown supported)"
                                className="min-h-[200px]"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsContentModalOpen(false)}>Cancel</Button>
                        <Button onClick={async () => {
                            if (contentModalMode === 'create' && selectedCategory) {
                                await projectApi.createContent({
                                    categoryId: selectedCategory,
                                    title: contentForm.title,
                                    content: contentForm.content
                                });
                            } else if (editingContent) {
                                await projectApi.updateContent(editingContent.id, {
                                    title: contentForm.title,
                                    content: contentForm.content
                                });
                            }
                            setIsContentModalOpen(false);
                            refetchContents();
                        }}>
                            {contentModalMode === 'create' ? 'Add' : 'Save'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
