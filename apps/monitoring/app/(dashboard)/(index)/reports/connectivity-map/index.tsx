"use client";

import { useCallback, useMemo, useState } from "react";
import { InteractiveSvgMap } from "@repo/design_system/app/atoms/maps/InteractiveSvgMap";
import { PROVINCE_MAPS } from "@repo/design_system/app/atoms/maps/province-maps";
import { DrillBreadcrumb } from "@repo/design_system/app/molecules/maps/DrillBreadcrumb";
import { MapHint } from "@repo/design_system/app/molecules/maps/MapHint";
import { ReportCard } from "@repo/design_system/app/organisms/report/report-card";
import { useReport } from "@repo/design_system/hooks/report/use-report";
import { PROVINCE_LABELS } from "@repo/design_system/lib/report/districts";
import { MONITORING_PRIMARY } from "@/lib/monitoring/colors";
import { CARD_ID, LABELS, NO_DATA_COLOR, TITLE } from "./constants";
import { districtRowFor, fetchData, provinceRowFor, toDistrictColors, toExcel, toProvinceColors, type Row } from "./actions";
import { ConnectivityLegend } from "./connectivity-legend";
import Docs from "./docs";

const PERIOD = "Últimos 12 meses";

// Laid out as the Minimals chart tooltip: grey title bar, then label: value rows.
function Tooltip({ name, row }: { name: string; row: Row | undefined }) {
  const rows: [string, string][] = row
    ? [["Conectividade", `${row.uptimePct}%`], ["Sites", String(row.hostCount)]]
    : [["Conectividade", "sem sites"]];
  return (
    <div className="pb-1 text-xs leading-[18px]">
      <div className="minimals-popover-title">{name}</div>
      {rows.map(([label, value], i) => (
        <div key={label} className="flex items-center gap-2 px-3 py-1">
          {i === 0 && <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: row ? MONITORING_PRIMARY : NO_DATA_COLOR }} />}
          <span>{label}:</span>
          <span className="font-semibold">{value}</span>
        </div>
      ))}
    </div>
  );
}

export default function ConnectivityMap() {
  const [province, setProvince] = useState<string | null>(null);
  const national = useReport(() => fetchData(null), []);
  const drill = useReport(() => (province ? fetchData(province) : Promise.resolve(null)), [province]);

  const provinceRows = useMemo(() => national.data?.rows ?? [], [national.data]);
  // While another province loads, the previous one's rows are still in `drill.data`; never draw them here.
  const districtRows = useMemo(
    () => (drill.data && drill.data.province === province ? drill.data.rows : []),
    [drill.data, province],
  );
  const ProvinceMap = province ? PROVINCE_MAPS[province] : undefined;

  // Stable props: the province map re-injects its SVG whenever one changes (see EID's map card).
  const provinceColors = useMemo(() => toProvinceColors(provinceRows), [provinceRows]);
  const districtColors = useMemo(() => (province ? toDistrictColors(province, districtRows) : null), [province, districtRows]);
  const provincePopover = useCallback((name: string) => <Tooltip name={name} row={provinceRowFor(provinceRows, name)} />, [provinceRows]);
  const districtPopover = useCallback(
    (name: string) => <Tooltip name={name} row={province ? districtRowFor(province, districtRows, name) : undefined} />,
    [province, districtRows],
  );

  const provinceLabel = province ? PROVINCE_LABELS[province] ?? province : "";
  const loading = province ? drill.loading || national.loading : national.loading;
  const error = national.error ?? (province ? drill.error : null);
  const retry = () => {
    if (national.error) national.retry();
    if (province && drill.error) drill.retry();
  };

  return (
    <ReportCard
      title={TITLE}
      subtitle={PERIOD}
      exportSubtitle={province ? `${PERIOD} | ${provinceLabel}` : PERIOD}
      cardId={CARD_ID}
      loading={loading}
      error={error}
      // The map means something without rows (everything "Sem sites").
      empty={false}
      onRetry={retry}
      onRestart={() => setProvince(null)}
      excel={() => (province ? toExcel(districtRows, "district") : toExcel(provinceRows, "province"))}
      documentation={<Docs />}
      footer={<ConnectivityLegend />}
    >
      <div className="flex flex-col gap-2">
        <div className="flex min-h-9 flex-col justify-center gap-1 px-1">
          {province ? (
            <DrillBreadcrumb items={[{ label: LABELS.HOME, onSelect: () => setProvince(null) }, { label: provinceLabel }]} />
          ) : (
            <MapHint>{LABELS.PROVINCE_HINT}</MapHint>
          )}
        </div>
        {/* Labels stay dark in dark mode: they sit on the light shades (as EID). */}
        <div
          className={`flex min-h-[420px] w-full items-center justify-center ${
            province ? "[&_text]:fill-[#1C252E]!" : "[&_text.st1:not(:last-of-type)]:fill-[#1C252E]!"
          }`}
        >
          {province && ProvinceMap && districtColors ? (
            <ProvinceMap key={province} {...districtColors} height="400px" showPopover legend={LABELS.LEGEND} getPopoverContent={districtPopover} />
          ) : (
            <InteractiveSvgMap
              height="400px"
              useShortName
              {...provinceColors}
              highlightedColor={MONITORING_PRIMARY}
              showPopover
              clickHint="Clique para ver os distritos"
              onClick={(value: { key: string }) => setProvince(value.key)}
              getPopoverContent={provincePopover}
            />
          )}
        </div>
      </div>
    </ReportCard>
  );
}
