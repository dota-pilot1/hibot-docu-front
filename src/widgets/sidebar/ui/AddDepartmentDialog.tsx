"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { useCreateDepartment, useDepartmentTree } from "@/features/organization/model/useOrganization";
import type { Department } from "@/features/organization/api/organizationApi";

interface AddDepartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentDepartment?: Department | null;
}

export const AddDepartmentDialog = ({
  open,
  onOpenChange,
  parentDepartment,
}: AddDepartmentDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const createDepartment = useCreateDepartment();
  const { data } = useDepartmentTree();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await createDepartment.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        parentId: parentDepartment?.id,
      });
      setName("");
      setDescription("");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create department:", error);
    }
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[400px] rounded-lg">
        <DialogHeader className="bg-white dark:bg-zinc-900 rounded-t-lg">
          <DialogTitle>
            {parentDepartment ? `${parentDepartment.name} 하위 부서 추가` : "부서 추가"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">부서명 *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 개발팀"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="부서 설명 (선택)"
              />
            </div>
            {parentDepartment && (
              <div className="text-sm text-zinc-500">
                상위 부서: <span className="font-medium">{parentDepartment.name}</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              취소
            </Button>
            <Button type="submit" disabled={!name.trim() || createDepartment.isPending}>
              {createDepartment.isPending ? "추가 중..." : "추가"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
