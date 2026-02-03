"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Loader2, History } from "lucide-react";
import {
  useUserSkillActivities,
  skillActivityTypeConfig,
} from "@/entities/skill";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface SkillActivityListProps {
  userId: number;
}

export function SkillActivityList({ userId }: SkillActivityListProps) {
  const { data: activities, isLoading } = useUserSkillActivities(userId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4" />
          최근 활동
        </CardTitle>
      </CardHeader>
      <CardContent className="max-h-[300px] overflow-auto">
        <div className="space-y-2">
          {activities?.map((activity) => {
            const config = skillActivityTypeConfig[activity.type];
            return (
              <div
                key={activity.id}
                className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50"
              >
                <span className="text-lg">{config.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {activity.skill?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDistanceToNow(new Date(activity.createdAt), {
                      addSuffix: true,
                      locale: ko,
                    })}
                  </p>
                </div>
              </div>
            );
          })}

          {(!activities || activities.length === 0) && (
            <div className="text-center py-4 text-muted-foreground text-sm">
              아직 활동 기록이 없습니다.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
