import type { Params } from "./params";

/** Levels of the API lab chain: lab → province → district → health facility. */
export type LabLevel = "lab" | "province" | "district" | "health_facility";

/** Where the drill started, and the bars clicked since (in order). */
export type LabDrill = {
  start: "lab" | "province";
  trail: { level: LabLevel; name: string; code?: string }[];
};

const CHILD: Record<LabLevel, LabLevel> = {
  lab: "province",
  province: "district",
  district: "health_facility",
  health_facility: "health_facility",
};

export const initialLabDrill = (start: "lab" | "province"): LabDrill => ({ start, trail: [] });

/** Level of the rows shown for this drill. */
export function labDrillLevel(d: LabDrill): LabLevel {
  const last = d.trail[d.trail.length - 1];
  return last ? CHILD[last.level] : d.start;
}

/**
 * API params of this drill (Ruling L4). `codes` are the labs the user chose; every level sends them,
 * so the drill stays inside the chosen labs. Below a clicked lab bar, that lab's code is sent instead.
 */
export function labDrillParams(d: LabDrill, codes: string[]): Params {
  const last = d.trail[d.trail.length - 1];
  const lab = d.trail.find((t) => t.level === "lab");
  const labCodes = lab?.code ? [lab.code] : codes;
  const params: Params = {};
  if (!last) {
    if (d.start === "province") params.facility_type = "province";
  } else if (last.level === "lab") {
    params.facility_type = "lab";
    params.disaggregation = "true";
  } else if (last.level === "province") {
    params.facility_type = "province";
    params.province = [last.name];
    params.disaggregation = "true";
  } else if (last.level === "district") {
    params.facility_type = "district";
    params.district = [last.name];
    params.disaggregation = "true";
  }
  if (labCodes.length > 0) params.lab_code = labCodes;
  return params;
}

/**
 * The drill after a click on the bar `label`, or null when the click does nothing: at the
 * health-facility level (the end of the chain), and on a lab bar without a code (Review Focus 1).
 */
export function labDrillClick(d: LabDrill, label: string, code?: string): LabDrill | null {
  if (!label) return null;
  const level = labDrillLevel(d);
  if (level === "health_facility") return null;
  if (level === "lab") {
    if (!code) return null;
    return { ...d, trail: [...d.trail, { level, name: label, code }] };
  }
  return { ...d, trail: [...d.trail, { level, name: label }] };
}

/** The clicked bars, for the subtitle ("Lab X → Gaza → Chókwè"); "" at the first level. */
export const labTrailLabel = (d: LabDrill): string => d.trail.map((t) => t.name).join(" → ");

export const sameLabDrill = (a: LabDrill, b: LabDrill): boolean => JSON.stringify(a) === JSON.stringify(b);

/** Rows fetched for `tagged.drill`, only when that is the current drill (Review Focus 3). */
export function rowsForDrill<Row>(tagged: { drill: LabDrill; rows: Row[] } | null | undefined, current: LabDrill): Row[] {
  if (!tagged || !sameLabDrill(tagged.drill, current)) return [];
  return tagged.rows;
}

/**
 * The drill after a click on the bar `label` (Review Focus 5): finds the row whose `labelOf` is the label
 * and drills with the row's own name, never the chart label. Null (no drill) when no row matches.
 */
export function labDrillClickRow<Row>(
  d: LabDrill,
  rows: Row[],
  label: string,
  labelOf: (row: Row) => string,
  codeOf: (row: Row) => string | undefined,
): LabDrill | null {
  const row = rows.find((x) => labelOf(x) === label);
  if (!row) return null;
  return labDrillClick(d, labelOf(row), codeOf(row));
}
