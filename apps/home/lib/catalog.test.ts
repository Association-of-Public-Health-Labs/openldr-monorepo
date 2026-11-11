import { describe, expect, it } from "vitest";
import type { DashboardInfo } from "@repo/design_system/dashboards";
import { buildCatalog } from "./catalog";

const DASHBOARDS: DashboardInfo[] = [
  { id: "vl", name: "Carga Viral", portalTitle: "Portal de Carga Viral", url: "https://vl.example", primary: "#00B000", primaryForeground: "#fff", ready: true },
  { id: "tb", name: "Tuberculose", portalTitle: "Portal de TB", url: "https://tb.example", primary: "#FF3030", primaryForeground: "#fff", ready: true },
  { id: "eid", name: "DPI", portalTitle: "Portal de DPI", url: "https://eid.example", primary: "#fda92d", primaryForeground: "#1C252E", ready: false },
  { id: "admin", name: "Administração", portalTitle: "Administração", url: "https://admin.example", primary: "#00d0f0", primaryForeground: "#1C252E", ready: true },
];

describe("buildCatalog", () => {
  it("lists the registry dashboards in order, then the planned ones", () => {
    expect(buildCatalog(DASHBOARDS).map((e) => e.id)).toEqual(["vl", "tb", "eid", "ad"]);
  });

  it("never lists the admin app", () => {
    expect(buildCatalog(DASHBOARDS).some((e) => (e.id as string) === "admin")).toBe(false);
  });

  it("takes name, title, link and colour from the registry", () => {
    const vl = buildCatalog(DASHBOARDS)[0]!;
    expect(vl).toMatchObject({ name: "Carga Viral", portalTitle: "Portal de Carga Viral", href: "https://vl.example", color: "#00B000", available: true });
  });

  it("offers no link for a dashboard that is not ready", () => {
    const eid = buildCatalog(DASHBOARDS).find((e) => e.id === "eid")!;
    expect(eid.available).toBe(false);
    expect(eid.href).toBeUndefined();
  });

  it("lists Doenças Avançadas as planned, without a link", () => {
    const ad = buildCatalog(DASHBOARDS).find((e) => e.id === "ad")!;
    expect(ad).toMatchObject({ available: false, tests: ["CD4", "CrAg", "TB-LAM"] });
    expect(ad.href).toBeUndefined();
  });

  it("gives every entry a programme, a description and its tests", () => {
    for (const e of buildCatalog(DASHBOARDS)) {
      expect(e.programme).toBeTruthy();
      expect(e.description.length).toBeGreaterThan(20);
      expect(e.tests.length).toBeGreaterThan(0);
    }
  });
});
