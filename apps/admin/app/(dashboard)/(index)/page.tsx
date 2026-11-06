"use client";

import { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/design_system/components/ui/select";
import { lastDays, usageRegistry, type UsageFilters } from "@/lib/admin/usage";
import UsageKpis from "./reports/usage-kpis";
import ActiveUsersByMonth from "./reports/active-users-by-month";
import ByDashboard from "./reports/by-dashboard";
import TopUsers from "./reports/top-users";
import TopPages from "./reports/top-pages";
import PatientAccessLog from "./reports/patient-access";

const ALL = "all";
const PERIODS = [
  { days: 7, label: "Últimos 7 dias" },
  { days: 30, label: "Últimos 30 dias" },
  { days: 90, label: "Últimos 90 dias" },
  { days: 365, label: "Últimos 12 meses" },
];

export default function UsagePage() {
  const [days, setDays] = useState(30);
  const [dashboard, setDashboard] = useState(ALL);
  const registry = usageRegistry();

  // One stable object per choice, so the cards reload only when a filter changes.
  const filters = useMemo<UsageFilters>(
    () => ({
      range: lastDays(days),
      dashboard: dashboard === ALL ? undefined : dashboard,
      label: PERIODS.find((p) => p.days === days)?.label ?? "",
    }),
    [days, dashboard],
  );

  return (
    <div className="w-full @container">
      <div className="grid grid-cols-1 gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-semibold">Utilização dos dashboards</h1>
          <div className="flex flex-wrap gap-2">
            <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
              <SelectTrigger aria-label="Período" className="min-w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERIODS.map((p) => (
                  <SelectItem key={p.days} value={String(p.days)}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={dashboard} onValueChange={setDashboard}>
              <SelectTrigger aria-label="Dashboard" className="min-w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todos os dashboards</SelectItem>
                {registry.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <UsageKpis filters={filters} />

        <div className="grid grid-cols-1 gap-6 @[1024px]:grid-cols-5">
          <div className="flex min-w-0 @[1024px]:col-span-3">
            <ActiveUsersByMonth />
          </div>
          <div className="flex min-w-0 @[1024px]:col-span-2">
            <ByDashboard filters={filters} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 @[840px]:grid-cols-2">
          <div className="flex min-w-0"><TopUsers filters={filters} /></div>
          <div className="flex min-w-0"><TopPages filters={filters} /></div>
        </div>

        <PatientAccessLog filters={filters} />
      </div>
    </div>
  );
}
