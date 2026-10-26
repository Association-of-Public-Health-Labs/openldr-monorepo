export type ProvinceKey = "mc" | "mp" | "gz" | "ib" | "mn" | "sf" | "tt" | "zb" | "np" | "ns" | "cd";

const KEYS: Record<string, ProvinceKey> = {
  "maputo cidade": "mc",
  "cidade de maputo": "mc",
  "maputo provincia": "mp",
  "provincia de maputo": "mp",
  gaza: "gz",
  inhambane: "ib",
  manica: "mn",
  sofala: "sf",
  tete: "tt",
  zambezia: "zb",
  nampula: "np",
  niassa: "ns",
  "cabo delgado": "cd",
};

export const normalizeName = (name: string): string =>
  name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();

export function provinceKey(name: string | null | undefined): ProvinceKey | undefined {
  if (!name) return undefined;
  return KEYS[normalizeName(name)];
}
