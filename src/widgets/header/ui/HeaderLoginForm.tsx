"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { AlertDialog } from "@/shared/ui/dialogs/AlertDialog";
import { useHeaderAuth } from "../model/useHeaderAuth";
import { useUserStore } from "@/entities/user/model/store";

export const HeaderLoginForm = () => {
  const { form, onSubmit, isLoading, error } = useHeaderAuth();
  const loginFocusTrigger = useUserStore((state) => state.loginFocusTrigger);
  const emailRef = useRef<HTMLInputElement>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  // Effect to focus email input when triggered
  useEffect(() => {
    if (loginFocusTrigger > 0) {
      emailRef.current?.focus();
    }
  }, [loginFocusTrigger]);

  // Show error dialog when login fails
  useEffect(() => {
    if (error) {
      setShowErrorDialog(true);
    }
  }, [error]);

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
      <Button
        type="submit"
        size="sm"
        className="h-8 px-3 text-xs"
        disabled={isLoading}
      >
        {isLoading ? "..." : "Login"}
      </Button>
      <Link href="/register">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 px-3 text-xs"
        >
          회원가입
        </Button>
      </Link>
      <AlertDialog
        open={showErrorDialog}
        onOpenChange={setShowErrorDialog}
        title="로그인 실패"
        description="이메일 또는 비밀번호가 올바르지 않습니다."
        variant="destructive"
      />
    </form>
  );
};
