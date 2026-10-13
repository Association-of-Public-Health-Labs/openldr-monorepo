import { AxiosError } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

const get = vi.fn();
vi.mock("@/config/api", () => ({ api: () => ({ get }) }));

import { ApiError, cleanParams, errorMessage, vlGet, vlGetList } from "./api";

const axiosError = (status: number | null, data?: unknown) =>
  new AxiosError("boom", "ERR", undefined, undefined, status === null ? undefined : ({ status, data } as any));

describe("errorMessage", () => {
  it("maps statuses to Portuguese messages and never echoes 5xx text", () => {
    expect(errorMessage(401)).toMatch(/sessão expirou/);
    expect(errorMessage(403)).toMatch(/Acesso restrito/);
    expect(errorMessage(400)).toBe("Parâmetros inválidos. Verifique o intervalo de datas e os filtros.");
    expect(errorMessage(null)).toMatch(/Não foi possível contactar o servidor/);
    expect(errorMessage(500)).toBe("Ocorreu um erro no servidor. Tente novamente.");
  });
});

describe("cleanParams", () => {
  it("drops undefined, empty strings and empty arrays", () => {
    expect(cleanParams({ a: undefined, b: "", c: [], d: "x", e: ["p"], f: 0 })).toEqual({ d: "x", e: ["p"], f: 0 });
  });
});

describe("vlGet", () => {
  beforeEach(() => {
    get.mockReset();
  });

  it("prefixes /hiv/vl, cleans params and serialises arrays without indexes", async () => {
    get.mockResolvedValue({ data: [{ total: 1 }] });
    const data = await vlGet("/summary/tat_by_month/", { interval_dates: "2025-01-01,2025-12-31", lab_code: [] }, "tok");
    expect(data).toEqual([{ total: 1 }]);
    expect(get).toHaveBeenCalledWith("/hiv/vl/summary/tat_by_month/", {
      params: { interval_dates: "2025-01-01,2025-12-31" },
      paramsSerializer: { indexes: null },
    });
  });

  it("turns a 403 into ApiError with the restricted-access message", async () => {
    get.mockRejectedValue(axiosError(403, { status: "error", code: 403, message: "Forbidden - User ..." }));
    await expect(vlGet("/facilities/registered_samples/", {}, "tok")).rejects.toMatchObject({
      status: 403,
      message: expect.stringMatching(/Acesso restrito/),
    });
  });

  it("turns an expired token (401) and a network failure into Portuguese messages", async () => {
    get.mockRejectedValueOnce(axiosError(401, { message: "Invalid or missing token" }));
    await expect(vlGet("/x/", {}, null)).rejects.toMatchObject({ status: 401, message: expect.stringMatching(/sessão expirou/) });
    get.mockRejectedValueOnce(axiosError(null));
    await expect(vlGet("/x/", {}, null)).rejects.toMatchObject({ status: null });
  });

  it("wraps non-axios errors as a generic server error", async () => {
    get.mockRejectedValue(new TypeError("x is undefined"));
    const err = (await vlGet("/x/", {}, "t").catch((e: unknown) => e)) as ApiError;
    expect(err).toBeInstanceOf(ApiError);
    expect(err.message).toBe("Ocorreu um erro no servidor. Tente novamente.");
  });
});

describe("vlGetList", () => {
  beforeEach(() => {
    get.mockReset();
  });

  it("returns the array body", async () => {
    get.mockResolvedValue({ data: [{ a: 1 }] });
    await expect(vlGetList("/x/", {}, "t")).resolves.toEqual([{ a: 1 }]);
  });

  it("throws a generic server ApiError when a 200 body is not an array", async () => {
    for (const body of [{ status: "error" }, null, "oops"]) {
      get.mockResolvedValueOnce({ data: body });
      const err = (await vlGetList("/x/", {}, "t").catch((e: unknown) => e)) as ApiError;
      expect(err).toBeInstanceOf(ApiError);
      expect(err.status).toBe(500);
      expect(err.message).toBe("Ocorreu um erro no servidor. Tente novamente.");
    }
  });

  it("propagates HTTP errors from vlGet", async () => {
    get.mockRejectedValue(axiosError(403));
    await expect(vlGetList("/x/", {}, "t")).rejects.toMatchObject({ status: 403 });
  });
});
