"use client";

import { useCallback, useMemo, type ComponentType } from "react";
import { InteractiveSvgMap } from "@repo/design_system/app/atoms/maps/InteractiveSvgMap";
import {
  CaboDelgado, Gaza, Inhambane, Manica, MaputoCidade, MaputoProvincia, Nampula, Niassa, Sofala, Tete, Zambezia,
} from "@repo/design_system/app/atoms/maps/Provinces";
import { DrillBreadcrumb } from "@repo/design_system/app/molecules/maps/DrillBreadcrumb";
import { MapHint } from "@repo/design_system/app/molecules/maps/MapHint";
import { OVERLINE } from "@repo/design_system/app/molecules/metrics/SummaryStrip";
import { formatNumber } from "@repo/design_system/lib/format-number";
import { ReportCard } from "@/components/report-card";
import { NATIONAL, type TatUnit, type TransportView } from "@/lib/vl/transport/data";
import { classify, classMeta, TAT_CLASSES, TAT_NO_DATA, totalOf, withinTarget } from "@/lib/vl/transport/tat";
import { districtColors, formatShare, provinceColors, toExcel } from "../actions";
import { LABELS, MAP_CARD_ID, MAP_IMAGE_ID, PROVINCE_LABELS } from "../constants";
import Docs from "../docs";

const PROVINCE_MAPS: Record<string, ComponentType<any>> = {
  Niassa, "Cabo Delgado": CaboDelgado, Nampula, Zambezia, Tete, Manica, Sofala, Inhambane, Gaza,
  "Maputo Provincia": MaputoProvincia, "Maputo Cidade": MaputoCidade,
};

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase();

// Laid out as the Minimals chart tooltip: grey title bar, then label: value rows.
function Tooltip({ name, unit }: { name: string; unit: TatUnit | undefined }) {
  const meta = classMeta(unit ? classify(unit.counts) : -1);
  const rows: [string, string][] = unit
    ? [
        ["Classe TAT", meta.label],
        ["<15 dias", formatShare(withinTarget(unit.counts))],
        ["Amostras", formatNumber(totalOf(unit.counts))],
      ]
    : [["Classe TAT", TAT_NO_DATA.label]];
  return (
    <div className="pb-1 text-xs leading-[18px]">
      <div className="minimals-popover-title">{name}</div>
      {rows.map(([label, value], i) => (
        <div key={label} className="flex items-center gap-2 px-3 py-1">
          {i === 0 && <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: meta.color }} />}
          <span>{label}:</span>
          <span className="font-semibold">{value}</span>
        </div>
      ))}
    </div>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-[#637381] dark:text-[#919EAB]">
      <span className={OVERLINE}>Intervalo TAT</span>
      {[...TAT_CLASSES, TAT_NO_DATA].map((c) => (
        <span key={c.label} className="flex items-center gap-1.5">
          <span aria-hidden className="size-2.5 rounded-[3px]" style={{ background: c.color }} />
          {c.label}
        </span>
      ))}
    </div>
  );
}

export type TransportMapProps = {
  view: TransportView | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  province: string | null;
  district: string | null;
  period: string;
  onProvince: (province: string | null) => void;
  onDistrict: (district: string | null) => void;
};

/** TAT class of every province, or of every district of the open province. */
export function TransportMap({ view, loading, error, onRetry, province, district, period, onProvince, onDistrict }: TransportMapProps) {
  const units = useMemo(() => view?.mapUnits ?? [], [view]);
  const ProvinceMap = province ? PROVINCE_MAPS[province] : undefined;
  const provinceLabel = province ? PROVINCE_LABELS[province] ?? province : "";

  // Stable props for the province map: it re-injects its SVG whenever one changes, which would
  // swallow clicks while hovering (see the province map components).
  const districts = useMemo(() => (province ? districtColors(province, units, district) : null), [province, units, district]);
  const popover = useCallback((name: string) => <Tooltip name={name} unit={units.find((u) => norm(u.name) === norm(name))} />, [units]);
  const openDistrict = useCallback((name: string) => onDistrict(name), [onDistrict]);

  return (
    <ReportCard
      title={LABELS.MAP_TITLE}
      subtitle={`${LABELS.LEG} · ${period}`}
      cardId={MAP_CARD_ID}
      imageTargetId={MAP_IMAGE_ID}
      loading={loading}
      error={error}
      empty={false}
      onRetry={onRetry}
      excel={() => (view ? toExcel(view.area, view.mapUnits, province ? "district" : "province") : { header: [], rows: [] })}
      documentation={<Docs />}
      footer={<Legend />}
    >
      <div className="flex flex-col gap-2">
        {/* Where the user is and what a click does, above the map (never over it). */}
        <div className="flex min-h-9 flex-col justify-center gap-1 px-1">
          {province ? (
            <DrillBreadcrumb
              items={[
                { label: NATIONAL, onSelect: () => onProvince(null) },
                { label: provinceLabel, onSelect: district ? () => onDistrict(null) : undefined },
                ...(district ? [{ label: district }] : []),
              ]}
            />
          ) : (
            <MapHint>{LABELS.PROVINCE_HINT}</MapHint>
          )}
          {province && <MapHint>{district ? LABELS.OTHER_DISTRICT_HINT : LABELS.DISTRICT_HINT}</MapHint>}
        </div>
        {/* Dark labels with a white halo: readable on every class colour, light or dark. */}
        <div id={MAP_IMAGE_ID} className="flex min-h-[480px] w-full items-center justify-center [&_text]:fill-[#1C252E]! [&_text]:stroke-white [&_text]:[paint-order:stroke] [&_text]:[stroke-width:3px]">
          {province && ProvinceMap && districts ? (
            <ProvinceMap
              key={province}
              {...districts}
              height="460px"
              showPopover
              legend="TAT"
              onDistrictClick={openDistrict}
              getPopoverContent={popover}
            />
          ) : (
            <InteractiveSvgMap
              height="460px"
              useShortName
              {...provinceColors(units)}
              showPopover
              clickHint={LABELS.CLICK_HINT}
              onClick={(value: { key: string }) => onProvince(value.key)}
              getPopoverContent={popover}
            />
          )}
        </div>
      </div>
    </ReportCard>
  );
}
