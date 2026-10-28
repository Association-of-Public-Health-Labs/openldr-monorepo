import { beforeEach, describe, expect, it, vi } from "vitest";

const eidGetList = vi.fn();
vi.mock("./api", () => ({ eidGetList: (...a: unknown[]) => eidGetList(...a) }));

import { fetchLabs, labsFor, resetLabsCache, toLabCodes, type EidLab } from "./labs";

const LABS: EidLab[] = [
  { code: "PMB", name: "HG Maputo", lab_type: "conventional" },
  { code: "XAI", name: "Xai-Xai", lab_type: "poc" },
  { code: "BEI", name: "Beira", lab_type: "conventional" },
];

describe("labsFor", () => {
  it("filters by kind", () => {
    expect(labsFor(LABS, "conventional")).toEqual([
      { name: "HG Maputo", codes: ["PMB"] },
      { name: "Beira", codes: ["BEI"] },
    ]);
    expect(labsFor(LABS, "poc")).toEqual([{ name: "Xai-Xai", codes: ["XAI"] }]);
  });

  it("all lists conventional first and suffixes PoC names", () => {
    expect(labsFor(LABS, "all")).toEqual([
      { name: "HG Maputo", codes: ["PMB"] },
      { name: "Beira", codes: ["BEI"] },
      { name: "Xai-Xai (PoC)", codes: ["XAI"] },
    ]);
  });
});

describe("toLabCodes", () => {
  it("maps names to codes and ignores unknown names", () => {
    const groups = labsFor(LABS, "all");
    expect(toLabCodes(groups, ["Beira", "Nope", "Xai-Xai (PoC)"])).toEqual(["BEI", "XAI"]);
    expect(toLabCodes([], ["Beira"])).toEqual([]);
  });
});

describe("fetchLabs", () => {
  beforeEach(() => {
    eidGetList.mockReset();
    resetLabsCache();
  });

  it("calls /laboratories/labs/ once across two calls", async () => {
    eidGetList.mockResolvedValue(LABS);
    const [a, b] = [await fetchLabs("t"), await fetchLabs("t")];
    expect(a).toEqual(LABS);
    expect(b).toEqual(LABS);
    expect(eidGetList).toHaveBeenCalledTimes(1);
    expect(eidGetList).toHaveBeenCalledWith("/laboratories/labs/", {}, "t");
  });

  it("does not cache a failure", async () => {
    eidGetList.mockRejectedValueOnce(new Error("x")).mockResolvedValueOnce(LABS);
    await expect(fetchLabs("t")).rejects.toThrow("x");
    await expect(fetchLabs("t")).resolves.toEqual(LABS);
  });
});
