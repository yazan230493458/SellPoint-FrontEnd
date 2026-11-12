"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { cn } from "cn";

function Switch({
  className,
  size = "default",
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default";
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent transition-all outline-none group-has-[:focus-visible]/field-label:border-transparent group-has-[:focus-visible]/field-label:ring-0 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-zinc-400 focus-visible:ring-1 focus-visible:ring-zinc-600 aria-invalid:border-zinc-400 aria-invalid:ring-1 aria-invalid:ring-zinc-400/30 data-[size=default]:h-[18.4px] data-[size=default]:w-[32px] data-[size=sm]:h-[14px] data-[size=sm]:w-[24px] dark:focus-visible:border-zinc-400 dark:focus-visible:ring-zinc-400 dark:aria-invalid:border-zinc-400 dark:aria-invalid:ring-zinc-400/40 data-checked:bg-black data-unchecked:bg-zinc-200 dark:data-checked:bg-white dark:data-unchecked:bg-zinc-700 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-full bg-white ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 group-data-[size=default]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=sm]/switch:data-checked:translate-x-[calc(100%-2px)] rtl:group-data-[size=default]/switch:data-checked:-translate-x-[calc(100%-2px)] rtl:group-data-[size=sm]/switch:data-checked:-translate-x-[calc(100%-2px)] group-data-[checked]/switch:bg-white dark:group-data-[checked]/switch:bg-black group-data-[size=default]/switch:data-unchecked:translate-x-0 group-data-[size=sm]/switch:data-unchecked:translate-x-0 group-data-[unchecked]/switch:bg-white dark:group-data-[unchecked]/switch:bg-white"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
