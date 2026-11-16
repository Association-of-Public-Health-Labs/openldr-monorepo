import type { DateRange } from "@repo/design_system/lib/report/dates";
import type { ExcelSheet } from "@repo/design_system/lib/report/export/excel";
import { monitoringGet } from "@/lib/monitoring/api";
import type { HistoryRow } from "@/lib/monitoring/types";

export type StateFilter = "Todos" | "Pendentes" | "Completos";

const MAPUTO = new Intl.DateTimeFormat("pt-PT", {
  timeZone: "Africa/Maputo", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false,
});

/** An ISO instant as Maputo local time, "dd/MM/yyyy HH:mm"; "—" when absent. */
export function formatMaputo(iso: string | null): string {
  if (!iso) return "—";
  const ms = Date.parse(iso);
  return Number.isNaN(ms) ? "—" : MAPUTO.format(ms).replace(",", "");
}

export const fetchData = (code: string, status: StateFilter, range: DateRange) =>
  monitoringGet<{ rows: HistoryRow[] }>("/api/history", { code, status, startDate: range.start, endDate: range.end }).then((r) => r.rows ?? []);

export const HEADER = ["ID", "Estado", "Ficou offline", "Ficou online", "Tempo offline", "Criado em", "Actualizado"];

export function toExcel(rows: HistoryRow[]): ExcelSheet {
  return {
    header: HEADER,
    rows: rows.map((r) => [
      r.id, r.state, formatMaputo(r.wentOffline), formatMaputo(r.wentOnline), r.offlineDurationLabel, formatMaputo(r.createdAt), formatMaputo(r.updatedAt),
    ]),
  };
}
