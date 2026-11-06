import { describe, expect, it } from "vitest";
import { buildNavItems, PAGE_LABELS } from "./nav";

describe("buildNavItems", () => {
  it("lists Utilização at / and Utilizadores at /users", () => {
    expect(buildNavItems("/").map((i) => [i.label, i.href])).toEqual([
      ["Utilização", "/"],
      ["Utilizadores", "/users"],
    ]);
  });
  it("marks only the current page active", () => {
    expect(buildNavItems("/users").filter((i) => i.active).map((i) => i.href)).toEqual(["/users"]);
  });
  it("has a header title for every page", () => {
    for (const item of buildNavItems("/")) expect(PAGE_LABELS[item.href]).toBe(item.label);
  });
});
