import axios from "axios";
import { api } from "@/config/api";

import { ApiError, asList, cleanParams, errorMessage } from "@repo/design_system/lib/report/api";
import type { Params } from "@repo/design_system/lib/report/params";

export type { Params };
export { ApiError, cleanParams, errorMessage };

export const VL_BASE = "/hiv/vl";

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
      throw new ApiError(errorMessage(status), status);
    }
    throw new ApiError(errorMessage(500), 500);
  }
}

/** Like vlGet, but for list endpoints: a 200 whose body is not an array is treated as a server error. */
export async function vlGetList<T>(path: string, params: Params, token: string | null): Promise<T[]> {
  return asList<T>(await vlGet<unknown>(path, params, token));
}
