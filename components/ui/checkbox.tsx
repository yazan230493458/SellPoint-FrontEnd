"use client"

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { cn } from "cn"
import { CheckIcon } from "lucide-react"

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-zinc-300 bg-zinc-200 transition-colors outline-none group-has-disabled/field:opacity-50 group-has-[:focus-visible]/field-label:ring-0 group-has-[:focus-visible]/field-label:not-data-checked:border-zinc-300 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-600 dark:border-zinc-700/40 dark:bg-zinc-700 dark:focus-visible:border-zinc-400 dark:focus-visible:ring-zinc-400 disabled:cursor-not-allowed disabled:opacity-50 data-checked:border-black data-checked:bg-black data-checked:text-white dark:data-checked:border-white dark:data-checked:bg-white dark:data-checked:text-black",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none [&>svg]:size-3.5"
      >
        <CheckIcon
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
