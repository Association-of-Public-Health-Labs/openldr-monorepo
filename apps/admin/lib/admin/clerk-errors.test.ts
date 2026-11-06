import { describe, expect, it } from "vitest";
import { clerkErrorMessage } from "./clerk-errors";

const clerkError = (code: string, message = "Clerk raw text") => ({ errors: [{ code, message, longMessage: message }] });

describe("clerkErrorMessage", () => {
  it("maps form_identifier_exists to an already-exists message", () => {
    expect(clerkErrorMessage(clerkError("form_identifier_exists"))).toMatch(/já existe/i);
  });
  it("maps duplicate_record to an already-exists message", () => {
    expect(clerkErrorMessage(clerkError("duplicate_record"))).toMatch(/já existe/i);
  });
  it("maps an unknown error to a generic message without Clerk's text", () => {
    const msg = clerkErrorMessage(clerkError("something_new", "Secret clerk detail"));
    expect(msg).not.toContain("Secret clerk detail");
    expect(msg).not.toContain("something_new");
    expect(msg.length).toBeGreaterThan(0);
  });
  it("never leaks the text of a plain Error", () => {
    expect(clerkErrorMessage(new Error("boom: sk_live_123"))).not.toContain("sk_live_123");
  });
  it("copes with non-error values", () => {
    for (const v of [undefined, null, "x", 42, {}]) expect(typeof clerkErrorMessage(v)).toBe("string");
  });
});
