/**
 * Region names: DisaStatus spells provinces and districts in several ways ("Maputo-Cidade",
 * "Kampfumo"); the shared maps use one key each. Pure and import-free so the route handlers can use
 * it (the shared map tables load the map components, which need a browser).
 */

/** The shared maps' province keys (`PROVINCE_NAMES` in @repo/design_system/lib/report/districts). */
export const PROVINCE_KEYS = [
  "Niassa", "Cabo Delgado", "Nampula", "Zambezia", "Tete", "Manica", "Sofala", "Inhambane", "Gaza",
  "Maputo Provincia", "Maputo Cidade",
] as const;

/** Lowercase, without accents and without anything but letters and digits. */
export function fold(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

const PROVINCE_BY_FOLD = new Map<string, string>(PROVINCE_KEYS.map((k) => [fold(k), k]));

export function normalizeProvince(name: string | null | undefined): string | null {
  if (!name) return null;
  return PROVINCE_BY_FOLD.get(fold(name)) ?? null;
}

/** DisaStatus district spellings that differ from the map's beyond case/accents/punctuation, keyed "<province>|<fold(raw)>". */
export const DISTRICT_ALIASES: Record<string, string> = {
  "Maputo Cidade|kampfumo": "KaMpfumu",
  // DisaStatus has both "Nampula" and "Cidade de Nampula"; the map has only the city district.
  "Nampula|nampula": "Cidade de Nampula",
};

/** One name per district for grouping: the alias when there is one, otherwise the trimmed name. */
export function canonicalDistrict(province: string, name: string | null | undefined): string | null {
  const trimmed = name?.trim();
  if (!trimmed) return null;
  return DISTRICT_ALIASES[`${province}|${fold(trimmed)}`] ?? trimmed;
}

/** The map's district name for `name`, or null when the map has none. */
export function matchDistrict(province: string, name: string | null, candidates: readonly string[]): string | null {
  const canonical = canonicalDistrict(province, name);
  if (!canonical) return null;
  const key = fold(canonical);
  return candidates.find((c) => fold(c) === key) ?? null;
}
