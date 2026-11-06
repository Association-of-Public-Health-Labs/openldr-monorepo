import type { DashboardInfo } from "@repo/design_system/dashboards";
import { canOpen, type UserAccess } from "@repo/design_system/lib/access";

export const NO_ACCESS_URL = "/sem-acesso";

/**
 * Where a newly invited user lands: their first accessible dashboard, the admin app if that is all
 * they have, otherwise `/sem-acesso`. `ready` is ignored on purpose: it only affects the switcher.
 */
export function postInviteUrl(access: UserAccess | null, dashboards: DashboardInfo[]): string {
  const first = dashboards.find((d) => d.id !== "admin" && canOpen(access, d.id));
  if (first) return first.url;
  const admin = dashboards.find((d) => d.id === "admin");
  if (admin && canOpen(access, "admin")) return admin.url;
  return NO_ACCESS_URL;
}

const NEW_INVITE = "Peça um novo convite a um administrador.";
const PASSWORD_WEAK = "A palavra-passe não é suficientemente segura. Escolha uma palavra-passe mais longa e menos comum.";

// Ticket codes are not listed in Clerk's packages; these are the ones its API documents for
// invitation tickets. Anything else falls back to GENERIC below.
const KNOWN: Record<string, string> = {
  ticket_expired: `Este convite expirou. ${NEW_INVITE}`,
  ticket_revoked: `Este convite foi cancelado. ${NEW_INVITE}`,
  ticket_invalid: `Este convite não é válido ou expirou. ${NEW_INVITE}`,
  ticket_already_used: `Este convite já foi utilizado. ${NEW_INVITE}`,
  invitation_already_accepted: `Este convite já foi utilizado. ${NEW_INVITE}`,
  invitation_revoked: `Este convite foi cancelado. ${NEW_INVITE}`,
  invitation_expired: `Este convite expirou. ${NEW_INVITE}`,
  form_identifier_exists: `Este convite já foi utilizado. ${NEW_INVITE}`,
  form_password_pwned: "Esta palavra-passe apareceu numa fuga de dados conhecida. Escolha outra.",
  form_password_compromised: "Esta palavra-passe apareceu numa fuga de dados conhecida. Escolha outra.",
  form_password_length_too_short: "A palavra-passe é demasiado curta. Use pelo menos 8 caracteres.",
  form_password_not_strong_enough: PASSWORD_WEAK,
  form_password_validation_failed: PASSWORD_WEAK,
  form_password_size_in_bytes_exceeded: "A palavra-passe é demasiado longa.",
  form_param_nil: "Preencha todos os campos obrigatórios.",
};

export const GENERIC_INVITE_ERROR = "Não foi possível concluir o registo. Tente novamente.";

/** Portuguese text for a Clerk failure on this page. Clerk's own wording is never shown. */
export function inviteErrorMessage(code: string): string {
  return KNOWN[code] ?? GENERIC_INVITE_ERROR;
}
