"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/shared/api";
import { useUserStore, userStore } from "@/entities/user/model/store";
import { useRouter } from "next/navigation";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Required"),
});

export type HeaderLoginFormValues = z.infer<typeof loginSchema>;

export const useHeaderAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setUser = useUserStore((state) => state.setUser);
  const router = useRouter();

  const form = useForm<HeaderLoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: HeaderLoginFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post("/auth/login", data);
      const { access_token } = response.data;
      userStore.state.setAccessToken(access_token);

      const profile = await api.get("/auth/profile");
      setUser({
        userId: profile.data.id,
        email: profile.data.email,
        role: profile.data.role,
        profileImage: profile.data.profileImage,
      });
      router.refresh();
    } catch (err: any) {
      setError("Failed");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isLoading,
    error,
  };
};
