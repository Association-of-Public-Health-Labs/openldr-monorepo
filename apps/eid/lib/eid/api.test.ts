import { AxiosError } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

const get = vi.fn();
vi.mock("@/config/api", () => ({ api: () => ({ get }) }));

import { ApiError, EID_BASE, eidGet, eidGetList } from "./api";

const axiosError = (status: number | null) =>
  new AxiosError("boom", "ERR", undefined, undefined, status === null ? undefined : ({ status, data: {} } as any));

describe("eidGetList", () => {
  beforeEach(() => get.mockReset());

  it("prefixes /hiv/eid, drops empty params and serialises arrays without indexes", async () => {
    get.mockResolvedValue({ data: [{ total: 1 }] });
    const rows = await eidGetList("/summary/tat/", { interval_dates: "a,b", lab_type: "" }, "t");
    expect(EID_BASE).toBe("/hiv/eid");
    expect(rows).toEqual([{ total: 1 }]);
    expect(get).toHaveBeenCalledWith("/hiv/eid/summary/tat/", {
      params: { interval_dates: "a,b" },
      paramsSerializer: { indexes: null },
    });
  });

  it("turns a 403 into the restricted-access message", async () => {
    get.mockRejectedValueOnce(axiosError(403));
    await expect(eidGetList("/x/", {}, "t")).rejects.toMatchObject({
      status: 403,
      message: "Acesso restrito a utilizadores com permissão de Administrador.",
    });
  });

  it("rejects with status 500 when a 200 body is an object", async () => {
    get.mockResolvedValue({ data: { status: "error" } });
    const err = (await eidGetList("/x/", {}, "t").catch((e: unknown) => e)) as ApiError;
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(500);
  });
});

describe("eidGet", () => {
  it("returns the body as is", async () => {
    get.mockResolvedValue({ data: { page: 1 } });
    await expect(eidGet("/x/", {}, null)).resolves.toEqual({ page: 1 });
  });
});
