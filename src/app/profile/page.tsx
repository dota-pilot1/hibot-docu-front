"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  User,
  Mail,
  Calendar,
  Shield,
  FileText,
  Trash2,
  Camera,
  Loader2,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { ConfirmDialog } from "@/shared/ui/dialogs/ConfirmDialog";
import { FormDialog } from "@/shared/ui/dialogs/FormDialog";
import { useUserStore } from "@/entities/user/model/store";
import { api } from "@/shared/api";
import { getImageUrl } from "@/shared/lib/utils";
import { toast } from "sonner";

interface Profile {
  id: number;
  email: string;
  name: string | null;
  profileImage: string | null;
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
  const setUser = useUserStore((state) => state.setUser);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 유저네임 수정 관련 상태
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [newName, setNewName] = useState("");
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [isNameAvailable, setIsNameAvailable] = useState<boolean | null>(null);
  const [isSavingName, setIsSavingName] = useState(false);
  const checkNameTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // 유저네임 중복 체크
  const checkNameAvailability = async (name: string) => {
    if (!name.trim() || name === profile?.name) {
      setIsNameAvailable(null);
      return;
    }

    setIsCheckingName(true);
    try {
      const response = await api.get(
        `/users/check-name/${encodeURIComponent(name)}`,
      );
      setIsNameAvailable(response.data.available);
    } catch (error) {
      console.error("Failed to check name:", error);
      setIsNameAvailable(null);
    } finally {
      setIsCheckingName(false);
    }
  };

  // 유저네임 변경 핸들러 (디바운스 적용)
  const handleNameChange = (value: string) => {
    setNewName(value);
    setIsNameAvailable(null);

    if (checkNameTimeoutRef.current) {
      clearTimeout(checkNameTimeoutRef.current);
    }

    if (value.trim() && value !== profile?.name) {
      checkNameTimeoutRef.current = setTimeout(() => {
        checkNameAvailability(value);
      }, 500);
    }
  };

  // 유저네임 저장
  const handleSaveName = async () => {
    if (!isNameAvailable || !newName.trim()) return;

    setIsSavingName(true);
    try {
      const response = await api.patch("/users/me/name", {
        name: newName.trim(),
      });
      setProfile(response.data);

      // user store도 업데이트
      if (user) {
        setUser({
          ...user,
          name: response.data.name,
        });
      }

      toast.success("이름이 변경되었습니다.");
      setShowNameDialog(false);
    } catch (error) {
      console.error("Failed to update name:", error);
      toast.error("이름 변경에 실패했습니다.");
    } finally {
      setIsSavingName(false);
    }
  };

  // 다이얼로그 열기
  const openNameDialog = () => {
    setNewName(profile?.name || "");
    setIsNameAvailable(null);
    setShowNameDialog(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("JPG, PNG, GIF, WEBP 형식의 이미지만 업로드 가능합니다.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("파일 크기는 5MB 이하만 업로드 가능합니다.");
      return;
    }

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("/users/me/profile-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setProfile(response.data);

      // user store도 업데이트
      if (user) {
        setUser({
          ...user,
          profileImage: response.data.profileImage,
        });
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
      alert("이미지 업로드에 실패했습니다.");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                  {getImageUrl(profile.profileImage) ? (
                    <img
                      src={getImageUrl(profile.profileImage)!}
                      alt="프로필 이미지"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-blue-600" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="absolute bottom-0 right-0 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isUploadingImage ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl">
                    {profile.name || profile.email.split("@")[0]}
                  </CardTitle>
                  <button
                    type="button"
                    onClick={openNameDialog}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="이름 수정"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
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

        {/* 유저네임 수정 다이얼로그 */}
        <FormDialog
          open={showNameDialog}
          onOpenChange={setShowNameDialog}
          title="이름 변경"
          description="새로운 이름을 입력하세요. 중복 확인 후 저장할 수 있습니다."
          submitLabel="저장"
          onSubmit={handleSaveName}
          isLoading={isSavingName}
        >
          <div className="space-y-3">
            <div className="relative">
              <Input
                value={newName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="새 이름 입력"
                className="pr-10"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isCheckingName && (
                  <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                )}
                {!isCheckingName && isNameAvailable === true && (
                  <Check className="w-4 h-4 text-green-500" />
                )}
                {!isCheckingName && isNameAvailable === false && (
                  <X className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>
            {isNameAvailable === false && (
              <p className="text-sm text-red-500">이미 사용 중인 이름입니다.</p>
            )}
            {isNameAvailable === true && (
              <p className="text-sm text-green-500">사용 가능한 이름입니다.</p>
            )}
            {newName === profile?.name && newName && (
              <p className="text-sm text-gray-500">
                현재 사용 중인 이름입니다.
              </p>
            )}
          </div>
        </FormDialog>
      </div>
    </div>
  );
}
