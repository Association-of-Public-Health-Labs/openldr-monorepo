"use client";

import { useMemo, type ReactNode } from "react";
import { Info, MapPin } from "lucide-react";
import { StatusBadge } from "@repo/design_system/app/atoms/badges/StatusBadge";
import { DistributionBar } from "@repo/design_system/app/atoms/progress/DistributionBar";
import { TargetProgress } from "@repo/design_system/app/atoms/progress/TargetProgress";
import { WeeklyTrend } from "@repo/design_system/app/molecules/charts/WeeklyTrend";
import { OVERLINE } from "@repo/design_system/app/molecules/metrics/SummaryStrip";
import { SortableTable, type SortableColumn } from "@repo/design_system/app/molecules/tables/SortableTable";
import { formatNumber } from "@repo/design_system/lib/format-number";
import type { Week, WeekRange } from "@repo/design_system/lib/weeks";
import { cn } from "@repo/design_system/lib/utils";
import { ReportCard } from "@repo/design_system/app/organisms/report/report-card";
import { NATIONAL, type TatUnit, type TransportView } from "@/lib/vl/transport/data";
import { classify, classMeta, severity, TARGET, TARGET_DAYS, totalOf, withinTarget } from "@repo/design_system/lib/report/tat";
import { CHILD_LABEL, formatShare, toExcel, toSegments } from "../actions";
import { DETAIL_CARD_ID, LABELS, PROVINCE_LABELS } from "../constants";
import Docs from "../docs";

function Section({ title, aside, children }: { title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 border-t border-dashed border-[rgba(145,158,171,0.2)] pt-4 first:border-t-0 first:pt-0">
      <div className="flex items-baseline justify-between gap-2">
        <h4 className={OVERLINE}>{title}</h4>
        {aside && <span className="text-[11px] text-[#919EAB]">{aside}</span>}
      </div>
      {children}
    </section>
  );
}

// Share within target, coloured against it: green on target, red when under half.
function ShareCell({ share }: { share: number | null }) {
  return (
    <span
      className={cn(
        "font-semibold",
        share === null && "text-[#919EAB]",
        share !== null && share >= TARGET && "text-[#118D57] dark:text-[#77ED8B]",
        share !== null && share < 0.5 && "text-[#B71D18] dark:text-[#FFAC82]",
      )}
    >
      {formatShare(share)}
    </span>
  );
}

function Empty() {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 px-6 text-center">
      <span aria-hidden className="flex size-12 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] text-[var(--primary)]">
        <MapPin className="size-5" />
      </span>
      <p className="text-base font-bold text-[#1C252E] dark:text-white">{LABELS.SELECT_TITLE}</p>
      <p className="max-w-[260px] text-sm text-[#637381] dark:text-[#919EAB]">{LABELS.SELECT_TEXT}</p>
    </div>
  );
}

export type TransportDetailProps = {
  view: TransportView | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  province: string | null;
  district: string | null;
  weeks: Week[];
  range: WeekRange;
  period: string;
};

