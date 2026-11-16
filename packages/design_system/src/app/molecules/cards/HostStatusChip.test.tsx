import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { HostStatusChip } from "./HostStatusChip";

describe("HostStatusChip", () => {
  it("shows an offline site with the destructive colour and an accessible status", () => {
    const html = renderToStaticMarkup(<HostStatusChip code="hgm-lab" name="HG Machava" category="Disalab" online={false} />);
    expect(html).toContain("bg-destructive");
    expect(html).toContain('aria-label="HG Machava: offline"');
    expect(html).toContain("HGM-L");
    expect(html).not.toContain("<button");
  });

  it("shows an online site with the success colour", () => {
    const html = renderToStaticMarkup(<HostStatusChip code="X" name="Site" category="Disapoc" online />);
    expect(html).toContain("bg-success");
    expect(html).toContain('aria-label="Site: online"');
  });

  it("is a button when it opens the site", () => {
    const html = renderToStaticMarkup(<HostStatusChip code="X" name="Site" category="Disapoc" online onClick={() => {}} />);
    expect(html).toContain('<button type="button"');
  });
});
