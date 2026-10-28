import { describe, expect, it } from "vitest";
import { ApiError, asList, cleanParams, errorMessage } from "./api";

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

describe("asList", () => {
  it("passes an array through", () => {
    expect(asList([{ a: 1 }])).toEqual([{ a: 1 }]);
  });

  it("throws a generic server ApiError (status 500) when the body is not an array", () => {
    for (const body of [{ status: "error" }, null, "oops"]) {
      let err: unknown;
      try {
        asList(body);
      } catch (e) {
        err = e;
      }
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(500);
      expect((err as ApiError).message).toBe("Ocorreu um erro no servidor. Tente novamente.");
    }
  });
});
