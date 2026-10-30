import { describe, expect, it, vi } from "vitest";
import { dataFor, buildView, fetchTransport, type GetList } from "@repo/design_system/lib/report/transport/data";
import { recentWeeks } from "@repo/design_system/lib/weeks";
import * as constants from "./constants";
import { ENDPOINTS, EXTRA_PARAMS, LABELS, REPORTS, REPORTS_ENDPOINT } from "./constants";

const weeks = recentWeeks(28, new Date(2026, 9, 21));
const last = { from: 27, to: 27 };
const query = { range: last, province: null, district: null };

describe("EID transport", () => {
  it("covers conventional laboratories only: the API value Convencional", () => {
    expect(EXTRA_PARAMS).toEqual({ type_of_test: "Convencional" });
  });

  it("sends type_of_test=Convencional on every request", async () => {
    const get = vi.fn().mockResolvedValue([]);
    await fetchTransport(get as unknown as GetList, ENDPOINTS, weeks, { ...query, extraParams: EXTRA_PARAMS }, "t");
    expect(get).toHaveBeenCalled();
    for (const [, params] of get.mock.calls) expect(params.type_of_test).toBe("Convencional");
  });

  it("has no lab-type switch", () => {
    expect(constants).not.toHaveProperty("TYPE_TABS");
    expect(constants).not.toHaveProperty("typeParams");
  });

  it("keeps a view fetched for Convencional, and ignores one fetched without it", () => {
    const responses = { children: [], weekly: [], national: [] };
    const conv = buildView(weeks, { ...query, extraParams: EXTRA_PARAMS }, responses);
    expect(dataFor(conv, EXTRA_PARAMS)).toBe(conv);
    expect(dataFor(conv, undefined)).toBeNull();
  });

  it("uses the EID labels and endpoints", () => {
    expect(LABELS.LEG).toBe("Colheita à recepção no laboratório");
    expect(ENDPOINTS.base).toBe("/hiv/eid");
  });

  it("lists the weekly DPI reports, in EID wording that never names the source", () => {
    expect(REPORTS_ENDPOINT).toBe("/api/reports/dpi");
    expect(REPORTS.TITLE).toBe("Relatórios semanais");
    expect(REPORTS.SUBTITLE).toMatch(/diagnóstico precoce infantil/i);
    for (const text of Object.values(REPORTS)) expect(text).not.toMatch(/nextcloud/i);
  });
});
