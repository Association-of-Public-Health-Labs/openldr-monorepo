import { periodLabel } from "../period";

export type DateRange = { start: string; end: string };

const pad = (n: number) => String(n).padStart(2, "0");

export const toIsoDate = (d: Date): string => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Legacy "Últimos 12 meses": the same day one year ago → today (29 Feb → 28 Feb). */
export function lastYear(today: Date = new Date()): DateRange {
  const start = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
  if (start.getMonth() !== today.getMonth()) start.setDate(0);
  return { start: toIsoDate(start), end: toIsoDate(today) };
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

/** Card subtitle period: "Últimos 12 meses" for the default window, otherwise the dates. Exports keep the dates. */
export const formatPeriodPt = (range: DateRange, today?: Date): string =>
  periodLabel(range.start, range.end, (start, end) => formatRangePt({ start, end }), today);
