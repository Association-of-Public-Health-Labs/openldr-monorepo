import { describe, expect, it } from "vitest";
import { classify, offTarget, severity, statusOf, totalOf, withinTarget, type TatCounts } from "./tat";

describe("transport TAT rules", () => {
  it("share within target is <7 plus 7–15 over the total", () => {
    expect(withinTarget([25, 33, 26, 21])).toBeCloseTo(58 / 105);
    expect(withinTarget([0, 0, 0, 0])).toBeNull();
    expect(totalOf([1, 2, 3, 4])).toBe(10);
  });

  it("class is the predominant interval, ties to the worse one", () => {
    expect(classify([25, 33, 26, 21])).toBe(1);
    expect(classify([4, 4, 0, 0])).toBe(1);
    expect(classify([0, 0, 0, 1])).toBe(3);
    expect(classify([0, 0, 0, 0])).toBe(-1);
  });

  it("off target when most samples took over 15 days", () => {
    expect(offTarget([1, 1, 3, 0])).toBe(true);
    expect(offTarget([3, 1, 1, 1])).toBe(false);
    expect(offTarget([0, 0, 0, 0])).toBe(false);
  });

  it("status follows the class", () => {
    expect(statusOf([5, 1, 0, 0]).label).toBe("Estável");
    expect(statusOf([0, 1, 5, 0]).label).toBe("Atenção");
    expect(statusOf([0, 1, 0, 5]).label).toBe("Crítico");
    expect(statusOf([0, 0, 0, 0]).label).toBe("Sem dados");
  });

  it("sorts worst first, no data last", () => {
    const rows: [string, TatCounts][] = [
      ["good", [5, 1, 0, 0]],
      ["none", [0, 0, 0, 0]],
      ["bad-low", [0, 1, 0, 9]],
      ["bad-high", [0, 4, 0, 5]],
    ];
    const order = [...rows].sort((a, b) => severity(b[1]) - severity(a[1])).map(([n]) => n);
    expect(order).toEqual(["bad-low", "bad-high", "good", "none"]);
  });
});
