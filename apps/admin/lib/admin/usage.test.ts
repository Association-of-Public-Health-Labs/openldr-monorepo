import { describe, expect, it } from "vitest";
import {
  countInactiveUsers, displayName, emptyMessage, last12Months, pivotMonthly, relativeDay, resolveInChunks,
  trendVsPrevious, usageRegistry, USER_REMOVED, lastDays,
} from "./usage";

describe("trendVsPrevious", () => {
  it("gives +8% for 142 against 131", () => {
    expect(trendVsPrevious(142, 131)).toMatchObject({ value: "+8%", direction: "up", good: true, caption: "vs período anterior" });
  });
  it("gives no trend without a previous value, never Infinity", () => {
    expect(trendVsPrevious(10, 0)).toBeNull();
    expect(trendVsPrevious(10, undefined)).toBeNull();
    expect(trendVsPrevious(10, null)).toBeNull();
  });
  it("marks a fall as down", () => {
    expect(trendVsPrevious(90, 100)).toMatchObject({ direction: "down", good: false });
  });
});

describe("usageRegistry", () => {
  it("lists the dashboards from the registry without admin, with name and colour", () => {
    const r = usageRegistry();
    expect(r.map((d) => d.id)).toEqual(["vl", "tb", "eid"]);
    expect(r[0]).toMatchObject({ name: "Carga Viral", color: "#00B000", tag: "CV" });
  });
});

describe("last12Months / lastDays", () => {
  it("covers the 12 calendar months ending with the current one", () => {
    const m = last12Months(new Date(2026, 10, 6));
    expect(m.range).toEqual({ start: "2025-12-01", end: "2026-11-06" });
    expect(m.months).toHaveLength(12);
    expect(m.months[0]).toEqual({ year: 2025, month: 12 });
    expect(m.months[11]).toEqual({ year: 2026, month: 11 });
  });
  it("lastDays(30) ends today and spans 30 days", () => {
    expect(lastDays(30, new Date(2026, 10, 6))).toEqual({ start: "2026-10-08", end: "2026-11-06" });
  });
});

describe("pivotMonthly", () => {
  const months = [{ year: 2026, month: 9 }, { year: 2026, month: 10 }, { year: 2026, month: 11 }];
  const rows = [
    { year: 2026, month: 9, dashboard: "vl", active_users: 5 },
    { year: 2026, month: 10, dashboard: "vl", active_users: 7 },
    { year: 2026, month: 11, dashboard: "vl", active_users: 9 },
    { year: 2026, month: 11, dashboard: "eid", active_users: 2 },
    { year: 2026, month: 11, dashboard: "admin", active_users: 1 },
    { year: 2026, month: 11, dashboard: "xx", active_users: 1 },
  ];
  it("makes one series per dashboard with null for months without data", () => {
    const chart = pivotMonthly(rows, months);
    expect(chart.labels).toEqual(["Set/26", "Out/26", "Nov/26"]);
    expect(chart.series.map((s) => s.name)).toEqual(["Carga Viral", "Diagnóstico Precoce Infantil"]);
    expect(chart.series[0]).toMatchObject({ color: "#00B000", data: [5, 7, 9] });
    expect(chart.series[1]).toMatchObject({ color: "#fda92d", data: [null, null, 2] });
  });
  it("gives no series for no rows", () => {
    expect(pivotMonthly([], months).series).toEqual([]);
  });
});

describe("countInactiveUsers", () => {
  const now = new Date("2026-11-06T00:00:00Z").getTime();
  const day = 86_400_000;
  const u = (o: Record<string, unknown>) => ({ banned: false, lastActiveAt: now, ...o });
  it("counts a user who never signed in (last_active_at null)", () => {
    expect(countInactiveUsers([u({ lastActiveAt: null })], 90, now)).toBe(1);
  });
  it("counts those older than the window and not recent ones", () => {
    expect(countInactiveUsers([u({ lastActiveAt: now - 91 * day }), u({ lastActiveAt: now - 89 * day })], 90, now)).toBe(1);
  });
  it("ignores blocked users", () => {
    expect(countInactiveUsers([u({ banned: true, lastActiveAt: null })], 90, now)).toBe(0);
  });
});

describe("displayName", () => {
  const known = { u1: { name: "Ana Exemplo", email: "ana@x.org" } };
  it("shows the resolved name", () => expect(displayName("u1", known)).toBe("Ana Exemplo"));
  it("shows Utilizador removido for an unresolved id", () => {
    expect(displayName("gone", known)).toBe("Utilizador removido");
    expect(USER_REMOVED).toBe("Utilizador removido");
  });
  it("falls back to the email when the name is empty", () => {
    expect(displayName("u2", { u2: { name: "", email: "b@x.org" } })).toBe("b@x.org");
  });
});

describe("emptyMessage", () => {
  it("is Portuguese and says data covers only the period since tracking began", () => {
    const m = emptyMessage("páginas vistas");
    expect(m).toMatch(/^Sem páginas vistas/);
    expect(m).toMatch(/apenas o período desde o início do acompanhamento/);
  });
});

describe("relativeDay", () => {
  const now = new Date(2026, 10, 6, 15, 0);
  it("says Hoje, Ontem and Há N dias", () => {
    expect(relativeDay(new Date(2026, 10, 6, 9, 0).toISOString(), now)).toBe("Hoje");
    expect(relativeDay(new Date(2026, 10, 5, 23, 0).toISOString(), now)).toBe("Ontem");
    expect(relativeDay(new Date(2026, 10, 3, 9, 0).toISOString(), now)).toBe("Há 3 dias");
  });
  it("is a dash for a missing or invalid date", () => {
    expect(relativeDay(null, now)).toBe("–");
    expect(relativeDay("nope", now)).toBe("–");
  });
});

describe("resolveInChunks", () => {
  it("dedupes and asks for at most 100 ids at a time", async () => {
    const calls: string[][] = [];
    const ids = Array.from({ length: 230 }, (_, i) => `u${i}`);
    const out = await resolveInChunks([...ids, "u0"], async (chunk) => {
      calls.push(chunk);
      return Object.fromEntries(chunk.map((id) => [id, { name: id, email: "" }]));
    });
    expect(calls.map((c) => c.length)).toEqual([100, 100, 30]);
    expect(Object.keys(out)).toHaveLength(230);
  });
});
