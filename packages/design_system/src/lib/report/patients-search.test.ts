import { describe, expect, it } from "vitest";
import {
  createSearchSession,
  initialValues,
  modeLayout,
  pageSummary,
  searchGate,
  type SearchMode,
} from "./patients-search";

const range = { start: "2025-10-13", end: "2026-10-13" };

const byName: SearchMode = {
  id: "name",
  label: "Por Nome",
  fields: [{ kind: "text", key: "name", label: "Nome" }],
  build: (values, r) =>
    values.name?.trim()
      ? { endpoint: "by_name", params: { interval_dates: `${r.start},${r.end}`, name: values.name.trim() } }
      : { error: "Indique o nome." },
};

const byResult: SearchMode = {
  id: "result",
  label: "Por Resultado",
  fields: [
    {
      kind: "select",
      key: "result",
      label: "Resultado",
      placeholder: "Escolha…",
      options: [{ value: "positive", label: "Positivo" }],
    },
    { kind: "select", key: "basis", label: "Data de referência", defaultValue: "registration", options: [] },
  ],
  build: () => ({ error: "x" }),
};

describe("search gate", () => {
  it("test_user_status_blocks_search", () => {
    expect(searchGate("unknown")).toBe("loading");
    expect(searchGate("user")).toBe("denied");
    expect(searchGate("admin")).toBe("ready");
    // A non-admin reaching the card (address bar) never gets a search to send.
    const session = createSearchSession();
    expect(session.submit("user", byName, { name: "Ana" }, range)).toEqual({ kind: "blocked" });
    expect(session.submit("unknown", byName, { name: "Ana" }, range)).toEqual({ kind: "blocked" });
    expect(session.last()).toBeNull();
  });
});

describe("search session", () => {
  it("test_build_error_sends_nothing", () => {
    const session = createSearchSession();
    expect(session.submit("admin", byName, { name: "Ana" }, range).kind).toBe("fetch");
    // A failed build drops the previous search: paging has nothing to re-send.
    expect(session.submit("admin", byName, { name: "  " }, range)).toEqual({ kind: "error", error: "Indique o nome." });
    expect(session.last()).toBeNull();
  });

  it("test_paging_reuses_last_search", () => {
    const session = createSearchSession();
    const values = { name: "Ana" };
    const first = session.submit("admin", byName, values, range);
    expect(first).toEqual({
      kind: "fetch",
      search: { endpoint: "by_name", params: { interval_dates: "2025-10-13,2026-10-13", name: "Ana" } },
    });
    values.name = "Maria"; // the user edits the input but does not press Pesquisar
    expect(session.last()).toEqual({ endpoint: "by_name", params: { interval_dates: "2025-10-13,2026-10-13", name: "Ana" } });
    session.clear();
    expect(session.last()).toBeNull();
  });
});

describe("fields", () => {
  it("starts every field at its default, or empty", () => {
    expect(initialValues([byName, byResult])).toEqual({ name: "", result: "", basis: "registration" });
  });

  it("lays out a lone select narrow and unwrapped, inputs in a grid", () => {
    expect(modeLayout([byResult.fields[0]!])).toEqual({ className: "pt-3 sm:max-w-xs", wrap: false });
    expect(modeLayout(byName.fields)).toEqual({ className: "grid gap-3 pt-3", wrap: true });
    expect(modeLayout([...byName.fields, ...byName.fields])).toEqual({ className: "grid gap-3 pt-3 sm:grid-cols-2", wrap: true });
    expect(modeLayout([...byName.fields, ...byName.fields, ...byName.fields])).toEqual({
      className: "grid gap-3 pt-3 sm:grid-cols-3",
      wrap: true,
    });
  });
});

describe("pageSummary", () => {
  it("describes the page in Portuguese and never says 'página 1 de 0'", () => {
    expect(pageSummary(null)).toBe("");
    expect(pageSummary({ status: "success", page: 1, per_page: 50, total_count: 0, total_pages: 0, data: [] })).toBe(
      "0 pacientes · página 1 de 1",
    );
    expect(pageSummary({ status: "success", page: 2, per_page: 50, total_count: 120, total_pages: 3, data: [] })).toBe(
      "120 pacientes · página 2 de 3",
    );
  });
});
