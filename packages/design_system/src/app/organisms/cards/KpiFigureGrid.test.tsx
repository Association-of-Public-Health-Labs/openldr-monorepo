import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { KpiFigureGrid, figureCellClass } from "./KpiFigureGrid";

const figures = (n: number) => Array.from({ length: n }, (_, i) => ({ label: `F${i}`, value: String(i) }));

describe("KpiFigureGrid", () => {
  it("draws a solid outline around a 2-column grid", () => {
    const html = renderToStaticMarkup(<KpiFigureGrid figures={figures(4)} />);
    expect(html).toContain("grid-cols-2");
    expect(html).toContain("border-solid");
  });

  it("puts a dashed divider only between columns and between rows, never on the outer edge", () => {
    // 4 figures, 2 × 2: right divider on the left column, top divider on the second row.
    expect(figureCellClass(0, 4)).toContain("border-r");
    expect(figureCellClass(0, 4)).not.toContain("border-t");
    expect(figureCellClass(1, 4)).not.toContain("border-r");
    expect(figureCellClass(2, 4)).toContain("border-t");
    expect(figureCellClass(2, 4)).toContain("border-r");
    expect(figureCellClass(3, 4)).toContain("border-t");
    expect(figureCellClass(3, 4)).not.toContain("border-r");
  });

  it("lets a last, odd figure span both columns with no side divider", () => {
    expect(figureCellClass(2, 3)).toContain("col-span-2");
    expect(figureCellClass(2, 3)).not.toContain("border-r");
    expect(figureCellClass(2, 3)).toContain("border-t");
  });

  it("shows the note under the value", () => {
    const html = renderToStaticMarkup(<KpiFigureGrid figures={[{ label: "Média mensal", value: "1 200", note: "11 meses completos" }]} />);
    expect(html).toContain("11 meses completos");
    expect(html).toContain("Média mensal");
  });
});
