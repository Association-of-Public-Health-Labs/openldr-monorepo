/** Suppression rate and colour bands for the suppression map (see the map spec §4.2). */
export type SuppressionCounts = { suppressed: number; not_suppressed: number };

export type SuppressionBand = { id: "low" | "mid" | "good" | "target" | "none"; label: string; color: string };

const TARGET: SuppressionBand = { id: "target", label: "Meta (≥95%)", color: "#00B000" };
const GOOD: SuppressionBand = { id: "good", label: "Boa (90–94%)", color: "#77ED8B" };
const MID: SuppressionBand = { id: "mid", label: "Média (80–89%)", color: "#FFAB00" };
const LOW: SuppressionBand = { id: "low", label: "Baixa (<80%)", color: "#EF5350" };
export const NO_DATA: SuppressionBand = { id: "none", label: "Sem dados", color: "#C4CDD5" };

/** Legend order. */
export const SUPPRESSION_BANDS: SuppressionBand[] = [TARGET, GOOD, MID, LOW, NO_DATA];

export function suppressionRate(row: SuppressionCounts | undefined): number | null {
  if (!row) return null;
  const withResult = row.suppressed + row.not_suppressed;
  return withResult > 0 ? (100 * row.suppressed) / withResult : null;
}

/** Band from the unrounded rate. */
export function suppressionBand(rate: number | null): SuppressionBand {
  if (rate === null) return NO_DATA;
  if (rate >= 95) return TARGET;
  if (rate >= 90) return GOOD;
  if (rate >= 80) return MID;
  return LOW;
}

export const formatRate = (rate: number | null): string => (rate === null ? "—" : `${rate.toFixed(1)}%`);
