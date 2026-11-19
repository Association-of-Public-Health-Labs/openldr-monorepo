import { describe, expect, it } from "vitest";
import { checkedLabel, locationLabel, onlineSinceLabel, realTime } from "./host-labels";

describe("host labels", () => {
  it("adds the 2 h DisaStatus stores its times behind", () => {
    expect(new Date(realTime("2026-11-19T09:55:50Z")).toISOString()).toBe("2026-11-19T11:55:50.000Z");
    expect(realTime(null)).toBeNaN();
    expect(realTime("not a date")).toBeNaN();
  });

  it("labels the last check from updated_at, which is stored 2 h behind", () => {
    const now = new Date("2026-11-19T09:34:00Z");
    expect(checkedLabel("2026-11-19T07:33:28Z", now)).toBe("verificado agora");
    expect(checkedLabel("2026-11-19T07:30:00Z", now)).toBe("verificado há 4 min");
    expect(checkedLabel("2026-11-19T02:34:00Z", now)).toBe("verificado há 5 h");
    expect(checkedLabel("2026-10-27T07:34:00Z", now)).toBe("verificado há 23 dias");
    expect(checkedLabel(null, now)).toBeUndefined();
  });

  it("says how long the site has been online in hours, then days", () => {
    expect(onlineSinceLabel(null)).toBe("Online");
    expect(onlineSinceLabel(0)).toBe("Online há menos de 1 h");
    expect(onlineSinceLabel(14)).toBe("Online há 14 h");
    expect(onlineSinceLabel(80)).toBe("Online há 3 dias");
  });

  it("shows province and district, tidying spelling variants", () => {
    expect(locationLabel({ ProvinceName: "Maputo-Cidade", DistrictName: "KaMpfumu" })).toBe("Maputo Cidade · KaMpfumu");
    expect(locationLabel({ ProvinceName: "", DistrictName: null })).toBe("Sem província · —");
  });
});
