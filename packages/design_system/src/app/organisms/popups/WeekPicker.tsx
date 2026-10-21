"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { SEGMENTED_ITEM, SEGMENTED_ITEM_ACTIVE, SEGMENTED_TRACK } from "../../../components/ui/segmented-tabs";
import { DIALOG_BUTTON_OUTLINE, DIALOG_BUTTON_PRIMARY } from "../../../lib/dialog-styles";
import { cn } from "../../../lib/utils";
import { weekRangeLabel, type Week, type WeekRange } from "../../../lib/weeks";
import { OVERLINE } from "../../molecules/metrics/SummaryStrip";

export type WeekBars = { values: number[]; colors: string[] };

export type WeekPickerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weeks: Week[];
  value: WeekRange;
  onApply: (range: WeekRange) => void;
  /** Tiny bars on each week (e.g. its samples per TAT class), so busy and empty weeks stand out. */
  bars?: (WeekBars | undefined)[];
};

type Mode = "single" | "range";

/** Weeks grouped under the month of their Sunday; the year shows on the first group and on January. */
function monthGroups(weeks: Week[]) {
  const groups: { key: string; title: string; items: { week: Week; index: number }[] }[] = [];
  weeks.forEach((week, index) => {
    const key = `${week.year}-${week.month}`;
    if (groups[groups.length - 1]?.key !== key) {
      groups.push({ key, title: groups.length === 0 || week.month === "Jan" ? `${week.month} ${week.year}` : week.month, items: [] });
    }
    groups[groups.length - 1].items.push({ week, index });
  });
  return groups;
}

const CHIP =
  "flex w-[88px] shrink-0 flex-col items-center gap-1.5 rounded-lg border px-1.5 pt-2 pb-1.5 text-[11px] leading-4 font-semibold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/40";

function MiniBars({ bars, active }: { bars?: WeekBars; active: boolean }) {
  const max = Math.max(1, ...(bars?.values ?? [0]));
  return (
    <span aria-hidden className="flex h-3.5 items-end gap-[2px]">
      {(bars?.values ?? [0, 0, 0, 0]).map((v, i) => (
        <span
          key={i}
          className="w-1 rounded-[1px]"
          style={{
            height: `${Math.max(12, (v / max) * 100)}%`,
            background: active ? "currentColor" : v > 0 ? bars?.colors[i] : "rgba(145,158,171,0.32)",
            opacity: active && v === 0 ? 0.4 : 1,
          }}
        />
      ))}
    </span>
  );
}

/**
 * "Período" for weekly reports: one week or a range of weeks, shortcuts, and the weeks laid out by
 * month on a scrolling strip. Styled like the other filter dialogs.
 */
