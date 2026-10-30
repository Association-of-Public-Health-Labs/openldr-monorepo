import { format, subYears } from "date-fns";
import { parseDate, type CalendarDate } from "@internationalized/date";

/** A date range as the cards use it: ["YYYY-MM-DD", "YYYY-MM-DD"]. */
export type IsoRange = [string, string];

/** The picker's range (react-aria). */
export type CalendarRange = { start: CalendarDate; end: CalendarDate };

/** The given range, or the last year up to today (the old MUI dialog's default). */
export function initialRange(initial?: [string, string], today = new Date()): IsoRange {
  if (initial?.length === 2) return initial;
  return [format(subYears(today, 1), "yyyy-MM-dd"), format(today, "yyyy-MM-dd")];
}

export function toCalendarRange(range: IsoRange): CalendarRange | null {
  try {
    return { start: parseDate(range[0]), end: parseDate(range[1]) };
  } catch {
    return null;
  }
}

export function fromCalendarRange(range: CalendarRange | null | undefined): IsoRange | null {
  if (!range?.start || !range?.end) return null;
  return [range.start.toString(), range.end.toString()];
}
