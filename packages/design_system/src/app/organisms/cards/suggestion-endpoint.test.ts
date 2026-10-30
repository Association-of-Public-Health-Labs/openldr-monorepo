import { afterEach, describe, expect, it, vi } from "vitest";
import { buildSuggestionEndpoint, sendSuggestion } from "./suggestion-endpoint";

describe("buildSuggestionEndpoint", () => {
  it("uses the VL suggestion path and marks suggestions as duvida=false", () => {
    expect(
      buildSuggestionEndpoint(
        "https://api.openldr.org.mz",
        "/hiv/vl/send-suggestion",
        "suggestion",
      ),
    ).toBe("https://api.openldr.org.mz/hiv/vl/send-suggestion?duvida=false");
  });

  it("marks doubts as duvida=true", () => {
    expect(
      buildSuggestionEndpoint(
        "https://dev.openldr.org.mz/",
        "/tb/gx/send-suggestion",
        "doubt",
      ),
    ).toBe("https://dev.openldr.org.mz/tb/gx/send-suggestion?duvida=true");
  });

  it("reports missing endpoint configuration", () => {
    expect(() => buildSuggestionEndpoint(undefined, "/tb/gx/send-suggestion", "doubt")).toThrow(
      "OpenLDR suggestion endpoint is not configured",
    );
  });
});

describe("sendSuggestion", () => {
  const payload = { content: "<p>Uma sugestão</p>", category: "suggestion" as const, reportTitle: "Amostras" };
  const endpointPath = "/tb/gx/send-suggestion";
  afterEach(() => vi.unstubAllGlobals());

  it("waits for authentication and sends the current Bearer token with the dashboard payload", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    let resolveToken!: (token: string) => void;
    const getToken = vi.fn(() => new Promise<string>((resolve) => { resolveToken = resolve; }));
    const sending = sendSuggestion("https://api.openldr.org.mz", { endpointPath, getToken }, payload);
    expect(fetchMock).not.toHaveBeenCalled();
    resolveToken("session-token");
    await sending;
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.openldr.org.mz/tb/gx/send-suggestion?duvida=false",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer session-token" },
        body: JSON.stringify(payload),
      },
    );
  });

  it("obtains a fresh session token for a retry after a rejected request", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({ ok: false, status: 401 }).mockResolvedValueOnce({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    const getToken = vi.fn().mockResolvedValueOnce("old-token").mockResolvedValueOnce("new-token");
    const services = { endpointPath, getToken };
    await expect(sendSuggestion("https://api.openldr.org.mz", services, payload)).rejects.toThrow("401");
    await sendSuggestion("https://api.openldr.org.mz", services, payload);
    expect(getToken).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1]![1].headers.Authorization).toBe("Bearer new-token");
  });

  it("does not send a message without an authenticated session", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await expect(sendSuggestion("https://api.openldr.org.mz", { endpointPath, getToken: async () => null }, payload)).rejects.toThrow("Authentication required");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects email service failures so the dialog can retain the message", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    await expect(sendSuggestion("https://api.openldr.org.mz", { endpointPath, getToken: async () => "session-token" }, payload)).rejects.toThrow("503");
  });
});
