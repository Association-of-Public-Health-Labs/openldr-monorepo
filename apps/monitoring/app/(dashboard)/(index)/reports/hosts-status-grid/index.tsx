"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HostStatusChip } from "@repo/design_system/app/molecules/cards/HostStatusChip";
import { SegmentedSwitch } from "@repo/design_system/app/molecules/tabs/SegmentedSwitch";
import { Button } from "@repo/design_system/components/ui/button";
import { ReportCard } from "@repo/design_system/app/organisms/report/report-card";
import { useReport } from "@repo/design_system/hooks/report/use-report";
import { CATEGORY_LABELS } from "@/lib/monitoring/colors";
import { CARD_ID, DEFAULT_TAB, PAGE_SIZE, TABS, TITLE } from "./constants";
import { fetchData, hostsForTab, toExcel, type Tab } from "./actions";
import Docs from "./docs";

export default function HostsStatusGrid() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(DEFAULT_TAB);
  const [showAll, setShowAll] = useState(false);
  const { data, loading, error, retry } = useReport(() => fetchData(), []);

  const hosts = data ?? [];
  const all = hostsForTab(hosts, tab, null);
  const shown = showAll ? all : all.slice(0, PAGE_SIZE);
  const offline = all.filter((h) => h.status === "Offline").length;
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
        <div className="grid grid-cols-1 gap-3 @[560px]:grid-cols-2 @[860px]:grid-cols-3 @[1100px]:grid-cols-4">
          {shown.map((h) => (
            <HostStatusChip
              key={h.id}
              code={h.code || "—"}
              name={h.name || "—"}
              category={h.type ? CATEGORY_LABELS[h.type] : ""}
              online={h.status === "Online"}
              onClick={h.code ? () => router.push(`/estado?code=${encodeURIComponent(h.code as string)}`) : undefined}
            />
          ))}
        </div>
        {all.length > PAGE_SIZE && (
          <Button variant="outline" className="self-center" onClick={() => setShowAll((v) => !v)}>
            {showAll ? "Mostrar menos" : `Ver todos (${all.length})`}
          </Button>
        )}
      </div>
    </ReportCard>
  );
}
