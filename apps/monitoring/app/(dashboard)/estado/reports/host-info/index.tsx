"use client";

import { useEffect, useState } from "react";
import { CardMessage } from "@repo/design_system/app/organisms/report/card-message";
import { Skeleton } from "@repo/design_system/components/ui/skeleton";
import { HostPicker } from "@/components/host-picker";
import { CATEGORY_LABELS } from "@/lib/monitoring/colors";
import { checkedLabel, locationLabel, onlineSinceLabel } from "@/lib/monitoring/host-labels";
import type { Host, HostDetail } from "@/lib/monitoring/types";

/** How often "verificado há N min" is recounted while the page stays open. */
const TICK_MS = 30_000;

function useNow(everyMs: number) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), everyMs);
    return () => clearInterval(id);
  }, [everyMs]);
  return now;
}

/**
 * The site's header, drawn like the "Estado dos sites" cards on Sumário: name, code, location and
 * category on top with the site picker beside them, then a band with the status written out, when it
 * was last checked and the 12-month availability. Only an offline site's band is tinted.
 */
export default function HostInfo({
  hosts, code, detail, loading, error, onRetry, onSelect,
}: {
  hosts: Host[]; code: string | null; detail: HostDetail | null; loading: boolean; error: string | null;
  onRetry: () => void; onSelect: (code: string) => void;
}) {
  const now = useNow(TICK_MS);
  const host = !error && !loading ? detail?.host : undefined;
  const online = host?.status === "Online";
  const checked = host ? checkedLabel(host.updated_at, now) : undefined;
  const uptime = detail ? Math.max(0, Math.min(100, detail.uptimePct)) : 0;

  return (
    <section className="@container overflow-hidden rounded-2xl border border-border bg-card" aria-label="Site">
      <div className="flex flex-wrap items-start justify-between gap-x-5 gap-y-3.5 px-5 pb-4 pt-5">
        <div className="min-w-0 flex-[1_1_16rem]">
          {error ? (
            <CardMessage tone="error" message={error} onRetry={onRetry} />
          ) : loading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-7 w-56" />
              <Skeleton className="h-4 w-44" />
            </div>
          ) : !host ? (
            <p className="py-1 text-sm text-muted-foreground">Escolha um site na lista ao lado.</p>
          ) : (
            <>
              <div className="flex min-w-0 items-baseline gap-2.5">
                <h2 className="truncate text-xl font-bold tracking-tight text-foreground">{host.name ?? "—"}</h2>
                {host.code && (
                  <span className="shrink-0 font-mono text-xs font-semibold tracking-wide text-muted-foreground">{host.code}</span>
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <span className="text-[13px] text-muted-foreground">{locationLabel(host)}</span>
                {host.type && (
                  <span className="rounded-md bg-muted px-1.5 py-px text-[11.5px] font-semibold text-muted-foreground">
                    {CATEGORY_LABELS[host.type]}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
        <HostPicker
          hosts={hosts}
          value={code}
          onSelect={onSelect}
          label="Trocar de site"
          className="w-full @[420px]:w-56"
        />
      </div>

      {host && detail && (
        <div
          className={`flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t px-5 py-2.5 text-[13px] ${
            online ? "border-border/60" : "border-destructive/25 bg-destructive/[0.07]"
          }`}
        >
          <p className={`inline-flex flex-wrap items-center gap-x-2 text-sm font-bold ${online ? "text-success" : "text-destructive"}`}>
            <span aria-hidden className="size-2 rounded-full bg-current" />
            {online ? onlineSinceLabel(detail.onlineSinceHours) : "Offline"}
            {checked && <span className="text-[13px] font-normal text-muted-foreground">· {checked}</span>}
          </p>
          <p className="inline-flex items-center gap-2.5 text-muted-foreground">
            <span>
              Disponibilidade <span className="hidden @[480px]:inline">12 meses</span>
              <span className="@[480px]:hidden">· 12 m</span>
            </span>
            <span aria-hidden className="h-1.5 w-[70px] overflow-hidden rounded-full bg-destructive/10 @[480px]:w-[120px]">
              <span className="block h-full rounded-full bg-success" style={{ width: `${uptime}%` }} />
            </span>
            <span className="font-semibold tabular-nums text-foreground">{Math.round(uptime)}%</span>
          </p>
        </div>
      )}
    </section>
  );
}
