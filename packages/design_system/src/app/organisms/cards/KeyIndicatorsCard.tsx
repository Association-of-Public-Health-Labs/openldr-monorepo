"use client";

import { useState } from "react";
import type { BoxProps } from "@mui/material";
import { cn } from "../../../lib/utils";
import { IndicatorsTable, type IndicatorsRow } from "../../molecules/tables/IndicatorsTable";
import { LineTabs } from "../../molecules/tabs/LineTabs";

export type KeyIndicatorsCardProps = {
  tab1: object[];
  tab2: object[];
  tab3: object[];
  columns: string[];
  /** Kept for compatibility; only `className` is applied. */
  containerProps?: BoxProps;
  labels?: string[];
  onValueChange?: (value: string) => void;
};

// Each row object's first value is the indicator, the rest its monthly values (as the MUI table read them).
const toRows = (rows: object[]): IndicatorsRow[] =>
  rows.map((row) => {
    const [label, ...values] = Object.values(row);
    return { label: String(label ?? ""), values };
  });

/**
 * Indicator table with up to three tabs (Todos / Ultra / XDR), after the Minimals tabs: bold labels,
 * the active one underlined in the dashboard colour. Same props as the MUI card it replaces.
 */
export function KeyIndicatorsCard({ tab1, tab2, tab3, columns, containerProps, labels = [], onValueChange }: KeyIndicatorsCardProps) {
  const [active, setActive] = useState(0);
  const tabs = [tab1, tab2, tab3];

  return (
    <div className={cn("w-full", containerProps?.className)}>
      {labels.length > 0 && (
        <LineTabs
          items={labels.map((label, i) => ({ value: String(i), label }))}
          value={String(active)}
          onChange={(value) => {
            const i = Number(value);
            setActive(i);
            onValueChange?.(labels[i]);
          }}
        />
      )}
      <div role="tabpanel" className="px-4 pt-5 pb-4">
        <IndicatorsTable columns={columns} rows={toRows(tabs[active] ?? [])} />
      </div>
    </div>
  );
}
