import { describe, expect, it, vi } from "vitest";
import { dataFor, buildView, fetchTransport, type GetList } from "@repo/design_system/lib/report/transport/data";
import { recentWeeks } from "@repo/design_system/lib/weeks";
import { ENDPOINTS, LABELS, TYPE_TABS, typeParams } from "./constants";

const weeks = recentWeeks(28, new Date(2026, 9, 21));
const last = { from: 27, to: 27 };
const query = { range: last, province: null, district: null };

describe("EID transport", () => {
  it("sends no type_of_test by default (all)", async () => {
    const get = vi.fn().mockResolvedValue([]);
    expect(typeParams("all")).toBeUndefined();
    await fetchTransport(get as unknown as GetList, ENDPOINTS, weeks, { ...query, extraParams: typeParams("all") }, "t");
    expect(get).toHaveBeenCalled();
    for (const [, params] of get.mock.calls) expect(params).not.toHaveProperty("type_of_test");
  });

  it("the PoC tab sends the API value Point-of-care, Convencional sends Convencional", async () => {
    expect(TYPE_TABS.map((t) => t.label)).toEqual(["Todos", "Convencional", "PoC"]);
    expect(typeParams("poc")).toEqual({ type_of_test: "Point-of-care" });
    expect(typeParams("conventional")).toEqual({ type_of_test: "Convencional" });
    const get = vi.fn().mockResolvedValue([]);
    await fetchTransport(get as unknown as GetList, ENDPOINTS, weeks, { ...query, extraParams: typeParams("poc") }, "t");
    for (const [, params] of get.mock.calls) expect(params.type_of_test).toBe("Point-of-care");
  });

  it("ignores a response tagged with the other type", () => {
    const responses = { children: [], weekly: [], national: [] };
    const conv = buildView(weeks, { ...query, extraParams: typeParams("conventional") }, responses);
    expect(dataFor(conv, typeParams("poc"))).toBeNull();
    expect(dataFor(conv, typeParams("all"))).toBeNull();
    expect(dataFor(conv, typeParams("conventional"))).toBe(conv);
  });

  it("uses the EID labels and endpoints", () => {
    expect(LABELS.LEG).toBe("Colheita à recepção no laboratório");
    expect(ENDPOINTS.base).toBe("/hiv/eid");
  });
});
