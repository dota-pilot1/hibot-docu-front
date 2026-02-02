"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useUserStore, userStore } from "@/entities/user/model/store";
import { FavoriteMatrix } from "@/features/favorite-management/ui/FavoriteMatrix";
import { FavoriteDetailView } from "@/features/favorite-management/ui/FavoriteDetailView";

function FavoritesContent() {
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
      {category ? <FavoriteDetailView /> : <FavoriteMatrix />}
    </div>
  );
}

export default function FavoritesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FavoritesContent />
    </Suspense>
  );
}
