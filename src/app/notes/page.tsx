"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserStore, userStore } from "@/entities/user/model/store";
import { NoteDetailView, NoteMatrix } from "@/features/note-management";

function NotesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const user = useUserStore((state) => state.user);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (hasMounted && !user) {
      userStore.state.triggerLoginFocus();
      router.push("/");
    }
  }, [user, router, hasMounted]);

  if (!hasMounted || !user) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="text-center">
          <p className="text-gray-500">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      {category ? <NoteDetailView /> : <NoteMatrix />}
    </div>
  );
}

export default function NotesPage() {
  return (
    <Suspense
      fallback={<div className="container mx-auto py-10 px-4">Loading...</div>}
    >
      <NotesContent />
    </Suspense>
  );
}
