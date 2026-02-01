"use client";

import { useEffect, useRef } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectCellEditorProps {
  value: string;
  onValueChange: (value: string) => void;
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
    onValueChange(e.target.value);
    setTimeout(() => {
      stopEditing();
    }, 50);
  };

  return (
    <select
      ref={selectRef}
      value={value}
      onChange={handleChange}
      className="w-full h-full px-2 border-none outline-none bg-white"
      style={{ fontSize: "14px" }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};
