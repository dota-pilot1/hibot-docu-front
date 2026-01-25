"use client";

import { useUserStore } from "@/entities/user/model/store";
import { Button } from "@/shared/ui/button";
import { User } from "lucide-react";

export const UserMenu = () => {
    const { user, logout } = useUserStore((state) => ({
        user: state.user,
        logout: state.logout,
    }));

    if (!user) return null;

    return (
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    <User className="w-4 h-4 text-zinc-500" />
                </div>
                <span className="hidden sm:inline-block truncate max-w-[150px]">{user.email}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={logout} className="h-8 text-xs">
                Logout
            </Button>
        </div>
    );
};
