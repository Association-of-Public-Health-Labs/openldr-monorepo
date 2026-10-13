export type DateRange = { start: string; end: string };

const pad = (n: number) => String(n).padStart(2, "0");

export const toIsoDate = (d: Date): string => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const addDays = (d: Date, days: number): Date => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);

/** Legacy "Últimos 12 meses": the same day one year ago → today (29 Feb → 28 Feb). */
export function lastYear(today: Date = new Date()): DateRange {
  const start = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
  if (start.getMonth() !== today.getMonth()) start.setDate(0);
  return { start: toIsoDate(start), end: toIsoDate(today) };
}

/** Legacy "Últimas 12 Semanas": today − 84 days → today. */
export function lastTwelveWeeks(today: Date = new Date()): DateRange {
  return { start: toIsoDate(addDays(today, -84)), end: toIsoDate(today) };
}

/** Legacy weekly-by-lab default: Sunday → Saturday of the week containing today − 6 days. */
export function legacyWeek(today: Date = new Date()): DateRange {
  const anchor = addDays(today, -6);
  const sunday = addDays(anchor, -anchor.getDay());
  return { start: toIsoDate(sunday), end: toIsoDate(addDays(sunday, 6)) };
}

export const intervalParam = (range: DateRange): string => `${range.start},${range.end}`;

export const PT_MONTHS_SHORT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const PT_MONTHS_LONG = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

export const monthLabel = (year: number, month: number): string =>
  `${PT_MONTHS_SHORT[month - 1] ?? String(month)}/${String(year).slice(-2)}`;

/** "2026-01-01" → "01 de janeiro de 2026", parsed by hand to avoid timezone shifts. */
export function formatDatePt(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d} de ${PT_MONTHS_LONG[Number(m) - 1]} de ${y}`;
}

export const formatRangePt = (range: DateRange): string => `${formatDatePt(range.start)} à ${formatDatePt(range.end)}`;
