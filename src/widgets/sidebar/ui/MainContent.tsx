"use client";

import { TabHeader } from "./TabHeader";
import { TabContent } from "./TabContent";

interface MainContentProps {
  children?: React.ReactNode;
}

export const MainContent = ({ children }: MainContentProps) => {
  return (
    <div className="flex flex-col h-full">
      <TabHeader />
      <TabContent />
    </div>
  );
};
