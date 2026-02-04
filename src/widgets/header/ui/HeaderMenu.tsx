"use client";

import { HeaderMenuItem } from "./HeaderMenuItem";
import { HeaderMenuDropdown } from "./HeaderMenuDropdown";

interface MenuItem {
  label: string;
  href: string;
}

interface DropdownMenuItem {
  label: string;
  basePath: string;
  items: MenuItem[];
}

type MenuEntry = MenuItem | DropdownMenuItem;

interface HeaderMenuProps {
  items?: MenuEntry[];
}

// 드롭다운 메뉴인지 확인
const isDropdownMenu = (item: MenuEntry): item is DropdownMenuItem => {
  return "items" in item && Array.isArray(item.items);
};

// 게시판 서브메뉴
const boardMenuItems: MenuItem[] = [
  { label: "공지사항", href: "/boards/notice" },
  { label: "자유게시판", href: "/boards/free" },
  { label: "Q&A", href: "/boards/qna" },
];

// 일지 서브메뉴
const journalMenuItems: MenuItem[] = [
  { label: "개발 일지", href: "/journals/dev" },
  { label: "학습 일지", href: "/journals/study" },
];

const defaultMenuItems: MenuEntry[] = [
  { label: "업무 관리", href: "/issues" },
  { label: "개인 업무", href: "/tasks" },
  { label: "일지", basePath: "/journals", items: journalMenuItems },
  { label: "채팅 관리", href: "/chats" },
  { label: "아키텍처 관리", href: "/architectures" },
  { label: "디자인 관리", href: "/design-systems" },
  { label: "파일럿 관리", href: "/pilots" },
  { label: "리뷰", href: "/reviews" },
  { label: "DB 관리", href: "/db-admin" },
  { label: "스킬 관리", href: "/skills" },
  { label: "즐찾 관리", href: "/favorites" },
  { label: "노트", href: "/notes" },
  { label: "게시판", basePath: "/boards", items: boardMenuItems },
  { label: "문서 관리", href: "/documents" },
  { label: "사용자 관리", href: "/users" },
  { label: "전체 채팅", href: "/global-chat" },
];

export const HeaderMenu = ({ items = defaultMenuItems }: HeaderMenuProps) => {
  return (
    <nav
      className="flex items-center gap-6"
      role="navigation"
      aria-label="메인 메뉴"
    >
      {items.map((item) =>
        isDropdownMenu(item) ? (
          <HeaderMenuDropdown
            key={item.basePath}
            label={item.label}
            items={item.items}
            basePath={item.basePath}
          />
        ) : (
          <HeaderMenuItem key={item.href} label={item.label} href={item.href} />
        ),
      )}
    </nav>
  );
};
