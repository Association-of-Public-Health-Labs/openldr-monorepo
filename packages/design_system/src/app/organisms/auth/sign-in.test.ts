import { describe, expect, it, vi } from "vitest";
import { getDashboard } from "../../../dashboards";
import { mix, rgba, signInTheme } from "./sign-in-theme";
import {
  completePasswordReset,
  postSignInUrl,
  requestPasswordReset,
  signInErrorMessage,
  signInWithPassword,
  type SignInResourceLike,
} from "./sign-in-flow";

const clerkError = (code: string, message = "raw") => ({ errors: [{ code, message, longMessage: message }] });

function fakeSignIn(overrides: Partial<SignInResourceLike> = {}): SignInResourceLike {
  return {
    create: vi.fn().mockResolvedValue({ status: "complete", createdSessionId: "sess_1" }),
    attemptFirstFactor: vi.fn().mockResolvedValue({ status: "complete", createdSessionId: "sess_2" }),
    ...overrides,
  };
}

describe("sign-in theme", () => {
  it("mixes colours", () => {
    expect(mix("#ffffff", "#000000", 0.5)).toBe("#808080");
    expect(mix("#ff0000", "#0000ff", 1)).toBe("#ff0000");
    expect(rgba("#00B000", 0.5)).toBe("rgba(0, 176, 0, 0.5)");
  });

  it("uses the portal colour as accent and keeps its foreground", () => {
    const t = signInTheme(getDashboard("eid", {}));
    expect(t.accent).toBe("#fda92d");
    expect(t.accentForeground).toBe("#1C252E");
  });

  it("gives each portal a different dark card", () => {
    const bgs = (["vl", "tb", "eid"] as const).map((id) => signInTheme(getDashboard(id, {})).bg);
    expect(new Set(bgs).size).toBe(3);
    for (const bg of bgs) {
      const [r, g, b] = [1, 3, 5].map((i) => parseInt(bg.slice(i, i + 2), 16));
      expect(Math.max(r!, g!, b!)).toBeLessThan(48);
    }
  });

  it("rejects bad colours", () => {
    expect(() => mix("nope", "#000000", 0.5)).toThrow();
  });
});

describe("postSignInUrl", () => {
  const tb = getDashboard("tb", {});
  it("stays in this app when its own portal is chosen", () => {
    expect(postSignInUrl(tb, "tb")).toBe("/");
  });
  it("goes to the other portal's site", () => {
    expect(postSignInUrl(tb, "vl")).toBe("https://tb.openldr.org.mz/");
  });
});

describe("signInWithPassword", () => {
  it("activates the new session", async () => {
    const signIn = fakeSignIn();
    const setActive = vi.fn().mockResolvedValue(undefined);
    await signInWithPassword(signIn, setActive, "  a@b.mz ", "pw");
    expect(signIn.create).toHaveBeenCalledWith({ identifier: "a@b.mz", password: "pw" });
    expect(setActive).toHaveBeenCalledWith({ session: "sess_1" });
  });

  it("translates a wrong password", async () => {
    const signIn = fakeSignIn({ create: vi.fn().mockRejectedValue(clerkError("form_password_incorrect")) });
    await expect(signInWithPassword(signIn, vi.fn(), "a@b.mz", "x")).rejects.toThrow("Palavra-passe incorrecta.");
  });

  it("fails when a second step is needed", async () => {
    const signIn = fakeSignIn({ create: vi.fn().mockResolvedValue({ status: "needs_second_factor", createdSessionId: null }) });
    const setActive = vi.fn();
    await expect(signInWithPassword(signIn, setActive, "a@b.mz", "x")).rejects.toThrow(/Contacte o administrador/);
    expect(setActive).not.toHaveBeenCalled();
  });

  it("treats an existing session as success", async () => {
    const signIn = fakeSignIn({ create: vi.fn().mockRejectedValue(clerkError("session_exists")) });
    await expect(signInWithPassword(signIn, vi.fn(), "a@b.mz", "x")).resolves.toBeUndefined();
  });
});

describe("password reset", () => {
  it("requests the email code", async () => {
    const signIn = fakeSignIn();
    await requestPasswordReset(signIn, " a@b.mz");
    expect(signIn.create).toHaveBeenCalledWith({ strategy: "reset_password_email_code", identifier: "a@b.mz" });
  });

  it("sets the new password and signs in", async () => {
    const signIn = fakeSignIn();
    const setActive = vi.fn().mockResolvedValue(undefined);
    await completePasswordReset(signIn, setActive, " 123456 ", "new-pw");
    expect(signIn.attemptFirstFactor).toHaveBeenCalledWith({
      strategy: "reset_password_email_code",
      code: "123456",
      password: "new-pw",
    });
    expect(setActive).toHaveBeenCalledWith({ session: "sess_2" });
  });

  it("translates a wrong code", async () => {
    const signIn = fakeSignIn({ attemptFirstFactor: vi.fn().mockRejectedValue(clerkError("form_code_incorrect")) });
    await expect(completePasswordReset(signIn, vi.fn(), "1", "pw")).rejects.toThrow("Código incorrecto.");
  });
});

describe("signInErrorMessage", () => {
  it("falls back to Clerk's message, then the default", () => {
    expect(signInErrorMessage(clerkError("unknown_code", "Something"), "fb")).toBe("Something");
    expect(signInErrorMessage(new Error("x"), "fb")).toBe("fb");
  });
});
