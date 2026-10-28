import { monthLabel } from "./dates";
import { mean, pct, sum, trendOf, type MonthPair } from "./format";
import type { Cell, ExcelSheet } from "./export/excel";

/** What a KPI tile measures: a count of samples, a rate (%) or a duration (days). */
export type KpiKind = "count" | "rate" | "days";

type Month = { year: number; month: number };

export type KpiDetailInput = {
  kind: KpiKind;
  /** One per bar, aligned with `data`. */
  months: Month[];
  data: number[];
  /** The tile's headline value, as the tile computes it. */
  value: number;
  /** The tile's trend pair (unrounded for a rate). */
  trend: MonthPair | null;
  format: (value: number) => string;
  /** Window start (ISO): its month is partial unless the window starts on the 1st. */
  start?: string;
  /** A count read as a share of another count over the period ("% das registadas"). */
  share?: { label: string; base: number[] };
};

/** A figure for the drawer's summary strip. */
export type KpiFigure = { label: string; value: string; note?: string };

const DASH = "—";

/**
 * Positions of the complete months: not the current month (still filling up, as `completeMonths`)
 * and not a first month the window starts part-way through.
 */
export function completeIndices(months: Month[], today = new Date(), start?: string): number[] {
  const current = today.getFullYear() * 12 + today.getMonth() + 1;
  const [sy, sm, sd] = (start ?? "").slice(0, 10).split("-").map(Number);
  const partialStart = start && sd > 1 ? sy * 12 + sm : null;
  return months.flatMap((m, i) => {
    const key = m.year * 12 + m.month;
    return key < current && key !== partialStart ? [i] : [];
  });
}

/** Highest (or lowest) complete month; ties go to the earliest. */
type MonthValue = { value: number; label: string } | null;

function extreme(input: KpiDetailInput, indices: number[], pick: "max" | "min"): MonthValue {
  let best: number | null = null;
  for (const i of indices) {
    const v = input.data[i];
    if (best === null || (pick === "max" ? v > input.data[best] : v < input.data[best])) best = i;
  }
  return best === null ? null : { value: input.data[best], label: monthLabel(input.months[best].year, input.months[best].month) };
}

function monthFigure(label: string, m: MonthValue, format: (v: number) => string): KpiFigure {
  return m ? { label, value: format(m.value), note: m.label } : { label, value: DASH };
}

/** The strip's figures for a tile; only complete months reach the mean, the highs and the lows. */
export function kpiFigures(input: KpiDetailInput, today = new Date()): KpiFigure[] {
  const done = completeIndices(input.months, today, input.start);
  const high = extreme(input, done, "max");
  const low = extreme(input, done, "min");
  const { format } = input;

  if (input.kind === "rate") {
    return [
      { label: "Taxa do período", value: format(input.value), note: "média das taxas mensais" },
      monthFigure("Melhor mês", high, format),
      monthFigure("Pior mês", low, format),
      { label: "Variação", value: trendOf(input.trend, "points")?.value ?? DASH, note: "vs mês anterior" },
    ];
  }
  if (input.kind === "days") {
    return [
      { label: "Média do período", value: format(input.value), note: "média dos meses" },
      monthFigure("Mês mais rápido", low, format),
      monthFigure("Mês mais lento", high, format),
    ];
  }

  const figures: KpiFigure[] = [
    { label: "Total do período", value: format(input.value) },
    {
      label: "Média mensal",
      value: done.length ? format(Math.round(mean(done.map((i) => input.data[i])))) : DASH,
      note: `${done.length} ${done.length === 1 ? "mês completo" : "meses completos"}`,
    },
    monthFigure("Mês mais alto", high, format),
    monthFigure("Mês mais baixo", low, format),
  ];
  if (input.share) figures.push({ label: input.share.label, value: `${pct(sum(input.data), sum(input.share.base))}%` });
  return figures;
}

/** Excel sheet: Mês, the value, then any extra columns, one row per month. */
export function kpiSheet(valueHeader: string, labels: string[], data: number[], extra: { header: string; values: Cell[] }[] = []): ExcelSheet {
  return {
    header: ["Mês", valueHeader, ...extra.map((c) => c.header)],
    rows: labels.map((label, i) => [label, data[i] ?? null, ...extra.map((c) => c.values[i] ?? null)]),
  };
}

const MONTH_NOTE: Record<KpiKind, string> = {
  count: "da média mensal e do mês mais alto e mais baixo",
  rate: "do melhor e pior mês",
  days: "do mês mais rápido e mais lento",
};

/** The tile's own sentences, then the note on incomplete months in the kind's wording. */
export function kpiDocs(kind: KpiKind, tile: string[]): string[] {
  return [
    ...tile,
    `O mês em curso e o primeiro mês, quando o período não começa no dia 1, estão incompletos: aparecem no gráfico, mas ficam fora ${MONTH_NOTE[kind]}; a tendência compara os dois últimos meses completos.`,
  ];
}
