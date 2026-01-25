"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useHeaderAuth } from "../model/useHeaderAuth";
import { useUserStore } from "@/entities/user/model/store";

export const HeaderLoginForm = () => {
    const { form, onSubmit, isLoading, error } = useHeaderAuth();
    const loginFocusTrigger = useUserStore((state) => state.loginFocusTrigger);
    const emailRef = useRef<HTMLInputElement>(null);

    // Effect to focus email input when triggered
    useEffect(() => {
        if (loginFocusTrigger > 0) {
            emailRef.current?.focus();
        }
    }, [loginFocusTrigger]);

    const { ref: formRef, ...emailRegister } = form.register("email");

    return (
        <form onSubmit={onSubmit} className="flex items-center gap-2">
            <div className="flex flex-col relative">
                <Input
                    {...emailRegister}
                    ref={(e) => {
                        formRef(e);
                        // @ts-ignore - combining refs
                        emailRef.current = e;
                    }}
                    placeholder="Email"
                    type="email"
                    className="h-8 w-40 text-xs"
                    disabled={isLoading}
                />
            </div>
            <div className="flex flex-col relative">
                <Input
                    {...form.register("password")}
                    placeholder="Password"
                    type="password"
                    className="h-8 w-32 text-xs"
                    disabled={isLoading}
                />
            </div>
            <Button type="submit" size="sm" className="h-8 px-3 text-xs" disabled={isLoading}>
                {isLoading ? "..." : "Login"}
            </Button>
            {error && <span className="text-[10px] text-destructive absolute -bottom-4 right-0 font-medium">!</span>}
        </form>
    );
};

