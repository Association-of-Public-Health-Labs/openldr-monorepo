import type { Host } from "./types";

/**
 * DisaStatus stores its times 2 h behind the real moment: hosts' `updated_at` and the outage
 * records' `start_date` / `end_date` / `updated_at` alike (checked against the poller, 2026-11-19).
 */
export const STORED_TIME_LAG_MS = 2 * 3_600_000;

/** The real moment (epoch ms) of a time read from DisaStatus, or NaN when missing or invalid. */
export function realTime(stored: string | null | undefined): number {
  const t = stored ? Date.parse(stored) : NaN;
  return Number.isNaN(t) ? NaN : t + STORED_TIME_LAG_MS;
}

/** When the poller last checked the site: "verificado há 3 min", "… há 5 h", "… há 23 dias". */
export function checkedLabel(updatedAt: string | null, now: Date = new Date()): string | undefined {
  const t = realTime(updatedAt);
  if (Number.isNaN(t)) return undefined;
  const min = Math.max(0, Math.floor((now.getTime() - t) / 60_000));
  if (min < 1) return "verificado agora";
  if (min < 60) return `verificado há ${min} min`;
  if (min < 48 * 60) return `verificado há ${Math.round(min / 60)} h`;
  return `verificado há ${Math.round(min / 1440)} dias`;
}

/** "Online há 14 h" / "Online há 3 dias" from the hours since the last outage ended. */
export function onlineSinceLabel(hours: number | null): string {
  if (hours == null) return "Online";
  if (hours < 1) return "Online há menos de 1 h";
  if (hours < 48) return `Online há ${hours} h`;
  return `Online há ${Math.round(hours / 24)} dias`;
}

/** "Província · Distrito" (spelling variants such as "Maputo-Cidade" tidied). */
export function locationLabel(h: Pick<Host, "ProvinceName" | "DistrictName">): string {
  const province = (h.ProvinceName ?? "").replace(/-/g, " ").trim() || "Sem província";
  return `${province} · ${h.DistrictName?.trim() || "—"}`;
}
