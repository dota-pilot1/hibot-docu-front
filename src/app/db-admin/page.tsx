"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useUserStore, userStore } from "@/entities/user/model/store";
import { DbAdminMatrix } from "@/features/db-admin/ui/DbAdminMatrix";
import { DbAdminDetailView } from "@/features/db-admin/ui/DbAdminDetailView";

function DbAdminContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const project = searchParams.get("project");
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
      {project ? <DbAdminDetailView /> : <DbAdminMatrix />}
    </div>
  );
}

export default function DbAdminPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DbAdminContent />
    </Suspense>
  );
}
