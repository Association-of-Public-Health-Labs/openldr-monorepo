"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "../../lib/utils"

/**
 * Minimals segmented switch for a few options (e.g. Ultra / XDR): grey track, the active option on
 * a white pill. Same look as the level switch in the facilities filter dialog. Use inside the
 * shadcn <Tabs> root, in place of TabsList / TabsTrigger; behaviour is Radix Tabs'.
 */
export const SEGMENTED_TRACK = "inline-flex w-fit items-center rounded-lg bg-[rgba(145,158,171,0.08)] p-1"
export const SEGMENTED_ITEM =
  "inline-flex h-7 items-center justify-center rounded-md px-3 text-[13px] font-semibold whitespace-nowrap text-[#637381] transition-colors outline-none hover:text-[#1C252E] focus-visible:ring-2 focus-visible:ring-[rgba(145,158,171,0.32)] disabled:pointer-events-none disabled:opacity-50 dark:text-[#919EAB] dark:hover:text-white"
export const SEGMENTED_ITEM_ACTIVE =
  "bg-white text-[#1C252E] shadow-[0_1px_2px_0_rgba(145,158,171,0.16)] dark:bg-[#1C252E] dark:text-white"

function SegmentedTabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return <TabsPrimitive.List data-slot="segmented-tabs-list" className={cn(SEGMENTED_TRACK, className)} {...props} />
}

function SegmentedTabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="segmented-tabs-trigger"
      className={cn(
        SEGMENTED_ITEM,
        "data-[state=active]:bg-white data-[state=active]:text-[#1C252E] data-[state=active]:shadow-[0_1px_2px_0_rgba(145,158,171,0.16)] dark:data-[state=active]:bg-[#1C252E] dark:data-[state=active]:text-white",
        className
      )}
      {...props}
    />
  )
}

export { SegmentedTabsList, SegmentedTabsTrigger }
