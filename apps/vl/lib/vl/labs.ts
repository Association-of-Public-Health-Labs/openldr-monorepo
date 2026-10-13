import type { Params } from "./api";
import { intervalParam, type DateRange } from "./dates";

/** The 16 lab groups of the legacy VL lab filter (openldr-frontend FacilitiesSelect), verbatim. */
export const LAB_GROUPS: { name: string; codes: string[] }[] = [
  { name: "Carmelo", codes: ["PCA"] },
  { name: "Cabo Delgado", codes: ["PCD", "PDD"] },
  { name: "Chimoio", codes: ["PCV", "PCM"] },
  { name: "DREAM Beira", codes: ["PDB"] },
  { name: "DREAM Maputo", codes: ["PDM"] },
  { name: "Clinica da UEM", codes: ["PEM", "PBU"] },
  { name: "H Militar de Maputo", codes: ["PIC", "PIT", "PIV"] },
  { name: "Jose Macamo", codes: ["PJC", "PJV"] },
  { name: "INS", codes: ["PMB"] },
  { name: "HG Machava", codes: ["PMV", "PMC"] },
  { name: "HG Mavalane", codes: ["PMA", "PVM"] },
  { name: "Nampula", codes: ["PNC", "PNT"] },
  { name: "Ponta Gea", codes: ["PPG"] },
  { name: "Quelimane", codes: ["PQM", "PQA", "PQE"] },
  { name: "HP Tete", codes: ["PTV", "PTC"] },
  { name: "Xai-Xai", codes: ["PXM", "PXE", "PXA"] },
];

export const labCodes = (names: string[]): string[] =>
  LAB_GROUPS.filter((group) => names.includes(group.name)).flatMap((group) => group.codes);

export const labParams = (range: DateRange, codes: string[]): Params => ({
  interval_dates: intervalParam(range),
  lab_code: codes,
});
