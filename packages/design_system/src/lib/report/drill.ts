import type { Params } from "./params";
import { formatRangePt, intervalParam, type DateRange } from "./dates";

export type FacilityLevel = "province" | "district" | "health_facility";

/**
 * filterType + names = the location filter sent to the API.
 * disaggregation = show the next level down inside that filter (legacy drill-down).
 */
export type DrillState = {
  filterType: FacilityLevel;
  names: string[];
  disaggregation: boolean;
  trail: string[];
};

export type DrillAction =
  | { kind: "drill"; next: DrillState }
  | { kind: "patients"; facility: string; district?: string }
  | { kind: "none" };

export const INITIAL_DRILL: DrillState = { filterType: "province", names: [], disaggregation: false, trail: [] };

export const LEVEL_LABEL: Record<FacilityLevel, string> = {
  province: "Província",
  district: "Distrito",
  health_facility: "Unidade Sanitária",
};

const CHILD: Record<FacilityLevel, FacilityLevel> = {
  province: "district",
  district: "health_facility",
  health_facility: "health_facility",
};

/** Level of the rows the API returns for this state. */
export const rowLevel = (state: DrillState): FacilityLevel =>
  state.disaggregation ? CHILD[state.filterType] : state.filterType;

export function drillClick(state: DrillState, label: string, isAdmin: boolean): DrillAction {
  if (!label) return { kind: "none" };
  const level = rowLevel(state);
  if (level === "health_facility") {
    if (!isAdmin) return { kind: "none" };
    return {
      kind: "patients",
      facility: label,
      district: state.filterType === "district" ? state.names[0] : undefined,
    };
  }
  return {
    kind: "drill",
    next: { filterType: level, names: [label], disaggregation: true, trail: [...state.trail, label] },
  };
}

export function drillParams(state: DrillState): Params {
  const params: Params = {
    facility_type: state.filterType,
    disaggregation: state.disaggregation ? "true" : "false",
  };
  if (state.names.length === 0) return params;
  if (state.filterType === "province") params.province = state.names;
  if (state.filterType === "district") params.district = state.names;
  if (state.filterType === "health_facility") params.health_facility = state.names[0];
  return params;
}

type PopupOption = { value?: string; label: string };

/** Ruling P8: map FacilitiesPopup output to API names. */
export function fromFilter(selection: PopupOption[], type: "province" | "district" | "clinic"): DrillState {
  const names = selection
    .map((option) => (type === "province" ? option.value ?? option.label : option.label))
    .filter((name): name is string => Boolean(name));
  return {
    filterType: type === "clinic" ? "health_facility" : type,
    names: type === "clinic" ? names.slice(0, 1) : names,
    disaggregation: false,
    trail: [],
  };
}

export function drillSubtitle(range: DateRange, state: DrillState, period: (range: DateRange) => string = formatRangePt): string {
  const parts = [period(range)];
  if (state.trail.length > 0) parts.push(state.trail.join(" → "));
  else if (state.names.length > 0) parts.push(`${LEVEL_LABEL[state.filterType]}: ${state.names.join(", ")}`);
  return parts.join(" | ");
}

export const facilityParams = (range: DateRange, drill: DrillState, extra: Params = {}): Params => ({
  interval_dates: intervalParam(range),
  ...drillParams(drill),
  ...extra,
});

/**
 * Rows that name their place. By-facility endpoints can return a row with requesting_facility null
 * (samples with no province, district or facility recorded, e.g. 24 in Gaza's districts); the
 * charts leave it out, since a null category crashes ApexCharts. Rows by month have no such field
 * and are kept.
 */
export const withLocation = <T>(rows: T[]): T[] =>
  rows.filter((r) => {
    const place = (r as { requesting_facility?: unknown }).requesting_facility;
    return place === undefined || (typeof place === "string" && place.trim() !== "");
  });
