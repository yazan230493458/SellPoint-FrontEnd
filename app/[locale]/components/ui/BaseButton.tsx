"use client";

import React from "react";
import { cn } from "cn";
import { Button, type ButtonProps } from "@/components/ui/button";

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
        loading={loading}
        onTouchStart={onTouchStart}
        onClick={onClick}
        className={cn(
          "h-10 px-5 py-3 cursor-pointer gap-2.5 shadow-lg shadow-zinc-900/10 dark:shadow-zinc-950/20",
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

export default BaseButton;
