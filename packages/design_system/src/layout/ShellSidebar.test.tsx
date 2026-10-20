import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SidebarProvider } from "../components/ui/sidebar";
import { ShellSidebar } from "./ShellSidebar";

const nav = [
  { label: "Sumário", href: "/", active: true },
  { label: "Laboratório", href: "/lab", active: false },
];

function render(variant: "expanded" | "compact", color: "integrate" | "apparent" = "integrate") {
  return renderToStaticMarkup(
    <SidebarProvider open={variant === "expanded"} onOpenChange={() => {}}>
      <ShellSidebar dashboard="vl" nav={nav} variant={variant} color={color} onToggle={() => {}} />
    </SidebarProvider>,
  );
}

describe("ShellSidebar", () => {
  it("expanded: 300px wide, items as rows, button says collapse", () => {
    const html = render("expanded");
    expect(html).toContain('data-variant="expanded"');
    expect(html).toContain("width:300px");
    expect(html).toContain("min-h-[44px]");
    expect(html).toContain('aria-label="Recolher menu"');
    expect(html).toContain("Carga Viral"); // switcher kept
  });

  it("compact: 88px wide, items as tiles, button says expand", () => {
    const html = render("compact");
    expect(html).toContain("width:88px");
    expect(html).toContain("w-[79px]");
    expect(html).toContain('aria-label="Expandir menu"');
  });

  it("marks the active item and keeps every nav link", () => {
    const html = render("expanded");
    expect(html).toMatch(/aria-current="page"[^>]*href="\/"|href="\/"[^>]*aria-current="page"/);
    expect(html).toContain('href="/lab"');
    expect(html).toContain("bg-primary/8");
  });

  it("apparent colour gives the dark sidebar", () => {
    expect(render("expanded", "apparent")).toContain("bg-[#141A21]");
  });

  it("apparent does not put the `dark` class on the sidebar (it would reset --primary to the dark-theme grey)", () => {
    const aside = render("expanded", "apparent").match(/<aside[^>]*class="([^"]*)"/)?.[1] ?? "";
    expect(aside.split(/\s+/)).not.toContain("dark");
  });

  it("compact shows an item's short label, keeping the full name as its accessible name", () => {
    const withShort = [{ label: "Província/Distrito/US", shortLabel: "Província", href: "/clinic", active: false }];
    const compact = renderToStaticMarkup(
      <SidebarProvider open={false} onOpenChange={() => {}}>
        <ShellSidebar dashboard="vl" nav={withShort} variant="compact" color="integrate" onToggle={() => {}} />
      </SidebarProvider>,
    );
    expect(compact).toContain(">Província</span>");
    expect(compact).not.toContain(">Província/Distrito/US</span>");
    expect(compact).toContain('aria-label="Província/Distrito/US"');

    const expanded = renderToStaticMarkup(
      <SidebarProvider open onOpenChange={() => {}}>
        <ShellSidebar dashboard="vl" nav={withShort} variant="expanded" color="integrate" onToggle={() => {}} />
      </SidebarProvider>,
    );
    expect(expanded).toContain(">Província/Distrito/US</span>");
  });

  it("items without a short label show their label in both modes", () => {
    expect(render("compact")).toContain(">Laboratório</span>");
    expect(render("expanded")).toContain(">Laboratório</span>");
  });

  // Minimals: logo 20px from the top, first item at 80px (20px below the 40px logo).
  // Expanded: the switcher button adds 4px above and below the emblem, so the area pads 16px / 16px.
  it.each([
    ["compact", "pt-5", "pb-5"],
    ["expanded", "pt-4", "pb-4"],
  ] as const)("%s: logo at 20px and a 20px gap to the menu, as Minimals", (variant, top, bottom) => {
    const classes = (render(variant).match(/data-slot="shell-sidebar-top"[^>]*class="([^"]*)"/)?.[1] ?? "").split(/\s+/);
    expect(classes).toContain(top);
    expect(classes).toContain(bottom);
  });

  it("collapsed: shows the whole colour dot (no clipping) and hides the switcher text and chevron", () => {
    const html = render("compact");
    const trigger = html.match(/<button[^>]*data-sidebar="menu-button"[^>]*class="([^"]*)"/)?.[1] ?? "";
    expect(trigger.split(/\s+/)).toContain("group-data-[collapsible=icon]:overflow-visible");
    const textAndChevron = (html.match(/group-data-\[collapsible=icon\]:hidden/g) ?? []).length;
    expect(textAndChevron).toBeGreaterThanOrEqual(2);
  });

  it("centres the 40px logo in the collapsed sidebar", () => {
    const html = render("compact");
    expect(html).toContain("group-data-[collapsible=icon]:size-10!");
    expect(html).toContain("group-data-[collapsible=icon]:mx-auto");
  });

  it("renders with no nav items", () => {
    const html = renderToStaticMarkup(
      <SidebarProvider open onOpenChange={() => {}}>
        <ShellSidebar dashboard="tb" nav={[]} variant="expanded" color="integrate" onToggle={() => {}} />
      </SidebarProvider>,
    );
    expect(html).toContain("Tuberculose");
  });
});
