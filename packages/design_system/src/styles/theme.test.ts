import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { DASHBOARDS } from "../dashboards";

const css = readFileSync(fileURLToPath(new URL("./theme.css", import.meta.url)), "utf8");

function block(selector: string): string {
  const start = css.indexOf(`${selector} {`);
  expect(start, `missing block ${selector}`).toBeGreaterThanOrEqual(0);
  return css.slice(start, css.indexOf("}", start));
}

describe("theme.css", () => {
  it.each(DASHBOARDS.map((d) => [d.id, d] as const))("matches the registry for %s", (id, d) => {
    const body = block(`[data-dashboard="${id}"]`);
    expect(body).toContain(`--primary: ${d.primary};`);
    expect(body).toContain(`--primary-foreground: ${d.primaryForeground};`);
  });

  it("has a primary block for every registry entry and no other", () => {
    const ids = [...css.matchAll(/\[data-dashboard="([a-z]+)"\]/g)].map((m) => m[1]);
    expect(new Set(ids)).toEqual(new Set(DASHBOARDS.map((d) => d.id)));
  });

  it("points the sans font at Open Sans and drops Geist", () => {
    expect(css).toContain('--font-sans: var(--font-open-sans), "Open Sans", system-ui, sans-serif;');
    expect(css).not.toContain("geist");
  });

  it("does not import Tailwind itself (apps do)", () => {
    expect(css).not.toMatch(/@import\s+"tailwindcss"/);
  });
});
