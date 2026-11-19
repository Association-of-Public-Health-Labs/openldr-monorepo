export type HostType = "Disalab" | "Disalink" | "Disapoc";
export type HostStatus = "Online" | "Offline";
export interface DateRangeStr { startDate: string; endDate: string } // YYYY-MM-DD

export interface Host {
  id: number; code: string | null; name: string | null; alias: string | null;
  teamviewer_id: string; category: string | null; group_id: string | null;
  type: HostType | null; status: HostStatus | null;
  created_at: string; updated_at: string;
  ProvinceName: string | null; DistrictName: string | null;
}
export interface ConnectivityLog {
  id: string; code: string | null; name: string | null; teamviewer_id: string | null;
  start_date: string | null; end_date: string | null; status: string | null;
  created_at: string; updated_at: string;
  host?: { id: number; code: string | null; name: string | null; type: HostType | null; status: HostStatus | null };
}
export interface GroupedStat { province?: string; district?: string; healthFacility?: string; amount_of_time: number }

export interface CategorySummary {
  type: HostType | "all"; label: string;
  total: number; offline: number; online: number;
  downtimePct: number; trend: number[];
}
export interface NationalSummary { categories: CategorySummary[]; uptimePct: number; downtimePct: number }
export interface ConnectivityTrend {
  labels: string[];
  series: { all: number[]; Disalab: number[]; Disapoc: number[]; Disalink: number[] };
}
export interface RegionConnectivity { name: string; code?: string; uptimePct: number; hostCount: number }
export interface HeatmapCell { date: string; uptime: number }
export interface HostDetail {
  host: Host; uptimePct: number; downtimePct: number;
  onlineSinceHours: number | null; heatmap: HeatmapCell[];
}
export interface HistoryRow {
  id: string; state: "Pendente" | "Completo";
  wentOffline: string | null; wentOnline: string | null;
  offlineDurationMs: number | null; offlineDurationLabel: string;
  createdAt: string; updatedAt: string;
}
