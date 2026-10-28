import { describe, expect, it } from "vitest";
import { buildNavItems, PAGE_LABELS, UNRELEASED_PAGES } from "./nav";

describe("buildNavItems", () => {
  it("shows only the Sumário to a production non-admin", () => {
    expect(buildNavItems("/", false, true).map((i) => i.href)).toEqual(["/"]);
  });
  it("shows all five pages in order to a dev admin", () => {
    expect(buildNavItems("/", true, false).map((i) => i.href)).toEqual(["/", "/lab", "/clinic", "/patients", "/transport"]);
  });
  it("never shows Pacientes to a non-admin", () => {
    expect(buildNavItems("/", false, false).map((i) => i.href)).not.toContain("/patients");
  });
  it("keeps every page but the Sumário unreleased", () => {
    expect(UNRELEASED_PAGES).toEqual(["/lab", "/clinic", "/patients", "/transport"]);
  });
  it("marks only the current page active", () => {
    expect(buildNavItems("/lab", true, false).filter((i) => i.active).map((i) => i.href)).toEqual(["/lab"]);
  });
  it("labels the pages in Portuguese", () => {
    expect(PAGE_LABELS["/"]).toBe("Sumário");
    expect(PAGE_LABELS["/clinic"]).toBe("Província/Distrito/US");
  });
});
