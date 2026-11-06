import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  getUserList: vi.fn(), banUser: vi.fn(), unbanUser: vi.fn(), updateUser: vi.fn(), updateUserMetadata: vi.fn(),
  getInvitationList: vi.fn(), createInvitation: vi.fn(), revokeInvitation: vi.fn(),
  createEmailAddress: vi.fn(), deleteEmailAddress: vi.fn(),
  getToken: vi.fn(), post: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: async () => ({ getToken: m.getToken }),
  clerkClient: async () => ({
    users: { getUserList: m.getUserList, banUser: m.banUser, unbanUser: m.unbanUser, updateUser: m.updateUser, updateUserMetadata: m.updateUserMetadata },
    invitations: { getInvitationList: m.getInvitationList, createInvitation: m.createInvitation, revokeInvitation: m.revokeInvitation },
    emailAddresses: { createEmailAddress: m.createEmailAddress, deleteEmailAddress: m.deleteEmailAddress },
  }),
}));
vi.mock("@/config/api", () => ({ api: () => ({ post: m.post }) }));
vi.mock("@/lib/admin/server-auth", async (orig) => ({ ...(await orig<typeof import("@/lib/admin/server-auth")>()), requireAdmin: m.requireAdmin }));

import { AUDIT_WARNING } from "@/lib/admin/users";
import { NotAdminError } from "@/lib/admin/server-auth";
import { countInactive, inviteUser, listUsers, resolveUsers, resendInvitation, revokeInvitation, setBlocked, updateUser } from "./actions";

const meta = (admin: boolean) => ({ dashboards: ["vl"], patientData: false, admin });
const mkUser = (id: string, o: Record<string, unknown> = {}) => ({
  id, firstName: "A", lastName: id, banned: false, lastActiveAt: null, primaryEmailAddressId: `e-${id}`,
  emailAddresses: [{ id: `e-${id}`, emailAddress: `${id}@x.org` }], publicMetadata: meta(false), ...o,
});
const users = (list: ReturnType<typeof mkUser>[]) => m.getUserList.mockResolvedValue({ data: list, totalCount: list.length });
const access = { dashboards: ["tb" as const], patientData: true, admin: false };