/** The open province or district: its class, share within target, distribution, weekly trend and areas. */
export function TransportDetail({ view, loading, error, onRetry, province, district, weeks, range, period }: TransportDetailProps) {
  const provinceLabel = province ? PROVINCE_LABELS[province] ?? province : "";
  const title = district ?? (provinceLabel || "Detalhe");
  const path = district ? `${provinceLabel} · ${NATIONAL}` : province ? NATIONAL : "";

  const level = view?.childLevel ?? "district";
  const columns = useMemo<SortableColumn<TatUnit>[]>(
    () => [
      { key: "name", header: CHILD_LABEL[level].one, cell: (u) => u.name, sortValue: (u) => u.name, className: "min-w-[120px]" },
      {
        key: "class",
        header: "Classe TAT",
        cell: (u) => {
          const meta = classMeta(classify(u.counts));
          return <StatusBadge label={meta.label} color={meta.color} />;
        },
        sortValue: (u) => severity(u.counts),
      },
      { key: "share", header: `% <${TARGET_DAYS}`, align: "right", cell: (u) => <ShareCell share={withinTarget(u.counts)} />, sortValue: (u) => withinTarget(u.counts) ?? -1 },
      { key: "total", header: "Amostras", align: "right", cell: (u) => formatNumber(totalOf(u.counts)), sortValue: (u) => totalOf(u.counts) },
    ],
    [level],
  );

  const weekly = useMemo(() => view?.weekly ?? [], [view]);
  const trend = useMemo(
    () => ({
      values: weekly.map((c) => {
        const s = withinTarget(c);
        return s === null ? null : Math.round(s * 1000) / 10;
      }),
      colors: weekly.map((c) => classMeta(classify(c)).color),
      classes: weekly.map((c) => classMeta(classify(c)).label),
    }),
    [weekly],
  );

  return (
    <ReportCard
      title={title}
      subtitle={path ? `${path} · ${period}` : period}
      cardId={DETAIL_CARD_ID}
      loading={loading}
      error={error}
      empty={false}
      onRetry={onRetry}
      excel={() => (view ? toExcel(view.area, view.children, view.childLevel) : { header: [], rows: [] })}
      documentation={<Docs />}
    >
      {!province || !view ? (
        <Empty />
      ) : (
        <div className="flex flex-col gap-4">
          <Section title={`% de amostras transportadas em <${TARGET_DAYS} dias`}>
            {(() => {
              const meta = classMeta(classify(view.area.counts));
              const share = withinTarget(view.area.counts);
              const total = totalOf(view.area.counts);
              return (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="flex items-baseline gap-2">
                      <span className="text-[32px] leading-10 font-bold text-[#1C252E] tabular-nums dark:text-white">{formatShare(share)}</span>
                      <span className="text-sm text-[#637381] dark:text-[#919EAB]">alvo {Math.round(TARGET * 100)}%</span>
                    </span>
                    <StatusBadge label={meta.label} color={meta.color} size="md" />
                  </div>
                  <TargetProgress value={share} target={TARGET} size="md" />
                  <p className="text-[13px] text-[#637381] dark:text-[#919EAB]">
                    Total de <b className="text-[#1C252E] tabular-nums dark:text-white">{formatNumber(total)}</b> amostras no período ·{" "}
                    <b className="text-[#1C252E] tabular-nums dark:text-white">{formatNumber(view.area.counts[0] + view.area.counts[1])}</b> dentro do alvo
                  </p>
                </>
              );
            })()}
          </Section>

          <Section title="Distribuição por intervalo (dias)">
            <DistributionBar segments={toSegments(view.area.counts)} />
            <p className="flex items-center gap-2 rounded-lg bg-[rgba(145,158,171,0.08)] px-3 py-2 text-[13px] text-[#637381] dark:text-[#919EAB]">
              <Info aria-hidden className="size-4 shrink-0" />
              Amostras sem data de recepção no laboratório: <b className="text-[#1C252E] tabular-nums dark:text-white">{formatNumber(view.area.noReceptionDate)}</b>
            </p>
          </Section>

          <Section title="Evolução semanal" aside={`% <${TARGET_DAYS} dias · ${weeks.length} semanas`}>
            <WeeklyTrend
              id={`${DETAIL_CARD_ID}-trend`}
              labels={weeks.map((w) => w.label)}
              values={trend.values}
              target={Math.round(TARGET * 100)}
              selected={range}
              detail={(i) => `${formatNumber(totalOf(weekly[i] ?? [0, 0, 0, 0]))} amostras`}
              classColors={trend.colors}
              classLabels={trend.classes}
              // Apex derives its gradient from the colour, so a hex value, not a CSS variable (the VL green).
              color="#00B000"
              height={150}
            />
          </Section>

          <Section title={`${CHILD_LABEL[level].many} · pior desempenho primeiro`}>
            <SortableTable
              id={`${DETAIL_CARD_ID}-table`}
              label={`${CHILD_LABEL[level].many}: ${title}`}
              columns={columns}
              rows={view.children}
              rowKey={(u) => u.name}
              defaultSort={{ key: "class", direction: "desc" }}
              search={view.children.length > 8 ? { placeholder: `Procurar ${CHILD_LABEL[level].one.toLowerCase()}`, text: (u) => u.name } : undefined}
              loading={loading}
              emptyMessage="Sem dados no período."
              maxHeight={360}
            />
          </Section>
        </div>
      )}
    </ReportCard>
  );
}
