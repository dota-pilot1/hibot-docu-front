"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { api } from "@/shared/api";
import { userStore } from "@/entities/user/model/store";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const registerSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Confirm Password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

interface PasswordRequirement {
  label: string;
  met: boolean;
}

export const RegisterForm = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [confirmPasswordValue, setConfirmPasswordValue] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  useEffect(() => {
    setPasswordValue(password || "");
  }, [password]);

  useEffect(() => {
    setConfirmPasswordValue(confirmPassword || "");
  }, [confirmPassword]);

  const passwordRequirements: PasswordRequirement[] = [
    {
      label: "최소 6자 이상",
      met: passwordValue.length >= 6,
    },
    {
      label: "비밀번호 일치",
      met:
        passwordValue.length > 0 &&
        confirmPasswordValue.length > 0 &&
        passwordValue === confirmPasswordValue,
    },
  ];

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.post("/auth/register", {
        email: data.email,
        password: data.password,
      });

      // After registration, redirect to home and trigger login focus
      userStore.state.triggerLoginFocus();
      router.push("/");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full border-border">
      <CardHeader className="space-y-1 pb-3 pt-5">
        <CardTitle className="text-xl font-bold">워크스페이스 만들기</CardTitle>
        <CardDescription className="text-xs">
          무료로 시작하세요. 신용카드 필요 없습니다.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-2.5">
          {/* Email Field */}
          <div className="space-y-1">
            <Label htmlFor="email" className="text-xs font-medium">
              이메일
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="이메일을 입력하세요"
              className={errors.email ? "border-destructive" : ""}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <X className="w-3 h-3" />
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <Label htmlFor="password" className="text-xs font-medium">
              비밀번호
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="비밀번호를 입력하세요"
                className={`pr-10 ${errors.password ? "border-destructive" : ""}`}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <X className="w-3 h-3" />
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-1">
            <Label htmlFor="confirmPassword" className="text-xs font-medium">
              비밀번호 확인
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="비밀번호를 다시 입력하세요"
                className={`pr-10 ${errors.confirmPassword ? "border-destructive" : ""}`}
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <X className="w-3 h-3" />
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Password Requirements - Real-time validation */}
          {passwordValue.length > 0 && (
            <div className="bg-muted rounded-md p-2.5 space-y-1.5">
              <p className="text-xs font-semibold text-foreground">
                비밀번호 요구사항
              </p>
              {passwordRequirements.map((req, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 text-xs ${
                    req.met
                      ? "text-green-600 dark:text-green-500"
                      : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${
                      req.met
                        ? "bg-green-600 dark:bg-green-500"
                        : "bg-muted-foreground/20"
                    }`}
                  >
                    {req.met && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span>{req.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-2">
              <p className="text-xs text-destructive flex items-start gap-2">
                <X className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                {error}
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2.5 pt-1 pb-5">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "계정 생성 중..." : "시작하기"}
          </Button>

          <div className="text-center text-xs text-muted-foreground">
            이미 계정이 있으신가요?{" "}
            <a href="/" className="font-medium text-primary hover:underline">
              로그인하기
            </a>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};
