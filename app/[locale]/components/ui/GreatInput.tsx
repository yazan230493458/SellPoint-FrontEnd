"use client";
import { User } from "lucide-react";
import React, { forwardRef, InputHTMLAttributes } from "react";

interface GreatInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode | null;
  isMobileNumber?: boolean;
  countryCode?: string;
}

const GreatInput = forwardRef<HTMLInputElement, GreatInputProps>(
  (
    {
      label,
      type = "text",
      id = "floating-input",
      className = "",
      placeholder = " ",
      required = false,
      error,
      helperText,
      leftIcon = <User />,
      value,
      isMobileNumber = false,
      countryCode = "",
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <div className={`w-full overflow-hidden rounded-lg ${className}`}>
        <div
          className={`relative flex items-center w-full h-14 border transition-all duration-200 bg-zinc-200 dark:bg-zinc-700 border-zinc-300/20 dark:border-zinc-700/20 focus-within:ring-1 focus-within:ring-zinc-600 dark:focus-within:ring-zinc-400 ${
            error
              ? "border-red-500 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500"
              : ""
          } ${disabled ? "opacity-50 cursor-not-allowed" : "opacity-100"}`}
        >
          {leftIcon && (
            <div className="ps-4 flex items-center justify-center text-zinc-500 dark:text-zinc-400 shrink-0">
              {leftIcon}
            </div>
          )}

          {isMobileNumber && (
            <div className="ps-4 pe-2 flex items-center justify-center font-medium text-sm text-black dark:text-white border-e border-zinc-300/20 dark:border-zinc-700/20 shrink-0 select-none">
              {countryCode}
            </div>
          )}

          <div className="relative w-full h-full flex items-center">
            <input
              autoComplete="off"
              ref={ref}
              type={type}
              id={id}
              value={value}
              disabled={disabled}
              placeholder={placeholder}
              required={required}
              aria-invalid={error ? true : undefined}
              aria-describedby={
                error || helperText ? `${id}-message` : undefined
              }
              {...props}
              className="peer w-full h-full px-4 bg-transparent text-base text-black dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:outline-none disabled:cursor-not-allowed"
            />

            {label && (
              <label
                htmlFor={id}
                className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-sm text-zinc-500 dark:text-zinc-400 transition-all duration-200 ease-out origin-[0]
                peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100
                peer-focus:top-2.5 peer-focus:translate-y-0 peer-focus:scale-75
                peer-[:not(:placeholder-shown)]:top-2.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:scale-75"
              >
                {label}
              </label>
            )}
          </div>
        </div>

        {(error || helperText) && (
          <p
            id={`${id}-message`}
            role={error ? "alert" : undefined}
            className={`mt-1.5 ms-1 text-xs ${
              error
                ? "text-red-500 dark:text-red-400 font-medium"
                : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  },
);

GreatInput.displayName = "GreatInput";

export default GreatInput;
