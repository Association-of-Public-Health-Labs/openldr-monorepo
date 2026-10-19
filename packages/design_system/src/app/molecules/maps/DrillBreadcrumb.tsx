"use client";

import { Fragment } from "react";
import { ChevronLeft } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../../components/ui/breadcrumb";
import { cn } from "../../../lib/utils";

export type DrillBreadcrumbItem = {
  label: string;
  /** Goes back to this level; the last item (where the user is) needs none. */
  onSelect?: () => void;
};

/**
 * Where the user is in a map drill-down ("Moçambique • Zambézia"), after the Minimals breadcrumbs:
 * a round back button to the previous level, muted links, dot separators and the current level in bold.
 */
export function DrillBreadcrumb({ items, className }: { items: DrillBreadcrumbItem[]; className?: string }) {
  const previous = items.length > 1 ? items[items.length - 2] : undefined;

  return (
    <div data-slot="drill-breadcrumb" className={cn("flex min-w-0 items-center gap-2", className)}>
      {previous?.onSelect && (
        <button
          type="button"
          onClick={previous.onSelect}
          aria-label={`Voltar a ${previous.label}`}
          title={`Voltar a ${previous.label}`}
          className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[rgba(145,158,171,0.08)] text-[#1C252E] transition-colors hover:bg-[rgba(145,158,171,0.16)] focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none dark:text-white"
        >
          <ChevronLeft className="size-4" />
        </button>
      )}
      <Breadcrumb className="min-w-0">
        <BreadcrumbList className="gap-0 text-sm leading-[22px] sm:gap-0">
          {items.map((item, i) => {
            const last = i === items.length - 1;
            return (
              <Fragment key={`${item.label}-${i}`}>
                <BreadcrumbItem className="min-w-0">
                  {last ? (
                    <BreadcrumbPage className="truncate font-semibold text-[#1C252E] dark:text-white">{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <button
                        type="button"
                        onClick={item.onSelect}
                        className="truncate text-[#637381] underline-offset-4 hover:text-[#1C252E] hover:underline dark:text-[#919EAB] dark:hover:text-white"
                      >
                        {item.label}
                      </button>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!last && (
                  <BreadcrumbSeparator className="mx-3 flex items-center">
                    <span className="block size-1 rounded-full bg-[#919EAB]" />
                  </BreadcrumbSeparator>
                )}
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
