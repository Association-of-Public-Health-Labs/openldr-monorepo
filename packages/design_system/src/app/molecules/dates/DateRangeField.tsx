"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import {
  Button as AriaButton,
  DateRangePicker,
  Dialog as AriaDialog,
  Group,
  I18nProvider,
  Popover as AriaPopover,
} from "react-aria-components";

import { cn } from "../../../lib/utils";
import { DIALOG_LABEL } from "../../../lib/dialog-styles";
import { RangeCalendar } from "../../../components/ui/calendar-rac";
import { DateInput, dateInputStyle } from "../../../components/ui/datefield-rac";
import { Label } from "../../../components/ui/label";
import { fromCalendarRange, toCalendarRange, type IsoRange } from "./date-range";

export type DateRangeFieldProps = {
  label?: string;
  value: IsoRange;
  /** Only complete ranges are reported. */
  onChange: (range: IsoRange) => void;
};

/**
 * Date range input with a calendar, as in LabDialog (react-aria, pt-PT): typed day/month/year
 * segments and a calendar button. Minimals field: 8px radius.
 */
export function DateRangeField({ label = "Intervalo de datas", value, onChange }: DateRangeFieldProps) {
  // Inside a modal dialog the calendar must render in the dialog: outside it, the dialog blocks the clicks.
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const portal = anchor?.closest<HTMLElement>("[role=dialog]") ?? (typeof document !== "undefined" ? document.body : undefined);
  const calendarValue = toCalendarRange(value);
  const change = (range: Parameters<typeof fromCalendarRange>[0]) => {
    const next = fromCalendarRange(range);
    if (next) onChange(next);
  };
  return (
    <I18nProvider locale="pt-PT">
      <DateRangePicker className="*:not-first:mt-2" value={calendarValue} onChange={change}>
        <Label className={DIALOG_LABEL}>{label}</Label>
        <div ref={setAnchor} className="flex">
          <Group className={cn(dateInputStyle, "h-10 rounded-lg pe-9")}>
            <DateInput slot="start" unstyled />
            <span aria-hidden="true" className="px-2 text-muted-foreground/70">
              -
            </span>
            <DateInput slot="end" unstyled />
          </Group>
          <AriaButton
            slot="trigger"
            className="z-10 -ms-9 -me-px flex w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 transition-[color,box-shadow] outline-none hover:text-foreground data-focus-visible:border-ring data-focus-visible:ring-[3px] data-focus-visible:ring-ring/50"
            aria-label="Abrir calendário"
          >
            <CalendarIcon size={16} />
          </AriaButton>
        </div>
        <AriaPopover
          UNSTABLE_portalContainer={portal}
          className="z-50 rounded-[10px] bg-white text-popover-foreground shadow-[0_0_2px_0_rgba(145,158,171,0.24),-20px_20px_40px_-4px_rgba(145,158,171,0.24)] outline-hidden data-entering:animate-in data-exiting:animate-out data-[entering]:fade-in-0 data-[entering]:zoom-in-95 data-[exiting]:fade-out-0 data-[exiting]:zoom-out-95 dark:bg-[#1C252E]"
          offset={4}
        >
          <AriaDialog className="max-h-[inherit] overflow-auto p-2">
            <RangeCalendar />
          </AriaDialog>
        </AriaPopover>
      </DateRangePicker>
    </I18nProvider>
  );
}
