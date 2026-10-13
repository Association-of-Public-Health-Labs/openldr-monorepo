export type AgeRange = [number, number];

export const DEFAULT_AGE_RANGE: AgeRange = [15, 49];

export function parseAgeRange(min: string, max: string): AgeRange | string {
  const a = min.trim();
  const b = max.trim();
  if (a === "" || b === "" || !Number.isInteger(Number(a)) || !Number.isInteger(Number(b))) {
    return "Indique idades inteiras.";
  }
  const lo = Number(a);
  const hi = Number(b);
  if (lo < 0 || hi > 120) return "As idades devem estar entre 0 e 120.";
  if (lo > hi) return "A idade inicial não pode ser maior que a final.";
  return [lo, hi];
}

export const ageRangeParam = (range: AgeRange): string => `${range[0]},${range[1]}`;
