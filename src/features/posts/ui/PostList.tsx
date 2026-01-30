"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  type ColumnDef,
  type SortingState,
  type PaginationState,
  type RowSelectionState,
} from "@tanstack/react-table";
import { DataTable } from "@/shared/ui/DataTable";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { ConfirmDialog } from "@/shared/ui/dialogs/ConfirmDialog";
import { usePosts, useDeletePost } from "../model/usePosts";
import { useUserStore } from "@/entities/user/model/store";
import type { Post } from "../api/postsApi";
import { Eye, PenSquare, Search, Trash2 } from "lucide-react";

export function PostList() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const user = useUserStore((state) => state.user);
  const isAdmin = isClient && user?.role === "ADMIN";

  // Hydration 불일치 방지: 클라이언트에서만 isAdmin 적용
  useEffect(() => {
    setIsClient(true);
  }, []);

  const { mutate: deletePost, isPending: isDeleting } = useDeletePost();

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);

  // API 파라미터 변환
  const queryParams = useMemo(() => {
    const sortBy = sorting[0]?.id || "createdAt";
    const sortOrder = sorting[0]?.desc ? "desc" : "asc";

    return {
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      sortBy,
      sortOrder: sortOrder as "asc" | "desc",
      search: search || undefined,
    };
  }, [pagination, sorting, search]);

  const { data, isLoading } = usePosts(queryParams);

  const columns: ColumnDef<Post>[] = useMemo(() => {
    const cols: ColumnDef<Post>[] = [];

    if (isAdmin) {
      cols.push({
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={(e) => {
              e.stopPropagation();
              row.toggleSelected(e.target.checked);
            }}
            onClick={(e) => e.stopPropagation()}
            className="h-4 w-4 rounded border-gray-300"
          />
        ),
        size: 40,
        enableSorting: false,
      });
    }

    cols.push(
      {
        accessorKey: "id",
        header: "번호",
        size: 80,
        enableSorting: false,
      },
      {
        accessorKey: "title",
        header: "제목",
        cell: ({ row }) => (
          <span className="font-medium text-gray-900 hover:text-blue-600">
            {row.original.title}
          </span>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "authorName",
        header: "작성자",
        size: 120,
        enableSorting: false,
      },
      {
        accessorKey: "viewCount",
        header: () => (
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            조회
          </div>
        ),
        size: 100,
        enableSorting: true,
      },
      {
        accessorKey: "createdAt",
        header: "작성일",
        size: 150,
        cell: ({ row }) => {
          const date = new Date(row.original.createdAt);
          return date.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          });
        },
        enableSorting: true,
      },
    );

    if (isAdmin) {
      cols.push({
        id: "actions",
        header: "",
        size: 60,
        cell: ({ row }) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(row.original);
            }}
            className="p-1 text-gray-400 hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ),
      });
    }

    return cols;
  }, [isAdmin]);

  const handleSearch = () => {
    setSearch(searchInput);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleRowClick = (post: Post) => {
    router.push(`/posts/${post.id}`);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deletePost(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  const selectedPosts = useMemo(() => {
    if (!data?.data) return [];
    return Object.keys(rowSelection)
      .filter((key) => rowSelection[key])
      .map((key) => data.data[parseInt(key)]);
  }, [rowSelection, data?.data]);

  const [bulkDeleting, setBulkDeleting] = useState(false);

  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    try {
      await Promise.all(
        selectedPosts.map(
          (post) =>
            new Promise<void>((resolve) => {
              deletePost(post.id, { onSuccess: () => resolve() });
            }),
        ),
      );
      setRowSelection({});
      setShowBulkDeleteDialog(false);
    } finally {
      setBulkDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">게시판</h1>
          {isAdmin && selectedPosts.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowBulkDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {selectedPosts.length}개 삭제
            </Button>
          )}
        </div>
        <Button onClick={() => router.push("/posts/write")}>
          <PenSquare className="h-4 w-4 mr-2" />
          글쓰기
        </Button>
      </div>

      {/* 검색 */}
      <div className="flex gap-2">
        <Input
          placeholder="제목 검색..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="max-w-sm"
        />
        <Button variant="outline" onClick={handleSearch}>
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* 테이블 */}
      <DataTable
        columns={columns}
        data={data?.data || []}
        pageCount={data?.meta.totalPages || 1}
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
        isLoading={isLoading}
        onRowClick={handleRowClick}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        enableRowSelection={isAdmin}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="게시글 삭제"
        description={`"${deleteTarget?.title}" 게시글을 삭제하시겠습니까?`}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />

      <ConfirmDialog
        open={showBulkDeleteDialog}
        onOpenChange={setShowBulkDeleteDialog}
        title="게시글 일괄 삭제"
        description={`선택한 ${selectedPosts.length}개의 게시글을 삭제하시겠습니까?`}
        onConfirm={handleBulkDelete}
        isLoading={bulkDeleting}
        variant="destructive"
      />
    </div>
  );
}
