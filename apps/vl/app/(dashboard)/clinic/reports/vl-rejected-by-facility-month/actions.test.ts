import { describe, expect, it } from "vitest";
import { ENDPOINT } from "./constants";
import { toChart } from "./actions";

describe("vl-rejected-by-facility-month", () => {
  it("uses facilities rejected_samples_by_month", () => {
    expect(ENDPOINT).toBe("/facilities/rejected_samples_by_month/");
  });
  it("has one red series by month", () => {
    expect(toChart([{ year: 2026, month: 9, month_name: "September", total: 6 }])).toEqual({
      labels: ["Set/26"],
      series: [{ name: "Amostras Rejeitadas", color: "#ef5350", data: [6] }],
    });
  });
});
