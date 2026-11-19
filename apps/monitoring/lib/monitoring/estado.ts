import type { Host } from "./types";

export type EstadoView =
  | { kind: "redirect"; code: string }
  | { kind: "show"; code: string }
  | { kind: "not-found" }
  | { kind: "empty" };

const collator = new Intl.Collator("pt", { sensitivity: "base" });

/** What the Estado page shows for `?code=`: that host, the first host by name, or a message. */
export function resolveEstado(code: string | null, hosts: Host[]): EstadoView {
  if (code) return hosts.some((h) => h.code === code) ? { kind: "show", code } : { kind: "not-found" };
  const first = hosts.filter((h) => h.code).sort((a, b) => collator.compare(a.name ?? "", b.name ?? ""))[0];
  return first?.code ? { kind: "redirect", code: first.code } : { kind: "empty" };
}

/** Whether the Estado cards show their loading state (pure, so every branch is tested). */
export function estadoLoading(s: {
  sitesLoading: boolean;
  view: EstadoView | null;
  detailLoading: boolean;
  detailError: string | null;
  hasDetail: boolean;
}): boolean {
  if (s.sitesLoading || !s.view) return true;
  if (s.view.kind === "redirect") return true;
  if (s.view.kind !== "show") return false;
  if (s.detailError) return false;
  return s.detailLoading || !s.hasDetail;
}
