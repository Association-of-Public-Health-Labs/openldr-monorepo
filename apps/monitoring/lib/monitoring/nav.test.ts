import { describe, expect, it } from "vitest";
import { buildNavItems, PAGE_LABELS, UNRELEASED_PAGES } from "./nav";

describe("monitoring nav", () => {
  it("hides Histórico in production", () => {
    expect(buildNavItems("/", true).map((i) => i.href)).toEqual(["/", "/estado"]);
    expect(UNRELEASED_PAGES).toContain("/historico");
  });
  it("lists every page outside production", () => {
    expect(buildNavItems("/", false).map((i) => i.href)).toEqual(["/", "/estado", "/historico"]);
  });
  it("marks only the current page active", () => {
    expect(buildNavItems("/estado", true).filter((i) => i.active).map((i) => i.href)).toEqual(["/estado"]);
  });
  it("labels each page", () => {
    expect(PAGE_LABELS).toEqual({ "/": "Sumário", "/estado": "Estado", "/historico": "Histórico" });
  });
});
