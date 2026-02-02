"use client";

import { useEffect, useRef } from "react";

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectCellEditorProps {
  value: string | number;
  onValueChange: (value: string | number) => void;
  stopEditing: () => void;
  options: SelectOption[];
}

export const SelectCellEditor = ({
  value,
  onValueChange,
  stopEditing,
  options,
}: SelectCellEditorProps) => {
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    selectRef.current?.focus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    // 원래 옵션의 value 타입에 맞춰 변환
    const originalOption = options.find(
      (opt) => String(opt.value) === newValue,
    );
    const typedValue =
      typeof originalOption?.value === "number" ? Number(newValue) : newValue;

    onValueChange(typedValue);
    setTimeout(() => {
      stopEditing();
    }, 50);
  };

  return (
    <select
      ref={selectRef}
      value={String(value)}
      onChange={handleChange}
      className="w-full h-full px-2 border-none outline-none bg-white"
      style={{ fontSize: "14px" }}
    >
      {options.map((opt) => (
        <option key={String(opt.value)} value={String(opt.value)}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};
