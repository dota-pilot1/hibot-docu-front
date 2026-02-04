"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Checkbox } from "@/shared/ui/checkbox";
import { AlertDialog } from "@/shared/ui/dialogs/AlertDialog";
import { useHeaderAuth } from "../model/useHeaderAuth";
import { useUserStore } from "@/entities/user/model/store";
import { useHeaderStore, headerStore } from "../model/useHeaderStore";

export const HeaderLoginForm = () => {
  const { form, onSubmit, isLoading, error } = useHeaderAuth();
  const loginFocusTrigger = useUserStore((state) => state.loginFocusTrigger);
  const rememberCredentials = useHeaderStore(
    (state) => state.rememberCredentials,
  );
  const savedEmail = useHeaderStore((state) => state.savedEmail);
  const savedPassword = useHeaderStore((state) => state.savedPassword);
  const emailRef = useRef<HTMLInputElement>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // 저장된 자격 증명 로드
  useEffect(() => {
    if (!initialized && rememberCredentials && savedEmail) {
      form.setValue("email", savedEmail);
      form.setValue("password", savedPassword);
      setInitialized(true);
    }
  }, [initialized, rememberCredentials, savedEmail, savedPassword, form]);

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

  const handleRememberChange = (checked: boolean) => {
    headerStore.state.setRememberCredentials(checked);
    if (checked) {
      const email = form.getValues("email");
      const password = form.getValues("password");
      headerStore.state.saveCredentials(email, password);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    // 로그인 전에 저장하기 옵션이 켜져 있으면 저장
    if (rememberCredentials) {
      const email = form.getValues("email");
      const password = form.getValues("password");
      headerStore.state.saveCredentials(email, password);
    }
    onSubmit(e);
  };

  const { ref: formRef, ...emailRegister } = form.register("email");

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="flex flex-col relative">
        <Input
          {...emailRegister}
          ref={(e) => {
            formRef(e);
            // @ts-ignore - combining refs
            emailRef.current = e;
          }}
          placeholder="이메일"
          type="email"
          className="h-8 w-40 text-xs"
          disabled={isLoading}
          autoComplete="new-email"
        />
      </div>
      <div className="flex flex-col relative">
        <Input
          {...form.register("password")}
          placeholder="비밀번호"
          type={showPassword ? "text" : "password"}
          className="h-8 w-40 text-xs pr-7"
          disabled={isLoading}
          autoComplete="new-password"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
      <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer select-none whitespace-nowrap">
        <Checkbox
          checked={rememberCredentials}
          onCheckedChange={handleRememberChange}
          className="cursor-pointer"
        />
        저장
      </label>
      <Button
        type="submit"
        size="sm"
        className="h-8 px-3 text-xs"
        disabled={isLoading}
      >
        {isLoading ? "..." : "로그인"}
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
