import {
  CABO_DELGADO_DISTRICT_CODES, GAZA_DISTRICT_CODES, INHAMBANE_DISTRICT_CODES, MANICA_DISTRICT_CODES,
  MAPUTO_CIDADE_DISTRICT_CODES, MAPUTO_PROVINCIA_DISTRICT_CODES, NAMPULA_DISTRICT_CODES, NIASSA_DISTRICT_CODES,
  SOFALA_DISTRICT_CODES, TETE_DISTRICT_CODES, ZAMBEZIA_DISTRICT_CODES,
} from "../../app/atoms/maps/Provinces";

/** Province names as the API and the national map use them, with their district code tables. */
export const DISTRICT_CODES: Record<string, Readonly<Record<string, string>>> = {
  Niassa: NIASSA_DISTRICT_CODES,
  "Cabo Delgado": CABO_DELGADO_DISTRICT_CODES,
  Nampula: NAMPULA_DISTRICT_CODES,
  Zambezia: ZAMBEZIA_DISTRICT_CODES,
  Tete: TETE_DISTRICT_CODES,
  Manica: MANICA_DISTRICT_CODES,
  Sofala: SOFALA_DISTRICT_CODES,
  Inhambane: INHAMBANE_DISTRICT_CODES,
  Gaza: GAZA_DISTRICT_CODES,
  "Maputo Provincia": MAPUTO_PROVINCIA_DISTRICT_CODES,
  "Maputo Cidade": MAPUTO_CIDADE_DISTRICT_CODES,
};
export const PROVINCE_NAMES = Object.keys(DISTRICT_CODES);

/** Accented names for display (the API and the maps use unaccented keys). */
export const PROVINCE_LABELS: Record<string, string> = { Zambezia: "Zambézia", "Maputo Provincia": "Maputo Província" };
