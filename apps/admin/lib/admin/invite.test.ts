import { describe, expect, it } from "vitest";
import { getDashboards } from "@repo/design_system/dashboards";
import { inviteErrorMessage, postInviteUrl } from "./invite";

const dashboards = getDashboards({});
const url = (id: string) => dashboards.find((d) => d.id === id)!.url;
const access = (over: Partial<{ dashboards: ("vl" | "tb" | "eid" | "admin")[]; admin: boolean }>) => ({
  dashboards: [],
  patientData: false,
  admin: false,
  ...over,
});

describe("postInviteUrl", () => {
  it("goes to the first accessible dashboard", () => {
    expect(postInviteUrl(access({ dashboards: ["tb"] }), dashboards)).toBe(url("tb"));
  });
  it("prefers a data dashboard over admin", () => {
    expect(postInviteUrl(access({ dashboards: ["vl"], admin: true }), dashboards)).toBe(url("vl"));
  });
  it("goes to the admin app when the user only has admin", () => {
    expect(postInviteUrl(access({ admin: true }), dashboards)).toBe(url("admin"));
  });
  it("goes to /sem-acesso with no dashboards and no admin", () => {
    expect(postInviteUrl(access({}), dashboards)).toBe("/sem-acesso");
  });
  it("goes to /sem-acesso when access is unknown", () => {
    expect(postInviteUrl(null, dashboards)).toBe("/sem-acesso");
  });
  it("counts dashboards that are not ready yet", () => {
    const notReady = dashboards.map((d) => (d.id === "eid" ? { ...d, ready: false } : d));
    expect(postInviteUrl(access({ dashboards: ["eid"] }), notReady)).toBe(url("eid"));
  });
});

describe("inviteErrorMessage", () => {
  it.each(["ticket_expired", "ticket_revoked", "ticket_invalid"])("%s asks for a new invitation", (code) => {
    expect(inviteErrorMessage(code)).toMatch(/novo convite/);
  });
  it("tells the user an already-used invitation was used and to ask for a new one", () => {
    const msg = inviteErrorMessage("ticket_already_used");
    expect(msg).toMatch(/já foi utilizado/);
    expect(msg).toMatch(/novo convite/);
  });
  it.each(["form_password_pwned", "form_password_length_too_short", "form_password_not_strong_enough"])(
    "%s gives a Portuguese password message",
    (code) => {
      expect(inviteErrorMessage(code)).toMatch(/palavra-passe/);
    },
  );
  it("falls back to Portuguese for unknown codes", () => {
    expect(inviteErrorMessage("something_new")).toMatch(/Não foi possível/);
  });
});
