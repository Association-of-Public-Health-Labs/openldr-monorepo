import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Sign-in / sign-up / accept-invite pages render the logo on the server. The design_system_mui
// barrel pulls in apexcharts, which touches `window` at import time, so the re-export must
// point at the Logo file itself.
describe("Logo re-export", () => {
  it("does not import the design_system_mui barrel", () => {
    const src = readFileSync(new URL("./Logo.tsx", import.meta.url), "utf8");
    expect(src).not.toMatch(/from\s+["']@repo\/design_system_mui["']/);
  });

  it("loads without a window global", async () => {
    const g = globalThis as { window?: unknown };
    const saved = g.window;
    delete g.window;
    try {
      const mod = await import("./Logo");
      expect(typeof mod.Logo).toBe("function");
    } finally {
      if (saved !== undefined) g.window = saved;
    }
  });
});
