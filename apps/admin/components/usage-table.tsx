"use client";

import type { ReactNode } from "react";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@repo/design_system/components/ui/table";
import { cn } from "@/lib/utils";

export const HEAD =
  "bg-[#F4F6F8] px-3 py-2.5 text-[13px] font-semibold whitespace-nowrap text-[#637381] first:rounded-l-lg last:rounded-r-lg dark:bg-[#28323D] dark:text-[#919EAB]";
export const CELL = "border-b border-dashed border-[rgba(145,158,171,0.2)] px-3 py-2.5";

export type UsageColumn = { label: string; align?: "right" };

/** The table style of the Users page, for the usage cards. */
export function UsageTable({ columns, children }: { columns: UsageColumn[]; children: ReactNode }) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-0 hover:bg-transparent">
          {columns.map((c) => (
            <TableHead key={c.label} className={cn(HEAD, c.align === "right" && "text-right")}>
              {c.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>{children}</TableBody>
    </Table>
  );
}
