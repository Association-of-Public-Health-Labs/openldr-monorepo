"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HostStatusChip } from "@repo/design_system/app/molecules/cards/HostStatusChip";
import { SegmentedSwitch } from "@repo/design_system/app/molecules/tabs/SegmentedSwitch";
import { Button } from "@repo/design_system/components/ui/button";
import { ReportCard } from "@repo/design_system/app/organisms/report/report-card";
import { useReport } from "@repo/design_system/hooks/report/use-report";
import { CARD_ID, DEFAULT_TAB, PAGE_SIZE, REFRESH_MS, TABS, TITLE } from "./constants";
import { checkedLabel, fetchData, hostsForTab, locationLabel, toExcel, type Tab } from "./actions";
import type { Host } from "@/lib/monitoring/types";
import Docs from "./docs";

export default function HostsStatusGrid() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(DEFAULT_TAB);
  const [showAll, setShowAll] = useState(false);
  const { data, loading, error, retry } = useReport(() => fetchData(), []);
  const [latest, setLatest] = useState<Host[] | null>(null);

  // Statuses must be current: reload quietly (no loading state) while the tab is visible, and as
  // soon as it becomes visible again. A failed reload keeps the last list on screen.
  useEffect(() => {
    setLatest(null); // a new initial load (retry) supersedes earlier reloads
    if (!data) return;
    let alive = true;
    const reload = () => {
      if (document.visibilityState !== "visible") return;
      fetchData()
        .then((hosts) => alive && setLatest(hosts))
        .catch(() => {});
    };
    const timer = setInterval(reload, REFRESH_MS);
    document.addEventListener("visibilitychange", reload);
    return () => {
      alive = false;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", reload);
    };
  }, [data]);

  const hosts = latest ?? data ?? [];
  const all = hostsForTab(hosts, tab, null);
  const shown = showAll ? all : all.slice(0, PAGE_SIZE);
  const offline = all.filter((h) => h.status === "Offline").length;
  const now = new Date();
  const groups = [
    { label: "Offline agora", count: offline, hosts: shown.filter((h) => h.status !== "Online") },
    { label: "Online", count: all.length - offline, hosts: shown.filter((h) => h.status === "Online") },
  ].filter((g) => g.hosts.length > 0);
  const tabLabel = TABS.find((t) => t.value === tab)?.label ?? "";

  return (
    <ReportCard
      title={TITLE}
      subtitle={`${tabLabel}: ${offline} de ${all.length} sites offline agora`}
      exportSubtitle={`Categoria: ${tabLabel}`}
      cardId={CARD_ID}
      loading={loading}
      error={error}
      empty={!loading && !error && all.length === 0}
      onRetry={retry}
      onRestart={() => {
        setTab(DEFAULT_TAB);
        setShowAll(false);
      }}
      excel={() => toExcel(all)}
      documentation={<Docs />}
      controls={
        <SegmentedSwitch<Tab>
          items={TABS}
          value={tab}
          onChange={(v) => {
            setTab(v);
            setShowAll(false);
          }}
          rootClassName="w-full"
          className="mx-4 ml-auto"
        />
      }
    >
      <div className="flex flex-col gap-4 px-1 pb-1">
        {/* How much of the category is offline now, at a glance. */}
        <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1">
          <div
            role="img"
            aria-label={`${offline} de ${all.length} sites offline`}
            className="h-2 min-w-[180px] flex-1 overflow-hidden rounded-full bg-success/10"
          >
            <div className="h-full rounded-full bg-destructive" style={{ width: `${all.length ? (offline / all.length) * 100 : 0}%` }} />
          </div>
          <span className="whitespace-nowrap text-[13px] font-semibold text-muted-foreground">
            <span className="text-destructive">{offline}</span> offline · {all.length - offline} online
          </span>
        </div>
        {groups.map((g) => (
          <section key={g.label} className="flex flex-col gap-2">
            <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground after:h-px after:flex-1 after:bg-border">
              {g.label} · {g.count}
            </h3>
            <div className="grid grid-cols-1 gap-2.5 @[560px]:grid-cols-2 @[860px]:grid-cols-3 @[1100px]:grid-cols-4">
              {g.hosts.map((h) => (
                <HostStatusChip
                  key={h.id}
                  name={h.name || "—"}
                  code={h.code || "—"}
                  location={locationLabel(h)}
                  online={h.status === "Online"}
                  checked={checkedLabel(h.updated_at, now)}
                  onClick={h.code ? () => router.push(`/estado?code=${encodeURIComponent(h.code as string)}`) : undefined}
                />
              ))}
            </div>
          </section>
        ))}
        {all.length > PAGE_SIZE && (
          <Button variant="outline" className="self-center" onClick={() => setShowAll((v) => !v)}>
            {showAll ? "Mostrar menos" : `Ver todos (${all.length})`}
          </Button>
        )}
      </div>
    </ReportCard>
  );
}
