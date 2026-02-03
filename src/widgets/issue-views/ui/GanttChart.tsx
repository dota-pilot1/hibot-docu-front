"use client";

import { useMemo, useRef, useState } from "react";
import { Task, TaskStatus, taskStatusConfig } from "@/entities/task";
import { cn } from "@/shared/lib/utils";
import {
  format,
  differenceInDays,
  startOfDay,
  addDays,
  isSameDay,
  isWithinInterval,
  min,
  max,
} from "date-fns";
import { ko } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface GanttChartProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

const STATUS_COLORS: Record<TaskStatus, string> = {
  pending: "bg-yellow-400",
  in_progress: "bg-green-400",
  review: "bg-blue-400",
  blocked: "bg-red-400",
  completed: "bg-gray-400",
};

const CELL_WIDTH = 40; // 일별 셀 너비
const ROW_HEIGHT = 40;
const HEADER_HEIGHT = 60;
const TASK_NAME_WIDTH = 250;

export const GanttChart = ({ tasks, onTaskClick }: GanttChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewOffset, setViewOffset] = useState(0); // 일 단위 오프셋

  // 날짜 범위 계산
  const { startDate, endDate, totalDays } = useMemo(() => {
    const today = startOfDay(new Date());
    const tasksWithDates = tasks.filter(
      (t) => t.startedAt || t.dueDate || t.createdAt
    );

    if (tasksWithDates.length === 0) {
      return {
        startDate: addDays(today, -7),
        endDate: addDays(today, 30),
        totalDays: 37,
      };
    }

    const allDates = tasksWithDates.flatMap((t) => {
      const dates: Date[] = [];
      if (t.startedAt) dates.push(new Date(t.startedAt));
      if (t.dueDate) dates.push(new Date(t.dueDate));
      if (t.createdAt) dates.push(new Date(t.createdAt));
      return dates;
    });

    const minDate = startOfDay(min(allDates));
    const maxDate = startOfDay(max(allDates));

    // 앞뒤로 여유 추가
    const start = addDays(minDate, -7);
    const end = addDays(maxDate, 14);
    const days = differenceInDays(end, start) + 1;

    return { startDate: start, endDate: end, totalDays: days };
  }, [tasks]);

  // 보이는 날짜 범위
  const visibleDays = 30;
  const visibleStartDate = addDays(startDate, viewOffset);
  const dates = Array.from({ length: visibleDays }, (_, i) =>
    addDays(visibleStartDate, i)
  );

  const handlePrev = () => {
    setViewOffset((prev) => Math.max(0, prev - 7));
  };

  const handleNext = () => {
    setViewOffset((prev) => Math.min(totalDays - visibleDays, prev + 7));
  };

  const today = startOfDay(new Date());

  return (
    <div className="flex flex-col h-full">
      {/* 네비게이션 */}
      <div className="flex items-center justify-between p-2 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={viewOffset === 0}
            className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium">
            {format(visibleStartDate, "yyyy년 M월", { locale: ko })}
          </span>
          <button
            onClick={handleNext}
            disabled={viewOffset >= totalDays - visibleDays}
            className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center gap-4 text-xs">
          {Object.entries(taskStatusConfig).map(([status, config]) => (
            <div key={status} className="flex items-center gap-1">
              <div
                className={cn(
                  "w-3 h-3 rounded",
                  STATUS_COLORS[status as TaskStatus]
                )}
              />
              <span>{config.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 차트 영역 */}
      <div ref={containerRef} className="flex-1 overflow-auto">
        <div className="min-w-max">
          {/* 헤더 (날짜) */}
          <div
            className="flex sticky top-0 bg-white dark:bg-zinc-900 z-10 border-b border-zinc-200 dark:border-zinc-700"
            style={{ height: HEADER_HEIGHT }}
          >
            {/* 업무명 컬럼 헤더 */}
            <div
              className="shrink-0 flex items-center px-3 font-medium text-sm border-r border-zinc-200 dark:border-zinc-700 sticky left-0 bg-white dark:bg-zinc-900 z-20"
              style={{ width: TASK_NAME_WIDTH }}
            >
              업무명
            </div>
            {/* 날짜 헤더 */}
            <div className="flex">
              {dates.map((date) => {
                const isToday = isSameDay(date, today);
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                return (
                  <div
                    key={date.toISOString()}
                    className={cn(
                      "flex flex-col items-center justify-center text-xs border-r border-zinc-200 dark:border-zinc-700",
                      isToday && "bg-blue-50 dark:bg-blue-900/20",
                      isWeekend && "bg-zinc-50 dark:bg-zinc-800/50"
                    )}
                    style={{ width: CELL_WIDTH }}
                  >
                    <span className="text-zinc-500">
                      {format(date, "EEE", { locale: ko })}
                    </span>
                    <span
                      className={cn(
                        "font-medium",
                        isToday && "text-blue-600 dark:text-blue-400"
                      )}
                    >
                      {format(date, "d")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 행 (업무별) */}
          {tasks.map((task) => (
            <GanttRow
              key={task.id}
              task={task}
              dates={dates}
              visibleStartDate={visibleStartDate}
              today={today}
              onClick={() => onTaskClick?.(task)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface GanttRowProps {
  task: Task;
  dates: Date[];
  visibleStartDate: Date;
  today: Date;
  onClick?: () => void;
}

const GanttRow = ({
  task,
  dates,
  visibleStartDate,
  today,
  onClick,
}: GanttRowProps) => {
  const taskStart = task.startedAt
    ? startOfDay(new Date(task.startedAt))
    : task.createdAt
      ? startOfDay(new Date(task.createdAt))
      : null;
  const taskEnd = task.dueDate ? startOfDay(new Date(task.dueDate)) : null;

  // 바 위치 계산
  const barStyle = useMemo(() => {
    if (!taskStart) return null;

    const startOffset = differenceInDays(taskStart, visibleStartDate);
    const endOffset = taskEnd
      ? differenceInDays(taskEnd, visibleStartDate)
      : startOffset;

    const left = Math.max(0, startOffset) * CELL_WIDTH;
    const right = Math.min(dates.length - 1, endOffset) * CELL_WIDTH + CELL_WIDTH;
    const width = Math.max(CELL_WIDTH, right - left);

    // 범위 밖이면 표시 안함
    if (startOffset >= dates.length || endOffset < 0) return null;

    return { left, width };
  }, [taskStart, taskEnd, visibleStartDate, dates.length]);

  const isOverdue =
    taskEnd && task.status !== "completed" && taskEnd < today;

  return (
    <div
      className="flex border-b border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
      style={{ height: ROW_HEIGHT }}
    >
      {/* 업무명 */}
      <div
        className="shrink-0 flex items-center px-3 text-sm border-r border-zinc-200 dark:border-zinc-700 sticky left-0 bg-white dark:bg-zinc-900 cursor-pointer hover:text-blue-600"
        style={{ width: TASK_NAME_WIDTH }}
        onClick={onClick}
      >
        <span className="truncate">{task.title}</span>
      </div>

      {/* 타임라인 */}
      <div className="relative flex">
        {/* 그리드 */}
        {dates.map((date) => {
          const isToday = isSameDay(date, today);
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          return (
            <div
              key={date.toISOString()}
              className={cn(
                "border-r border-zinc-200 dark:border-zinc-700",
                isToday && "bg-blue-50 dark:bg-blue-900/20",
                isWeekend && "bg-zinc-50 dark:bg-zinc-800/50"
              )}
              style={{ width: CELL_WIDTH, height: ROW_HEIGHT }}
            />
          );
        })}

        {/* 바 */}
        {barStyle && (
          <div
            className={cn(
              "absolute top-2 h-6 rounded cursor-pointer transition-opacity hover:opacity-80",
              STATUS_COLORS[task.status],
              isOverdue && "ring-2 ring-red-500"
            )}
            style={{ left: barStyle.left, width: barStyle.width }}
            onClick={onClick}
            title={`${task.title}\n${taskStatusConfig[task.status].label}`}
          />
        )}
      </div>
    </div>
  );
};
