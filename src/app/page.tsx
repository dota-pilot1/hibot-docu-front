"use client";

import Image from "next/image";
import { Button } from "@/shared/ui/button";
import { useUserStore } from "@/entities/user/model/store";
import Link from "next/link";

export default function Home() {
  const { user } = useUserStore();

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start shadow-sm rounded-xl">
        <Image
          className="dark:invert mb-8"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left mb-12">
          {user ? (
            <>
              <h1 className="max-w-md text-4xl font-bold tracking-tight text-black dark:text-zinc-50">
                Welcome back, <span className="text-primary">{user.email}</span>!
              </h1>
              <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
                You are successfully logged in to HiBot Docu. Start managing your documents with our intelligent assistant.
              </p>
            </>
          ) : (
            <>
              <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
                Welcome to HiBot Docu
              </h1>
              <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
                Manage your documents smarter. Please login or register to get started.
              </p>
            </>
          )}
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          {user ? (
            <>
              <Button size="lg" className="rounded-full px-8">
                Go to Dashboard
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8" asChild>
                <Link href="/users">User List</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild className="rounded-full h-12 px-8">
                <Link href="/login">Login</Link>
              </Button>
              <Button variant="outline" asChild className="rounded-full h-12 px-8">
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
