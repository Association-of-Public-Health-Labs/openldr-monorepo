import { beforeEach, describe, expect, it, vi } from "vitest";

const eidGet = vi.fn();
vi.mock("@/lib/eid/api", () => ({ eidGet: (...a: unknown[]) => eidGet(...a), eidGetList: (...a: unknown[]) => eidGet(...a) }));

import { initialLabDrill, labDrillParams } from "@repo/design_system/lib/report/lab-drill";
import { fetchData, toExcel } from "./actions";
import { DRILL_START, EXTRA_PARAMS } from "./constants";

const range = { start: "2026-01-01", end: "2026-06-30" };

describe("eid-tested-by-lab-poc", () => {
  beforeEach(() => {
    eidGet.mockReset();
    eidGet.mockResolvedValue([]);
  });
  it("first request equals the cache seed (lab_type from the card, facility_type from the drill start)", async () => {
    // What the kit card sends: extraParams merged with the drill's first-level params.
    await fetchData(range, [], "t", { ...EXTRA_PARAMS, ...labDrillParams(initialLabDrill(DRILL_START), []) });
    expect(eidGet).toHaveBeenCalledWith(
      "/laboratories/tested_samples/",
      { interval_dates: "2026-01-01,2026-06-30", lab_type: "poc", facility_type: "province" },
      "t",
    );
  });
  it("the card's own params leave facility_type to the drill", () => {
    expect(EXTRA_PARAMS).toEqual({ lab_type: "poc" });
    expect(DRILL_START).toBe("province");
  });
  it("starts at the province level", () => {
    expect(toExcel([{ requesting_facility: "Gaza", total: 1, positive: 0, negative: 1 }], "province").header[0]).toBe("Província");
  });
});