export function WeekPicker({ open, onOpenChange, weeks, value, onApply, bars }: WeekPickerProps) {
  const [mode, setMode] = useState<Mode>(value.from === value.to ? "single" : "range");
  const [draft, setDraft] = useState<WeekRange>(value);
  // In range mode, the first click sets one end and waits for the second.
  const [anchor, setAnchor] = useState<number | null>(null);
  const strip = useRef<HTMLDivElement>(null);
  const last = weeks.length - 1;

  useEffect(() => {
    if (!open) return;
    setDraft(value);
    setMode(value.from === value.to ? "single" : "range");
    setAnchor(null);
    // Bring the chosen week into view.
    requestAnimationFrame(() => strip.current?.querySelector<HTMLElement>("[data-selected]")?.scrollIntoView({ inline: "center", block: "nearest" }));
  }, [open, value]);

  const pick = (i: number) => {
    if (mode === "single") return setDraft({ from: i, to: i });
    if (anchor === null) {
      setAnchor(i);
      setDraft({ from: i, to: i });
    } else {
      setDraft({ from: Math.min(anchor, i), to: Math.max(anchor, i) });
      setAnchor(null);
    }
  };

  const shortcut = (range: WeekRange) => {
    setMode(range.from === range.to ? "single" : "range");
    setDraft(range);
    setAnchor(null);
  };

  const SHORTCUTS = [
    { label: "Última semana", range: { from: last, to: last } },
    { label: "Últimas 4 semanas", range: { from: Math.max(0, last - 3), to: last } },
    { label: "Todo o período", range: { from: 0, to: last } },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-5 sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Período</DialogTitle>
          <DialogDescription>Uma semana (domingo a sábado, como nos relatórios semanais) ou um intervalo de semanas.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div role="radiogroup" aria-label="Tipo de período" className={SEGMENTED_TRACK}>
            {(
              [
                ["single", "Semana única"],
                ["range", "Intervalo"],
              ] as const
            ).map(([m, label]) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={mode === m}
                onClick={() => {
                  setMode(m);
                  setAnchor(null);
                  if (m === "single") setDraft({ from: draft.to, to: draft.to });
                }}
                className={cn(SEGMENTED_ITEM, "h-8 text-sm", mode === m && SEGMENTED_ITEM_ACTIVE)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={OVERLINE}>Atalhos</span>
            {SHORTCUTS.map((s) => {
              const on = draft.from === s.range.from && draft.to === s.range.to;
              return (
                <button
                  key={s.label}
                  type="button"
                  aria-pressed={on}
                  onClick={() => shortcut(s.range)}
                  className={cn(
                    "h-8 rounded-full border px-3 text-[13px] font-semibold transition-colors",
                    on
                      ? "border-[#1C252E] bg-[#1C252E] text-white dark:border-white dark:bg-white dark:text-[#1C252E]"
                      : "border-[rgba(145,158,171,0.32)] text-[#1C252E] hover:bg-[rgba(145,158,171,0.08)] dark:text-white",
                  )}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* The weeks by month, oldest on the left. */}
        <div ref={strip} role="listbox" aria-label="Semanas" aria-multiselectable={mode === "range"} className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2">
          {monthGroups(weeks).map((group) => (
            <div key={group.key} className="flex shrink-0 flex-col gap-2">
              <span className={cn(OVERLINE, "pl-1")}>{group.title}</span>
              <div className="flex gap-1.5">
                {group.items.map(({ week, index }) => {
                  const on = index >= draft.from && index <= draft.to;
                  const end = index === draft.from || index === draft.to;
                  return (
                    <button
                      key={week.start}
                      type="button"
                      role="option"
                      aria-selected={on}
                      data-selected={on || undefined}
                      onClick={() => pick(index)}
                      className={cn(
                        CHIP,
                        on && end
                          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : on
                            ? "border-transparent bg-[color-mix(in_srgb,var(--primary)_14%,transparent)] text-[#1C252E] dark:text-white"
                            : "border-[rgba(145,158,171,0.2)] text-[#1C252E] hover:bg-[rgba(145,158,171,0.08)] dark:text-white",
                      )}
                    >
                      {week.label}
                      <MiniBars bars={bars?.[index]} active={on && end} />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="items-center pt-1 sm:justify-between">
          <p className="flex items-center gap-2 text-sm text-[#637381] dark:text-[#919EAB]">
            <span aria-hidden className="size-2 rounded-full bg-[var(--primary)]" />
            Selecção: <b className="font-semibold text-[#1C252E] dark:text-white">{weekRangeLabel(weeks, draft)}</b>
            {anchor !== null && <span className="text-xs">(escolha a outra semana)</span>}
          </p>
          <div className="flex gap-2">
            <button type="button" className={DIALOG_BUTTON_OUTLINE} onClick={() => onOpenChange(false)}>
              Cancelar
            </button>
            <button
              type="button"
              className={DIALOG_BUTTON_PRIMARY}
              onClick={() => {
                onApply(draft);
                onOpenChange(false);
              }}
            >
              Aplicar
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** The toolbar button that opens the week picker: calendar chip, "Período" caption, the period. */
export function PeriodButton({ label, onClick, className }: { label: string; onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-12 items-center gap-3 rounded-xl border border-[rgba(145,158,171,0.2)] bg-white pr-3 pl-2 text-left transition-colors hover:bg-[rgba(145,158,171,0.08)] dark:bg-[#1d232a]",
        className,
      )}
    >
      <span aria-hidden className="flex size-8 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] text-[var(--primary)]">
        <CalendarDays className="size-[18px]" />
      </span>
      <span className="flex flex-col">
        <span className={cn(OVERLINE, "text-[10px] leading-3")}>Período</span>
        <span className="text-sm leading-5 font-semibold whitespace-nowrap text-[#1C252E] dark:text-white">{label}</span>
      </span>
      <ChevronDown aria-hidden className="ml-1 size-4 text-[#637381]" />
    </button>
  );
}
