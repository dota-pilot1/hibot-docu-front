"use client";

import { TabType } from "./FooterCard";
import { TaskNotification } from "../model/useTaskNotifications";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface FooterBodyProps {
  isExpanded: boolean;
  activeTab: TabType;
  notifications: TaskNotification[];
}

export const FooterBody = ({
  isExpanded,
  activeTab,
  notifications,
}: FooterBodyProps) => {
  if (!isExpanded) return null;

  return (
    <div
      className="bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800 transition-all duration-300 overflow-y-auto p-4"
      style={{ height: isExpanded ? "25vh" : "0" }}
    >
      {/* 탭 컨텐츠 */}
      <div className="h-full">
        {activeTab === "notice" && (
          <div className="flex items-center justify-center h-full text-center text-zinc-500 dark:text-zinc-400">
            <div>
              <p className="text-sm">📢 공지사항이 여기 표시됩니다.</p>
              <p className="text-xs mt-2 text-zinc-400 dark:text-zinc-500">
                (추후 구현 예정)
              </p>
            </div>
          </div>
        )}

        {activeTab === "task" && (
          <div className="space-y-2">
            {notifications.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center text-zinc-500 dark:text-zinc-400">
                <div>
                  <p className="text-sm">📌 아직 알림이 없습니다</p>
                  <p className="text-xs mt-2 text-zinc-400 dark:text-zinc-500">
                    업무 상태가 변경되면 여기에 표시됩니다
                  </p>
                </div>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="p-3 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-colors animate-fadeIn"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm text-zinc-700 dark:text-zinc-300">
                        {notif.message}
                      </p>
                    </div>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
                      {formatDistanceToNow(notif.timestamp, {
                        addSuffix: true,
                        locale: ko,
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "favorite" && (
          <div className="flex items-center justify-center h-full text-center text-zinc-500 dark:text-zinc-400">
            <div>
              <p className="text-sm">⭐ 즐겨찾기 항목이 여기 표시됩니다.</p>
              <p className="text-xs mt-2 text-zinc-400 dark:text-zinc-500">
                (추후 구현 예정)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
