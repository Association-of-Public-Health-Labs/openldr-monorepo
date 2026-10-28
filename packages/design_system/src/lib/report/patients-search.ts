import type { AdminStatus } from "../../hooks/report/report-context";
import type { DateRange } from "./dates";
import type { Params } from "./params";
import type { PatientsPage } from "./patients";

export type FieldOption = { value: string; label: string };

/** One input of a search mode. `key` names its value and its DOM id (`p-<key>`). */
export type Field =
  | { kind: "text"; key: string; label: string }
  | {
      kind: "select";
      key: string;
      label: string;
      options: FieldOption[];
      /** Empty first option (value ""), e.g. "Escolha…". */
      placeholder?: string;
      defaultValue?: string;
    };

export type FieldValues = Record<string, string>;

export type SubmittedSearch = { endpoint: string; params: Params };

export type BuiltSearch = SubmittedSearch | { error: string };

/** A search tab: its fields, and how their values become a request (or a validation message). */
export type SearchMode = {
  id: string;
  label: string;
  fields: Field[];
  build: (values: FieldValues, range: DateRange) => BuiltSearch;
};

export const DEFAULT_PER_PAGE_OPTIONS = [50, 100, 500];

/** Every field of every mode at its default, or "". */
export function initialValues(modes: SearchMode[]): FieldValues {
  const values: FieldValues = {};
  for (const mode of modes) {
    for (const field of mode.fields) values[field.key] = field.kind === "select" ? (field.defaultValue ?? "") : "";
  }
  return values;
}

/** What the card shows for the user's role: a skeleton, the restricted message, or the search. */
export function searchGate(status: AdminStatus): "loading" | "denied" | "ready" {
  if (status === "admin") return "ready";
  return status === "user" ? "denied" : "loading";
}

// Literal classes so Tailwind sees them.
const GRID_COLS = ["", "", " sm:grid-cols-2", " sm:grid-cols-3", " sm:grid-cols-4"];

/** Tab layout: a lone select sits narrow without a wrapper; other fields go in a grid, one column each. */
export function modeLayout(fields: Field[]): { className: string; wrap: boolean } {
  if (fields.length === 1 && fields[0]!.kind === "select") return { className: "pt-3 sm:max-w-xs", wrap: false };
  return { className: `grid gap-3 pt-3${GRID_COLS[Math.min(fields.length, 4)]}`, wrap: true };
}

export type SubmitResult = { kind: "blocked" } | { kind: "error"; error: string } | { kind: "fetch"; search: SubmittedSearch };

/**
 * The last submitted search. Pesquisar builds a fresh one from the inputs; paging and per-page
 * changes re-use it, not the edited inputs. A failed build or a non-admin sends nothing.
 */
export function createSearchSession() {
  let last: SubmittedSearch | null = null;
  return {
    submit(status: AdminStatus, mode: SearchMode, values: FieldValues, range: DateRange): SubmitResult {
      if (status !== "admin") return { kind: "blocked" };
      const search = mode.build(values, range);
      if ("error" in search) {
        last = null;
        return { kind: "error", error: search.error };
      }
      last = search;
      return { kind: "fetch", search };
    },
    last: (): SubmittedSearch | null => last,
    clear: () => {
      last = null;
    },
  };
}

export const pageSummary = (page: PatientsPage<unknown> | null): string =>
  page ? `${page.total_count} pacientes · página ${page.page} de ${Math.max(page.total_pages, 1)}` : "";
