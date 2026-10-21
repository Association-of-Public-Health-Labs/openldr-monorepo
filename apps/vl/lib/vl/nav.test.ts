import { describe, expect, it } from "vitest";
import { buildNavItems, PAGE_LABELS } from "./nav";

describe("buildNavItems", () => {
  it("hides Pacientes for non-admins", () => {
    expect(buildNavItems("/", false, true).map((i) => i.href)).toEqual(["/", "/lab", "/clinic"]);
  });
  it("shows Pacientes for admins", () => {
    expect(buildNavItems("/", true, true).map((i) => i.href)).toEqual(["/", "/lab", "/clinic", "/patients"]);
  });
  it("lists Transporte (still being built) outside production only", () => {
    expect(buildNavItems("/", false, false).map((i) => i.href)).toEqual(["/", "/lab", "/clinic", "/transport"]);
    expect(buildNavItems("/", true, true).some((i) => i.href === "/transport")).toBe(false);
    expect(PAGE_LABELS["/transport"]).toBe("Transporte");
  });
  it("marks only the current page active", () => {
    const items = buildNavItems("/lab", true);
    expect(items.filter((i) => i.active).map((i) => i.href)).toEqual(["/lab"]);
  });
  it("gives Província/Distrito/US a short label for the collapsed sidebar", () => {
    const clinic = buildNavItems("/", true).find((i) => i.href === "/clinic");
    expect(clinic?.label).toBe("Província/Distrito/US");
    expect(clinic?.shortLabel).toBe("Província");
    expect(buildNavItems("/", true).filter((i) => i.shortLabel).map((i) => i.href)).toEqual(["/clinic"]);
  });
  it("labels every page in Portuguese", () => {
    expect(PAGE_LABELS["/clinic"]).toBe("Província/Distrito/US");
    expect(PAGE_LABELS["/patients"]).toBe("Pacientes");
  });
});
