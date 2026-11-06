import { describe, expect, it } from "vitest";
import { GENERIC_SIGN_IN_ERROR, signInErrorMessage } from "./sign-in-errors";

describe("signInErrorMessage", () => {
  it("maps wrong credentials to one message that does not say which part was wrong", () => {
    const wrongPassword = signInErrorMessage({ errors: [{ code: "form_password_incorrect", message: "Password is incorrect" }] });
    const unknownUser = signInErrorMessage({ errors: [{ code: "form_identifier_not_found", message: "Couldn't find your account." }] });
    expect(wrongPassword).toBe(unknownUser);
    expect(wrongPassword).toContain("incorrectos");
  });
  it("maps throttling and locked accounts", () => {
    expect(signInErrorMessage({ errors: [{ code: "too_many_requests" }] })).toContain("Demasiadas tentativas");
    expect(signInErrorMessage({ errors: [{ code: "user_locked" }] })).toContain("bloqueada");
  });
  it("never shows Clerk's text for an unknown code", () => {
    const text = signInErrorMessage({ errors: [{ code: "something_new", message: "Clerk says no" }] });
    expect(text).toBe(GENERIC_SIGN_IN_ERROR);
    expect(text).not.toContain("Clerk");
  });
  it("falls back to the generic message for odd shapes", () => {
    for (const value of [null, undefined, "x", {}, { errors: [] }, { errors: [{ code: 5 }] }]) {
      expect(signInErrorMessage(value)).toBe(GENERIC_SIGN_IN_ERROR);
    }
  });
  it("reports an already open session by code", () => {
    expect(signInErrorMessage({ errors: [{ code: "session_exists" }] })).toBeNull();
  });
});
