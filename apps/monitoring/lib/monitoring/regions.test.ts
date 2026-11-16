import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { canonicalDistrict, fold, matchDistrict, normalizeProvince, PROVINCE_KEYS } from "./regions";
import pairs from "./__fixtures__/regions.json";

// District names as the shared province maps draw them, read from the map sources: the real tables
// can't be imported in node (the map components touch `window`).
const MAPS_DIR = fileURLToPath(new URL("../../../../packages/design_system_mui/src/atoms/maps/provinces/", import.meta.url));
function mapDistricts(): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const dir of readdirSync(MAPS_DIR, { withFileTypes: true }).filter((d) => d.isDirectory())) {
    const file = readdirSync(MAPS_DIR + dir.name).find((f) => f.endsWith(".tsx") && !f.includes("stories"));
    const src = readFileSync(`${MAPS_DIR}${dir.name}/${file}`, "utf8");
    const table = src.match(/const DISTRICT_MAP[^{]*\{([\s\S]*?)\n\}/)?.[1] ?? "";
    const province = normalizeProvince(dir.name.replace(/_/g, " "));
    if (province) out[province] = [...table.matchAll(/:\s*(["'])([^"']+)\1/g)].map((m) => m[2]);
  }
  return out;
}

describe("normalizeProvince", () => {
  it("maps DisaStatus spellings to the shared map keys", () => {
    expect(normalizeProvince("Maputo-Cidade")).toBe("Maputo Cidade");
    expect(normalizeProvince("Maputo Cidade")).toBe("Maputo Cidade");
    expect(normalizeProvince("Maputo Província")).toBe("Maputo Provincia");
    expect(normalizeProvince("Zambézia")).toBe("Zambezia");
    expect(normalizeProvince("cabo delgado")).toBe("Cabo Delgado");
  });
  it("returns null for empty or unknown names", () => {
    expect(normalizeProvince("")).toBeNull();
    expect(normalizeProvince(null)).toBeNull();
    expect(normalizeProvince("Atlantis")).toBeNull();
  });
});

describe("canonicalDistrict", () => {
  it("merges known spelling variants", () => {
    expect(canonicalDistrict("Maputo Cidade", "Kampfumo")).toBe(canonicalDistrict("Maputo Cidade", "KaMpfumu"));
  });
  it("trims, and returns null for empty names", () => {
    expect(canonicalDistrict("Tete", "  Moatize ")).toBe("Moatize");
    expect(canonicalDistrict("Tete", "")).toBeNull();
    expect(canonicalDistrict("Tete", null)).toBeNull();
  });
});

describe("matchDistrict", () => {
  it("ignores case, accents, hyphens and spaces", () => {
    expect(fold("Chókwè")).toBe(fold("Chokwe"));
    expect(matchDistrict("Gaza", "Xai Xai", ["Xai-Xai", "Chokwe"])).toBe("Xai-Xai");
    expect(matchDistrict("Gaza", "Chókwè", ["Xai-Xai", "Chokwe"])).toBe("Chokwe");
    expect(matchDistrict("Gaza", "Nowhere", ["Xai-Xai"])).toBeNull();
  });

  it("finds a map district for every district DisaStatus reports (live sample, 2026-11-16)", () => {
    const maps = mapDistricts();
    expect(Object.keys(maps).sort()).toEqual([...PROVINCE_KEYS].sort());
    const unmatched = (pairs as { province: string; district: string }[])
      .map(({ province, district }) => ({ p: normalizeProvince(province), d: district }))
      .filter(({ p, d }) => p && d)
      .filter(({ p, d }) => !matchDistrict(p!, canonicalDistrict(p!, d), maps[p!]))
      .map(({ p, d }) => `${p}|${d}`);
    expect(unmatched).toEqual([]);
  });
});
