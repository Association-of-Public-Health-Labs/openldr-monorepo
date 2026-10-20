import React, { type ReactNode } from "react";
import type { BoxProps } from "@mui/material";
import { cn } from "../../../lib/utils";
import { CARD_FRAME } from "./MainCard";

export type StatusCardProps = {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  value?: number | string | ReactNode;
  /** Kept for compatibility; only `className` is applied. */
  containerProps?: BoxProps;
};

/**
 * Summary tile, as Minimals' widget summary ("Total active users"): the report card frame, title,
 * a large value that never wraps and a small chart beside it that shrinks with the tile.
 */
export function StatusCard({ children, title, subtitle, value, containerProps }: StatusCardProps) {
  return (
    <div data-slot="status-card" className={cn(CARD_FRAME, "gap-1 p-6", containerProps?.className)}>
      <p className="text-sm leading-[22px] font-semibold text-[#1C252E] dark:text-white">{title}</p>
      <div className="flex min-w-0 items-center gap-3">
        <span className="shrink-0 text-[28px] leading-[42px] font-bold whitespace-nowrap text-[#1C252E] dark:text-white">{value}</span>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
      {subtitle && <p className="text-[13px] leading-5 font-semibold text-[#919EAB]">{subtitle}</p>}
    </div>
  );
}
