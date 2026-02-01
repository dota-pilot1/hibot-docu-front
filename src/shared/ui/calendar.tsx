"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { ko } from "date-fns/locale";

import { cn } from "@/shared/lib/utils";

import "react-day-picker/style.css";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, ...props }: CalendarProps) {
  return <DayPicker locale={ko} className={cn("p-3", className)} {...props} />;
}
Calendar.displayName = "Calendar";

export { Calendar };
