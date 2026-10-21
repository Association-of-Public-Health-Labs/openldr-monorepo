/**
 * Transport turnaround (collection → reception at the laboratory) in four day intervals, as in the
 * EID "Monitoria de Transporte" mockup. Pure rules; the data comes from ./data.
 */

/** Samples per interval: <7, 7–15, 16–21, >21 days. */
export type TatCounts = [number, number, number, number];

export type TatClass = { id: "best" | "good" | "warn" | "bad"; label: string; color: string; ink: string; withinTarget: boolean };

// Colours from the mockup's TAT ramp; `ink` is the text colour on each.
export const TAT_CLASSES: TatClass[] = [
  { id: "best", label: "<7 dias", color: "#1B7837", ink: "#FFFFFF", withinTarget: true },
  { id: "good", label: "7-15 dias", color: "#7FBF7B", ink: "#0A2A12", withinTarget: true },
  { id: "warn", label: "16-21 dias", color: "#F4A259", ink: "#3A1D00", withinTarget: false },
  { id: "bad", label: ">21 dias", color: "#C1272D", ink: "#FFFFFF", withinTarget: false },
];

export const TAT_NO_DATA = { label: "Sem dados", color: "#C4CDD5", ink: "#454F5B" };

/** Share of samples transported in under 15 days that the programme aims for. */
export const TARGET = 0.9;
export const TARGET_DAYS = 15;

export const EMPTY: TatCounts = [0, 0, 0, 0];

export const totalOf = (c: TatCounts) => c[0] + c[1] + c[2] + c[3];

/** Share transported in under 15 days (<7 and 7–15), or null without samples. */
export function withinTarget(c: TatCounts): number | null {
  const total = totalOf(c);
  return total ? (c[0] + c[1]) / total : null;
}

/**
 * The area's class: its predominant interval, a tie going to the worse one (as the mockup);
 * -1 without samples.
 */
export function classify(c: TatCounts): number {
  if (totalOf(c) === 0) return -1;
  let best = 0;
  for (let i = 1; i < 4; i++) if (c[i] >= c[best]) best = i;
  return best;
}

export const classMeta = (index: number) => (index < 0 ? TAT_NO_DATA : TAT_CLASSES[index]);

/** Off target: most samples took more than 15 days (16–21 or >21). */
export const offTarget = (c: TatCounts) => classify(c) >= 2;

export function addCounts(a: TatCounts, b: TatCounts): TatCounts {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2], a[3] + b[3]];
}

/** Overall state of an area, from its class: Estável (≤15 days), Atenção (16–21), Crítico (>21). */
export function statusOf(c: TatCounts): { label: string; color: string } {
  const index = classify(c);
  if (index < 0) return { label: "Sem dados", color: TAT_NO_DATA.color };
  if (index <= 1) return { label: "Estável", color: TAT_CLASSES[0].color };
  if (index === 2) return { label: "Atenção", color: TAT_CLASSES[2].color };
  return { label: "Crítico", color: TAT_CLASSES[3].color };
}

/** Worst first: by class (worse first), then by the share within target (lower first); no data last. */
export const severity = (c: TatCounts) => {
  const index = classify(c);
  return index < 0 ? -1 : index * 1000 + (1 - (withinTarget(c) ?? 0)) * 100;
};