beforeEach(() => {
  for (const f of Object.values(m)) f.mockReset();
  m.requireAdmin.mockResolvedValue({ userId: "me" });
  m.getToken.mockResolvedValue("tok");
  m.post.mockResolvedValue({ status: 201 });
  m.getInvitationList.mockResolvedValue({ data: [], totalCount: 0 });
  m.createInvitation.mockResolvedValue({ id: "inv-new" });
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("not an admin", () => {
  it("mutating actions return a Portuguese failure and touch nothing", async () => {
    m.requireAdmin.mockRejectedValue(new NotAdminError());
    for (const r of [
      await inviteUser({ firstName: "a", lastName: "b", email: "c@d.org", access }),
      await updateUser("u", { firstName: "a", lastName: "b", email: "c@d.org", access }),
      await setBlocked("u", true), await resendInvitation("i"), await revokeInvitation("i"),
    ]) expect(r).toEqual({ ok: false, message: expect.stringMatching(/administradores/) });
    expect(m.createInvitation).not.toHaveBeenCalled();
    expect(m.banUser).not.toHaveBeenCalled();
    expect(m.post).not.toHaveBeenCalled();
  });
  it("listUsers throws", async () => {
    m.requireAdmin.mockRejectedValue(new NotAdminError());
    await expect(listUsers()).rejects.toBeInstanceOf(NotAdminError);
  });
});

describe("inviteUser", () => {
  it("carries access and invited name as metadata and audits without a password", async () => {
    const r = await inviteUser({ firstName: " Ana ", lastName: "Silva", email: "ana@x.org", access });
    expect(r).toEqual({ ok: true });
    expect(m.createInvitation).toHaveBeenCalledWith(expect.objectContaining({
      emailAddress: "ana@x.org",
      publicMetadata: { dashboards: ["tb"], patientData: true, admin: false, invitedName: { firstName: "Ana", lastName: "Silva" } },
      redirectUrl: expect.stringMatching(/\/accept-invite$/),
    }));
    const [path, body] = m.post.mock.calls[0];
    expect(path).toBe("/admin/audit");
    expect(body.action.length).toBeLessThanOrEqual(50);
    expect(JSON.stringify(body)).not.toMatch(/password/i);
  });
  it("stays successful but warns when the audit POST fails", async () => {
    m.post.mockRejectedValue(new Error("down"));
    expect(await inviteUser({ firstName: "a", lastName: "b", email: "a@b.org", access })).toEqual({ ok: true, warning: AUDIT_WARNING });
  });
  it("stays successful but warns when there is no token", async () => {
    m.getToken.mockResolvedValue(null);
    expect(await inviteUser({ firstName: "a", lastName: "b", email: "a@b.org", access })).toEqual({ ok: true, warning: AUDIT_WARNING });
    expect(m.post).not.toHaveBeenCalled();
  });
  it("returns Portuguese text and never Clerk's message", async () => {
    m.createInvitation.mockRejectedValue({ errors: [{ code: "duplicate_record", message: "Clerk raw" }] });
    const r = await inviteUser({ firstName: "a", lastName: "b", email: "a@b.org", access });
    expect(r).toEqual({ ok: false, message: expect.stringMatching(/já existe/i) });
    expect(m.post).not.toHaveBeenCalled();
  });
});

describe("setBlocked", () => {
  it("refuses a self-block and writes nothing", async () => {
    users([mkUser("me", { publicMetadata: meta(true) }), mkUser("o", { publicMetadata: meta(true) })]);
    const r = await setBlocked("me", true);
    expect(r.ok).toBe(false);
    expect(m.banUser).not.toHaveBeenCalled();
    expect(m.post).not.toHaveBeenCalled();
  });
  it("refuses blocking the last admin", async () => {
    users([mkUser("me", { publicMetadata: meta(true) }), mkUser("o", { publicMetadata: meta(true), banned: true })]);
    m.requireAdmin.mockResolvedValue({ userId: "someone" });
    expect((await setBlocked("me", true)).ok).toBe(false);
    expect(m.banUser).not.toHaveBeenCalled();
  });
  it("blocks another admin when two are active, and audits", async () => {
    users([mkUser("me", { publicMetadata: meta(true) }), mkUser("o", { publicMetadata: meta(true) })]);
    expect(await setBlocked("o", true)).toEqual({ ok: true });
    expect(m.banUser).toHaveBeenCalledWith("o");
    expect(m.post.mock.calls[0][1]).toMatchObject({ action: "user_block", target_user_id: "o" });
  });
  it("unblocks", async () => {
    users([mkUser("me", { publicMetadata: meta(true) }), mkUser("o", { banned: true })]);
    expect(await setBlocked("o", false)).toEqual({ ok: true });
    expect(m.unbanUser).toHaveBeenCalledWith("o");
  });
});

describe("updateUser", () => {
  const input = { firstName: "A", lastName: "o", email: "o@x.org", access: { dashboards: ["vl" as const], patientData: false, admin: false } };
  it("refuses a self-demotion and writes nothing", async () => {
    users([mkUser("me", { publicMetadata: meta(true) }), mkUser("o", { publicMetadata: meta(true) })]);
    const r = await updateUser("me", { ...input, email: "me@x.org", access: { ...input.access, admin: false } });
    expect(r.ok).toBe(false);
    expect(m.updateUserMetadata).not.toHaveBeenCalled();
    expect(m.createEmailAddress).not.toHaveBeenCalled();
  });
  it("writes the three permission keys only, and no invitedName", async () => {
    users([mkUser("me", { publicMetadata: meta(true) }), mkUser("o")]);
    expect(await updateUser("o", { ...input, firstName: "Novo" })).toEqual({ ok: true });
    expect(m.updateUserMetadata).toHaveBeenCalledWith("o", { publicMetadata: { dashboards: ["vl"], patientData: false, admin: false } });
    expect(m.updateUser).toHaveBeenCalledWith("o", { firstName: "Novo", lastName: "o" });
    expect(JSON.stringify(m.updateUser.mock.calls)).not.toContain("invitedName");
  });
  it("skips the email step when unchanged ignoring case", async () => {
    users([mkUser("o")]);
    await updateUser("o", { ...input, email: "O@X.org" });
    expect(m.createEmailAddress).not.toHaveBeenCalled();
    expect(m.deleteEmailAddress).not.toHaveBeenCalled();
  });
  it("creates the new email before deleting the old one", async () => {
    users([mkUser("o")]);
    await updateUser("o", { ...input, email: "new@x.org" });
    expect(m.createEmailAddress).toHaveBeenCalledWith({ userId: "o", emailAddress: "new@x.org", primary: true, verified: true });
    expect(m.deleteEmailAddress).toHaveBeenCalledWith("e-o");
    expect(m.createEmailAddress.mock.invocationCallOrder[0]).toBeLessThan(m.deleteEmailAddress.mock.invocationCallOrder[0]);
  });
  it("changes nothing else when creating the new email fails", async () => {
    users([mkUser("o")]);
    m.createEmailAddress.mockRejectedValue({ errors: [{ code: "form_identifier_exists" }] });
    const r = await updateUser("o", { ...input, firstName: "Novo", email: "taken@x.org" });
    expect(r).toEqual({ ok: false, message: expect.stringMatching(/já existe/i) });
    expect(m.deleteEmailAddress).not.toHaveBeenCalled();
    expect(m.updateUser).not.toHaveBeenCalled();
    expect(m.updateUserMetadata).not.toHaveBeenCalled();
    expect(m.post).not.toHaveBeenCalled();
  });
});

describe("resendInvitation", () => {
  it("revokes then recreates with the same metadata", async () => {
    const publicMetadata = { ...meta(false), invitedName: { firstName: "J", lastName: "K" } };
    m.getInvitationList.mockResolvedValue({ data: [{ id: "i1", emailAddress: "j@x.org", publicMetadata }], totalCount: 1 });
    expect(await resendInvitation("i1")).toEqual({ ok: true });
    expect(m.revokeInvitation).toHaveBeenCalledWith("i1");
    expect(m.createInvitation).toHaveBeenCalledWith(expect.objectContaining({ emailAddress: "j@x.org", publicMetadata }));
    expect(m.revokeInvitation.mock.invocationCallOrder[0]).toBeLessThan(m.createInvitation.mock.invocationCallOrder[0]);
  });
});

describe("revokeInvitation", () => {
  it("revokes a pending invitation and audits", async () => {
    m.getInvitationList.mockResolvedValue({ data: [{ id: "i1", emailAddress: "j@x.org", publicMetadata: null }], totalCount: 1 });
    expect(await revokeInvitation("i1")).toEqual({ ok: true });
    expect(m.revokeInvitation).toHaveBeenCalledWith("i1");
    expect(m.post.mock.calls[0][1]).toMatchObject({ action: "invitation_revoke", target_user_id: "i1" });
  });
  it("reports not found without revoking", async () => {
    expect(await revokeInvitation("nope")).toEqual({ ok: false, message: expect.stringMatching(/já não existe/) });
    expect(m.revokeInvitation).not.toHaveBeenCalled();
  });
});

describe("resendInvitation failures", () => {
  const pending = { id: "i1", emailAddress: "j@x.org", publicMetadata: { ...meta(false), invitedName: { firstName: "J", lastName: "K" } } };
  it("when create fails after the revoke, audits partially and says the invitation must be recreated", async () => {
    m.getInvitationList.mockResolvedValue({ data: [pending], totalCount: 1 });
    m.createInvitation.mockRejectedValue(new Error("boom"));
    const r = await resendInvitation("i1");
    expect(r).toEqual({ ok: false, message: expect.stringMatching(/cancelado.*novamente/) });
    expect(m.post.mock.calls[0][1]).toMatchObject({
      action: "invitation_resend", target_user_id: "i1",
      changes: { partial: true, old: { publicMetadata: pending.publicMetadata, email: "j@x.org" } },
    });
  });
  it("when the revoke itself fails, nothing is audited", async () => {
    m.getInvitationList.mockResolvedValue({ data: [pending], totalCount: 1 });
    m.revokeInvitation.mockRejectedValue(new Error("boom"));
    expect((await resendInvitation("i1")).ok).toBe(false);
    expect(m.createInvitation).not.toHaveBeenCalled();
    expect(m.post).not.toHaveBeenCalled();
  });
});

describe("crafted input", () => {
  const good = { firstName: "A", lastName: "o", email: "o@x.org", access: { dashboards: ["vl"], patientData: false, admin: false } };
  const bads: [string, unknown][] = [
    ['admin: "false"', { ...good, access: { ...good.access, admin: "false" } }],
    ["admin: 1", { ...good, access: { ...good.access, admin: 1 } }],
    ['dashboards: "x"', { ...good, access: { ...good.access, dashboards: "x" } }],
    ["dashboards with an object", { ...good, access: { ...good.access, dashboards: [{ a: 1 }] } }],
    ["unknown dashboard", { ...good, access: { ...good.access, dashboards: ["zz"] } }],
    ["admin as a dashboard id", { ...good, access: { ...good.access, dashboards: ["admin"] } }],
    ['patientData: "yes"', { ...good, access: { ...good.access, patientData: "yes" } }],
    ["bad email", { ...good, email: "nope" }],
    ["non-string name", { ...good, firstName: 5 }],
    ["null", null],
  ];
  it.each(bads)("updateUser rejects %s before reading or writing", async (_n, input) => {
    users([mkUser("me", { publicMetadata: meta(true) }), mkUser("o", { publicMetadata: meta(true) })]);
    const r = await updateUser("me", input);
    expect(r).toEqual({ ok: false, message: expect.any(String) });
    expect(m.updateUserMetadata).not.toHaveBeenCalled();
    expect(m.post).not.toHaveBeenCalled();
  });
  it.each(bads)("inviteUser rejects %s", async (_n, input) => {
    expect((await inviteUser(input)).ok).toBe(false);
    expect(m.createInvitation).not.toHaveBeenCalled();
  });
  it("writes only the validated, normalised access", async () => {
    users([mkUser("me", { publicMetadata: meta(true) }), mkUser("o")]);
    await updateUser("o", { ...good, extra: "x", access: { ...good.access, dashboards: ["vl", "vl"], junk: 1 } });
    expect(m.updateUserMetadata).toHaveBeenCalledWith("o", { publicMetadata: { dashboards: ["vl"], patientData: false, admin: false } });
  });
  it("setBlocked requires a real boolean", async () => {
    for (const b of ["false", 1, undefined, null]) {
      expect((await setBlocked("o", b as unknown as boolean)).ok).toBe(false);
    }
    expect(m.banUser).not.toHaveBeenCalled();
    expect(m.unbanUser).not.toHaveBeenCalled();
  });
});

describe("updateUser partial audit", () => {
  it("records what was applied when a later step fails", async () => {
    users([mkUser("o")]);
    m.updateUser.mockRejectedValue(new Error("boom"));
    const r = await updateUser("o", { firstName: "Novo", lastName: "o", email: "new@x.org", access: { dashboards: [], patientData: false, admin: false } });
    expect(r.ok).toBe(false);
    expect(m.post.mock.calls[0][1]).toMatchObject({ action: "user_update", changes: { partial: true, new: { email: "new@x.org" } } });
  });
});

describe("setBlocked audit", () => {
  it("uses the real previous state as the old value", async () => {
    users([mkUser("me", { publicMetadata: meta(true) }), mkUser("o", { banned: true })]);
    await setBlocked("o", true);
    expect(m.post.mock.calls[0][1].changes).toEqual({ old: { blocked: true }, new: { blocked: true } });
  });
});

describe("resolveUsers", () => {
  it("returns name and email by id and leaves out unknown ids", async () => {
    m.getUserList.mockResolvedValue({ data: [mkUser("u1", { firstName: "Ana", lastName: "Exemplo" })], totalCount: 1 });
    expect(await resolveUsers(["u1", "gone", "u1"])).toEqual({ u1: { name: "Ana Exemplo", email: "u1@x.org" } });
    expect(m.getUserList).toHaveBeenCalledWith({ userId: ["u1", "gone"], limit: 100 });
  });
  it("rejects non-admins before touching Clerk", async () => {
    m.requireAdmin.mockRejectedValue(new NotAdminError());
    await expect(resolveUsers(["u1"])).rejects.toThrow(NotAdminError);
    expect(m.getUserList).not.toHaveBeenCalled();
  });
  it("rejects input that is not an array of strings, or has more than 100", async () => {
    await expect(resolveUsers("u1" as never)).rejects.toThrow();
    await expect(resolveUsers([1] as never)).rejects.toThrow();
    await expect(resolveUsers(Array.from({ length: 101 }, (_, i) => `u${i}`))).rejects.toThrow();
    expect(m.getUserList).not.toHaveBeenCalled();
  });
  it("returns {} for no ids without calling Clerk", async () => {
    expect(await resolveUsers([])).toEqual({});
    expect(m.getUserList).not.toHaveBeenCalled();
  });
});

describe("countInactive", () => {
  const day = 86_400_000;
  it("counts active users never seen or not seen for 90 days, not blocked ones", async () => {
    users([
      mkUser("never", { lastActiveAt: null }),
      mkUser("old", { lastActiveAt: Date.now() - 120 * day }),
      mkUser("recent", { lastActiveAt: Date.now() - 5 * day }),
      mkUser("blocked", { banned: true, lastActiveAt: null }),
    ]);
    expect(await countInactive()).toBe(2);
  });
  it("rejects non-admins", async () => {
    m.requireAdmin.mockRejectedValue(new NotAdminError());
    await expect(countInactive()).rejects.toThrow(NotAdminError);
  });
});

describe("audit failure on every mutating action", () => {
  const input = { firstName: "A", lastName: "o", email: "o@x.org", access: { dashboards: ["vl" as const], patientData: false, admin: false } };
  const pending = { id: "i1", emailAddress: "j@x.org", publicMetadata: { ...meta(false), invitedName: { firstName: "J", lastName: "K" } } };
  beforeEach(() => { m.post.mockRejectedValue(new Error("down")); });
  it("updateUser", async () => {
    users([mkUser("me", { publicMetadata: meta(true) }), mkUser("o")]);
    expect(await updateUser("o", input)).toEqual({ ok: true, warning: AUDIT_WARNING });
    expect(m.updateUserMetadata).toHaveBeenCalled();
  });
  it("setBlocked", async () => {
    users([mkUser("me", { publicMetadata: meta(true) }), mkUser("o")]);
    expect(await setBlocked("o", true)).toEqual({ ok: true, warning: AUDIT_WARNING });
    expect(m.banUser).toHaveBeenCalledWith("o");
  });
  it("resendInvitation", async () => {
    m.getInvitationList.mockResolvedValue({ data: [pending], totalCount: 1 });
    expect(await resendInvitation("i1")).toEqual({ ok: true, warning: AUDIT_WARNING });
  });
  it("revokeInvitation", async () => {
    m.getInvitationList.mockResolvedValue({ data: [pending], totalCount: 1 });
    expect(await revokeInvitation("i1")).toEqual({ ok: true, warning: AUDIT_WARNING });
  });
});
