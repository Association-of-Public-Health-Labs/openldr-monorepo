import type { ExcelSheet } from "@repo/design_system/lib/report/export/excel";
import { monitoringGet } from "@/lib/monitoring/api";
import { CATEGORY_LABELS } from "@/lib/monitoring/colors";
import type { Host, HostType } from "@/lib/monitoring/types";

export { checkedLabel, locationLabel } from "@/lib/monitoring/host-labels";

export type Tab = HostType | "all";

const collator = new Intl.Collator("pt", { sensitivity: "base" });

/** The tab's hosts, offline first then by name; `limit` null shows them all. */
export function hostsForTab(hosts: Host[], tab: Tab, limit: number | null): Host[] {
  const shown = (tab === "all" ? hosts : hosts.filter((h) => h.type === tab)).slice().sort((a, b) => {
    const off = Number(b.status === "Offline") - Number(a.status === "Offline");
    return off || collator.compare(a.name ?? "", b.name ?? "");
  });
  return limit === null ? shown : shown.slice(0, limit);
}

export function toExcel(hosts: Host[]): ExcelSheet {
  return {
    header: ["Código", "Nome", "Categoria", "Província", "Distrito", "Estado"],
    rows: hosts.map((h) => [
      h.code ?? "", h.name ?? "", h.type ? CATEGORY_LABELS[h.type] : "", h.ProvinceName ?? "", h.DistrictName ?? "", h.status ?? "",
    ]),
  };
}

export const fetchData = () => monitoringGet<{ hosts: Host[] }>("/api/sites").then((r) => r.hosts ?? []);
