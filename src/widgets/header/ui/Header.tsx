"use client";

import Link from "next/link";
import { useUserStore } from "@/entities/user/model/store";
import { HeaderLoginForm } from "./HeaderLoginForm";
import { HeaderMenu } from "./HeaderMenu";
import { UserMenu } from "./UserMenu";
import { useEffect, useState } from "react";
import { sidebarStore } from "@/widgets/sidebar/model/useSidebarStore";
import { Button } from "@/shared/ui/button";
import { Menu } from "lucide-react";

export const Header = () => {
  const user = useUserStore((state) => state.user);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 h-12">
      <div className="w-full mx-auto px-4 h-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          {mounted && user && (
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-8 w-8"
              onClick={() => sidebarStore.state.toggle()}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <Link href="/" className="text-xl font-bold tracking-tight shrink-0">
            HiBot <span className="text-primary">Docu</span>
          </Link>
        </div>

        {/* Center Navigation */}
        <div className="ml-8">
          {mounted && user && (
            <HeaderMenu
              items={[
                { label: "업무 관리", href: "/tasks" },
                { label: "문서 관리", href: "/documents" },
                { label: "채팅 관리", href: "/chats" },
                { label: "프로젝트 관리", href: "/projects" },
                { label: "노트", href: "/notes" },
                { label: "게시판", href: "/posts" },
                { label: "사용자 관리", href: "/users" },
              ]}
            />
          )}
        </div>

        {/* Right Side - User Menu or Login */}
        <div className="flex items-center gap-4">
          {mounted && (user ? <UserMenu /> : <HeaderLoginForm />)}
        </div>
      </div>
    </header>
  );
};
