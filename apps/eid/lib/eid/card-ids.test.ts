import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(__dirname, "../../app/(dashboard)");
const ids = (page: string) =>
  readdirSync(join(root, page, "reports"))
    .map((d) => join(root, page, "reports", d, "constants.ts"))
    .filter(existsSync)
    .map((f) => /CARD_ID = "([^"]+)"/.exec(readFileSync(f, "utf8"))?.[1] as string);

describe("card ids", () => {
  it("of the Província/Distrito/US page never equal a Sumário or Laboratório id", () => {
    const clinic = ids("clinic");
    const others = new Set([...ids("(index)"), ...ids("lab")]);
    expect(clinic.every(Boolean)).toBe(true);
    expect(new Set(clinic).size).toBe(clinic.length);
    expect(clinic.filter((id) => others.has(id))).toEqual([]);
  });
  it("suffixes the clinic by-month cards with -facility", () => {
    const clinic = ids("clinic");
    for (const id of ["eid-registered-by-month-facility", "eid-tested-by-month-facility", "eid-rejected-by-month-facility"]) {
      expect(clinic).toContain(id);
    }
  });
});
