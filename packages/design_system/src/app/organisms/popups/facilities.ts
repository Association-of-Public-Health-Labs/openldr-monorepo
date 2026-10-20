// Data rules of the facilities filter, unchanged from the MUI SelectFacilities it replaces.

export type FacilityType = "province" | "district" | "clinic";

/** The `facilities` prop of the old popup (the lists are loaded from the dictionary, not read from it). */
export type FacilitiesProps = { clinics: any[]; districts: any[]; labs: any[]; pocs: any[] };

/** Same shape as SelectPickerOptionsProps: what the cards read from the selection. */
export type FacilityOption = {
  value: string;
  label: string;
  clinic?: string;
  district?: string;
  province?: string;
};

/** Dictionary endpoints the old dialog used. */
export const DICT_URL = "https://api-ts.openldr.org.mz/dict";

export const PROVINCES: FacilityOption[] = [
  { value: "Maputo Provincia", label: "Maputo Provincia" },
  { value: "Maputo Cidade", label: "Maputo Cidade" },
  { value: "Gaza", label: "Gaza" },
  { value: "Inhambane", label: "Inhambane" },
  { value: "Manica", label: "Manica" },
  { value: "Sofala", label: "Sofala" },
  { value: "Tete", label: "Tete" },
  { value: "Zambezia", label: "Zambézia" },
  { value: "Nampula", label: "Nampula" },
  { value: "Niassa", label: "Niassa" },
  { value: "Cabo Delgado", label: "Cabo Delgado" },
];

type DistrictRow = { DistrictCode: string; DistrictName: string; ProvinceName: string };
type ClinicRow = { FacilityCode: string; FacilityName: string; DistrictName: string; ProvinceName: string };

/** The dictionary has rows without a name and repeated codes: one option per code, never a blank one. */
const usable = (options: FacilityOption[]): FacilityOption[] => {
  const seen = new Set<string>();
  return options.filter((o) => {
    if (!o.value || !o.label?.trim() || seen.has(o.value)) return false;
    seen.add(o.value);
    return true;
  });
};

export const formatDistricts = (rows: DistrictRow[]): FacilityOption[] =>
  usable(rows.map((d) => ({ value: d.DistrictCode, label: d.DistrictName, district: d.DistrictName, province: d.ProvinceName })));

export const formatClinics = (rows: ClinicRow[]): FacilityOption[] =>
  usable(rows.map((c) => ({
    value: c.FacilityCode,
    label: c.FacilityName,
    clinic: c.FacilityName,
    district: c.DistrictName,
    province: c.ProvinceName,
  })));

// Value or label: the old dialog matched labels only, so "Zambézia" (accented label) found no districts.
const byLabel = (selected: FacilityOption[]) => new Set(selected.flatMap((s) => [s.label, s.value]));

export function filterDistricts(districts: FacilityOption[], provinces: FacilityOption[]): FacilityOption[] {
  if (provinces.length === 0) return districts;
  const names = byLabel(provinces);
  return districts.filter((d) => d.province !== undefined && names.has(d.province));
}

export function filterClinics(clinics: FacilityOption[], provinces: FacilityOption[], districts: FacilityOption[]): FacilityOption[] {
  let out = clinics;
  if (provinces.length > 0) {
    const names = byLabel(provinces);
    out = out.filter((c) => c.province !== undefined && names.has(c.province));
  }
  if (districts.length > 0) {
    const names = byLabel(districts);
    out = out.filter((c) => c.district !== undefined && names.has(c.district));
  }
  return out;
}

export async function fetchDictionary(kind: "districts" | "clinics"): Promise<FacilityOption[]> {
  const response = await fetch(`${DICT_URL}/${kind}`);
  if (!response.ok) throw new Error(`Falha ao carregar ${kind}`);
  const rows = await response.json();
  return kind === "districts" ? formatDistricts(rows) : formatClinics(rows);
}
