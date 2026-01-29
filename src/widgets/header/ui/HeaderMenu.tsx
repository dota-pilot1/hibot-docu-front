"use client";

import { HeaderMenuItem } from "./HeaderMenuItem";

interface MenuItem {
  label: string;
  href: string;
}

interface HeaderMenuProps {
  items: MenuItem[];
}

const defaultMenuItems: MenuItem[] = [
  { label: "프로젝트 관리", href: "/projects" },
  { label: "게시판", href: "/posts" },
  { label: "사용자", href: "/users" },
];

export const HeaderMenu = ({ items = defaultMenuItems }: HeaderMenuProps) => {
  return (
    <nav className="flex items-center gap-8" role="navigation" aria-label="메인 메뉴">
      {items.map((item) => (
        <HeaderMenuItem key={item.href} label={item.label} href={item.href} />
      ))}
    </nav>
  );
};
