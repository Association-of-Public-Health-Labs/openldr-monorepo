import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/config/api", () => ({ api: () => ({ get: m.get }) }));

import type { ApiError } from "@repo/design_system/lib/report/api";
import { usageGet } from "./usage-api";

beforeEach(() => {
  m.get.mockReset();
});

describe("usageGet errors", () => {
  it("says the server could not be reached when there is no response", async () => {
    m.get.mockRejectedValue({ isAxiosError: true, message: "Network Error" });
    const error = (await usageGet<unknown>("/summary/", {}, "t").then(() => null, (e) => e)) as ApiError;
    expect(error.status).toBeNull();
    expect(error.message).toMatch(/Não foi possível contactar o servidor/);
  });
  it("maps 403 to the administrator message", async () => {
    m.get.mockRejectedValue({ isAxiosError: true, response: { status: 403 } });
    const error = (await usageGet<unknown>("/summary/", {}, "t").then(() => null, (e) => e)) as ApiError;
    expect(error.status).toBe(403);
    expect(error.message).toMatch(/Administrador/);
  });
});
