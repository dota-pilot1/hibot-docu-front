"use client";

import { useUserStore } from "@/entities/user/model/store";
import {
  FileText,
  Users,
  MessageSquare,
  FolderKanban,
  StickyNote,
  LayoutGrid,
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
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl text-center">
          <h1 className="text-4xl font-bold mb-4">
            HiBot <span className="text-primary">Docu</span>
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
            팀 업무 관리와 문서 협업을 위한 통합 플랫폼
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="업무 관리"
              description="팀원별 Task 추적"
            />
            <FeatureCard
              icon={<FolderKanban className="h-6 w-6" />}
              title="아키텍처"
              description="프로젝트 구조 관리"
            />
            <FeatureCard
              icon={<FileText className="h-6 w-6" />}
              title="문서 관리"
              description="팀 문서 협업"
            />
            <FeatureCard
              icon={<MessageSquare className="h-6 w-6" />}
              title="채팅"
              description="실시간 커뮤니케이션"
            />
            <FeatureCard
              icon={<StickyNote className="h-6 w-6" />}
              title="노트"
              description="개인 메모 관리"
            />
            <FeatureCard
              icon={<LayoutGrid className="h-6 w-6" />}
              title="게시판"
              description="공지 및 자료 공유"
            />
          </div>

          <p className="text-sm text-zinc-500">
            우측 상단에서 로그인하여 시작하세요
          </p>
        </div>
      </div>
    );
  }

  // 로그인 후 화면
  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">
          안녕하세요, {user.email.split("@")[0]}님
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mb-8">
          오늘도 좋은 하루 되세요
        </p>

        <h2 className="text-lg font-semibold mb-4">바로가기</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <QuickLinkCard
            href="/tasks"
            icon={<Users className="h-6 w-6" />}
            title="업무 관리"
            description="팀원 Task 확인"
          />
          <QuickLinkCard
            href="/architectures"
            icon={<FolderKanban className="h-6 w-6" />}
            title="아키텍처 관리"
            description="프로젝트 구조"
          />
          <QuickLinkCard
            href="/documents"
            icon={<FileText className="h-6 w-6" />}
            title="문서 관리"
            description="팀 문서"
          />
          <QuickLinkCard
            href="/chats"
            icon={<MessageSquare className="h-6 w-6" />}
            title="채팅 관리"
            description="메시지"
          />
          <QuickLinkCard
            href="/notes"
            icon={<StickyNote className="h-6 w-6" />}
            title="노트"
            description="개인 메모"
          />
          <QuickLinkCard
            href="/posts"
            icon={<LayoutGrid className="h-6 w-6" />}
            title="게시판"
            description="공지사항"
          />
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
    <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800">
      <div className="text-primary mb-2">{icon}</div>
      <h3 className="font-medium text-sm">{title}</h3>
      <p className="text-xs text-zinc-500">{description}</p>
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
      className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-primary hover:shadow-sm transition-all"
    >
      <div className="text-primary mb-2">{icon}</div>
      <h3 className="font-medium text-sm">{title}</h3>
      <p className="text-xs text-zinc-500">{description}</p>
    </Link>
  );
}
