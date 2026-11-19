import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { HostStatusChip } from "./HostStatusChip";

describe("HostStatusChip", () => {
  it("writes the status out and tints only an offline site's footer", () => {
    const html = renderToStaticMarkup(
      <HostStatusChip name="HG Machava" code="PMV" location="Maputo Província · Matola" online={false} checked="verificado há 1 min" />,
    );
    expect(html).toContain('aria-label="HG Machava: offline"');
    expect(html).toContain(">Offline<");
    expect(html).toContain("bg-destructive/[0.07]");
    expect(html).toContain("Maputo Província · Matola");
    expect(html).toContain("verificado há 1 min");
    expect(html).not.toContain("<button");
  });

  it("shows an online site in the success colour, without the tint", () => {
    const html = renderToStaticMarkup(<HostStatusChip name="Site" code="X" location="Gaza · Chókwè" online />);
    expect(html).toContain('aria-label="Site: online"');
    expect(html).toContain("text-success");
    expect(html).not.toContain("bg-destructive");
  });

  it("is a button when it opens the site", () => {
    const html = renderToStaticMarkup(<HostStatusChip name="Site" code="X" location="—" online onClick={() => {}} />);
    expect(html).toContain('<button type="button"');
  });
});
