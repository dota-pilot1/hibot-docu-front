"use client";

import { useState } from "react";
import { FormDialog, FormField } from "@/shared/ui/dialogs/BaseDialog";
import { Input } from "@/shared/ui/input";
import {
  useCreateDepartment,
  useDepartmentTree,
} from "@/features/organization/model/useOrganization";
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

  const handleSubmit = async () => {
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
    <FormDialog
      open={open}
      onOpenChange={handleClose}
      title={
        parentDepartment
          ? `${parentDepartment.name} 하위 부서 추가`
          : "부서 추가"
      }
      onSubmit={handleSubmit}
      onCancel={handleClose}
      submitLabel="추가"
      isSubmitting={createDepartment.isPending}
      submitDisabled={!name.trim()}
    >
      <FormField label="부서명" required>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 개발팀"
          autoFocus
        />
      </FormField>
      <FormField label="설명">
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="부서 설명 (선택)"
        />
      </FormField>
      {parentDepartment && (
        <div className="text-sm text-muted-foreground">
          상위 부서:{" "}
          <span className="font-medium">{parentDepartment.name}</span>
        </div>
      )}
    </FormDialog>
  );
};
