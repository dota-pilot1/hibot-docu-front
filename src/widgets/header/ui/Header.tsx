"use client";

import Link from "next/link";
import { useUserStore } from "@/entities/user/model/store";
import { HeaderLoginForm } from "./HeaderLoginForm";
import { UserMenu } from "./UserMenu";
import { useEffect, useState } from "react";

export const Header = () => {
  const user = useUserStore((state) => state.user);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 h-16">
      <div className="w-full mx-auto px-4 h-full flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight shrink-0">
          HiBot <span className="text-primary">Docu</span>
        </Link>

        {/* Center Navigation */}
        <nav className="flex items-center gap-8 ml-8">
          {mounted && user && (
            <>
              <Link
                href="/projects"
                className="text-[15px] font-semibold text-gray-600 hover:text-primary transition-colors"
              >
                프로젝트 관리
              </Link>
              <Link
                href="/posts"
                className="text-[15px] font-semibold text-gray-600 hover:text-primary transition-colors"
              >
                게시판
              </Link>
              <Link
                href="/users"
                className="text-[15px] font-semibold text-gray-600 hover:text-primary transition-colors"
              >
                사용자
              </Link>
            </>
          )}
        </nav>

        {/* Right Side - User Menu or Login */}
        <div className="flex items-center gap-4">
          {mounted && (user ? <UserMenu /> : <HeaderLoginForm />)}
        </div>
      </div>
    </header>
  );
};
