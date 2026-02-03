"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface SubMenuItem {
  label: string;
  href: string;
}

interface HeaderMenuDropdownProps {
  label: string;
  items: SubMenuItem[];
  basePath?: string;
}

export const HeaderMenuDropdown = ({
  label,
  items,
  basePath,
}: HeaderMenuDropdownProps) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // basePath가 있으면 그걸로 active 체크, 없으면 items의 href들로 체크
  const isActive = basePath
    ? pathname.startsWith(basePath)
    : items.some(
        (item) =>
          pathname === item.href || pathname.startsWith(`${item.href}/`),
      );

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-1
          text-[15px] font-semibold
          transition-all duration-150
          outline-none

          ${isActive ? "text-primary" : "text-gray-600 dark:text-gray-400"}

          hover:text-primary

          focus-visible:text-primary
          focus-visible:ring-2
          focus-visible:ring-primary/30
          focus-visible:ring-offset-2
          focus-visible:rounded-sm

          active:scale-95
          active:opacity-80
        `}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {label}
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />

        {isActive && (
          <span
            className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
            aria-hidden="true"
          />
        )}
      </button>

      {isOpen && (
        <div
          className="
            absolute top-full left-0 mt-4
            min-w-[160px]
            bg-white dark:bg-gray-800
            border border-gray-200 dark:border-gray-700
            rounded-lg shadow-lg
            py-1
            z-50
          "
          role="menu"
        >
          {items.map((item) => {
            const isItemActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  block px-4 py-2
                  text-sm font-medium
                  transition-colors duration-150

                  ${
                    isItemActive
                      ? "text-primary bg-primary/5"
                      : "text-gray-700 dark:text-gray-300"
                  }

                  hover:bg-gray-100 dark:hover:bg-gray-700
                  hover:text-primary
                `}
                role="menuitem"
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
