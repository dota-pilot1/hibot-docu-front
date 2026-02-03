"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function JournalsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/journals/dev");
  }, [router]);

  return null;
}
