import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { DEFAULT_LAYOUT_SETTINGS, type LayoutSettings } from "./layoutSettings";
import { SettingsPanel, settingsActions } from "./SettingsPanel";

const base: LayoutSettings = { ...DEFAULT_LAYOUT_SETTINGS };

describe("SettingsDrawer trigger", () => {
  it("is a 40px round grey icon button with a 24px gear, as the Minimals header buttons", async () => {
    const { SettingsDrawer } = await import("./SettingsDrawer");
    const html = renderToStaticMarkup(<SettingsDrawer settings={base} onChange={() => {}} />);
    const trigger = (html.match(/<button[^>]*aria-label="settings"[^>]*class="([^"]*)"/)?.[1] ?? "").split(/\s+/);
    for (const c of ["size-10", "rounded-full", "text-[#637381]"]) expect(trigger).toContain(c);
    expect(html).toMatch(/<svg[^>]*width="24"[^>]*height="24"/);
  });
});

describe("settingsActions", () => {
  it("each control sends exactly its own change", () => {
    const onChange = vi.fn();
    const a = settingsActions(base, onChange);
    a.toggleDark();
    a.toggleContrast();
    a.toggleCompact();
    a.setLayout("stacked");
    a.setColor("integrate");
    expect(onChange.mock.calls.map((c) => c[0])).toEqual([
      { ...base, mode: "dark" },
      { ...base, contrast: "negative" },
      { ...base, compact: "small" },
      { ...base, layout: "stacked" },
      { ...base, color: "integrate" },
    ]);
  });

  it("toggles back", () => {
    const onChange = vi.fn();
    const a = settingsActions({ ...base, mode: "dark", contrast: "negative", compact: "small" }, onChange);
    a.toggleDark();
    a.toggleContrast();
    a.toggleCompact();
    expect(onChange.mock.calls.map((c) => c[0])).toEqual([
      { ...base, mode: "light", contrast: "negative", compact: "small" },
      { ...base, mode: "dark", contrast: "positive", compact: "small" },
      { ...base, mode: "dark", contrast: "negative", compact: "large" },
    ]);
  });
});

describe("SettingsPanel", () => {
  const render = (settings: LayoutSettings = base) =>
    renderToStaticMarkup(<SettingsPanel settings={settings} onChange={() => {}} onClose={() => {}} />);

  it("has the same sections and Portuguese labels as the old drawer", () => {
    const html = render();
    for (const text of ["Configurações", "Modo Escuro", "Contraste", "Compacto", "Navegação", "Layout", "Cor", "Integrada", "Aparente"]) {
      expect(html).toContain(text);
    }
  });

  it("switches show the current values (contrast on = positive, compact on = small)", () => {
    const html = render({ ...base, mode: "dark", contrast: "positive", compact: "large" });
    expect(html).toMatch(/aria-label="Modo Escuro"[^>]*aria-checked="true"|aria-checked="true"[^>]*aria-label="Modo Escuro"/);
    expect(html).toMatch(/aria-label="Contraste"[^>]*aria-checked="true"|aria-checked="true"[^>]*aria-label="Contraste"/);
    expect(html).toMatch(/aria-label="Compacto"[^>]*aria-checked="false"|aria-checked="false"[^>]*aria-label="Compacto"/);
  });

  it("marks the selected layout and colour tiles", () => {
    const html = render({ ...base, layout: "expanded", color: "integrate" });
    const pressed = [...html.matchAll(/<button[^>]*aria-pressed="true"[^>]*data-value="([a-z]+)"/g)].map((m) => m[1]);
    expect(pressed.sort()).toEqual(["expanded", "integrate"]);
  });

  it("uses the Minimals card, tile and section styles", () => {
    const html = render();
    expect(html).toContain("rounded-2xl"); // cards and section block: 16px
    expect(html).toContain("border-[rgba(145,158,171,0.12)]");
    expect(html).toContain("h-[100px]"); // setting card height
    expect(html).toContain("h-16"); // layout tile 64px
    expect(html).toContain("h-14"); // colour tile 56px
  });
});
