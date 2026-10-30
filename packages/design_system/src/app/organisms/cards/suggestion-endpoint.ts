export type SuggestionCategory = "suggestion" | "doubt";

export function buildSuggestionEndpoint(
  apiBaseUrl: string | undefined,
  endpointPath: string | undefined,
  category: SuggestionCategory,
): string {
  if (!apiBaseUrl || !endpointPath) {
    throw new Error("OpenLDR suggestion endpoint is not configured");
  }

  const endpoint = new URL(endpointPath, apiBaseUrl);
  endpoint.searchParams.set("duvida", String(category === "doubt"));
  return endpoint.toString();
}

export type SuggestionPayload = {
  content: string;
  category: SuggestionCategory;
  reportTitle: string;
  userEmail?: string;
  userName?: string;
};

export type SuggestionServices = {
  endpointPath: string;
  getToken: () => Promise<string | null>;
};

export async function sendSuggestion(
  apiBaseUrl: string | undefined,
  services: SuggestionServices,
  payload: SuggestionPayload,
): Promise<void> {
  const endpoint = buildSuggestionEndpoint(apiBaseUrl, services.endpointPath, payload.category);
  // Resolve the current session token for every send, including retries.
  const token = await services.getToken();
  if (!token) throw new Error("Authentication required to send a suggestion");

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`Failed to send suggestion (${response.status})`);
}
