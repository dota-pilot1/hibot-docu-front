"use client";

import { useUserStore } from "@/entities/user/model/store";
import {
  FileText,
  Users,
  MessageSquare,
  FolderKanban,
  StickyNote,
  LayoutGrid,
  Briefcase,
  Palette,
  ArrowRight,
  Sparkles,
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
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800">
        <div className="max-w-6xl w-full">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="h-8 w-8 text-blue-600" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                HiBot Docu
              </h1>
            </div>
            <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              팀 업무 관리와 문서 협업을 위한 통합 플랫폼
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="업무 관리"
              description="팀원별 Task를 효율적으로 추적하고 관리하세요"
              color="blue"
            />
            <FeatureCard
              icon={<FolderKanban className="h-8 w-8" />}
              title="아키텍처"
              description="프로젝트 구조와 기술 스택을 체계적으로 관리"
              color="purple"
            />
            <FeatureCard
              icon={<Palette className="h-8 w-8" />}
              title="디자인 시스템"
              description="UI/UX 디자인 가이드와 컴포넌트 관리"
              color="pink"
            />
            <FeatureCard
              icon={<FileText className="h-8 w-8" />}
              title="문서 관리"
              description="실시간 협업과 버전 관리로 팀 문서를 체계화"
              color="green"
            />
            <FeatureCard
              icon={<MessageSquare className="h-8 w-8" />}
              title="채팅"
              description="프로젝트별 실시간 커뮤니케이션 공간"
              color="orange"
            />
            <FeatureCard
              icon={<StickyNote className="h-8 w-8" />}
              title="노트"
              description="개인 메모와 아이디어를 자유롭게 기록"
              color="yellow"
            />
          </div>

          <div className="text-center">
            <p className="text-sm text-zinc-500 bg-white dark:bg-zinc-800/50 inline-block px-6 py-3 rounded-full border border-zinc-200 dark:border-zinc-700">
              우측 상단에서 로그인하여 시작하세요 →
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 로그인 후 화면
  return (
    <div className="flex-1 p-8 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            안녕하세요, {user.name || user.email.split("@")[0]}님 👋
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            오늘도 생산적인 하루 되세요
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            바로가기
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <QuickLinkCard
              href="/tasks"
              icon={<Users className="h-10 w-10" />}
              title="업무 관리"
              description="팀원별 Task 확인 및 관리"
              color="blue"
            />
            <QuickLinkCard
              href="/architectures"
              icon={<FolderKanban className="h-10 w-10" />}
              title="아키텍처 관리"
              description="프로젝트 구조 설계"
              color="purple"
            />
            <QuickLinkCard
              href="/design-systems"
              icon={<Palette className="h-10 w-10" />}
              title="디자인 관리"
              description="디자인 시스템 문서화"
              color="pink"
            />
            <QuickLinkCard
              href="/documents"
              icon={<FileText className="h-10 w-10" />}
              title="문서 관리"
              description="팀 문서 협업"
              color="green"
            />
            <QuickLinkCard
              href="/chats"
              icon={<MessageSquare className="h-10 w-10" />}
              title="채팅 관리"
              description="실시간 소통"
              color="orange"
            />
            <QuickLinkCard
              href="/notes"
              icon={<StickyNote className="h-10 w-10" />}
              title="노트"
              description="개인 메모 작성"
              color="yellow"
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
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  const colorClasses = {
    blue: "from-blue-500/10 to-blue-600/10 border-blue-200 dark:border-blue-900 text-blue-600",
    purple:
      "from-purple-500/10 to-purple-600/10 border-purple-200 dark:border-purple-900 text-purple-600",
    pink: "from-pink-500/10 to-pink-600/10 border-pink-200 dark:border-pink-900 text-pink-600",
    green:
      "from-green-500/10 to-green-600/10 border-green-200 dark:border-green-900 text-green-600",
    orange:
      "from-orange-500/10 to-orange-600/10 border-orange-200 dark:border-orange-900 text-orange-600",
    yellow:
      "from-yellow-500/10 to-yellow-600/10 border-yellow-200 dark:border-yellow-900 text-yellow-600",
  };

  return (
    <div
      className={`p-6 rounded-2xl border bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} backdrop-blur-sm shadow-sm hover:shadow-md transition-all`}
    >
      <div className="mb-4">{icon}</div>
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
  color,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  const colorClasses = {
    blue: "from-blue-500/10 to-blue-600/10 border-blue-200 dark:border-blue-900/50 hover:border-blue-400 text-blue-600 hover:shadow-blue-200/50",
    purple:
      "from-purple-500/10 to-purple-600/10 border-purple-200 dark:border-purple-900/50 hover:border-purple-400 text-purple-600 hover:shadow-purple-200/50",
    pink: "from-pink-500/10 to-pink-600/10 border-pink-200 dark:border-pink-900/50 hover:border-pink-400 text-pink-600 hover:shadow-pink-200/50",
    green:
      "from-green-500/10 to-green-600/10 border-green-200 dark:border-green-900/50 hover:border-green-400 text-green-600 hover:shadow-green-200/50",
    orange:
      "from-orange-500/10 to-orange-600/10 border-orange-200 dark:border-orange-900/50 hover:border-orange-400 text-orange-600 hover:shadow-orange-200/50",
    yellow:
      "from-yellow-500/10 to-yellow-600/10 border-yellow-200 dark:border-yellow-900/50 hover:border-yellow-400 text-yellow-600 hover:shadow-yellow-200/50",
  };

  return (
    <Link
      href={href}
      className={`group p-6 rounded-2xl border bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} backdrop-blur-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden`}
    >
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowRight className="h-5 w-5" />
      </div>
      <div className="mb-4">{icon}</div>
      <h3 className="font-semibold text-lg mb-2 text-zinc-900 dark:text-zinc-100">
        {title}
      </h3>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
    </Link>
  );
}
