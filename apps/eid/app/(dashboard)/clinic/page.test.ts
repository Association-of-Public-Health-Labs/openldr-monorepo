import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("clinic page", () => {
  it("renders the twelve cards in legacy order", () => {
    const src = readFileSync(join(__dirname, "page.tsx"), "utf8");
    const used = [...src.matchAll(/^\s+<(Eid\w+) \/>/gm)].map((m) => m[1]);
    expect(used).toEqual([
      "EidRegisteredByFacility", "EidRegisteredByMonthFacility", "EidTestedByFacility", "EidTestedByMonthFacility",
      "EidRejectedByFacility", "EidRejectedByMonthFacility", "EidGenderByFacility", "EidGenderByMonth",
      "EidTatAvgByFacility", "EidTatAvgByMonth", "EidTatDaysByFacility", "EidTatDaysByMonth",
    ]);
  });
});
