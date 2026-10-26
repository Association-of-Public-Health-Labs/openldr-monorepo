export const num = (value: number | null | undefined): number =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

export const sum = (values: (number | null | undefined)[]): number => values.reduce<number>((acc, v) => acc + num(v), 0);

export const mean = (values: (number | null | undefined)[]): number => (values.length ? sum(values) / values.length : 0);

/** round(part / total × 100), 0 when total is 0 or missing. */
export const pct = (part: number | null | undefined, total: number | null | undefined): number =>
  num(total) > 0 ? Math.round((num(part) / num(total)) * 100) : 0;
