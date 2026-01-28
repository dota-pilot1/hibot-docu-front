"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Calendar, Shield, FileText, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { ConfirmDialog } from "@/shared/ui/dialogs/ConfirmDialog";
import { useUserStore } from "@/entities/user/model/store";
import { api } from "@/shared/api";

interface Profile {
  id: number;
  email: string;
  name: string | null;
  role: "ADMIN" | "USER";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Post {
  id: number;
  title: string;
  createdAt: string;
  viewCount: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const accessToken = useUserStore((state) => state.accessToken);
  const logout = useUserStore((state) => state.logout);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!user || !accessToken) {
      router.push("/");
      return;
    }

    const fetchData = async () => {
      try {
        const [profileRes, postsRes] = await Promise.all([
          api.get("/auth/profile"),
          api.get("/posts/my"),
        ]);
        setProfile(profileRes.data);
        setMyPosts(postsRes.data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, accessToken, router]);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await api.delete("/users/me");
      logout();
      router.push("/");
    } catch (error) {
      console.error("Failed to delete account:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <p className="text-gray-500">프로필을 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">내 프로필</h1>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  {profile.name || profile.email.split("@")[0]}
                </CardTitle>
                <p className="text-sm text-gray-500">
                  {profile.role === "ADMIN" ? "관리자" : "일반 사용자"}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">이메일</p>
                <p className="font-medium">{profile.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Shield className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">권한</p>
                <p className="font-medium">
                  {profile.role === "ADMIN" ? "관리자" : "일반 사용자"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">가입일</p>
                <p className="font-medium">
                  {new Date(profile.createdAt).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 내가 쓴 글 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5" />
              내가 쓴 글 ({myPosts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {myPosts.length === 0 ? (
              <p className="text-gray-500 text-sm">작성한 글이 없습니다.</p>
            ) : (
              <ul className="space-y-2">
                {myPosts.map((post) => (
                  <li key={post.id}>
                    <Link
                      href={`/posts/${post.id}`}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <span className="font-medium text-gray-900 truncate">
                        {post.title}
                      </span>
                      <span className="text-xs text-gray-500 shrink-0 ml-4">
                        {new Date(post.createdAt).toLocaleDateString("ko-KR")}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* 회원 탈퇴 */}
        <Card className="mt-6 border-red-200">
          <CardHeader>
            <CardTitle className="text-lg text-red-600">회원 탈퇴</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              회원 탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.
            </p>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              회원 탈퇴
            </Button>
          </CardContent>
        </Card>

        <ConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title="회원 탈퇴"
          description="정말로 탈퇴하시겠습니까? 모든 데이터가 삭제되며 복구할 수 없습니다."
          onConfirm={handleDeleteAccount}
          isLoading={isDeleting}
          variant="destructive"
        />
      </div>
    </div>
  );
}
