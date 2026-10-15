import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next-themes", () => ({ useTheme: () => ({ theme: "light", setTheme: () => {} }) }));

import { DashboardShell } from "./DashboardShell";

const base = {
  dashboard: "vl" as const,
  user: { name: "Vagner Pene", email: "v@example.org" },
  onSignOut: () => {},
  pageTitle: "Sumário",
  nav: [
    { label: "Sumário", href: "/", active: true },
    { label: "Laboratório", href: "/lab", active: false },
  ],
};

describe("DashboardShell", () => {
  it("renders the switcher with the current dashboard, the nav and the header title", () => {
    const html = renderToStaticMarkup(<DashboardShell {...base}><p>conteúdo</p></DashboardShell>);
    expect(html).toContain("Carga Viral");
    expect(html).toContain("Portal de Carga Viral - Sumário");
    expect(html).toContain('href="/lab"');
    expect(html).toContain("conteúdo");
    expect(html).toMatch(/data-active="true"[^>]*>[\s\S]*?Sumário/);
  });

  it("uses the TB registry entry for TB", () => {
    const html = renderToStaticMarkup(<DashboardShell {...base} dashboard="tb" pageTitle="Província"><p /></DashboardShell>);
    expect(html).toContain("Tuberculose");
    expect(html).toContain("Portal de Testagem Laboratorial de TB - Província");
  });

  it("renders the right panel only when given", () => {
    const without = renderToStaticMarkup(<DashboardShell {...base}><p /></DashboardShell>);
    expect(without).not.toContain('data-slot="shell-right-panel"');
    const withPanel = renderToStaticMarkup(
      <DashboardShell {...base} rightPanel={<span>chat</span>}><p /></DashboardShell>,
    );
    expect(withPanel).toContain('data-slot="shell-right-panel"');
    expect(withPanel).toContain("chat");
  });

  it("keeps the header below Radix popups (z-50) so menus, tooltips and the mobile sheet stay on top", () => {
    const html = renderToStaticMarkup(<DashboardShell {...base}><p /></DashboardShell>);
    const header = html.match(/<header[^>]*class="([^"]*)"/)?.[1] ?? "";
    const z = header.match(/(?:^|\s)z-(?:\[(\d+)\]|(\d+))(?:\s|$)/);
    expect(z, "header needs a z-index class").not.toBeNull();
    expect(Number(z![1] ?? z![2])).toBeLessThan(50);
  });

  it("renders with an empty nav", () => {
    const html = renderToStaticMarkup(<DashboardShell {...base} nav={[]}><p>ok</p></DashboardShell>);
    expect(html).toContain("ok");
  });
});
