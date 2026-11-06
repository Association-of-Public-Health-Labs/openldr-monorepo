import { describe, expect, it } from "vitest";
import { countActiveAdmins, filterRows, guardChange, mergeRows, validateUserInput, type UserRow } from "./users";

const base = { actorId: "a", targetId: "b", targetIsAdmin: false, nextAdmin: false, blocking: false, adminCount: 2 };

describe("guardChange", () => {
  it("refuses a self-block", () => {
    expect(guardChange({ ...base, targetId: "a", targetIsAdmin: true, nextAdmin: true, blocking: true })).toMatch(/própria/i);
  });
  it("refuses removing your own admin", () => {
    expect(guardChange({ ...base, targetId: "a", targetIsAdmin: true, nextAdmin: false })).toMatch(/própri/i);
  });
  it("refuses demoting the last admin", () => {
    expect(guardChange({ ...base, targetIsAdmin: true, nextAdmin: false, adminCount: 1 })).toMatch(/último/i);
  });
  it("refuses blocking the last admin", () => {
    expect(guardChange({ ...base, targetIsAdmin: true, nextAdmin: true, blocking: true, adminCount: 1 })).toMatch(/último/i);
  });
  it("allows demoting another admin when there are two", () => {
    expect(guardChange({ ...base, targetIsAdmin: true, nextAdmin: false, adminCount: 2 })).toBeNull();
  });
  it("allows blocking another admin when there are two", () => {
    expect(guardChange({ ...base, targetIsAdmin: true, nextAdmin: true, blocking: true, adminCount: 2 })).toBeNull();
  });
  it("allows changes to non-admins and unblocking", () => {
    expect(guardChange({ ...base, blocking: true, adminCount: 1 })).toBeNull();
    expect(guardChange({ ...base, targetIsAdmin: true, nextAdmin: true, blocking: false, adminCount: 1 })).toBeNull();
  });
});

const access = (admin = false, dashboards: ("vl" | "tb" | "eid" | "admin")[] = [], patientData = false) => ({ admin, dashboards, patientData });
const user = (o: Record<string, unknown> = {}) => ({
  id: "u1", firstName: "Ana", lastName: "Zeca", banned: false, lastActiveAt: 1000,
  primaryEmailAddressId: "e1", emailAddresses: [{ id: "e1", emailAddress: "ana@x.org" }],
  publicMetadata: access(false, ["vl"], true), ...o,
});
const invitation = (o: Record<string, unknown> = {}) => ({
  id: "i1", emailAddress: "inv@x.org", publicMetadata: { ...access(false, ["tb"]), invitedName: { firstName: "João", lastName: "Álvaro" } }, ...o,
});

describe("mergeRows", () => {
  it("returns a user and an invitation, sorted by last name", () => {
    const rows = mergeRows([user()], [invitation()]);
    expect(rows.map((r) => [r.kind, r.id])).toEqual([["invitation", "i1"], ["user", "u1"]]);
    expect(rows[1]).toMatchObject({ email: "ana@x.org", status: "active", lastActiveAt: 1000, access: { dashboards: ["vl"], patientData: true, admin: false } });
  });
  it("marks a banned user as blocked", () => {
    expect(mergeRows([user({ banned: true })], [])[0].status).toBe("blocked");
  });
  it("marks a pending invitation as invited with its metadata as access and invited name", () => {
    expect(mergeRows([], [invitation()])[0]).toMatchObject({
      kind: "invitation", status: "invited", firstName: "João", lastName: "Álvaro", email: "inv@x.org", lastActiveAt: null,
      access: { dashboards: ["tb"], patientData: false, admin: false },
    });
  });
  it("gives no access when metadata is missing or malformed", () => {
    expect(mergeRows([user({ publicMetadata: {} })], [invitation({ publicMetadata: null })]).every((r) => !r.access.admin && r.access.dashboards.length === 0 && !r.access.patientData)).toBe(true);
  });
});

describe("countActiveAdmins", () => {
  it("counts admins that are not banned", () => {
    const users = [user({ id: "a", publicMetadata: access(true) }), user({ id: "b", publicMetadata: access(true), banned: true }), user({ id: "c" })];
    expect(countActiveAdmins(users)).toBe(1);
  });
});

describe("filterRows", () => {
  const rows: UserRow[] = mergeRows(
    [
      user({ id: "1", firstName: "José", lastName: "Maçal", emailAddresses: [{ id: "e1", emailAddress: "jose@x.org" }], publicMetadata: access(false, ["vl"], true) }),
      user({ id: "2", firstName: "Maria", lastName: "Silva", emailAddresses: [{ id: "e1", emailAddress: "maria@y.org" }], banned: true, publicMetadata: access(true, ["tb", "vl"], false) }),
    ],
    [invitation({ id: "3", emailAddress: "novo@z.org", publicMetadata: access(false, ["tb"], true) })],
  );
  const ids = (r: UserRow[]) => r.map((x) => x.id).sort();
  it("returns everything with no filters", () => expect(ids(filterRows(rows, {}))).toEqual(["1", "2", "3"]));
  it("searches case- and accent-insensitively across name and email", () => {
    expect(ids(filterRows(rows, { search: "JOSE" }))).toEqual(["1"]);
    expect(ids(filterRows(rows, { search: "macal" }))).toEqual(["1"]);
    expect(ids(filterRows(rows, { search: "Y.ORG" }))).toEqual(["2"]);
  });
  it("filters by status", () => expect(ids(filterRows(rows, { status: "blocked" }))).toEqual(["2"]));
  it("filters by dashboard", () => expect(ids(filterRows(rows, { dashboard: "vl" }))).toEqual(["1", "2"]));
  it("filters by patient data", () => {
    expect(ids(filterRows(rows, { patientData: true }))).toEqual(["1", "3"]);
    expect(ids(filterRows(rows, { patientData: false }))).toEqual(["2"]);
  });
  it("combines filters", () => expect(ids(filterRows(rows, { dashboard: "vl", patientData: true, search: "jose" }))).toEqual(["1"]));
});

describe("validateUserInput names", () => {
  const base = { firstName: "Ana", lastName: "Exemplo", email: "ana@exemplo.org", access: { dashboards: [], patientData: false, admin: false } };

  it("rejects an empty or blank first or last name", () => {
    expect(validateUserInput({ ...base, firstName: "  " })).toEqual({ ok: false, message: "Indique o nome." });
    expect(validateUserInput({ ...base, lastName: "" })).toEqual({ ok: false, message: "Indique o apelido." });
  });
});
