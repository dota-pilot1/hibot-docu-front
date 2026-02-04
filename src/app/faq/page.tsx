"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { HelpCircle } from "lucide-react";

export default function FaqPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-6 w-6" />
            FAQ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">FAQ 페이지 준비 중입니다.</p>
        </CardContent>
      </Card>
    </div>
  );
}
