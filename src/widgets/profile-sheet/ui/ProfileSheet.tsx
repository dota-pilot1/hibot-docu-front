"use client";

import { useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { User, FileText, Star } from "lucide-react";
import { ProfileTab } from "./ProfileTab";
import { MemoTab } from "./MemoTab";
import { FavoritesTab } from "./FavoritesTab";
import {
  useProfileSheetStore,
  profileSheetActions,
} from "../model/profileSheetStore";
import { useUserStore } from "@/entities/user/model/store";

interface ProfileSheetProps {
  children: React.ReactNode;
}

export const ProfileSheet = ({ children }: ProfileSheetProps) => {
  const open = useProfileSheetStore((s) => s.isOpen);
  const user = useUserStore((s) => s.user);

  // Ctrl+P 단축키 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 로그인 상태에서만 동작
      if (!user) return;

      // input, textarea 등에서는 동작하지 않음
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // Ctrl+P (Windows) 또는 Cmd+P (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
        profileSheetActions.toggle();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [user]);

  return (
    <Sheet open={open} onOpenChange={profileSheetActions.setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side="right"
        className="w-96 p-0 [&>button]:hidden"
        // 배경 흐림 제거를 위해 overlay 스타일 오버라이드
        style={{ "--sheet-overlay-bg": "transparent" } as React.CSSProperties}
      >
        <SheetHeader className="px-4 py-3 border-b">
          <SheetTitle>내 정보</SheetTitle>
        </SheetHeader>

        <Tabs
          defaultValue="profile"
          className="flex flex-col h-[calc(100%-57px)]"
        >
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-4 h-10">
            <TabsTrigger
              value="profile"
              className="gap-1.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              <User className="h-4 w-4" />
              프로필
            </TabsTrigger>
            <TabsTrigger
              value="memo"
              className="gap-1.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              <FileText className="h-4 w-4" />
              메모
            </TabsTrigger>
            <TabsTrigger
              value="favorites"
              className="gap-1.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              <Star className="h-4 w-4" />
              즐찾
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="flex-1 m-0 overflow-y-auto">
            <ProfileTab onClose={profileSheetActions.close} />
          </TabsContent>
          <TabsContent value="memo" className="flex-1 m-0 overflow-y-auto">
            <MemoTab />
          </TabsContent>
          <TabsContent value="favorites" className="flex-1 m-0 overflow-y-auto">
            <FavoritesTab onClose={profileSheetActions.close} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};
