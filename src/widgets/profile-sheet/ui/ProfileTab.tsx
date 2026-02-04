"use client";

import { useRouter } from "next/navigation";
import { useUserStore } from "@/entities/user/model/store";
import { Button } from "@/shared/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { User, Shield, Mail, LogOut, Settings } from "lucide-react";
import { getImageUrl } from "@/shared/lib/utils";

interface ProfileTabProps {
  onClose: () => void;
}

export const ProfileTab = ({ onClose }: ProfileTabProps) => {
  const router = useRouter();
  const { user, logout } = useUserStore((state) => ({
    user: state.user,
    logout: state.logout,
  }));

  if (!user) return null;

  const isAdmin = user.role === "ADMIN";
  const profileImageUrl = getImageUrl(user.profileImage);
  const displayName = user.name || user.email.split("@")[0];
  const initials = displayName.charAt(0).toUpperCase();

  const handleProfileEdit = () => {
    onClose();
    router.push("/profile");
  };

  const handleLogout = () => {
    onClose();
    logout();
  };

  return (
    <div className="p-4 space-y-6">
      {/* 프로필 정보 */}
      <div className="flex flex-col items-center text-center">
        <Avatar className="h-20 w-20 mb-3">
          <AvatarImage src={profileImageUrl || undefined} alt={displayName} />
          <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            {initials}
          </AvatarFallback>
        </Avatar>

        <h3 className="text-lg font-semibold">{displayName}</h3>

        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
          <Mail className="h-3.5 w-3.5" />
          {user.email}
        </div>

        <div className="mt-2">
          {isAdmin ? (
            <Badge variant="secondary" className="gap-1 bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
              <Shield className="h-3 w-3" />
              관리자
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1">
              <User className="h-3 w-3" />
              사용자
            </Badge>
          )}
        </div>
      </div>

      {/* 구분선 */}
      <div className="border-t" />

      {/* 액션 버튼들 */}
      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={handleProfileEdit}
        >
          <Settings className="h-4 w-4" />
          프로필 수정
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          로그아웃
        </Button>
      </div>
    </div>
  );
};
