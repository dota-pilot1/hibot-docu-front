"use client";

import Link from "next/link";
import { useUserStore } from "@/entities/user/model/store";
import { Button } from "@/shared/ui/button";
import { User, Shield } from "lucide-react";
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
    <div className="flex items-center gap-3">
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
        <div className="hidden sm:flex items-center gap-1.5">
          <span className="truncate max-w-[150px]">{user.email}</span>
          {isAdmin && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              <Shield className="w-3 h-3" />
              관리자
            </span>
          )}
        </div>
      </Link>
      <Button
        variant="ghost"
        size="sm"
        onClick={logout}
        className="h-8 text-xs"
      >
        Logout
      </Button>
    </div>
  );
};
