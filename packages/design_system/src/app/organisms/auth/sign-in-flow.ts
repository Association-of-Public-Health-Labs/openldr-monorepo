import type { DashboardId, DashboardInfo } from "../../../dashboards";

/**
 * The slice of Clerk's SignIn resource the sign-in screen uses. Kept structural so
 * the design system does not depend on @clerk/nextjs; apps pass `useSignIn().signIn`.
 */
export interface SignInAttempt {
  status: string | null;
  createdSessionId: string | null;
}

export interface SignInResourceLike {
  create(params: { identifier: string; password?: string; strategy?: string }): Promise<SignInAttempt>;
  attemptFirstFactor(params: { strategy: string; code: string; password: string }): Promise<SignInAttempt>;
}

export type SetActiveLike = (params: { session: string | null }) => Promise<unknown>;

const MESSAGES: Record<string, string> = {
  form_password_incorrect: "Palavra-passe incorrecta.",
  form_identifier_not_found: "Não existe uma conta com este email.",
  form_param_format_invalid: "Email inválido.",
  form_code_incorrect: "Código incorrecto.",
  verification_expired: "O código expirou. Peça um novo código.",
  verification_failed: "Demasiadas tentativas. Peça um novo código.",
  form_password_pwned: "Esta palavra-passe apareceu numa fuga de dados. Escolha outra.",
  form_password_length_too_short: "A palavra-passe é demasiado curta.",
  form_password_not_strong_enough: "A palavra-passe não é suficientemente forte.",
  too_many_requests: "Demasiadas tentativas. Aguarde um momento e tente de novo.",
  strategy_for_user_invalid: "Esta conta não usa palavra-passe. Contacte o administrador.",
};

export function signInErrorMessage(err: unknown, fallback: string): string {
  const first = (err as { errors?: Array<{ code?: string; longMessage?: string; message?: string }> })?.errors?.[0];
  if (first?.code && MESSAGES[first.code]) return MESSAGES[first.code]!;
  return first?.longMessage || first?.message || fallback;
}

function isSessionExists(err: unknown): boolean {
  const first = (err as { errors?: Array<{ code?: string; message?: string }> })?.errors?.[0];
  return first?.code === "session_exists" || Boolean(first?.message?.includes("Session already exists"));
}

/** Where to go after signing in: this app's root, or the chosen portal's site. */
export function postSignInUrl(selected: Pick<DashboardInfo, "id" | "url">, currentId: DashboardId): string {
  return selected.id === currentId ? "/" : `${selected.url}/`;
}

export async function signInWithPassword(
  signIn: SignInResourceLike,
  setActive: SetActiveLike,
  identifier: string,
  password: string,
): Promise<void> {
  try {
    const result = await signIn.create({ identifier: identifier.trim(), password });
    if (result.status !== "complete") {
      throw { errors: [{ message: "Não foi possível concluir o acesso. Contacte o administrador." }] };
    }
    await setActive({ session: result.createdSessionId });
  } catch (err) {
    if (isSessionExists(err)) return;
    throw new Error(signInErrorMessage(err, "Não foi possível entrar."));
  }
}

export async function requestPasswordReset(signIn: SignInResourceLike, email: string): Promise<void> {
  try {
    await signIn.create({ strategy: "reset_password_email_code", identifier: email.trim() });
  } catch (err) {
    throw new Error(signInErrorMessage(err, "Não foi possível enviar o código."));
  }
}

export async function completePasswordReset(
  signIn: SignInResourceLike,
  setActive: SetActiveLike,
  code: string,
  password: string,
): Promise<void> {
  try {
    const result = await signIn.attemptFirstFactor({
      strategy: "reset_password_email_code",
      code: code.trim(),
      password,
    });
    if (result.status !== "complete") {
      throw { errors: [{ message: "Não foi possível concluir a recuperação. Contacte o administrador." }] };
    }
    await setActive({ session: result.createdSessionId });
  } catch (err) {
    throw new Error(signInErrorMessage(err, "Não foi possível alterar a palavra-passe."));
  }
}
