import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SplashScreen } from "./SplashScreen";
import { EMBLEM_URL } from "./shell-utils";

describe("SplashScreen", () => {
  it("announces loading and draws the emblem with both animated squares", () => {
    const html = renderToStaticMarkup(<SplashScreen />);
    expect(html).toContain('role="status"');
    expect(html).toContain("A carregar…");
    expect(html).toContain(EMBLEM_URL);
    for (const cls of ["splash-logo", "splash-ring-inner", "splash-ring-outer"]) expect(html).toContain(cls);
  });

  it("takes a custom label", () => {
    expect(renderToStaticMarkup(<SplashScreen label="A iniciar" />)).toContain("A iniciar");
  });
});
