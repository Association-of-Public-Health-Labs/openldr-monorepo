import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const setTheme = vi.fn();
vi.mock("next-themes", () => ({ useTheme: () => ({ theme: "light", setTheme }) }));

// The old MUI drawer and layout load the design_system_mui barrel, which touches `window`.
// They are used unchanged; here we only check the shell hands them the right props.
const drawerProps: any[] = [];
const layoutProps: any[] = [];
vi.mock("../app/molecules/headers/SettingsDrawer", () => ({
  SettingsDrawer: (props: any) => {
    drawerProps.push(props);
    return <span data-slot="settings-drawer">drawer:{props.settings.layout}</span>;
  },
}));
vi.mock("../app/templates/DashboardLayout", () => ({
  DashboardLayout: (props: any) => {
    layoutProps.push(props);
    return <div data-slot="old-stacked-layout">{props.children}</div>;
  },
}));

import { DashboardShell } from "./DashboardShell";
import { DEFAULT_LAYOUT_SETTINGS, layoutSettingsStore } from "./layoutSettings";

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

function withLayout(layout: "expanded" | "compact" | "stacked", extra = {}) {
  layoutSettingsStore.set({ ...DEFAULT_LAYOUT_SETTINGS, layout, ...extra });
}

beforeEach(() => {
  drawerProps.length = 0;
  layoutProps.length = 0;
  setTheme.mockClear();
  withLayout("compact");
});

describe("DashboardShell", () => {
  it("renders the switcher, the nav and the header title", () => {
    const html = renderToStaticMarkup(<DashboardShell {...base}><p>conteúdo</p></DashboardShell>);
    expect(html).toContain("Carga Viral");
    expect(html).toContain("Portal de Carga Viral - Sumário");
    expect(html).toContain('href="/lab"');
    expect(html).toContain("conteúdo");
  });

  it("uses the TB registry entry for TB", () => {
    const html = renderToStaticMarkup(<DashboardShell {...base} dashboard="tb" pageTitle="Província"><p /></DashboardShell>);
    expect(html).toContain("Tuberculose");
    expect(html).toContain("Portal de Testagem Laboratorial de TB - Província");
  });

  it("expanded and compact render the new sidebar at 300px and 88px", () => {
    withLayout("expanded");
    expect(renderToStaticMarkup(<DashboardShell {...base}><p /></DashboardShell>)).toContain('data-variant="expanded"');
    withLayout("compact");
    expect(renderToStaticMarkup(<DashboardShell {...base}><p /></DashboardShell>)).toContain('data-variant="compact"');
  });

  it("puts the old settings drawer in the header with the current settings", () => {
    withLayout("expanded");
    const html = renderToStaticMarkup(<DashboardShell {...base}><p /></DashboardShell>);
    expect(html).toContain("drawer:expanded");
    expect(drawerProps.at(-1).settings.layout).toBe("expanded");
  });

  it("stacked renders the old top layout with the old props and no new sidebar", () => {
    withLayout("stacked");
    const html = renderToStaticMarkup(<DashboardShell {...base}><p>conteúdo</p></DashboardShell>);
    expect(html).toContain('data-slot="old-stacked-layout"');
    expect(html).not.toContain('data-slot="shell-sidebar"');
    expect(html).toContain("conteúdo");
    const props = layoutProps.at(-1);
    expect(props.portalTitle).toBe("Portal de Carga Viral");
    expect(props.pagename).toBe("Sumário");
    expect(props.aiChatIsOpen).toBe(false);
    expect(props.options).toEqual(base.nav);
    expect(props.settings.layout).toBe("stacked");
    expect(props.user).toMatchObject({ name: "Vagner Pene", email: "v@example.org" });
    expect(typeof props.handleSetAppSettings).toBe("function");
  });

  it("changing settings from the drawer saves them and syncs next-themes on mode change", () => {
    renderToStaticMarkup(<DashboardShell {...base}><p /></DashboardShell>);
    const { handleSetAppSettings, settings } = drawerProps.at(-1);
    handleSetAppSettings({ ...settings, layout: "expanded" });
    expect(layoutSettingsStore.get().layout).toBe("expanded");
    expect(setTheme).not.toHaveBeenCalled();
    handleSetAppSettings({ ...layoutSettingsStore.get(), mode: "dark" });
    expect(setTheme).toHaveBeenCalledWith("dark");
  });

  it("applies contrast and padding settings to the content", () => {
    withLayout("expanded", { contrast: "negative", compact: "small" });
    const html = renderToStaticMarkup(<DashboardShell {...base}><p /></DashboardShell>);
    expect(html).toMatch(/data-slot="shell-content"[^>]*class="[^"]*bg-white/);
    expect(html).toMatch(/data-slot="shell-content-inner"[^>]*class="[^"]*px-1/);
  });

  it("keeps the header below Radix popups (z-50) so menus, tooltips and the mobile sheet stay on top", () => {
    const html = renderToStaticMarkup(<DashboardShell {...base}><p /></DashboardShell>);
    const header = html.match(/<header[^>]*class="([^"]*)"/)?.[1] ?? "";
    const z = header.match(/(?:^|\s)z-(?:\[(\d+)\]|(\d+))(?:\s|$)/);
    expect(z, "header needs a z-index class").not.toBeNull();
    expect(Number(z![1] ?? z![2])).toBeLessThan(50);
  });

  it("renders the right panel only when given", () => {
    const without = renderToStaticMarkup(<DashboardShell {...base}><p /></DashboardShell>);
    expect(without).not.toContain('data-slot="shell-right-panel"');
    const withPanel = renderToStaticMarkup(<DashboardShell {...base} rightPanel={<span>chat</span>}><p /></DashboardShell>);
    expect(withPanel).toContain('data-slot="shell-right-panel"');
  });

  it("renders with an empty nav", () => {
    expect(renderToStaticMarkup(<DashboardShell {...base} nav={[]}><p>ok</p></DashboardShell>)).toContain("ok");
  });
});
