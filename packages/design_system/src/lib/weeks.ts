// Monday-to-Sunday weeks, labelled the Portuguese way ("2–8 Nov", "26 Out–1 Nov", "28 Dez–3 Jan").

export const PT_MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export type Week = {
  /** Monday, YYYY-MM-DD. */
  start: string;
  /** Sunday, YYYY-MM-DD. */
  end: string;
  label: string;
  /** Month the week is grouped under in the picker: the month of its Monday ("Nov"). */
  month: string;
  year: number;
};

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const addDays = (d: Date, days: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);

/** Monday of the week holding `d`. */
export function mondayOf(d: Date): Date {
  const shift = (d.getDay() + 6) % 7; // Monday = 0
  return addDays(d, -shift);
}

export function weekLabel(monday: Date): string {
  const sunday = addDays(monday, 6);
  const a = `${monday.getDate()}${monday.getMonth() === sunday.getMonth() ? "" : ` ${PT_MONTHS[monday.getMonth()]}`}`;
  return `${a}–${sunday.getDate()} ${PT_MONTHS[sunday.getMonth()]}`;
}

/** The last `count` complete weeks before `today`, oldest first (the current week is still running). */
export function recentWeeks(count: number, today: Date = new Date()): Week[] {
  const lastMonday = addDays(mondayOf(today), -7);
  return Array.from({ length: count }, (_, i) => {
    const monday = addDays(lastMonday, -7 * (count - 1 - i));
    return {
      start: iso(monday),
      end: iso(addDays(monday, 6)),
      label: weekLabel(monday),
      month: PT_MONTHS[monday.getMonth()],
      year: monday.getFullYear(),
    };
  });
}

export type WeekRange = { from: number; to: number };

/** "2–8 Nov", or "2 Nov – 29 Nov (4 semanas)" for several weeks. */
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

/** "2026-11-02,2026-11-29": the API's interval_dates for a range of weeks. */
export const weekRangeParam = (weeks: Week[], range: WeekRange) => `${weeks[range.from]?.start},${weeks[range.to]?.end}`;
