"use client";

import { getDashboard, type DashboardId } from "../../../dashboards";
import type { UserAccess } from "../../../lib/access";
import { Button } from "../../../components/ui/button";
import { noAccessContent } from "./no-access-content";

/**
 * Shown when a signed-in user lacks access to dashboard `dashboard`. Lists the other dashboards they can open.
 * Pass `onSignOut` for a signed-in visitor; without it the visitor is signed out and gets a sign-in link.
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
  const { open, others } = noAccessContent(dashboard, access);
  const signedIn = Boolean(onSignOut);
  const name = getDashboard(dashboard).name;
  const title = dashboard === "admin" ? "Sem acesso à Administração" : "Sem acesso a este dashboard";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-bold">{title}</h1>
      {open ? (
        <>
          <p className="max-w-md text-sm text-muted-foreground">O acesso foi concedido. Pode abrir {name} agora.</p>
          <Button asChild>
            <a href={open.href}>Abrir {name}</a>
          </Button>
        </>
      ) : (
        <p className="max-w-md text-sm text-muted-foreground">
          {name}: a sua conta não tem permissão para aceder. Contacte um administrador se precisar de acesso.
        </p>
      )}
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
        signedIn &&
        !open && (
          <p className="max-w-md text-sm text-muted-foreground">Esta conta ainda não tem acesso a nenhum dashboard.</p>
        )
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
