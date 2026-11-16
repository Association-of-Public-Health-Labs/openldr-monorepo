"use client";

import { CardMessage } from "@repo/design_system/app/organisms/report/card-message";
import { Skeleton } from "@repo/design_system/components/ui/skeleton";
import { HostPicker } from "@/components/host-picker";
import { CATEGORY_LABELS } from "@/lib/monitoring/colors";
import type { Host, HostDetail } from "@/lib/monitoring/types";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="truncate font-semibold text-foreground">{value}</span>
    </div>
  );
}

/** The site's header: picker, name and status pill, then location, category, code and current state. */
export default function HostInfo({
  hosts, code, detail, loading, error, onRetry, onSelect,
}: {
  hosts: Host[]; code: string | null; detail: HostDetail | null; loading: boolean; error: string | null;
  onRetry: () => void; onSelect: (code: string) => void;
}) {
  const host = detail?.host;
  const online = host?.status === "Online";
  const state = !host ? "—" : online
    ? detail?.onlineSinceHours != null ? `Online há ${detail.onlineSinceHours} horas` : "Online"
    : "Offline";

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5" aria-label="Site">
      <HostPicker hosts={hosts} value={code} onSelect={onSelect} />
      {error ? (
        <CardMessage tone="error" message={error} onRetry={onRetry} />
      ) : loading || !host ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold text-foreground">{host.name ?? "—"}</h2>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${online ? "bg-success" : "bg-destructive"}`}>
              {online ? "Online" : "Offline"}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 @[560px]:grid-cols-2 @[900px]:grid-cols-4">
            <Field label="Localização" value={`${host.ProvinceName || "—"} • ${host.DistrictName || "—"}`} />
            <Field label="Categoria" value={host.type ? CATEGORY_LABELS[host.type] : "—"} />
            <Field label="Código do site" value={host.code ?? "—"} />
            <Field label="Estado" value={state} />
          </div>
        </>
      )}
    </section>
  );
}
