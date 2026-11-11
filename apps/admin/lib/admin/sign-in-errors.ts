const BAD_CREDENTIALS = "E-mail ou palavra-passe incorrectos.";

// One message for an unknown user and a wrong password, so the form does not reveal which accounts exist.
const KNOWN: Record<string, string> = {
  form_identifier_not_found: BAD_CREDENTIALS,
  form_password_incorrect: BAD_CREDENTIALS,
  strategy_for_user_invalid: BAD_CREDENTIALS,
  form_param_format_invalid: "O e-mail indicado não é válido.",
  form_param_nil: "Preencha o e-mail e a palavra-passe.",
  too_many_requests: "Demasiadas tentativas. Aguarde um momento e tente novamente.",
  user_locked: "Esta conta está bloqueada temporariamente. Tente mais tarde ou contacte um administrador.",
};

export const GENERIC_SIGN_IN_ERROR = "Não foi possível iniciar a sessão. Tente novamente.";

/**
 * Portuguese text for a Clerk sign-in failure; Clerk's own wording is never shown. `null` means a
 * session is already open, so the page should just continue to the app.
 */
export function signInErrorMessage(error: unknown): string | null {
  const code = (error as { errors?: { code?: unknown }[] } | null)?.errors?.[0]?.code;
  if (code === "session_exists") return null;
  return (typeof code === "string" && KNOWN[code]) || GENERIC_SIGN_IN_ERROR;
}
