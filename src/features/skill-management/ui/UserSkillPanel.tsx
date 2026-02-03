"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { FormDialog, FormField } from "@/shared/ui/dialogs/BaseDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Loader2,
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  FolderPlus,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import {
  useSkillsWithUserLevels,
  useUpdateUserSkill,
  skillLevelConfig,
  useAllSkills,
  useCreateSkill,
  useUpdateSkill,
  useDeleteSkill,
  useSkillCategories,
  useCreateSkillCategory,
  useUpdateSkillCategory,
  useDeleteSkillCategory,
} from "@/entities/skill";
import type { Skill, SkillCategory } from "@/entities/skill";
import { SkillLevelSlider } from "./SkillLevelSlider";
import { toast } from "sonner";

interface UserSkillPanelProps {
  userId: number;
  userName?: string;
  isOwnProfile?: boolean;
}

type ModalMode =
  | "skill-add"
  | "skill-edit"
  | "category-add"
  | "category-edit"
  | null;

export function UserSkillPanel({
  userId,
  userName,
  isOwnProfile = false,
}: UserSkillPanelProps) {
  const { data: skillsWithLevels, isLoading } = useSkillsWithUserLevels(userId);
  const { data: allSkills } = useAllSkills();
  const { data: categories } = useSkillCategories();
  const updateUserSkill = useUpdateUserSkill(userId);
  const [updatingSkillId, setUpdatingSkillId] = useState<number | null>(null);

  // 카테고리 접기/펴기 상태
  const [collapsedCategories, setCollapsedCategories] = useState<Set<number>>(
    new Set(),
  );

  // 스킬 관리 mutation hooks
  const createSkill = useCreateSkill();
  const updateSkill = useUpdateSkill();
  const deleteSkill = useDeleteSkill();

  // 카테고리 관리 mutation hooks
  const createCategory = useCreateSkillCategory();
  const updateCategory = useUpdateSkillCategory();
  const deleteCategory = useDeleteSkillCategory();

  // 모달 상태
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [selectedCategory, setSelectedCategory] =
    useState<SkillCategory | null>(null);
  const [selectedCategoryIdForSkill, setSelectedCategoryIdForSkill] = useState<
    number | null
  >(null);

  // 카테고리 폼
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    color: "#4F46E5",
  });

  // 스킬 폼
  const [skillForm, setSkillForm] = useState({
    name: "",
    description: "",
    maxLevel: 5,
    categoryId: undefined as number | undefined,
  });

  const resetForms = () => {
    setSkillForm({
      name: "",
      description: "",
      maxLevel: 5,
      categoryId: undefined,
    });
    setCategoryForm({ name: "", description: "", color: "#4F46E5" });
    setSelectedSkill(null);
    setSelectedCategory(null);
    setSelectedCategoryIdForSkill(null);
    setModalMode(null);
  };

  // 카테고리 핸들러
  const handleAddCategory = () => {
    setCategoryForm({ name: "", description: "", color: "#4F46E5" });
    setModalMode("category-add");
  };

  const handleEditCategory = (category: SkillCategory) => {
    setSelectedCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || "",
      color: category.color || "#4F46E5",
    });
    setModalMode("category-edit");
  };

  const handleDeleteCategory = async (category: SkillCategory) => {
    if (!confirm(`"${category.name}" 카테고리를 삭제하시겠습니까?`)) return;
    try {
      await deleteCategory.mutateAsync(category.id);
      toast.success("카테고리가 삭제되었습니다.");
    } catch (error) {
      toast.error("카테고리 삭제에 실패했습니다.");
    }
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) {
      toast.error("카테고리 이름을 입력하세요.");
      return;
    }
    try {
      if (modalMode === "category-add") {
        await createCategory.mutateAsync(categoryForm);
        toast.success("카테고리가 추가되었습니다.");
      } else if (modalMode === "category-edit" && selectedCategory) {
        await updateCategory.mutateAsync({
          id: selectedCategory.id,
          data: categoryForm,
        });
        toast.success("카테고리가 수정되었습니다.");
      }
      resetForms();
    } catch (error) {
      toast.error("저장에 실패했습니다.");
    }
  };

  // 스킬 핸들러
  const handleAddSkill = (categoryId: number) => {
    setSelectedCategoryIdForSkill(categoryId);
    setSkillForm({
      name: "",
      description: "",
      maxLevel: 5,
      categoryId: categoryId,
    });
    setModalMode("skill-add");
  };

  const handleEditSkill = (skill: Skill) => {
    setSelectedSkill(skill);
    setSkillForm({
      name: skill.name,
      description: skill.description || "",
      maxLevel: skill.maxLevel,
      categoryId: skill.categoryId,
    });
    setModalMode("skill-edit");
  };

  const handleDeleteSkill = async (skill: Skill) => {
    if (!confirm(`"${skill.name}" 스킬을 삭제하시겠습니까?`)) return;
    try {
      await deleteSkill.mutateAsync(skill.id);
      toast.success("스킬이 삭제되었습니다.");
    } catch (error) {
      toast.error("스킬 삭제에 실패했습니다.");
    }
  };

  const handleSaveSkill = async () => {
    if (!skillForm.name.trim()) {
      toast.error("스킬 이름을 입력하세요.");
      return;
    }
    try {
      if (modalMode === "skill-add") {
        await createSkill.mutateAsync(skillForm);
        toast.success("스킬이 추가되었습니다.");
      } else if (modalMode === "skill-edit" && selectedSkill) {
        await updateSkill.mutateAsync({
          id: selectedSkill.id,
          data: skillForm,
        });
        toast.success("스킬이 수정되었습니다.");
      }
      resetForms();
    } catch (error) {
      toast.error("저장에 실패했습니다.");
    }
  };

  const handleSkillLevelChange = async (skillId: number, level: number) => {
    if (!isOwnProfile) return;

    setUpdatingSkillId(skillId);
    try {
      await updateUserSkill.mutateAsync({
        skillId,
        data: { level },
      });
      toast.success("스킬 레벨이 업데이트되었습니다.");
    } catch (error) {
      toast.error("스킬 레벨 업데이트에 실패했습니다.");
    } finally {
      setUpdatingSkillId(null);
    }
  };

  const toggleCategory = (categoryId: number) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  // 유저 스킬 레벨 맵
  const userSkillMap = new Map<number, number>();
  skillsWithLevels?.forEach((skill) => {
    userSkillMap.set(skill.id, skill.userSkill?.level || 0);
  });

  // 카테고리별 스킬 그룹화
  const skillsByCategory = new Map<number | null, Skill[]>();
  (allSkills || []).forEach((skill) => {
    const catId = skill.categoryId ?? null;
    if (!skillsByCategory.has(catId)) {
      skillsByCategory.set(catId, []);
    }
    skillsByCategory.get(catId)!.push(skill);
  });

  // 카테고리 없는 스킬들
  const uncategorizedSkills = skillsByCategory.get(null) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // 카테고리가 없으면 카테고리 추가 안내
  if (!categories || categories.length === 0) {
    return (
      <div className="h-full flex flex-col p-4">
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <FolderPlus className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">카테고리가 없습니다</h3>
          <p className="text-sm text-muted-foreground mb-4">
            스킬을 관리하려면 먼저 카테고리를 추가하세요.
          </p>
          <Button onClick={handleAddCategory}>
            <Plus className="h-4 w-4 mr-2" />
            카테고리 추가
          </Button>
        </div>

        {/* 카테고리 추가 모달 */}
        <FormDialog
          open={modalMode === "category-add"}
          onOpenChange={() => resetForms()}
          title="카테고리 추가"
          onSubmit={handleSaveCategory}
          onCancel={resetForms}
        >
          <FormField label="카테고리 이름">
            <Input
              value={categoryForm.name}
              onChange={(e) =>
                setCategoryForm({ ...categoryForm, name: e.target.value })
              }
              placeholder="예: Frontend"
            />
          </FormField>
          <FormField label="설명">
            <Input
              value={categoryForm.description}
              onChange={(e) =>
                setCategoryForm({
                  ...categoryForm,
                  description: e.target.value,
                })
              }
              placeholder="카테고리 설명"
            />
          </FormField>
          <FormField label="색상">
            <div className="flex items-center gap-3">
              <Input
                type="color"
                value={categoryForm.color}
                onChange={(e) =>
                  setCategoryForm({ ...categoryForm, color: e.target.value })
                }
                className="h-10 w-16 p-1 cursor-pointer"
              />
              <span className="text-sm text-muted-foreground">
                {categoryForm.color}
              </span>
            </div>
          </FormField>
        </FormDialog>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4">
      {/* 상단 툴바 */}
      <div className="flex items-center gap-2 mb-4">
        <Button onClick={handleAddCategory} size="sm" variant="outline">
          <FolderPlus className="h-4 w-4 mr-2" />
          카테고리 추가
        </Button>
      </div>

      {/* 카테고리별 스킬 목록 */}
      <div className="flex-1 overflow-auto space-y-4">
        {categories.map((category) => {
          const categorySkills = skillsByCategory.get(category.id) || [];
          const isCollapsed = collapsedCategories.has(category.id);

          return (
            <div
              key={category.id}
              className="border rounded-lg overflow-hidden"
            >
              {/* 카테고리 헤더 */}
              <div
                className="flex items-center justify-between p-3 bg-muted/50 cursor-pointer hover:bg-muted/70"
                onClick={() => toggleCategory(category.id)}
              >
                <div className="flex items-center gap-2">
                  {isCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color || "#4F46E5" }}
                  />
                  <h3 className="font-semibold">{category.name}</h3>
                  <span className="text-xs text-muted-foreground">
                    ({categorySkills.length})
                  </span>
                </div>
                <div
                  className="flex gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => handleAddSkill(category.id)}
                    title="스킬 추가"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => handleEditCategory(category)}
                    title="카테고리 수정"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => handleDeleteCategory(category)}
                    title="카테고리 삭제"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              </div>

              {/* 스킬 카드들 */}
              {!isCollapsed && (
                <div className="p-3">
                  {categorySkills.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      이 카테고리에 스킬이 없습니다.
                      <Button
                        variant="link"
                        size="sm"
                        className="ml-1"
                        onClick={() => handleAddSkill(category.id)}
                      >
                        스킬 추가
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
                      {categorySkills.map((skill) => {
                        const level = userSkillMap.get(skill.id) || 0;
                        const config =
                          skillLevelConfig[level] || skillLevelConfig[0];

                        return (
                          <div
                            key={skill.id}
                            className="border rounded-lg p-4 hover:bg-muted/30 hover:shadow-sm transition-all"
                          >
                            {/* 카드 헤더 */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div
                                  className={cn(
                                    "w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold",
                                    config.bgColor,
                                    config.color,
                                  )}
                                >
                                  {level}
                                </div>
                                <div>
                                  <h4 className="font-semibold text-base">
                                    {skill.name}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    최대 Lv.{skill.maxLevel}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleEditSkill(skill)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleDeleteSkill(skill)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </div>

                            {/* 설명 */}
                            {skill.description && (
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                {skill.description}
                              </p>
                            )}

                            {/* 레벨 슬라이더 */}
                            {isOwnProfile && (
                              <div className="pt-2 border-t">
                                <SkillLevelSlider
                                  level={level}
                                  maxLevel={skill.maxLevel}
                                  onChange={(newLevel) =>
                                    handleSkillLevelChange(skill.id, newLevel)
                                  }
                                  disabled={updatingSkillId === skill.id}
                                  showLabel
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* 미분류 스킬 */}
        {uncategorizedSkills.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-3 bg-muted/30">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400" />
                <h3 className="font-semibold text-muted-foreground">미분류</h3>
                <span className="text-xs text-muted-foreground">
                  ({uncategorizedSkills.length})
                </span>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
                {uncategorizedSkills.map((skill) => {
                  const level = userSkillMap.get(skill.id) || 0;
                  const config = skillLevelConfig[level] || skillLevelConfig[0];

                  return (
                    <div
                      key={skill.id}
                      className="border rounded-lg p-4 hover:bg-muted/30 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold",
                              config.bgColor,
                              config.color,
                            )}
                          >
                            {level}
                          </div>
                          <div>
                            <h4 className="font-semibold text-base">
                              {skill.name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              최대 Lv.{skill.maxLevel}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleEditSkill(skill)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleDeleteSkill(skill)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      {skill.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {skill.description}
                        </p>
                      )}
                      {isOwnProfile && (
                        <div className="pt-2 border-t">
                          <SkillLevelSlider
                            level={level}
                            maxLevel={skill.maxLevel}
                            onChange={(newLevel) =>
                              handleSkillLevelChange(skill.id, newLevel)
                            }
                            disabled={updatingSkillId === skill.id}
                            showLabel
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 카테고리 추가/수정 모달 */}
      <FormDialog
        open={modalMode === "category-add" || modalMode === "category-edit"}
        onOpenChange={() => resetForms()}
        title={modalMode === "category-add" ? "카테고리 추가" : "카테고리 수정"}
        onSubmit={handleSaveCategory}
        onCancel={resetForms}
      >
        <FormField label="카테고리 이름">
          <Input
            value={categoryForm.name}
            onChange={(e) =>
              setCategoryForm({ ...categoryForm, name: e.target.value })
            }
            placeholder="예: Frontend"
          />
        </FormField>
        <FormField label="설명">
          <Input
            value={categoryForm.description}
            onChange={(e) =>
              setCategoryForm({
                ...categoryForm,
                description: e.target.value,
              })
            }
            placeholder="카테고리 설명"
          />
        </FormField>
        <FormField label="색상">
          <div className="flex items-center gap-3">
            <Input
              type="color"
              value={categoryForm.color}
              onChange={(e) =>
                setCategoryForm({ ...categoryForm, color: e.target.value })
              }
              className="h-10 w-16 p-1 cursor-pointer"
            />
            <span className="text-sm text-muted-foreground">
              {categoryForm.color}
            </span>
          </div>
        </FormField>
      </FormDialog>

      {/* 스킬 추가/수정 모달 */}
      <FormDialog
        open={modalMode === "skill-add" || modalMode === "skill-edit"}
        onOpenChange={() => resetForms()}
        title={modalMode === "skill-add" ? "스킬 추가" : "스킬 수정"}
        onSubmit={handleSaveSkill}
        onCancel={resetForms}
      >
        <FormField label="카테고리">
          <Select
            value={skillForm.categoryId?.toString() || ""}
            onValueChange={(value) =>
              setSkillForm({
                ...skillForm,
                categoryId: value ? parseInt(value) : undefined,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="카테고리 선택" />
            </SelectTrigger>
            <SelectContent>
              {categories?.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="스킬 이름">
          <Input
            value={skillForm.name}
            onChange={(e) =>
              setSkillForm({ ...skillForm, name: e.target.value })
            }
            placeholder="예: React"
          />
        </FormField>
        <FormField label="설명">
          <Input
            value={skillForm.description}
            onChange={(e) =>
              setSkillForm({ ...skillForm, description: e.target.value })
            }
            placeholder="스킬 설명"
          />
        </FormField>
        <FormField label="최대 레벨">
          <Input
            type="number"
            min={1}
            max={10}
            value={skillForm.maxLevel}
            onChange={(e) =>
              setSkillForm({
                ...skillForm,
                maxLevel: parseInt(e.target.value) || 5,
              })
            }
          />
        </FormField>
      </FormDialog>
    </div>
  );
}
