import { describe, expect, it } from "vitest";
import type { UserAccess } from "../../../lib/access";
import { noAccessContent } from "./no-access-content";

const access = (over: Partial<UserAccess>): UserAccess => ({ dashboards: [], patientData: false, admin: false, ...over });

describe("noAccessContent", () => {
  it("gives nothing for null access", () => {
    expect(noAccessContent("tb", null)).toEqual({ open: null, others: [] });
  });
  it("offers the way back in when the user can already open the dashboard", () => {
    const c = noAccessContent("tb", access({ dashboards: ["tb"] }));
    expect(c.open).toMatchObject({ id: "tb", href: "/" });
    expect(c.others).toEqual([]);
  });
  it("lists the other dashboards the user can open, not the current one", () => {
    const c = noAccessContent("tb", access({ dashboards: ["vl", "eid"] }));
    expect(c.open).toBeNull();
    expect(c.others.map((l) => l.id)).toEqual(["vl", "eid"]);
  });
  it("lists admin only for admins", () => {
    expect(noAccessContent("tb", access({ dashboards: ["vl"] })).others.map((l) => l.id)).toEqual(["vl"]);
    expect(noAccessContent("tb", access({ admin: true })).others.map((l) => l.id)).toEqual(["admin"]);
  });
  it("gives no links for a user with no dashboards", () => {
    expect(noAccessContent("vl", access({}))).toEqual({ open: null, others: [] });
  });
});
