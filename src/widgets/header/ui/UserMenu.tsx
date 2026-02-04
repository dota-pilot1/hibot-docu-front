"use client";

import Link from "next/link";
import { useUserStore } from "@/entities/user/model/store";
import { Button } from "@/shared/ui/button";
import { User, Shield, LogOut } from "lucide-react";
import { getImageUrl } from "@/shared/lib/utils";

export const UserMenu = () => {
  const { user, logout } = useUserStore((state) => ({
    user: state.user,
    logout: state.logout,
  }));

  if (!user) return null;

  const isAdmin = user.role === "ADMIN";
  const profileImageUrl = getImageUrl(user.profileImage);

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/profile"
        className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-blue-600 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
          {profileImageUrl ? (
            <img
              src={profileImageUrl}
              alt="프로필"
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-4 h-4 text-zinc-500" />
          )}
        </div>
        <span className="inline">
          {user.name || user.email.split("@")[0]}님
        </span>
      </Link>

      {/* 관리자 아이콘 */}
      {isAdmin && (
        <div
          className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center"
          title="관리자"
        >
          <Shield className="w-4 h-4 text-purple-600 dark:text-purple-300" />
        </div>
      )}

      {/* 로그아웃 아이콘 */}
      <Button
        variant="ghost"
        size="icon"
        onClick={logout}
        className="w-8 h-8"
        title="로그아웃"
      >
        <LogOut className="w-4 h-4" />
      </Button>
    </div>
  );
};
