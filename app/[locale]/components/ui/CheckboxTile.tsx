"use client";

import React, { ComponentPropsWithoutRef } from "react";
import { Check } from "lucide-react";
import Button from "./Button";

export interface CheckboxTileProps extends Omit<
  ComponentPropsWithoutRef<"button">,
  "onChange" | "title" | "description"
> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
}

export const CheckboxTile: React.FC<CheckboxTileProps> = ({
  checked = false,
  onCheckedChange,
  title,
  description,
  className = "",
  onClick,
  disabled,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    onCheckedChange?.(!checked);
    onClick?.(e);
  };

  return (
    <Button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={handleClick}
      className={`relative flex w-full items-start gap-3.5 rounded-xl border p-4 text-left transition-all duration-200 ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      } ${
        checked
          ? "border-zinc-900 bg-zinc-200 dark:border-zinc-100 dark:bg-zinc-800"
          : "border-zinc-200 bg-zinc-100 hover:border-zinc-300 dark:border-zinc-700/40 dark:bg-zinc-800 dark:hover:border-zinc-600"
      } ${className}`}
      {...props}
    >
      <div
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-200 ${
          checked
            ? "border-zinc-900 bg-zinc-900 text-zinc-100 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
            : "border-zinc-300 bg-zinc-100 dark:border-zinc-700/40 dark:bg-zinc-700"
        }`}
      >
        <Check
          className={`h-3.5 w-3.5 transition-opacity ${
            checked
              ? "opacity-100 text-zinc-100 dark:text-zinc-900"
              : "opacity-0 text-transparent"
          }`}
        />
      </div>
      <div className="text-sm leading-tight">
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
          {title}
        </span>
        {description && (
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {description}
          </p>
        )}
      </div>
    </Button>
  );
};

export default CheckboxTile;
