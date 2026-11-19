import { monitoringGet } from "@/lib/monitoring/api";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/monitoring/colors";
import type { ConnectivityTrend, HostType, NationalSummary } from "@/lib/monitoring/types";
import { PERIOD } from "./constants";

export type TileId = HostType | "all";

export type Tile = {
  id: TileId;
  title: string;
  /** Offline share of working hours over the period, e.g. "12%". */
  value: string;
  subtitle: string;
  color: string;
  /** Monthly connectivity (uptime %), empty when the trend is unavailable. */
  labels: string[];
  data: number[];
};

const ORDER: TileId[] = ["all", "Disalab", "Disapoc", "Disalink"];
const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

/** "2026-03" → "Mar 2026"; anything else unchanged. */
export function monthLabel(yyyyMm: string): string {
  const m = /^(\d{4})-(\d{2})$/.exec(yyyyMm);
  const month = m ? MONTHS[Number(m[2]) - 1] : undefined;
  return m && month ? `${month} ${m[1]}` : yyyyMm;
}

export function toTiles(summary: NationalSummary, trend: ConnectivityTrend | null): Tile[] {
  return ORDER.flatMap((id) => {
    const c = summary.categories.find((x) => x.type === id);
    if (!c) return [];
    return [{
      id,
      title: CATEGORY_LABELS[id],
      value: `${c.downtimePct}%`,
      subtitle: `Tempo offline nos ${PERIOD.toLowerCase()} · ${c.offline}/${c.total} offline agora`,
      color: CATEGORY_COLORS[id],
      labels: trend ? trend.labels.map(monthLabel) : [],
      data: trend ? trend.series[id] ?? [] : [],
    }];
  });
}

export const fetchSummary = () => monitoringGet<NationalSummary>("/api/summary");

/** The trend is slow upstream and only adds the bars: a failure is "no trend", never a card error. */
export const fetchTrend = () => monitoringGet<ConnectivityTrend>("/api/connectivity-trend").catch(() => null);
