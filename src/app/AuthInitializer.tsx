"use client";

import { useEffect, useState } from "react";
import { useUserStore, userStore } from "@/entities/user/model/store";
import { api } from "@/shared/api";

export const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
    const accessToken = useUserStore((state) => state.accessToken);
    const user = useUserStore((state) => state.user);
    const setUser = useUserStore((state) => state.setUser);
    const logout = useUserStore((state) => state.logout);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const initAuth = async () => {
            // Explicitly hydrate on client
            userStore.state.hydrate();

            // Now check after hydration
            const currentAccessToken = userStore.state.accessToken;
            const currentUser = userStore.state.user;

            if (currentAccessToken && !currentUser) {
                try {
                    const response = await api.get("/auth/profile");
                    setUser(response.data);
                } catch (error) {
                    console.error("Failed to restore session", error);
                    logout();
                }
            }
            setIsInitialized(true);
        };

        if (typeof window !== 'undefined') {
            initAuth();
        }
    }, [setUser, logout]);

    // Optional: show a loading state while initializing
    if (!isInitialized && accessToken && !user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return <>{children}</>;
};
