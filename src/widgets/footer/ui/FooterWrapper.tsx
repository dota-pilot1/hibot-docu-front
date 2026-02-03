"use client";

import { FooterCard } from "./FooterCard";
import { useFooterStatusCounts } from "../model/useFooterStatusCounts";
import { useTaskNotifications } from "../model/useTaskNotifications";

export const FooterWrapper = () => {
  const statusCounts = useFooterStatusCounts();
  const {
    notifications,
    hasNewNotifications,
    clearNewNotifications,
    isConnected,
  } = useTaskNotifications();

  return (
    <FooterCard
      statusCounts={statusCounts}
      notifications={notifications}
      hasNewNotifications={hasNewNotifications}
      onClearNewNotifications={clearNewNotifications}
      isWebSocketConnected={isConnected}
    />
  );
};
