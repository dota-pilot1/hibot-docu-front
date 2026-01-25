"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useUserStore, userStore } from "@/entities/user/model/store";
import { ProjectMatrix } from "@/features/project-management/ui/ProjectMatrix";
import { ProjectDetailView } from "@/features/project-management/ui/ProjectDetailView";

function ProjectsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const tech = searchParams.get("tech");
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

    // Show loading while checking authentication and during initial mount to prevent hydration mismatch
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
            {tech ? <ProjectDetailView /> : <ProjectMatrix />}
        </div>
    );
}

export default function ProjectsPage() {
    return (
        <Suspense fallback={<div className="container mx-auto py-10 px-4">Loading...</div>}>
            <ProjectsContent />
        </Suspense>
    );
}
