import { describe, expect, it } from "vitest";
// The modules themselves, not the MUI barrel (which touches `window`).
import { formatNumber, groupThousands } from "../../../design_system_mui/src/utils/format-number";
import { withGroupedNumbers } from "../../../design_system_mui/src/themes/minimals-chart";

const S = " ";

describe("formatNumber", () => {
  it("groups thousands with a narrow no-break space, four-digit numbers too", () => {
    expect(formatNumber(138499)).toBe(`138${S}499`);
    expect(formatNumber(2255)).toBe(`2${S}255`);
    expect(formatNumber(1234567)).toBe(`1${S}234${S}567`);
    expect(formatNumber(999)).toBe("999");
    expect(formatNumber(-12345)).toBe(`-12${S}345`);
  });

  it("keeps up to two decimals and accepts numeric strings", () => {
    expect(formatNumber(12345.678)).toBe(`12${S}345.68`);
    expect(formatNumber("242589")).toBe(`242${S}589`);
  });

  it("returns empty text for missing values and leaves other text as is", () => {
    expect(formatNumber(undefined)).toBe("");
    expect(formatNumber(null)).toBe("");
    expect(formatNumber("n/d")).toBe("n/d");
  });
});

describe("groupThousands", () => {
  it("groups whole-number runs in formatted text, not decimals or grouped numbers", () => {
    expect(groupThousands("12345 amostras")).toBe(`12${S}345 amostras`);
    expect(groupThousands("95.3%")).toBe("95.3%");
    expect(groupThousands("0.12345")).toBe("0.12345");
    expect(groupThousands(`12${S}345`)).toBe(`12${S}345`);
  });
});

describe("withGroupedNumbers", () => {
  it("groups tooltip values, y-axis labels and data labels by default", () => {
    const out = withGroupedNumbers({}, "bar");
    expect(out.tooltip.y.formatter(138499)).toBe(`138${S}499`);
    expect(out.yaxis.labels.formatter(20000)).toBe(`20${S}000`);
    expect(out.dataLabels.formatter(4500)).toBe(`4${S}500`);
  });

  it("keeps the pie's percentage data labels and wraps every y axis", () => {
    expect(withGroupedNumbers({}, "pie").dataLabels).toBeUndefined();
    const out = withGroupedNumbers({ yaxis: [{ labels: { formatter: (v: number) => `${v}%` } }, {}] }, "mixed");
    expect(out.yaxis[0].labels.formatter(50)).toBe("50%");
    expect(out.yaxis[1].labels.formatter(10000)).toBe(`10${S}000`);
  });
});
