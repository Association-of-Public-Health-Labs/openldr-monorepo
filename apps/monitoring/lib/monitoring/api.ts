/** Client-side reads of this app's own route handlers (same origin; the Clerk session cookie authenticates). */
const FALLBACK = "Não foi possível carregar os dados.";

// Requests in flight, by URL: cards on one page asking for the same route share one request.
const inFlight = new Map<string, Promise<unknown>>();

export function monitoringGet<T>(path: string, params?: Record<string, string>): Promise<T> {
  const query = params && Object.keys(params).length ? `?${new URLSearchParams(params).toString()}` : "";
  const url = `${path}${query}`;
  const pending = inFlight.get(url);
  if (pending) return pending as Promise<T>;
  const request = load<T>(url).finally(() => inFlight.delete(url));
  inFlight.set(url, request);
  return request;
}

async function load<T>(url: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, { cache: "no-store" });
  } catch {
    throw new Error(FALLBACK);
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(typeof body?.error === "string" && body.error ? body.error : FALLBACK);
  }
  return (await res.json()) as T;
}
