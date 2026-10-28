import type { Params } from "./params";

export class ApiError extends Error {
  status: number | null;
  constructor(message: string, status: number | null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** Portuguese message for an HTTP status. 5xx text from the server is never shown. */
export function errorMessage(status: number | null): string {
  if (status === 401) return "A sua sessão expirou. Inicie sessão novamente.";
  if (status === 403) return "Acesso restrito a utilizadores com permissão de Administrador.";
  if (status === 400) return "Parâmetros inválidos. Verifique o intervalo de datas e os filtros.";
  if (status === null) return "Não foi possível contactar o servidor. Verifique a ligação e tente novamente.";
  return "Ocorreu um erro no servidor. Tente novamente.";
}

export function cleanParams(params: Params): Params {
  const out: Params = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    if (Array.isArray(value) && value.length === 0) continue;
    out[key] = value;
  }
  return out;
}

/** A 200 whose body is not an array is treated as a server error. */
export function asList<T>(data: unknown): T[] {
  if (!Array.isArray(data)) throw new ApiError(errorMessage(500), 500);
  return data as T[];
}
