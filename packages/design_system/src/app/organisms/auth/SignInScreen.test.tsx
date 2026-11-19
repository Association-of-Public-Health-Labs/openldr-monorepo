import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { getDashboard } from "../../../dashboards";
import { SignInScreen, signInHeading } from "./SignInScreen";

const noop = async () => {};

function render(ids: Array<"vl" | "tb" | "eid" | "monitoring" | "admin">, title?: string) {
  return renderToStaticMarkup(
    <SignInScreen
      currentId={ids[0]!}
      portals={ids.map((id) => getDashboard(id, {}))}
      title={title}
      backgroundSrc="/login-bg.jpg"
      onSignIn={noop}
      onRequestReset={noop}
      onCompleteReset={noop}
    />,
  );
}

describe("SignInScreen", () => {
  it("shows the portal selector when several portals are offered", () => {
    expect(render(["vl", "tb", "eid"])).toContain('id="si-portal-label"');
  });

  it("hides the portal selector for a single portal", () => {
    const html = render(["admin"], "Portal de Administração");
    expect(html).not.toContain('id="si-portal-label"');
    expect(html).toContain("Portal de Administração");
  });

  it("agrees the heading with the portal title's gender", () => {
    expect(render(["vl"])).toContain("Entrar no<br/>");
    expect(render(["monitoring"])).toContain("Entrar na<br/>");
    expect(render(["monitoring"])).toContain("Monitoria de Conectividade");
    // An explicit title (admin's "Portal de Administração") keeps the masculine form.
    expect(render(["admin"], "Portal de Administração")).toContain("Entrar no<br/>");
    expect(signInHeading("reset-request", true)).toBe("Recuperar acesso à");
    expect(signInHeading("reset-verify", false)).toBe("Nova palavra-passe para o");
  });
});
