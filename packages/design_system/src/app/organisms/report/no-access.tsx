"use client";

import { getDashboard, getDashboards, type DashboardId } from "../../../dashboards";
import type { UserAccess } from "../../../lib/access";
import { switcherItems } from "../../../layout/shell-utils";
import { Button } from "../../../components/ui/button";

/**
 * Shown when a signed-in user lacks access to dashboard `dashboard`. Lists the other dashboards they can open.
 * Pass `onSignOut` for a signed-in visitor; without it a link to sign in is shown instead.
 */
export function NoAccess({
  dashboard,
  access,
  onSignOut,
}: {
  dashboard: DashboardId;
  access: UserAccess | null;
  onSignOut?: () => void;
}) {
  const others = access
    ? switcherItems(dashboard, getDashboards(), undefined, access).filter((i) => !i.current && i.href)
    : [];
  const title = dashboard === "admin" ? "Sem acesso à Administração" : "Sem acesso a este dashboard";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        {getDashboard(dashboard).name}: a sua conta não tem permissão para aceder. Contacte um administrador se precisar de
        acesso.
      </p>
      {others.length > 0 ? (
        <nav aria-label="Dashboards disponíveis" className="flex flex-col items-center gap-2">
          <p className="text-sm text-muted-foreground">Pode aceder a:</p>
          <ul className="flex flex-wrap justify-center gap-2">
            {others.map((item) => (
              <li key={item.id}>
                <Button asChild variant="outline">
                  <a href={item.href}>{item.name}</a>
                </Button>
              </li>
            ))}
          </ul>
        </nav>
      ) : (
        <p className="max-w-md text-sm text-muted-foreground">Esta conta ainda não tem acesso a nenhum dashboard.</p>
      )}
      {onSignOut ? (
        <Button variant="outline" onClick={onSignOut}>
          Terminar sessão
        </Button>
      ) : (
        <Button asChild variant="outline">
          <a href="/sign-in">Iniciar sessão</a>
        </Button>
      )}
    </div>
  );
}
