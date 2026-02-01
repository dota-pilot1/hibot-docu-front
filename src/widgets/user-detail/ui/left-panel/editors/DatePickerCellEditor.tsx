"use client";

import { useEffect, useRef } from "react";

interface DatePickerCellEditorProps {
  value: string | null;
  onValueChange: (value: string | null) => void;
  stopEditing: () => void;
}

export const DatePickerCellEditor = ({
  value,
  onValueChange,
  stopEditing,
}: DatePickerCellEditorProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // ISO string을 YYYY-MM-DD로 변환
  const dateValue = value ? new Date(value).toISOString().split("T")[0] : "";

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log("DatePicker handleChange:", newValue);
    if (!newValue) {
      onValueChange?.(null);
    } else {
      // YYYY-MM-DD를 ISO string으로 변환
      const isoValue = new Date(newValue).toISOString();
      console.log("DatePicker setting value:", isoValue);
      onValueChange?.(isoValue);
    }
    // 값 변경 후 편집 종료
    setTimeout(() => {
      stopEditing?.();
    }, 100);
  };

  return (
    <input
      ref={inputRef}
      type="date"
      value={dateValue}
      onChange={handleChange}
      className="w-full h-full px-2 border-none outline-none bg-white"
      style={{ fontSize: "14px" }}
    />
  );
};
