import { eidGetList } from "./api";

export type EidLab = { code: string; name: string; lab_type: "conventional" | "poc" };
export type LabKind = "conventional" | "poc" | "all";
export type LabGroup = { name: string; codes: string[] };

let cached: Promise<EidLab[]> | null = null;

/** The EID lab list (Ruling L1), loaded once per session. A failure is not cached, so a retry can succeed. */
export function fetchLabs(token: string | null): Promise<EidLab[]> {
  if (!cached) {
    cached = eidGetList<EidLab>("/laboratories/labs/", {}, token);
    cached.catch(() => {
      cached = null;
    });
  }
  return cached;
}

/** Test hook: forgets the cached list. */
export function resetLabsCache(): void {
  cached = null;
}

/** One dialog group per lab (Ruling L3). `all`: conventional first, then PoC sites suffixed " (PoC)". */
export function labsFor(labs: EidLab[], kind: LabKind): LabGroup[] {
  const group = (l: EidLab, suffix = ""): LabGroup => ({ name: l.name + suffix, codes: [l.code] });
  const conventional = labs.filter((l) => l.lab_type === "conventional").map((l) => group(l));
  if (kind === "conventional") return conventional;
  if (kind === "poc") return labs.filter((l) => l.lab_type === "poc").map((l) => group(l));
  return [...conventional, ...labs.filter((l) => l.lab_type === "poc").map((l) => group(l, " (PoC)"))];
}

/** Codes of the chosen lab names; unknown names are ignored. */
export const toLabCodes = (groups: LabGroup[], names: string[]): string[] =>
  groups.filter((g) => names.includes(g.name)).flatMap((g) => g.codes);
