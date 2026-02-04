"use client";

import { useState } from "react";
import {
  MessageSquare,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  useGlobalRooms,
  useCreateGlobalRoom,
  useUpdateGlobalRoom,
  useDeleteGlobalRoom,
} from "@/features/global-chat/model/useGlobalChat";
import {
  useGlobalChatStore,
  globalChatActions,
} from "@/features/global-chat/model/globalChatStore";
import { GlobalChatRoom } from "@/features/global-chat/api/globalChatApi";
import { useUserStore } from "@/entities/user/model/store";
import { cn } from "@/shared/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { FormDialog, FormField } from "@/shared/ui/dialogs/BaseDialog";
import { ConfirmDialog } from "@/shared/ui/dialogs/ConfirmDialog";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { toast } from "sonner";

export const GlobalChatSidebar = () => {
  const { data: rooms, isLoading } = useGlobalRooms();
  const selectedRoomId = useGlobalChatStore((s) => s.selectedRoomId);
  const user = useUserStore((s) => s.user);
  const isAdmin = user?.role === "ADMIN";

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editRoom, setEditRoom] = useState<GlobalChatRoom | null>(null);
  const [deleteRoom, setDeleteRoom] = useState<GlobalChatRoom | null>(null);

  const createMutation = useCreateGlobalRoom();
  const updateMutation = useUpdateGlobalRoom();
  const deleteMutation = useDeleteGlobalRoom();

  const handleSelectRoom = (roomId: number) => {
    globalChatActions.setSelectedRoomId(roomId);
  };

  const handleCreate = async (data: { name: string; description: string }) => {
    try {
      await createMutation.mutateAsync({
        name: data.name,
        description: data.description || undefined,
        createdBy: user?.userId,
      });
      setCreateDialogOpen(false);
      toast.success("채팅방이 생성되었습니다");
    } catch {
      toast.error("채팅방 생성에 실패했습니다");
    }
  };

  const handleUpdate = async (data: { name: string; description: string }) => {
    if (!editRoom) return;
    try {
      await updateMutation.mutateAsync({
        id: editRoom.id,
        data: {
          name: data.name,
          description: data.description || undefined,
        },
      });
      setEditRoom(null);
      toast.success("채팅방이 수정되었습니다");
    } catch {
      toast.error("채팅방 수정에 실패했습니다");
    }
  };

  const handleDelete = async () => {
    if (!deleteRoom) return;
    try {
      await deleteMutation.mutateAsync(deleteRoom.id);
      if (selectedRoomId === deleteRoom.id) {
        globalChatActions.setSelectedRoomId(null);
      }
      setDeleteRoom(null);
      toast.success("채팅방이 삭제되었습니다");
    } catch {
      toast.error("채팅방 삭제에 실패했습니다");
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950">
      {/* 헤더 */}
      <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">전체 채팅</h2>
          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCreateDialogOpen(true)}
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-xs text-zinc-500 mt-1">
          조직 전체가 참여하는 채팅방
        </p>
      </div>

      {/* 채팅방 목록 */}
      <div className="flex-1 overflow-y-auto py-2">
        {isLoading ? (
          <div className="px-4 py-8 text-center text-zinc-400 text-sm">
            로딩 중...
          </div>
        ) : rooms && rooms.length > 0 ? (
          <div className="space-y-1 px-2">
            {rooms.map((room) => (
              <GlobalChatRoomItem
                key={room.id}
                room={room}
                isSelected={selectedRoomId === room.id}
                isAdmin={isAdmin}
                onSelect={() => handleSelectRoom(room.id)}
                onEdit={() => setEditRoom(room)}
                onDelete={() => setDeleteRoom(room)}
              />
            ))}
          </div>
        ) : (
          <div className="px-4 py-8 text-center text-zinc-400">
            <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">채팅방이 없습니다</p>
            {isAdmin && <p className="text-xs mt-1">+ 버튼으로 추가하세요</p>}
          </div>
        )}
      </div>

      {/* 채팅방 생성 다이얼로그 */}
      <CreateRoomDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreate}
        isLoading={createMutation.isPending}
      />

      {/* 채팅방 수정 다이얼로그 */}
      <EditRoomDialog
        open={editRoom !== null}
        onOpenChange={(open) => !open && setEditRoom(null)}
        room={editRoom}
        onSubmit={handleUpdate}
        isLoading={updateMutation.isPending}
      />

      {/* 채팅방 삭제 확인 */}
      <ConfirmDialog
        open={deleteRoom !== null}
        onOpenChange={(open) => !open && setDeleteRoom(null)}
        title="채팅방 삭제"
        description={`"${deleteRoom?.name}" 채팅방을 삭제하시겠습니까? 모든 메시지가 삭제됩니다.`}
        variant="destructive"
        onConfirm={handleDelete}
        confirmLabel="삭제"
        cancelLabel="취소"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

interface GlobalChatRoomItemProps {
  room: GlobalChatRoom;
  isSelected: boolean;
  isAdmin: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const GlobalChatRoomItem = ({
  room,
  isSelected,
  isAdmin,
  onSelect,
  onEdit,
  onDelete,
}: GlobalChatRoomItemProps) => {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer group",
        "hover:bg-zinc-100 dark:hover:bg-zinc-800",
        isSelected &&
          "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
      )}
      onClick={onSelect}
    >
      <MessageSquare
        className={cn(
          "h-4 w-4 shrink-0",
          isSelected ? "text-blue-500" : "text-zinc-400",
        )}
      />
      <span className="flex-1 truncate text-sm">{room.name}</span>
      {isAdmin && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "p-1 rounded opacity-0 group-hover:opacity-100",
                "hover:bg-zinc-200 dark:hover:bg-zinc-700",
                "transition-opacity",
              )}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="h-4 w-4 mr-2" />
              수정
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

interface CreateRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; description: string }) => void;
  isLoading: boolean;
}

const CreateRoomDialog = ({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: CreateRoomDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), description: description.trim() });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setName("");
      setDescription("");
    }
    onOpenChange(newOpen);
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="채팅방 생성"
      onSubmit={handleSubmit}
      submitLabel="생성"
      submitDisabled={!name.trim() || isLoading}
      isSubmitting={isLoading}
    >
      <FormField label="채팅방 이름" required>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="채팅방 이름을 입력하세요"
          autoFocus
        />
      </FormField>
      <FormField label="설명">
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="채팅방 설명을 입력하세요 (선택)"
          rows={3}
        />
      </FormField>
    </FormDialog>
  );
};

interface EditRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: GlobalChatRoom | null;
  onSubmit: (data: { name: string; description: string }) => void;
  isLoading: boolean;
}

const EditRoomDialog = ({
  open,
  onOpenChange,
  room,
  onSubmit,
  isLoading,
}: EditRoomDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // room이 변경되면 폼 초기화
  useState(() => {
    if (room) {
      setName(room.name);
      setDescription(room.description || "");
    }
  });

  // open 상태가 true가 되면 room 값으로 초기화
  if (open && room && name === "" && description === "") {
    setName(room.name);
    setDescription(room.description || "");
  }

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), description: description.trim() });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setName("");
      setDescription("");
    }
    onOpenChange(newOpen);
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="채팅방 수정"
      onSubmit={handleSubmit}
      submitLabel="저장"
      submitDisabled={!name.trim() || isLoading}
      isSubmitting={isLoading}
    >
      <FormField label="채팅방 이름" required>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="채팅방 이름을 입력하세요"
          autoFocus
        />
      </FormField>
      <FormField label="설명">
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="채팅방 설명을 입력하세요 (선택)"
          rows={3}
        />
      </FormField>
    </FormDialog>
  );
};
