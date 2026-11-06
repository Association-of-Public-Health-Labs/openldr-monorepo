const KNOWN: Record<string, string> = {
  form_identifier_exists: "Já existe um utilizador com este e-mail.",
  duplicate_record: "Já existe um registo com estes dados.",
  form_param_format_invalid: "O e-mail indicado não é válido.",
  form_param_nil: "Preencha todos os campos obrigatórios.",
};

export const GENERIC_ERROR = "Não foi possível concluir a operação. Tente novamente.";

/** Portuguese text for a Clerk failure. Never forwards Clerk's own wording to the client. */
export function clerkErrorMessage(error: unknown): string {
  const code = (error as { errors?: { code?: unknown }[] } | null)?.errors?.[0]?.code;
  return (typeof code === "string" && KNOWN[code]) || GENERIC_ERROR;
}
