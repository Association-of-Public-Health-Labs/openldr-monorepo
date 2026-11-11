import type { DashboardInfo } from "../../../dashboards";

/** Colours for the dark sign-in card, derived from a portal's primary colour. */
export interface SignInTheme {
  accent: string;
  accentForeground: string;
  bg: string;
  field: string;
  line: string;
  muted: string;
  ring: string;
  tint: string;
}

const BASE = "#0b0f0e";
const WHITE = "#ffffff";

function parseHex(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) throw new Error(`Invalid hex colour: ${hex}`);
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as [number, number, number];
}

function toHex([r, g, b]: [number, number, number]): string {
  return "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
}

/** Mix `amount` (0..1) of colour `a` into colour `b`. */
export function mix(a: string, b: string, amount: number): string {
  const ca = parseHex(a);
  const cb = parseHex(b);
  return toHex([0, 1, 2].map((i) => ca[i] * amount + cb[i] * (1 - amount)) as [number, number, number]);
}

export function rgba(hex: string, alpha: number): string {
  const [r, g, b] = parseHex(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function signInTheme(portal: Pick<DashboardInfo, "primary" | "primaryForeground">): SignInTheme {
  const p = portal.primary;
  return {
    accent: p,
    accentForeground: portal.primaryForeground,
    bg: mix(p, BASE, 0.1),
    field: mix(p, BASE, 0.16),
    line: mix(p, BASE, 0.28),
    muted: mix(p, mix(WHITE, BASE, 0.7), 0.18),
    ring: rgba(p, 0.28),
    tint: `linear-gradient(90deg, ${rgba(mix(p, "#000000", 0.25), 0.08)} 0%, ${rgba(mix(p, "#000000", 0.2), 0.38)} 100%)`,
  };
}
