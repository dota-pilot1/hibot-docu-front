"use client";

import { HeaderMenuItem } from "./HeaderMenuItem";

interface MenuItem {
  label: string;
  href: string;
}

interface HeaderMenuProps {
  items?: MenuItem[];
}

const defaultMenuItems: MenuItem[] = [
  { label: "업무 할당", href: "/issues" },
  { label: "업무 관리", href: "/tasks" },
  { label: "아키텍처 관리", href: "/architectures" },
  { label: "파일럿 관리", href: "/pilots" },
  { label: "문서 관리", href: "/documents" },
  { label: "노트", href: "/notes" },
  { label: "게시판", href: "/posts" },
  { label: "사용자 관리", href: "/users" },
  { label: "히스토리", href: "/history" },
];

export const HeaderMenu = ({ items = defaultMenuItems }: HeaderMenuProps) => {
  return (
    <nav
      className="flex items-center gap-8"
      role="navigation"
      aria-label="메인 메뉴"
    >
      {items.map((item) => (
        <HeaderMenuItem key={item.href} label={item.label} href={item.href} />
      ))}
    </nav>
  );
};
