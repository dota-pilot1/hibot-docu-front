"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { projectApi } from '../api/projectApi';
import { useProjectMutations } from '../model/useProjectMutations';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { FormDialog } from '@/shared/ui/dialogs/FormDialog';
import { ConfirmDialog } from '@/shared/ui/dialogs/ConfirmDialog';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import type { ProjectCategory } from '@/entities/project/model/types';
import { PlusIcon, TrashIcon } from 'lucide-react';

export const ProjectMatrix = () => {
    const router = useRouter();
    const [tree, setTree] = useState<ProjectCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAdminMode, setIsAdminMode] = useState(false);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [showTechModal, setShowTechModal] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [techData, setTechData] = useState({ name: '', techType: '', description: '', parentId: null as number | null });

    // Confirm Modal states
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);

    const { createCategory, deleteCategory } = useProjectMutations();

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            console.log('Fetching project tree...');
            const data = await projectApi.getTree();
            console.log('Received tree:', data);
            setTree(data);
        } catch (err: any) {
            console.error('Failed to fetch projects:', err);
            setError(err.message || 'Failed to load projects');
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
            await createCategory({ name: groupName, projectType: 'NOTE' });
            setShowGroupModal(false);
            setGroupName('');
            fetchData();
        } catch (err) {
            console.error('Failed to create group:', err);
        }
    };

    const handleAddTech = async () => {
        if (!techData.name.trim() || !techData.techType.trim()) return;
        try {
            await createCategory({
                name: techData.name,
                techType: techData.techType,
                description: techData.description,
                parentId: techData.parentId ?? undefined,
                projectType: 'NOTE',
            });
            setShowTechModal(false);
            setTechData({ name: '', techType: '', description: '', parentId: null });
            fetchData();
        } catch (err) {
            console.error('Failed to create tech:', err);
        }
    };

    const handleDeleteCategory = (id: number) => {
        setCategoryToDelete(id);
        setConfirmDeleteOpen(true);
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <p className="text-center text-gray-500">Loading projects...</p>
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-xl" />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div className="text-center text-red-500">
                    <p>Error: {error}</p>
                    <Button onClick={fetchData} className="mt-4">Retry</Button>
                </div>
            </div>
        );
    }

    // Render tree recursively
    const renderCategory = (category: ProjectCategory) => {
        const hasChildren = category.children && category.children.length > 0;
        const isTopLevel = category.depth === 0;

        if (isTopLevel) {
            // Top level - render as a card group
            return (
                <Card key={category.id} className="border-none shadow-md bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden">
                    <CardHeader className="border-b border-gray-50 dark:border-zinc-800 pb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                                <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">{category.name}</CardTitle>
                                <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100 px-2.5 py-0.5 rounded-full text-xs">
                                    {hasChildren ? category.children!.length : 0}
                                </Badge>
                                {isAdminMode && (
                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(category.id)} className="h-8 w-8 p-0">
                                        <TrashIcon className="h-4 w-4 text-red-500" />
                                    </Button>
                                )}
                            </div>
                            {isAdminMode && (
                                <Button size="sm" className="rounded-full shadow-sm" onClick={() => {
                                    setTechData({ ...techData, parentId: category.id });
                                    setShowTechModal(true);
                                }}>
                                    <PlusIcon className="h-4 w-4 mr-1" />
                                    추가
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {!hasChildren ? (
                            <p className="text-sm text-gray-400 text-center py-12">아직 항목이 없습니다</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {category.children!.map((child) => (
                                    <div
                                        key={child.id}
                                        className="bg-slate-50/50 dark:bg-zinc-800/30 border border-gray-200 dark:border-zinc-700 rounded-2xl p-5 cursor-pointer 
                                            shadow-sm hover:border-blue-500/50 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 group relative"
                                        onClick={() => router.push(`/projects?tech=${child.techType || child.id}`)}
                                    >
                                        <div className="flex flex-col gap-4">
                                            <div className="flex items-start justify-between">
                                                <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-700 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                                                    {child.icon ? (
                                                        <span className="text-2xl">{child.icon}</span>
                                                    ) : (
                                                        <PlusIcon className="w-6 h-6 rotate-45" />
                                                    )}
                                                </div>
                                                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-none text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">Active</Badge>
                                            </div>

                                            <div className="space-y-1.5">
                                                <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors">
                                                    {child.name}
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed h-10">
                                                    {child.description || '상세 정보를 확인하려면 클릭하세요.'}
                                                </p>
                                            </div>

                                            <div className="pt-3 flex items-center justify-between border-t border-gray-200 dark:border-zinc-700">
                                                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{child.techType || 'General'}</span>
                                                <div className="flex items-center gap-2">
                                                    {isAdminMode && (
                                                        <Button variant="ghost" size="sm" onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteCategory(child.id);
                                                        }} className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <TrashIcon className="h-3.5 w-3.5 text-red-500" />
                                                        </Button>
                                                    )}
                                                    <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-gray-400 border border-gray-200 dark:border-zinc-700">
                                                        {'>'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
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
                    <h1 className="text-2xl font-bold text-gray-900">Project Management</h1>
                    <p className="text-sm text-gray-500 mt-1">기술 스택별 프로젝트 관리</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full shadow-sm hover:border-blue-200 transition-all cursor-pointer select-none"
                    onClick={() => setIsAdminMode(!isAdminMode)}>
                    <span className={`text-xs font-medium ${isAdminMode ? 'text-blue-600' : 'text-gray-400'}`}>Admin</span>
                    <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${isAdminMode ? 'bg-blue-600' : 'bg-gray-200'}`}>
                        <div className={`w-3 h-3 bg-white rounded-full transition-transform ${isAdminMode ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                </div>
            </div>

            {tree.length === 0 ? (
                <Card className="border-gray-200 shadow-sm">
                    <CardContent className="py-12">
                        <p className="text-center text-gray-400">프로젝트가 없습니다. Admin 모드를 켜고 그룹을 추가해주세요.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {tree.map(renderCategory)}
                </div>
            )}

            {isAdminMode && (
                <Button onClick={() => setShowGroupModal(true)} variant="outline" className="w-full py-8 border-dashed">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    새 그룹 추가
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
                    <Input placeholder="그룹 이름" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
                </div>
            </FormDialog>

            {/* Tech Modal */}
            <FormDialog
                open={showTechModal}
                onOpenChange={setShowTechModal}
                title="새 기술 스택 추가"
                submitLabel="추가"
                onSubmit={handleAddTech}
            >
                <div className="space-y-4">
                    <Input placeholder="표시 이름 (예: React)" value={techData.name} onChange={(e) => setTechData({ ...techData, name: e.target.value })} />
                    <Input placeholder="식별 코드 (예: react)" value={techData.techType} onChange={(e) => setTechData({ ...techData, techType: e.target.value })} />
                    <Textarea placeholder="설명 (선택)" value={techData.description} onChange={(e) => setTechData({ ...techData, description: e.target.value })} rows={3} />
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
