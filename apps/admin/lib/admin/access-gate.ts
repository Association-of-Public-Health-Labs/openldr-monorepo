import type { UserAccess } from "@repo/design_system/lib/access";

export const NO_ACCESS_PATH = "/sem-acesso";

/**
 * Where to send a signed-in user who requested `pathname`: `null` to let them through.
 * Only admins may use this app. `/sem-acesso` is never redirected, so there is no loop.
 */
export function gateRedirect(pathname: string, access: UserAccess | null): typeof NO_ACCESS_PATH | null {
  if (pathname === NO_ACCESS_PATH) return null;
  return access?.admin ? null : NO_ACCESS_PATH;
}
