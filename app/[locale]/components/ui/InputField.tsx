"use client";

import * as React from "react";
import { cn } from "cn";

export type InputProps = React.ComponentProps<"input"> & {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  classNameForBox?: string;
};

const fieldClassName =
  "w-full min-w-0 overflow-hidden rounded-lg border border-zinc-300/20 bg-zinc-200 p-2.5 text-black outline-0 placeholder:text-zinc-500 focus:ring-1 focus:ring-zinc-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700/20 dark:bg-zinc-700 dark:text-white dark:placeholder:text-zinc-400 dark:focus:ring-zinc-400";

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      className,
      classNameForBox,
      label,
      description,
      error,
      disabled,
      required,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const descriptionId = description ? `${inputId}-description` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const describedBy =
      [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

    const control = (
      <input
        id={inputId}
        ref={ref}
        disabled={disabled}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          fieldClassName,
          error && "ring-1 ring-red-500 dark:ring-red-400",
          className,
        )}
        {...props}
      />
    );

    if (label == null && description == null && error == null) {
      return control;
    }

    return (
      <div className={`${classNameForBox} flex w-full min-w-0 flex-col items-start gap-1.5`}>
        {label != null && label !== "" ? (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
          >
            {label}
            {required ? (
              <span aria-hidden="true" className="ms-0.5">
                *
              </span>
            ) : null}
          </label>
        ) : null}
        {control}
        {description != null && description !== "" && !error ? (
          <p
            id={descriptionId}
            className="text-xs text-zinc-500 dark:text-zinc-400"
          >
            {description}
          </p>
        ) : null}
        {error ? (
          <p
            id={errorId}
            role="alert"
            className="text-xs font-medium text-red-500 dark:text-red-400"
          >
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
