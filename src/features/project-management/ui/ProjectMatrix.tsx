"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { projectApi } from '../api/projectApi';
import { useProjectMutations } from '../model/useProjectMutations';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
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

    const handleDeleteCategory = async (id: number) => {
        if (!confirm('삭제하시겠습니까?')) return;
        try {
            await deleteCategory(id);
            fetchData();
        } catch (err) {
            console.error('Failed to delete:', err);
        }
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
                <Card key={category.id} className="border-gray-200 shadow-sm">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-1 h-6 bg-blue-500 rounded-full" />
                                <CardTitle className="text-lg">{category.name}</CardTitle>
                                <Badge variant="outline">{hasChildren ? category.children!.length : 0}</Badge>
                                {isAdminMode && (
                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(category.id)}>
                                        <TrashIcon className="h-4 w-4 text-red-500" />
                                    </Button>
                                )}
                            </div>
                            {isAdminMode && (
                                <Button size="sm" onClick={() => {
                                    setTechData({ ...techData, parentId: category.id });
                                    setShowTechModal(true);
                                }}>
                                    <PlusIcon className="h-4 w-4 mr-1" />
                                    추가
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {!hasChildren ? (
                            <p className="text-sm text-gray-400 text-center py-8">아직 항목이 없습니다</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {category.children!.map((child) => (
                                    <div key={child.id} className="bg-gray-50 border border-gray-100 rounded-xl p-4 hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => router.push(`/projects?tech=${child.techType || child.id}`)}>
                                                {child.icon && (
                                                    <div className="p-2 bg-white rounded-lg text-gray-500 inline-block mb-2">
                                                        <span className="text-xl">{child.icon}</span>
                                                    </div>
                                                )}
                                                <h3 className="font-medium text-sm text-gray-800 truncate">{child.name}</h3>
                                                {child.description && (
                                                    <p className="text-xs text-gray-400 truncate mt-0.5">{child.description}</p>
                                                )}
                                            </div>
                                            {isAdminMode && (
                                                <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(child.id)} className="opacity-0 group-hover:opacity-100">
                                                    <TrashIcon className="h-4 w-4 text-red-500" />
                                                </Button>
                                            )}
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
            <Dialog open={showGroupModal} onOpenChange={setShowGroupModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>새 그룹 추가</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Input placeholder="그룹 이름" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setShowGroupModal(false)} className="flex-1">취소</Button>
                            <Button onClick={handleAddGroup} className="flex-1">생성</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Tech Modal */}
            <Dialog open={showTechModal} onOpenChange={setShowTechModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>새 기술 스택 추가</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Input placeholder="표시 이름 (예: React)" value={techData.name} onChange={(e) => setTechData({ ...techData, name: e.target.value })} />
                        <Input placeholder="식별 코드 (예: react)" value={techData.techType} onChange={(e) => setTechData({ ...techData, techType: e.target.value })} />
                        <Textarea placeholder="설명 (선택)" value={techData.description} onChange={(e) => setTechData({ ...techData, description: e.target.value })} rows={3} />
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setShowTechModal(false)} className="flex-1">취소</Button>
                            <Button onClick={handleAddTech} className="flex-1">추가</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
