"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface HeaderMenuItemProps {
  label: string;
  href: string;
}

export const HeaderMenuItem = ({ label, href }: HeaderMenuItemProps) => {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`
        relative text-[15px] font-semibold
        transition-all duration-150
        outline-none

        /* Base state */
        ${isActive
          ? "text-primary"
          : "text-gray-600 dark:text-gray-400"
        }

        /* Hover */
        hover:text-primary

        /* Focus visible */
        focus-visible:text-primary
        focus-visible:ring-2
        focus-visible:ring-primary/30
        focus-visible:ring-offset-2
        focus-visible:rounded-sm

        /* Active/Press */
        active:scale-95
        active:opacity-80
      `}
    >
      {label}

      {/* Active indicator */}
      {isActive && (
        <span
          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
          aria-hidden="true"
        />
      )}
    </Link>
  );
};
