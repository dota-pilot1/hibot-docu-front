"use client";

import { FooterCard } from "./FooterCard";
import { useFooterStatusCounts } from "../model/useFooterStatusCounts";

export const FooterWrapper = () => {
  const statusCounts = useFooterStatusCounts();

  return <FooterCard statusCounts={statusCounts} />;
};
