import axios from "axios";
import { api } from "@/config/api";

export type Params = Record<string, string | number | string[] | undefined>;

export const VL_BASE = "/hiv/vl";

export class ApiError extends Error {
  status: number | null;
  constructor(message: string, status: number | null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** Portuguese message for an HTTP status. 5xx text from the server is never shown. */
export function errorMessage(status: number | null, serverMessage?: string): string {
  if (status === 401) return "A sua sessão expirou. Inicie sessão novamente.";
  if (status === 403) return "Acesso restrito a utilizadores com permissão de Administrador.";
  if (status === 400) return serverMessage || "Parâmetros inválidos.";
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

export async function vlGet<T>(path: string, params: Params, token: string | null): Promise<T> {
  try {
    const res = await api(token ?? "").get<T>(`${VL_BASE}${path}`, {
      params: cleanParams(params),
      paramsSerializer: { indexes: null },
    });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? null;
      const message = (error.response?.data as { message?: unknown } | undefined)?.message;
      throw new ApiError(errorMessage(status, typeof message === "string" ? message : undefined), status);
    }
    throw new ApiError(errorMessage(500), 500);
  }
}
