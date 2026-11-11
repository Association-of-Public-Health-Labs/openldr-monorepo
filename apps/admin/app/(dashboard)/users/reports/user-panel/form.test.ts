import { describe, expect, it } from "vitest";
import { validateUserForm } from "./form";

const valid = { firstName: "Ana", lastName: "Exemplo", email: "ana@exemplo.org" };

describe("validateUserForm", () => {
  it("passes a valid form, including a new user with no dashboards", () => {
    expect(validateUserForm(valid)).toEqual({});
  });

  it("requires first name, last name and email", () => {
    expect(validateUserForm({ firstName: "", lastName: "  ", email: "" })).toEqual({
      firstName: "Indique o nome.",
      lastName: "Indique o apelido.",
      email: "Indique o e-mail.",
    });
  });

  it("rejects a malformed email", () => {
    expect(validateUserForm({ ...valid, email: "ana@" })).toEqual({ email: "Indique um e-mail válido." });
  });

  it("trims before checking", () => {
    expect(validateUserForm({ ...valid, email: "  ana@exemplo.org " })).toEqual({});
  });
});
