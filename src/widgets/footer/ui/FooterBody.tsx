"use client";

interface FooterBodyProps {
  isExpanded: boolean;
}

export const FooterBody = ({ isExpanded }: FooterBodyProps) => {
  if (!isExpanded) return null;

  return (
    <div
      className="overflow-y-auto bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800 transition-all duration-300"
      style={{ height: isExpanded ? "25vh" : "0" }}
    >
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center text-zinc-500 dark:text-zinc-400">
          <p className="text-sm">📌 최근 업데이트 내역이 여기 표시됩니다.</p>
          <p className="text-xs mt-2 text-zinc-400 dark:text-zinc-500">
            (2차에서 구현 예정)
          </p>
        </div>
      </div>
    </div>
  );
};
