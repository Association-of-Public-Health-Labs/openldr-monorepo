import axios from "axios";
import { api } from "@/config/api";
import { ApiError, asList, cleanParams, errorMessage } from "@repo/design_system/lib/report/api";
import type { Params } from "@repo/design_system/lib/report/params";

/** GET on the API's admin-only /usage/* endpoints. A 403 (no admin claim) becomes the Portuguese access message. */
export async function usageGet<T>(path: string, params: Params, token: string | null): Promise<T> {
  try {
    const res = await api(token ?? "").get<T>(`/usage${path}`, { params: cleanParams(params), paramsSerializer: { indexes: null } });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? null;
      throw new ApiError(errorMessage(status), status);
    }
    throw new ApiError(errorMessage(500), 500);
  }
}

export async function usageGetList<T>(path: string, params: Params, token: string | null): Promise<T[]> {
  return asList<T>(await usageGet<unknown>(path, params, token));
}
