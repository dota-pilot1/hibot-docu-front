"use client";

import Image from "next/image";
import { Button } from "@/shared/ui/button";
import { useUserStore, userStore } from "@/entities/user/model/store";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="flex flex-col items-center gap-8">
        <div className="relative w-[500px] h-[500px] overflow-hidden rounded-2xl shadow-2xl">
          <Image
            src="/hibot-d-image.jpg"
            alt="HiBot Communication"
            fill
            className="object-cover"
            priority
          />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          하이봇 커뮤니케이션
        </h1>
      </div>
    </div>
  );
}

