"use client";

import { useCallback, useMemo, useState } from "react";
import { InteractiveSvgMap } from "@repo/design_system/app/atoms/maps/InteractiveSvgMap";
import { PROVINCE_MAPS } from "@repo/design_system/app/atoms/maps/province-maps";
import { DrillBreadcrumb } from "@repo/design_system/app/molecules/maps/DrillBreadcrumb";
import { MapHint } from "@repo/design_system/app/molecules/maps/MapHint";
import { BarValue, SortableTable, type SortableColumn } from "@repo/design_system/app/molecules/tables/SortableTable";
import { Tabs } from "@repo/design_system/components/ui/tabs";
import { SegmentedTabsList, SegmentedTabsTrigger } from "@repo/design_system/components/ui/segmented-tabs";
import { formatNumber } from "@repo/design_system/lib/format-number";
import { ReportCard } from "@repo/design_system/app/organisms/report/report-card";
import { useReport } from "@repo/design_system/hooks/report/use-report";
import { formatPeriodPt, formatRangePt, lastYear, type DateRange } from "@repo/design_system/lib/report/dates";
import { num } from "@repo/design_system/lib/report/format";
import { EID_PRIMARY, LAB_TYPE_TABS } from "@/lib/eid/series";
import type { IndicatorsByProvince, KeyIndicators, LabType } from "@/lib/eid/types";
import { PROVINCE_LABELS } from "@repo/design_system/lib/report/districts";
import { CARD_ID, LABELS, NO_DATA_COLOR, TITLE } from "./constants";
import {
  exportLabType, facilitiesForView, facilityName, fetchData, rowFor, rowsForView, sumFacilities, toDistrictColors, toExcel, toFacilityExcel, toProvinceColors,
} from "./actions";
import { PositivityLegend } from "./positivity-legend";
import Docs from "./docs";

const DEFAULT_LAB_TYPE: LabType = "conventional";

const percent = (value: number | null | undefined) => `${num(value).toFixed(1)}%`;

// Laid out as the Minimals chart tooltip: grey title bar, then label: value rows.
function Tooltip({ name, row }: { name: string; row: IndicatorsByProvince | KeyIndicators | undefined }) {
  const rows: [string, string][] = row
    ? [
        ["Positividade", percent(row.positivity)],
        ["Registadas", formatNumber(num(row.registered))],
        ["Testadas", formatNumber(num(row.tested))],
        ...("province" in row
          ? ([
              ["Convencional", formatNumber(num(row.conventional))],
              ["PoC", formatNumber(num(row.poc))],
            ] as [string, string][])
          : []),
      ]
    : [["Positividade", "sem dados"]];
  return (
    <div className="pb-1 text-xs leading-[18px]">
      <div className="minimals-popover-title">{name}</div>
      {rows.map(([label, value], i) => (
        <div key={label} className="flex items-center gap-2 px-3 py-1">
          {i === 0 && <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: row ? EID_PRIMARY : NO_DATA_COLOR }} />}
          <span>{label}:</span>
          <span className="font-semibold">{value}</span>
        </div>
      ))}
    </div>
  );
}

// Positivity as a share (0–1) for the bar.
const shareOf = (r: { positivity: number | null }) => num(r.positivity) / 100;
const maxOf = (rows: { positivity: number | null }[]) => Math.max(0, ...rows.map((r) => num(r.positivity)));

