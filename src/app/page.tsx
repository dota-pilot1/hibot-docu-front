"use client";

import {
  FileText,
  CircleDot,
  Download,
  MessageCircle,
  Calendar,
  Palette,
  BookOpen,
  StickyNote,
  CheckSquare,
  GraduationCap,
  Component,
  Rocket,
} from "lucide-react";
import { FeatureCard } from "@/shared/ui/feature-card";

const features = [
  {
    title: "업무 공유",
    description: "프로젝트 진행 상황과 업무 내용을 팀원들과 공유합니다.",
    icon: FileText,
    href: "/posts",
    iconClass: "text-black dark:text-white",
  },
  {
    title: "이슈 관리",
    description: "버그 리포트와 기능 요청을 추적하고 관리합니다.",
    icon: CircleDot,
    href: "#",
    iconClass: "text-green-600",
  },
  {
    title: "개발 일지",
    description: "일일 개발 진행 상황과 작업 내용을 기록합니다.",
    icon: BookOpen,
    href: "#",
    iconClass: "text-indigo-600",
  },
  {
    title: "노트 정리",
    description: "회의록, 아이디어, 참고 자료를 정리합니다.",
    icon: StickyNote,
    href: "#",
    iconClass: "text-yellow-600",
  },
  {
    title: "TODO 관리",
    description: "할 일 목록을 관리하고 진행 상황을 추적합니다.",
    icon: CheckSquare,
    href: "#",
    iconClass: "text-teal-600",
  },
  {
    title: "버전 관리 및 다운로드",
    description: "앱 버전을 관리하고 QR 코드로 다운로드합니다.",
    icon: Download,
    href: "#",
    iconClass: "text-blue-600",
  },
  {
    title: "채팅",
    description: "실시간 메시지로 팀원들과 빠르게 소통합니다.",
    icon: MessageCircle,
    href: "#",
    iconClass: "text-purple-600",
  },
  {
    title: "스케줄링",
    description: "프로젝트 일정과 마일스톤을 관리합니다.",
    icon: Calendar,
    href: "#",
    iconClass: "text-orange-600",
  },
  {
    title: "디자인 시스템",
    description: "UI 컴포넌트와 디자인 가이드라인을 확인합니다.",
    icon: Palette,
    href: "#",
    iconClass: "text-pink-600",
  },
  {
    title: "학습 관리",
    description: "기술 학습 자료와 진행 상황을 관리합니다.",
    icon: GraduationCap,
    href: "#",
    iconClass: "text-red-600",
  },
  {
    title: "공통 컴포넌트",
    description: "재사용 가능한 UI 컴포넌트를 관리합니다.",
    icon: Component,
    href: "#",
    iconClass: "text-cyan-600",
  },
  {
    title: "파일럿 프로젝트",
    description: "신규 기술 검증을 위한 파일럿 프로젝트를 관리합니다.",
    icon: Rocket,
    href: "#",
    iconClass: "text-amber-600",
  },
];

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      {/* Hero Section */}
      <div className="text-center mb-8 md:mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
          HiBot Docu
        </h1>
        <p className="text-center text-muted-foreground  max-w-2xl mx-auto">
          하이봇 팀의 키오스크 개발 프로젝트 협업 공간
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {features.map((feature) => (
          <FeatureCard
            key={feature.title}
            title={feature.title}
            description={feature.description}
            icon={feature.icon}
            href={feature.href}
            iconClass={feature.iconClass}
          />
        ))}
      </div>

      {/* Footer Text */}
    </div>
  );
}
