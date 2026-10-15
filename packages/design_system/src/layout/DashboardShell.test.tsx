import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const setTheme = vi.fn();
vi.mock("next-themes", () => ({ useTheme: () => ({ theme: "light", setTheme }) }));

// The old MUI layout loads the design_system_mui barrel, which touches `window`; the drawer is
// mocked too, so these tests only check what the shell hands them.
const drawerProps: any[] = [];
const layoutProps: any[] = [];
vi.mock("./SettingsDrawer", () => ({
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

  it("stacked renders the new top layout (Minimals horizontal), not the old MUI layout", () => {
    withLayout("stacked");
    const html = renderToStaticMarkup(<DashboardShell {...base}><p>conteúdo</p></DashboardShell>);
    expect(html).not.toContain('data-slot="old-stacked-layout"');
    expect(layoutProps).toHaveLength(0);
    expect(html).not.toContain('data-slot="shell-sidebar"');
    expect(html).toContain('data-slot="shell-topnav"');
    expect(html).toContain("conteúdo");
    expect(html).toContain("Carga Viral"); // switcher
    expect(html).toContain("Portal de Carga Viral - Sumário");
    expect(html).toContain("Ministério da Saúde");
    expect(html).toContain("drawer:stacked"); // new settings drawer
    expect(html).toContain('aria-label="Conta"');
  });

  it("stacked: two 64px rows split by a dashed divider; menu items as Minimals pills", () => {
    withLayout("stacked", { color: "integrate" });
    const html = renderToStaticMarkup(<DashboardShell {...base}><p /></DashboardShell>);
    const bar = (html.match(/data-slot="shell-topnav-bar"[^>]*class="([^"]*)"/)?.[1] ?? "").split(/\s+/);
    const menu = (html.match(/data-slot="shell-topnav-menu"[^>]*class="([^"]*)"/)?.[1] ?? "").split(/\s+/);
    expect(bar).toContain("h-16");
    expect(menu).toContain("h-16");
    expect(menu).toContain("border-dashed");
    const active = html.match(/<a[^>]*aria-current="page"[^>]*class="([^"]*)"/)?.[1] ?? "";
    for (const c of ["h-8", "rounded-[6px]", "px-1.5", "bg-primary/8", "text-primary"]) expect(active.split(/\s+/)).toContain(c);
    expect(html).toContain('href="/lab"');
    expect(html).toContain(">Laboratório</span>");
  });

  it("stacked keeps the full label even when an item has a short label", () => {
    withLayout("stacked");
    const nav = [{ label: "Província/Distrito/US", shortLabel: "Província", href: "/clinic", active: false }];
    const html = renderToStaticMarkup(<DashboardShell {...base} nav={nav}><p /></DashboardShell>);
    expect(html).toContain(">Província/Distrito/US</span>");
  });

  it("stacked with the light colour gives the switcher light-surface tokens (its caption was invisible)", () => {
    withLayout("stacked", { color: "integrate" });
    const html = renderToStaticMarkup(<DashboardShell {...base}><p /></DashboardShell>);
    const top = html.match(/data-slot="shell-topnav"[^>]*class="([^"]*)"/)?.[1] ?? "";
    expect(top).toContain("[--sidebar-foreground:#1C252E]");
  });

  it("stacked with the apparent colour makes both rows dark", () => {
    withLayout("stacked", { color: "apparent" });
    const html = renderToStaticMarkup(<DashboardShell {...base}><p /></DashboardShell>);
    const top = (html.match(/data-slot="shell-topnav"[^>]*class="([^"]*)"/)?.[1] ?? "").split(/\s+/);
    expect(top).toContain("bg-[#141A21]");
  });

  it("changing settings from the drawer saves them and syncs next-themes on mode change", () => {
    renderToStaticMarkup(<DashboardShell {...base}><p /></DashboardShell>);
    const { onChange: handleSetAppSettings, settings } = drawerProps.at(-1);
    handleSetAppSettings({ ...settings, layout: "expanded" });
    expect(layoutSettingsStore.get().layout).toBe("expanded");
    handleSetAppSettings({ ...layoutSettingsStore.get(), mode: "dark" });
    expect(setTheme).toHaveBeenLastCalledWith("dark");
  });

  it("always passes the drawer's mode to next-themes, even when the stored mode already matches", () => {
    // next-themes can hold "dark" while layout-settings says "light" (e.g. the earlier "Modo" menu);
    // picking "light" in the drawer must still reach next-themes, as the old layouts did.
    withLayout("expanded", { mode: "light" });
    renderToStaticMarkup(<DashboardShell {...base}><p /></DashboardShell>);
    const { onChange: handleSetAppSettings, settings } = drawerProps.at(-1);
    handleSetAppSettings({ ...settings, mode: "light" });
    expect(setTheme).toHaveBeenCalledWith("light");
  });

  it("gives the header the content background at 40%, as the old layout did", () => {
    withLayout("expanded", { contrast: "positive" });
    let header = renderToStaticMarkup(<DashboardShell {...base}><p /></DashboardShell>).match(/<header[^>]*class="([^"]*)"/)?.[1] ?? "";
    expect(header).toContain("bg-[#f4f4f4]/40");
    expect(header).toContain("dark:bg-[#141a21]/40");
    withLayout("expanded", { contrast: "negative" });
    header = renderToStaticMarkup(<DashboardShell {...base}><p /></DashboardShell>).match(/<header[^>]*class="([^"]*)"/)?.[1] ?? "";
    expect(header).toContain("bg-white/40");
    expect(header).toContain("dark:bg-[#1d232a]/40");
  });

  it("applies contrast and padding settings to the content", () => {
    withLayout("expanded", { contrast: "negative", compact: "small" });
    const html = renderToStaticMarkup(<DashboardShell {...base}><p /></DashboardShell>);
    expect(html).toMatch(/data-slot="shell-content"[^>]*class="[^"]*bg-white/);
  });

  // The old layout used MUI spacing units: paddingX 16 / 4 = 128px / 32px, on content and header.
  // Kept from md up; below md it is 16px (128px left the old layout 27px of content on phones).
  it.each([
    ["large", "md:px-32"],
    ["small", "md:px-8"],
  ] as const)("compact=%s pads content and header with %s on desktop and px-4 on phones", (compact, cls) => {
    withLayout("expanded", { compact });
    const html = renderToStaticMarkup(<DashboardShell {...base}><p /></DashboardShell>);
    const inner = html.match(/data-slot="shell-content-inner"[^>]*class="([^"]*)"/)?.[1] ?? "";
    const header = html.match(/<header[^>]*class="([^"]*)"/)?.[1] ?? "";
    for (const classes of [inner, header]) {
      expect(classes.split(/\s+/)).toContain(cls);
      expect(classes.split(/\s+/)).toContain("px-4");
    }
  });

  it("keeps the header below Radix popups (z-50) so menus, tooltips and the mobile sheet stay on top", () => {
    const html = renderToStaticMarkup(<DashboardShell {...base}><p /></DashboardShell>);
    const header = html.match(/<header[^>]*class="([^"]*)"/)?.[1] ?? "";
    const z = header.match(/(?:^|\s)z-(?:\[(\d+)\]|(\d+))(?:\s|$)/);
    expect(z, "header needs a z-index class").not.toBeNull();
    expect(Number(z![1] ?? z![2])).toBeLessThan(50);
  });

  it("header: 64px bar, 18px semibold title, as Minimals", () => {
    const html = renderToStaticMarkup(<DashboardShell {...base}><p /></DashboardShell>);
    const header = (html.match(/<header[^>]*class="([^"]*)"/)?.[1] ?? "").split(/\s+/);
    expect(header).toContain("h-16");
    const title = (html.match(/<h1[^>]*class="([^"]*)"/)?.[1] ?? "").split(/\s+/);
    for (const c of ["text-lg", "font-semibold", "text-[#1C252E]", "dark:text-white"]) expect(title).toContain(c);
    expect(html).toContain("Portal de Carga Viral - Sumário");
  });

  it("account menu items use Minimals' 6px radius (not the theme's rounded-md)", async () => {
    const src = (await import("node:fs")).readFileSync(new URL("./ShellHeader.tsx", import.meta.url), "utf8");
    const item = src.match(/const MENU_ITEM =\s*"([^"]*)"/)?.[1] ?? "";
    expect(item.split(/\s+/)).toContain("rounded-[6px]");
  });

  it("account button: 40px round with a 34px avatar and the gradient ring", () => {
    const html = renderToStaticMarkup(<DashboardShell {...base}><p /></DashboardShell>);
    const trigger = (html.match(/<button[^>]*aria-label="Conta"[^>]*class="([^"]*)"/)?.[1] ?? "").split(/\s+/);
    expect(trigger).toContain("size-10");
    expect(trigger).toContain("rounded-full");
    expect(html).toContain('data-slot="avatar-ring"');
    expect(html).toContain("size-[34px]");
    expect(html).toContain(">V</span>"); // initial when there is no photo
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
