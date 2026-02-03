"use client";

import { Button } from "@/shared/ui/button";
import { useLikeStatus, useToggleLike } from "../model/useLikes";
import { useUserStore } from "@/entities/user/model/store";
import { Heart } from "lucide-react";

interface LikeButtonProps {
  postId: number;
}

export function LikeButton({ postId }: LikeButtonProps) {
  const user = useUserStore((state) => state.user);
  const { data: likeStatus, isLoading } = useLikeStatus(postId);
  const { mutate: toggleLike, isPending } = useToggleLike();

  const handleClick = () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }
    toggleLike(postId);
  };

  if (isLoading) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Heart className="h-4 w-4 mr-1" />
        ...
      </Button>
    );
  }

  return (
    <Button
      variant={likeStatus?.isLiked ? "default" : "outline"}
      size="sm"
      onClick={handleClick}
      disabled={isPending}
      className={likeStatus?.isLiked ? "bg-red-500 hover:bg-red-600 text-white" : ""}
    >
      <Heart
        className={`h-4 w-4 mr-1 ${likeStatus?.isLiked ? "fill-white" : ""}`}
      />
      {likeStatus?.likeCount || 0}
    </Button>
  );
}
