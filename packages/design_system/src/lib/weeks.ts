// Sunday-to-Saturday weeks, as the weekly CV/EID reports (api-weekly-reports-python), labelled the
// Portuguese way ("27 Set–3 Out", "4–10 Out", "27 Dez–2 Jan").

export const PT_MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export type Week = {
  /** Sunday, YYYY-MM-DD. */
  start: string;
  /** Saturday, YYYY-MM-DD. */
  end: string;
  label: string;
  /** Month the week is grouped under in the picker: the month of its Sunday ("Set"). */
  month: string;
  year: number;
};

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const addDays = (d: Date, days: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);

const fromIso = (value: string) => {
  const [y, m, d] = value.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
};

/** Sunday of the week holding `d`. */
export function sundayOf(d: Date): Date {
  return addDays(d, -d.getDay()); // getDay(): Sunday = 0
}

export function weekLabel(sunday: Date): string {
  const saturday = addDays(sunday, 6);
  const a = `${sunday.getDate()}${sunday.getMonth() === saturday.getMonth() ? "" : ` ${PT_MONTHS[sunday.getMonth()]}`}`;
  return `${a}–${saturday.getDate()} ${PT_MONTHS[saturday.getMonth()]}`;
}

/** The last `count` complete weeks before `today`, oldest first (the current week is still running). */
export function recentWeeks(count: number, today: Date = new Date()): Week[] {
  const lastSunday = addDays(sundayOf(today), -7);
  return Array.from({ length: count }, (_, i) => {
    const sunday = addDays(lastSunday, -7 * (count - 1 - i));
    return {
      start: iso(sunday),
      end: iso(addDays(sunday, 6)),
      label: weekLabel(sunday),
      month: PT_MONTHS[sunday.getMonth()],
      year: sunday.getFullYear(),
    };
  });
}

/**
 * Whether a period is a whole Sunday-to-Saturday week. Data for any other window is ignored, as in
 * the weekly reports (the ETL left a few extra windows, e.g. Monday 1 – Saturday 6 June 2026).
 */
export function isSundayToSaturday(start: string, end: string): boolean {
  const a = fromIso(start);
  const b = fromIso(end);
  return a.getDay() === 0 && iso(addDays(a, 6)) === iso(b);
}

export type WeekRange = { from: number; to: number };

/** "27 Set–3 Out", or "4 Out – 31 Out (4 semanas)" for several weeks. */
export function weekRangeLabel(weeks: Week[], range: WeekRange): string {
  const a = weeks[range.from];
  const b = weeks[range.to];
  if (!a || !b) return "";
  if (range.from === range.to) return a.label;
  const first = a.label.split("–")[0];
  const firstWithMonth = /\s/.test(first) ? first : `${first} ${a.month}`;
  const n = range.to - range.from + 1;
  return `${firstWithMonth} – ${b.label.split("–").pop()} (${n} semanas)`;
}

/** "2026-10-04,2026-10-31": the API's interval_dates for a range of weeks (Sunday of the first, Saturday of the last). */
export const weekRangeParam = (weeks: Week[], range: WeekRange) => `${weeks[range.from]?.start},${weeks[range.to]?.end}`;
