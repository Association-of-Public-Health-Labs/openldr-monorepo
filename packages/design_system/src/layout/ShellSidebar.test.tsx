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

  it("renders with no nav items", () => {
    const html = renderToStaticMarkup(
      <SidebarProvider open onOpenChange={() => {}}>
        <ShellSidebar dashboard="tb" nav={[]} variant="expanded" color="integrate" onToggle={() => {}} />
      </SidebarProvider>,
    );
    expect(html).toContain("Tuberculose");
  });
});
