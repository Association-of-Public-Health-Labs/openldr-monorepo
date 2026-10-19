import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

// The filter and docs dialogs load the MUI barrel, which touches `window`; the card only opens them.
vi.mock("../popups/DateRange", () => ({ DateRange: () => null }));
vi.mock("../popups/FacilitiesPopup", () => ({ FacilitiesPopup: () => null }));
vi.mock("../popups/LabDialog", () => ({ LabDialog: () => null }));
vi.mock("../popups/CardDocsPopup", () => ({ CardDocsPopup: () => null }));
vi.mock("../popups/SuggestionsPopup", () => ({ SuggestionsPopup: () => null }));

import { MainCard } from "./MainCard";
import { cardMenuGroups } from "../../molecules/cards/MainCardHeader";

const user = { name: "Vagner Pene", email: "v@example.org" };
const option = (label: string, type: "primary" | "secondary") => ({ label, type, action: () => {} });

describe("MainCard (Minimals card)", () => {
  it("has a single 3-dots menu button and no pencil button", () => {
    const html = renderToStaticMarkup(
      <MainCard title="Amostras" subtitle="01 de janeiro à 31 de março" reportType="national" user={user} additionalOptions={[option("Exportar para Excel", "primary")]}>
        <p>chart</p>
      </MainCard>,
    );
    expect(html.match(/<button/g)).toHaveLength(1);
    expect(html).toContain('aria-label="Opções"');
    expect(html).not.toContain('aria-label="Editar"');
  });

  it("shows the title above the subtitle, in the Minimals frame", () => {
    const html = renderToStaticMarkup(<MainCard title="Amostras" subtitle="Período" user={user}><p /></MainCard>);
    expect(html.indexOf("Amostras")).toBeLessThan(html.indexOf("Período"));
    const frame = (html.match(/data-slot="main-card"[^>]*class="([^"]*)"/)?.[1] ?? html.match(/class="([^"]*)"[^>]*data-slot="main-card"/)?.[1] ?? "").split(/\s+/);
    for (const c of ["rounded-2xl", "bg-white", "dark:bg-[#1d232a]"]) expect(frame).toContain(c);
  });

  it("orders the menu: edit and other primary options, then the secondary ones", () => {
    const edit = option("Editar período", "primary");
    const { primary, secondary } = cardMenuGroups([edit], [option("Docs", "secondary"), option("Excel", "primary")]);
    expect(primary.map((o) => o.label)).toEqual(["Editar período", "Excel"]);
    expect(secondary.map((o) => o.label)).toEqual(["Docs"]);
  });
});
