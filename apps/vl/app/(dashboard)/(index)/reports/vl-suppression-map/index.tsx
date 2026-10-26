"use client";

import { useCallback, useMemo, useState, type ComponentType } from "react";
import { InteractiveSvgMap } from "@repo/design_system/app/atoms/maps/InteractiveSvgMap";
import {
  CaboDelgado, Gaza, Inhambane, Manica, MaputoCidade, MaputoProvincia, Nampula, Niassa, Sofala, Tete, Zambezia,
} from "@repo/design_system/app/atoms/maps/Provinces";
import { DrillBreadcrumb } from "@repo/design_system/app/molecules/maps/DrillBreadcrumb";
import { MapHint } from "@repo/design_system/app/molecules/maps/MapHint";
import { BarValue, SortableTable, type SortableColumn } from "@repo/design_system/app/molecules/tables/SortableTable";
import { formatNumber } from "@repo/design_system/lib/format-number";
import { ReportCard } from "@/components/report-card";
import { useReport } from "@/hooks/use-report";
import { formatPeriodPt, formatRangePt, lastYear, type DateRange } from "@repo/design_system/lib/report/dates";
import { formatRate, suppressionBand, suppressionRate } from "@/lib/vl/suppression";
import type { SuppressionByProvince, TestedByFacility } from "@/lib/vl/types";
import { CARD_ID, LABELS, MAP_COLOR, PROVINCE_LABELS, TITLE } from "./constants";
import { fetchData, rowFor, sumFacilities, toDistrictColors, toExcel, toFacilityExcel, toProvinceColors } from "./actions";
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
        ["Amostras testadas", formatNumber(row.total)],
        ["Rotina", formatNumber(row.routine)],
        ["Falência terapêutica", formatNumber(row.treatment_failure)],
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

// Suppression as a share (0–1) for the bar, from the samples with a result.
const shareOf = (r: { suppressed: number; not_suppressed: number }) => (suppressionRate(r) ?? 0) / 100;

export default function VlSuppressionMap() {
  const [range, setRange] = useState<DateRange>(() => lastYear());
  const [province, setProvince] = useState<string | null>(null);
  const [district, setDistrict] = useState<string | null>(null);
  // The province and district are dependencies: changing the dates reloads the level being viewed.
  const r = useReport((token) => fetchData(range, province, district, token), [range, province, district]);
  // While another level loads, the previous level's rows are still in `r.data`; never draw them here.
  const rows = useMemo(() => (r.data?.province === province ? r.data.rows : []), [r.data, province]);
  const facilities = useMemo(
    () => (district && r.data?.province === province && r.data.district === district ? r.data.facilities : []),
    [r.data, province, district],
  );
  const ProvinceMap = province ? PROVINCE_MAPS[province] : undefined;

  // Stable props for the province map: it re-injects its SVG whenever one changes, which would
  // swallow clicks while hovering (see the province map components).
  const districtColors = useMemo(() => (province ? toDistrictColors(province, rows) : null), [province, rows]);
  const popover = useCallback((name: string) => <Tooltip name={name} row={rowFor(rows, name)} />, [rows]);
  const openDistrict = useCallback((name: string) => setDistrict(name), []);

  const goHome = () => {
    setProvince(null);
    setDistrict(null);
  };

  const columns = useMemo<SortableColumn<TestedByFacility>[]>(() => {
    const total = sumFacilities(facilities);
    return [
      {
        key: "facility",
        header: "Unidade sanitária",
        cell: (row) => row.requesting_facility,
        sortValue: (row) => row.requesting_facility,
        footer: LABELS.FACILITY_TOTAL,
        className: "min-w-[130px]",
      },
      {
        key: "total",
        header: "Testadas",
        align: "right",
        cell: (row) => formatNumber(row.total || 0),
        sortValue: (row) => row.total || 0,
        footer: formatNumber(total.total),
      },
      {
        key: "suppressed",
        header: "<1000 cp/ml",
        align: "right",
        cell: (row) => formatNumber(row.suppressed || 0),
        sortValue: (row) => row.suppressed || 0,
        footer: formatNumber(total.suppressed),
      },
      {
        key: "rate",
        header: "Supressão",
        align: "right",
        cell: (row) => <BarValue value={shareOf(row)} color={MAP_COLOR} />,
        sortValue: shareOf,
        footer: <BarValue value={shareOf(total)} color={MAP_COLOR} />,
      },
    ];
  }, [facilities]);

  const provinceLabel = province ? PROVINCE_LABELS[province] ?? province : "";

  return (
    <ReportCard
      title={TITLE}
      subtitle={formatPeriodPt(range)}
      exportSubtitle={district ? `${formatRangePt(range)} | ${provinceLabel} - ${district}` : formatRangePt(range)}
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
        goHome();
      }}
      excel={() => (district ? toFacilityExcel(facilities) : toExcel(rows))}
      documentation={<Docs />}
      footer={district ? undefined : <SuppressionLegend />}
    >
      <div className="flex flex-col gap-2">
        {/* Where the user is, and what a click does; both above the map, never over it. */}
        <div className="flex min-h-9 flex-col justify-center gap-1 px-1">
          {province ? (
            <DrillBreadcrumb
              items={[
                { label: LABELS.HOME, onSelect: goHome },
                { label: provinceLabel, onSelect: district ? () => setDistrict(null) : undefined },
                ...(district ? [{ label: district }] : []),
              ]}
            />
          ) : (
            <MapHint>{LABELS.PROVINCE_HINT}</MapHint>
          )}
          {province && !district && <MapHint>{LABELS.DISTRICT_HINT}</MapHint>}
        </div>

        {district ? (
          <SortableTable
            id={`${CARD_ID}-facilities`}
            className="min-h-[400px]"
            label={`${LABELS.FACILITY_TABLE}: ${district}`}
            columns={columns}
            rows={facilities}
            rowKey={(row) => row.requesting_facility}
            defaultSort={{ key: "total", direction: "desc" }}
            search={{ placeholder: LABELS.FACILITY_SEARCH, text: (row) => row.requesting_facility }}
            loading={r.loading}
            emptyMessage={LABELS.FACILITY_EMPTY}
            error={r.error ? { message: r.error, onRetry: r.retry } : null}
            maxHeight={400}
          />
        ) : (
          // Labels stay dark in dark mode: they sit on the light band colours. On the national map the
          // last one, "MC", sits beside its circle on the card, so it keeps the theme colour.
          <div
            className={`flex min-h-[420px] w-full items-center justify-center ${
              province ? "[&_text]:fill-[#1C252E]!" : "[&_text.st1:not(:last-of-type)]:fill-[#1C252E]!"
            }`}
          >
            {province && ProvinceMap && districtColors ? (
              <ProvinceMap
                key={province}
                {...districtColors}
                height="400px"
                showPopover
                legend="Supressão"
                onDistrictClick={openDistrict}
                getPopoverContent={popover}
              />
            ) : (
              <InteractiveSvgMap
                height="400px"
                useShortName
                {...toProvinceColors(rows)}
                showPopover
                clickHint="Clique para ver os distritos"
                onClick={(value: { key: string }) => setProvince(value.key)}
                getPopoverContent={popover}
              />
            )}
          </div>
        )}
      </div>
    </ReportCard>
  );
}
