import { afterEach, describe, expect, it, vi } from "vitest";
import type { HistoryRow } from "@/lib/monitoring/types";

const get = vi.fn();
vi.mock("@/lib/monitoring/api", () => ({ monitoringGet: (...a: unknown[]) => get(...a) }));
import { fetchData, formatMaputo, toExcel } from "./actions";

const row: HistoryRow = {
  id: "a1", state: "Pendente", wentOffline: "2026-11-15T22:30:00.000Z", wentOnline: null,
  offlineDurationMs: 3_600_000, offlineDurationLabel: "1 hora", createdAt: "2026-11-15T22:31:00.000Z", updatedAt: "2026-11-15T22:31:00.000Z",
};

describe("connectivity-history actions", () => {
  afterEach(() => get.mockReset());

  it("formats instants in Maputo time (UTC+2) as dd/MM/yyyy HH:mm", () => {
    expect(formatMaputo("2026-11-15T22:30:00.000Z")).toBe("16/11/2026 00:30");
    expect(formatMaputo(null)).toBe("—");
  });

  it("asks the history route for the host, state filter and period", async () => {
    get.mockResolvedValue({ rows: [row] });
    await expect(fetchData("HGM", "Pendentes", { start: "2025-11-16", end: "2026-11-16" })).resolves.toEqual([row]);
    expect(get).toHaveBeenCalledWith("/api/history", { code: "HGM", status: "Pendentes", startDate: "2025-11-16", endDate: "2026-11-16" });
  });

  it("exports the rows with the table's columns", () => {
    expect(toExcel([row])).toEqual({
      header: ["ID", "Estado", "Ficou offline", "Ficou online", "Tempo offline", "Criado em", "Actualizado"],
      rows: [["a1", "Pendente", "16/11/2026 00:30", "—", "1 hora", "16/11/2026 00:31", "16/11/2026 00:31"]],
    });
  });
});
