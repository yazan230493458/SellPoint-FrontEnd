
"use client";

import React from "react";

interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  label: string;
  onChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ checked, onChange, label, id, className = "", ...props }, ref) => {
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 border border-zinc-300/20 dark:border-zinc-700/20">
        <input
          {...props}
          ref={ref}
          checked={checked}
          className={`w-5 h-5 accent-zinc-900 dark:accent-zinc-100 cursor-pointer ${className}`}
          id={id}
          onChange={(event) => onChange?.(event.target.checked)}
          type="checkbox"
        />

        <label
          className="text-sm cursor-pointer select-none"
          htmlFor={id}
        >
          {label}
        </label>
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
