import { describe, expect, it } from "vitest";
import { chartToSheet, singleSeries } from "./series";

describe("series", () => {
  it("chartToSheet writes one row per series under a label header", () => {
    const sheet = chartToSheet({ labels: ["A", "B"], series: singleSeries("Total", "#000", [1, 2]) }, "Província");
    expect(sheet).toEqual({ header: ["Província", "A", "B"], rows: [["Total", 1, 2]] });
  });
});
