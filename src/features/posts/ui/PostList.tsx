"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { type ColumnDef, type SortingState, type PaginationState } from "@tanstack/react-table";
import { DataTable } from "@/shared/ui/DataTable";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { usePosts } from "../model/usePosts";
import type { Post } from "../api/postsApi";
import { Eye, PenSquare, Search } from "lucide-react";

export function PostList() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

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

  const columns: ColumnDef<Post>[] = useMemo(
    () => [
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
    ],
    []
  );

  const handleSearch = () => {
    setSearch(searchInput);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleRowClick = (post: Post) => {
    router.push(`/posts/${post.id}`);
  };

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">게시판</h1>
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
      />
    </div>
  );
}
