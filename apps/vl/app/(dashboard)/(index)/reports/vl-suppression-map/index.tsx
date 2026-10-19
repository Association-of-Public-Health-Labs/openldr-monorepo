"use client";

import { useState, type ComponentType } from "react";
import { InteractiveSvgMap } from "@repo/design_system/app/atoms/maps/InteractiveSvgMap";
import {
  CaboDelgado, Gaza, Inhambane, Manica, MaputoCidade, MaputoProvincia, Nampula, Niassa, Sofala, Tete, Zambezia,
} from "@repo/design_system/app/atoms/maps/Provinces";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@repo/design_system/components/ui/breadcrumb";
import { ReportCard } from "@/components/report-card";
import { useReport } from "@/hooks/use-report";
import { formatRangePt, lastYear, type DateRange } from "@/lib/vl/dates";
import { formatRate, suppressionBand, suppressionRate } from "@/lib/vl/suppression";
import type { SuppressionByProvince } from "@/lib/vl/types";
import { CARD_ID, TITLE } from "./constants";
import { fetchData, rowFor, toDistrictColors, toExcel, toProvinceColors } from "./actions";
import { SuppressionLegend } from "./suppression-legend";
import Docs from "./docs";

// The shared province maps each have their own props type.
const PROVINCE_MAPS: Record<string, ComponentType<any>> = {
  Niassa, "Cabo Delgado": CaboDelgado, Nampula, Zambezia, Tete, Manica, Sofala, Inhambane, Gaza,
  "Maputo Provincia": MaputoProvincia, "Maputo Cidade": MaputoCidade,
};

// Laid out as the Minimals chart tooltip: grey title bar, then label: value rows.
function Tooltip({ name, row }: { name: string; row: SuppressionByProvince | undefined }) {
  const rate = suppressionRate(row);
  const rows: [string, string | number][] = row
    ? [
        ["Supressão viral", formatRate(rate)],
        ["Amostras testadas", row.total],
        ["Rotina", row.routine],
        ["Falência terapêutica", row.treatment_failure],
      ]
    : [["Supressão viral", "sem dados"]];
  return (
    <div className="pb-1 text-xs leading-[18px]">
      <div className="minimals-popover-title">{name}</div>
      {rows.map(([label, value], i) => (
        <div key={label} className="flex items-center gap-2 px-3 py-1">
          {i === 0 && <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: suppressionBand(rate).color }} />}
          <span>{label}:</span>
          <span className="font-semibold">{value}</span>
        </div>
      ))}
    </div>
  );
}

export default function VlSuppressionMap() {
  const [range, setRange] = useState<DateRange>(() => lastYear());
  const [province, setProvince] = useState<string | null>(null);
  // The province is a dependency: changing the dates while a province is open reloads its districts.
  const r = useReport((token) => fetchData(range, province, token), [range, province]);
  // While the other level loads, the previous level's rows are still in `r.data`; never draw them here.
  const rows = r.data?.province === province ? r.data.rows : [];
  const ProvinceMap = province ? PROVINCE_MAPS[province] : undefined;
  const popover = (name: string) => <Tooltip name={name} row={rowFor(rows, name)} />;

  return (
    <ReportCard
      title={TITLE}
      subtitle={formatRangePt(range)}
      cardId={CARD_ID}
      reportType="national"
      loading={r.loading}
      error={r.error}
      // The map means something without rows (everything "Sem dados").
      empty={false}
      onRetry={r.retry}
      onSubmit={(dates: [string, string]) => setRange({ start: dates[0], end: dates[1] })}
      onRestart={() => {
        setRange(lastYear());
        setProvince(null);
      }}
      excel={() => toExcel(rows)}
      documentation={<Docs />}
    >
      <div className="flex flex-col items-center gap-2">
        <div className="w-full px-1 text-xs text-[#637381] dark:text-[#919EAB]">
          {province ? (
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <button type="button" onClick={() => setProvince(null)}>Moçambique</button>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{province}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          ) : (
            "Clique sobre a Província para mais detalhes"
          )}
        </div>
        {province && ProvinceMap ? (
          <ProvinceMap
            key={province}
            {...toDistrictColors(province, rows)}
            height="420px"
            showPopover
            legend="Supressão"
            onDistrictClick={() => {}}
            getPopoverContent={popover}
          />
        ) : (
          <InteractiveSvgMap
            width="100%"
            height={420}
            {...toProvinceColors(rows)}
            showPopover
            onClick={(value: { key: string }) => setProvince(value.key)}
            getPopoverContent={popover}
          />
        )}
        <SuppressionLegend />
      </div>
    </ReportCard>
  );
}
