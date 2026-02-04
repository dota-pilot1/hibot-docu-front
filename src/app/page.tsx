"use client";

import { useUserStore } from "@/entities/user/model/store";
import {
  FileText,
  Users,
  MessageSquare,
  FolderKanban,
  StickyNote,
  Palette,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const user = useUserStore((state) => state.user);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // 로그인 전 화면
  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-6xl w-full">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              HiBot Docu
            </h1>
            <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              팀 업무 관리와 문서 협업을 위한 통합 플랫폼
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="업무 관리"
              description="팀원별 Task를 효율적으로 추적하고 관리하세요"
            />
            <FeatureCard
              icon={<FolderKanban className="h-8 w-8" />}
              title="아키텍처"
              description="프로젝트 구조와 기술 스택을 체계적으로 관리"
            />
            <FeatureCard
              icon={<Palette className="h-8 w-8" />}
              title="디자인 시스템"
              description="UI/UX 디자인 가이드와 컴포넌트 관리"
            />
            <FeatureCard
              icon={<FileText className="h-8 w-8" />}
              title="문서 관리"
              description="실시간 협업과 버전 관리로 팀 문서를 체계화"
            />
            <FeatureCard
              icon={<MessageSquare className="h-8 w-8" />}
              title="채팅"
              description="프로젝트별 실시간 커뮤니케이션 공간"
            />
            <FeatureCard
              icon={<StickyNote className="h-8 w-8" />}
              title="노트"
              description="개인 메모와 아이디어를 자유롭게 기록"
            />
          </div>

          <div className="text-center">
            <p className="text-sm text-zinc-500 bg-white dark:bg-zinc-900 inline-block px-6 py-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
              우측 상단에서 로그인하여 시작하세요 →
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 로그인 후 화면
  return (
    <div className="flex-1 p-8 bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-3xl font-bold mb-2 text-zinc-900 dark:text-zinc-100">
            안녕하세요, {user.name || user.email.split("@")[0]}님 👋
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            오늘도 생산적인 하루 되세요
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-6 text-zinc-900 dark:text-zinc-100">
            바로가기
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <QuickLinkCard
              href="/tasks"
              icon={<Users className="h-10 w-10" />}
              title="업무 관리"
              description="팀원별 Task 확인 및 관리"
            />
            <QuickLinkCard
              href="/architectures"
              icon={<FolderKanban className="h-10 w-10" />}
              title="아키텍처 관리"
              description="프로젝트 구조 설계"
            />
            <QuickLinkCard
              href="/design-systems"
              icon={<Palette className="h-10 w-10" />}
              title="디자인 관리"
              description="디자인 시스템 문서화"
            />
            <QuickLinkCard
              href="/documents"
              icon={<FileText className="h-10 w-10" />}
              title="문서 관리"
              description="팀 문서 협업"
            />
            <QuickLinkCard
              href="/chats"
              icon={<MessageSquare className="h-10 w-10" />}
              title="채팅 관리"
              description="실시간 소통"
            />
            <QuickLinkCard
              href="/notes"
              icon={<StickyNote className="h-10 w-10" />}
              title="노트"
              description="개인 메모 작성"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:shadow-md transition-shadow">
      <div className="mb-4 text-zinc-700 dark:text-zinc-300">{icon}</div>
      <h3 className="font-semibold text-lg mb-2 text-zinc-900 dark:text-zinc-100">
        {title}
      </h3>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function QuickLinkCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg transition-all duration-200 relative"
    >
      <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400">
        <ArrowRight className="h-5 w-5" />
      </div>
      <div className="mb-4 text-zinc-700 dark:text-zinc-300">{icon}</div>
      <h3 className="font-semibold text-lg mb-2 text-zinc-900 dark:text-zinc-100">
        {title}
      </h3>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
    </Link>
  );
}