export default function EidProvinceMap() {
  const [range, setRange] = useState<DateRange>(() => lastYear());
  const [province, setProvince] = useState<string | null>(null);
  const [district, setDistrict] = useState<string | null>(null);
  const [labType, setLabType] = useState<LabType>(DEFAULT_LAB_TYPE);

  // National rows: the national map and the province tiles (E3). No lab_type at this level.
  const national = useReport((token) => fetchData(range, null, null, DEFAULT_LAB_TYPE, token), [range]);
  const provinceRows = useMemo(() => (national.data?.rows ?? []) as IndicatorsByProvince[], [national.data]);
  const provinceRow = province ? rowFor(provinceRows, province) : undefined;
  // `province` is the map's key ("Zambezia"); the API filters by its own spelling ("Zambézia").
  const apiProvince = province ? provinceRow?.province ?? province : null;
  // The drill levels. The province, district and lab type are deps: changing one reloads the level
  // being viewed, and the request gate drops the slower old response.
  const drill = useReport(
    (token) => (apiProvince ? fetchData(range, apiProvince, district, labType, token) : Promise.resolve(null)),
    [range, apiProvince, district, labType],
  );

  // While another level loads, the previous level's rows are still in `drill.data`; never draw them here.
  const districtRows = useMemo(() => rowsForView(drill.data, apiProvince, labType) as KeyIndicators[], [drill.data, apiProvince, labType]);
  const facilities = useMemo(
    () => facilitiesForView(drill.data, apiProvince, district, labType),
    [drill.data, apiProvince, district, labType],
  );
  const ProvinceMap = province ? PROVINCE_MAPS[province] : undefined;

  // Stable props for the province map: it re-injects its SVG whenever one changes, which would
  // swallow clicks while hovering (see the province map components).
  const districtColors = useMemo(() => (province ? toDistrictColors(province, districtRows) : null), [province, districtRows]);
  const provinceColors = useMemo(() => toProvinceColors(provinceRows), [provinceRows]);
  const districtPopover = useCallback((name: string) => <Tooltip name={name} row={rowFor(districtRows, name)} />, [districtRows]);
  const provincePopover = useCallback((name: string) => <Tooltip name={name} row={rowFor(provinceRows, name)} />, [provinceRows]);
  const openDistrict = useCallback((name: string) => setDistrict(name), []);

  const goHome = () => {
    setProvince(null);
    setDistrict(null);
  };

  const columns = useMemo<SortableColumn<KeyIndicators>[]>(() => {
    const total = sumFacilities(facilities);
    const count = (key: "registered" | "tested" | "rejected" | "pending" | "positive", header: string): SortableColumn<KeyIndicators> => ({
      key,
      header,
      align: "right",
      cell: (row) => formatNumber(num(row[key])),
      sortValue: (row) => num(row[key]),
      footer: formatNumber(total[key]),
    });
    return [
      {
        key: "facility",
        header: "Unidade sanitária",
        cell: facilityName,
        sortValue: facilityName,
        footer: LABELS.FACILITY_TOTAL,
        className: "min-w-[130px]",
      },
      count("registered", "Registadas"),
      count("tested", "Testadas"),
      count("rejected", "Rejeitadas"),
      count("pending", "Pendentes"),
      count("positive", "Positivas"),
      {
        key: "positivity",
        header: "Positividade",
        align: "right",
        cell: (row) => <BarValue value={shareOf(row)} color={EID_PRIMARY} />,
        sortValue: shareOf,
        footer: <BarValue value={shareOf(total)} color={EID_PRIMARY} />,
      },
    ];
  }, [facilities]);

  const provinceLabel = province ? PROVINCE_LABELS[province] ?? province : "";
  // The label follows the data applied, not the selected tab, which is ahead of it while loading.
  const exportType = exportLabType(drill.data, labType);
  const labLabel = LAB_TYPE_TABS.find((t) => t.value === exportType)?.label ?? "";
  const loading = province ? drill.loading || national.loading : national.loading;
  const error = national.error ?? (province ? drill.error : null);
  const retry = () => {
    if (national.error) national.retry();
    if (province && drill.error) drill.retry();
  };

  return (
    <ReportCard
      title={TITLE}
      subtitle={formatPeriodPt(range)}
      exportSubtitle={
        province
          ? `${formatRangePt(range)} | ${provinceLabel}${district ? ` - ${district}` : ""} | ${labLabel}`
          : formatRangePt(range)
      }
      cardId={CARD_ID}
      reportType="national"
      loading={loading}
      error={error}
      // The map means something without rows (everything "Sem dados").
      empty={false}
      onRetry={retry}
      onSubmit={(dates: [string, string]) => setRange({ start: dates[0], end: dates[1] })}
      onRestart={() => {
        setRange(lastYear());
        setLabType(DEFAULT_LAB_TYPE);
        goHome();
      }}
      excel={() => (district ? toFacilityExcel(facilities) : province ? toExcel(districtRows, false) : toExcel(provinceRows, true))}
      documentation={<Docs />}
      footer={district ? undefined : <PositivityLegend max={maxOf(province ? districtRows : provinceRows)} />}
      controls={
        province ? (
          <Tabs value={labType} onValueChange={(v) => setLabType(v as LabType)} className="w-full">
            <SegmentedTabsList className="mx-4 ml-auto">
              {LAB_TYPE_TABS.map((tab) => (
                <SegmentedTabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </SegmentedTabsTrigger>
              ))}
            </SegmentedTabsList>
          </Tabs>
        ) : undefined
      }
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
            rowKey={facilityName}
            defaultSort={{ key: "registered", direction: "desc" }}
            search={{ placeholder: LABELS.FACILITY_SEARCH, text: facilityName }}
            loading={drill.loading}
            emptyMessage={LABELS.FACILITY_EMPTY}
            error={drill.error ? { message: drill.error, onRetry: drill.retry } : null}
            maxHeight={400}
          />
        ) : (
          // Labels stay dark in dark mode: they sit on the light shades. On the national map the
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
                legend={LABELS.LEGEND}
                onDistrictClick={openDistrict}
                getPopoverContent={districtPopover}
              />
            ) : (
              <InteractiveSvgMap
                height="400px"
                useShortName
                {...provinceColors}
                highlightedColor={EID_PRIMARY}
                showPopover
                clickHint="Clique para ver os distritos"
                onClick={(value: { key: string }) => setProvince(value.key)}
                getPopoverContent={provincePopover}
              />
            )}
          </div>
        )}
      </div>
    </ReportCard>
  );
}
