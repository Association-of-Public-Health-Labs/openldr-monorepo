import { describe, expect, it } from "vitest";
import { buildNavItems, PAGE_LABELS } from "./nav";

describe("buildNavItems", () => {
  it("hides Pacientes for non-admins", () => {
    expect(buildNavItems("/", false).map((i) => i.href)).toEqual(["/", "/lab", "/clinic"]);
  });
  it("shows Pacientes for admins", () => {
    expect(buildNavItems("/", true).map((i) => i.href)).toEqual(["/", "/lab", "/clinic", "/patients"]);
  });
  it("marks only the current page active", () => {
    const items = buildNavItems("/lab", true);
    expect(items.filter((i) => i.active).map((i) => i.href)).toEqual(["/lab"]);
  });
  it("labels every page in Portuguese", () => {
    expect(PAGE_LABELS["/clinic"]).toBe("Província/Distrito/US");
    expect(PAGE_LABELS["/patients"]).toBe("Pacientes");
  });
});
