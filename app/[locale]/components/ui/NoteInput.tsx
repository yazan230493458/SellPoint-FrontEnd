"use client";
import React, {
  useRef,
  useImperativeHandle,
  forwardRef,
  TextareaHTMLAttributes,
} from "react";

interface NoteInputProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
  id?: string;
  label?: string;
  classNameForContainer?: string;
  error?: string;
  helperText?: string;
  value?: string;
  variant?: "floating" | "fixed";
}

const NoteInput = forwardRef<HTMLTextAreaElement, NoteInputProps>(
  (
    {
      className = "",
      id = "note-input",
      label,
      classNameForContainer = "",
      placeholder,
      error,
      helperText,
      value,
      variant = "floating",
      ...props
    },
    ref,
  ) => {
    const internalRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(ref, () => internalRef.current!);

    const isFixed = variant === "fixed";
    const effectivePlaceholder = isFixed ? placeholder : (placeholder ?? " ");

    return (
      <div className={`${classNameForContainer}`}>
        {isFixed && label && (
          <label
            htmlFor={id}
            className="mb-1 text-sm font-medium text-zinc-900 dark:text-zinc-100"
          >
            {label}
          </label>
        )}

        <div className="relative flex w-full h-full min-w-0">
          <textarea
            {...props}
            autoComplete="false"
            id={id}
            ref={internalRef}
            value={value}
            placeholder={effectivePlaceholder}
            className={`peer w-full min-w-0 rounded-2xl outline-none resize-none transition-all duration-200 ${
              isFixed ? "py-2.5 px-3.5" : "pt-4 pb-2.5 px-3.5"
            } ${props.disabled ? "opacity-50" : "opacity-100"} ${
              error ? "border-red-500 focus:ring-red-500" : ""
            } ${className}`}
          />

          {!isFixed && label && (
            <label
              htmlFor={id}
              className={`pointer-events-none absolute bg-zinc-200 dark:bg-zinc-700 px-1 text-base transition-all duration-200 ease-out left-3 top-5 -translate-y-1/2 peer-placeholder-shown:top-5 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:left-3 peer-placeholder-shown:text-zinc-500 dark:peer-placeholder-shown:text-zinc-400 peer-focus:left-3 peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:font-semibold text-zinc-500 dark:text-zinc-400 peer-focus:text-black dark:peer-focus:text-white peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-medium peer-[:not(:placeholder-shown)]:text-black dark:peer-[:not(:placeholder-shown)]:text-white`}
            >
              {label}
            </label>
          )}
        </div>

        {(error || helperText) && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {error || helperText}
          </p>
        )}
      </div>
    );
  },
);

NoteInput.displayName = "NoteInput";

export default NoteInput;
