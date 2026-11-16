/** Client-side reads of this app's own route handlers (same origin; the Clerk session cookie authenticates). */
const FALLBACK = "Não foi possível carregar os dados.";

export async function monitoringGet<T>(path: string, params?: Record<string, string>): Promise<T> {
  const query = params && Object.keys(params).length ? `?${new URLSearchParams(params).toString()}` : "";
  let res: Response;
  try {
    res = await fetch(`${path}${query}`, { cache: "no-store" });
  } catch {
    throw new Error(FALLBACK);
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(typeof body?.error === "string" && body.error ? body.error : FALLBACK);
  }
  return (await res.json()) as T;
}
