"use client";

import React from "react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";

type ButtonProps = React.ComponentProps<typeof Button> & {
  loading?: boolean;
};

const BaseButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      onClick,
      children,
      className,
      variant = "default",
      size,
      type = "button",
      loading = false,
      disabled,
      onTouchStart,
      ...props
    },
    ref,
  ) => {
    return (
      <Button
        ref={ref}
        type={type}
        variant={variant}
        size={size}
        disabled={Boolean(disabled || loading)}
        aria-busy={loading || undefined}
        onTouchStart={onTouchStart}
        onClick={onClick}
        className={cn(
          "h-10 px-5 py-3 cursor-pointer gap-2.5 shadow-lg shadow-zinc-900/10 dark:shadow-zinc-950/20",
          loading && "pointer-events-none opacity-70",
          className,
        )}
        {...props}
      >
        {children}
      </Button>
    );
  },
);

BaseButton.displayName = "BaseButton";

export type { ButtonProps };
export default BaseButton;
