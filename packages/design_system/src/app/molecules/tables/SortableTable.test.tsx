import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BarValue, filterRows, SortableTable, sortRows } from "./SortableTable";

type Row = { name: string; tested: number };
const rows: Row[] = [
  { name: "CS Caiave", tested: 35 },
  { name: "Hospital Distrital de Mocuba", tested: 651 },
  { name: "CS Alto Benfica", tested: 10 },
];

describe("sortRows / filterRows", () => {
  it("sorts numbers and Portuguese text both ways", () => {
    expect(sortRows(rows, (r) => r.tested, "desc").map((r) => r.tested)).toEqual([651, 35, 10]);
    expect(sortRows(rows, (r) => r.name, "asc").map((r) => r.name)).toEqual(["CS Alto Benfica", "CS Caiave", "Hospital Distrital de Mocuba"]);
  });

  it("searches ignoring case and accents", () => {
    expect(filterRows([{ name: "Unidade Sanitária" }], (r) => r.name, "sanitaria")).toHaveLength(1);
    expect(filterRows(rows, (r) => r.name, "  ")).toHaveLength(3);
  });
});

describe("SortableTable", () => {
  const columns = [
    { key: "name", header: "Unidade sanitária", cell: (r: Row) => r.name, sortValue: (r: Row) => r.name, footer: "Total" },
    { key: "tested", header: "Testadas", align: "right" as const, cell: (r: Row) => r.tested, sortValue: (r: Row) => r.tested, footer: 696 },
  ];

  it("renders the rows in the default order with a total row", () => {
    const html = renderToStaticMarkup(
      <SortableTable label="Unidades" columns={columns} rows={rows} rowKey={(r) => r.name} defaultSort={{ key: "tested", direction: "desc" }} />,
    );
    expect(html.indexOf("Hospital Distrital de Mocuba")).toBeLessThan(html.indexOf("CS Caiave"));
    expect(html).toContain('aria-sort="descending"');
    expect(html).toContain("<tfoot>");
  });

  it("shows skeleton rows while loading, and the empty and error states", () => {
    expect(renderToStaticMarkup(<SortableTable label="U" columns={columns} rows={[]} rowKey={(r) => r.name} loading />)).toContain("animate-pulse");
    expect(renderToStaticMarkup(<SortableTable label="U" columns={columns} rows={[]} rowKey={(r) => r.name} emptyMessage="Sem dados" />)).toContain("Sem dados");
    const err = renderToStaticMarkup(<SortableTable label="U" columns={columns} rows={[]} rowKey={(r) => r.name} error={{ message: "Falhou", onRetry: () => {} }} />);
    expect(err).toContain('role="alert"');
    expect(err).toContain("Tentar novamente");
  });
});

describe("BarValue", () => {
  it("shows the share with one decimal, clamped to 0–100%", () => {
    expect(renderToStaticMarkup(<BarValue value={0.0926} color="#e10d09" />)).toContain("9.3%");
    expect(renderToStaticMarkup(<BarValue value={1.4} color="#e10d09" />)).toContain("100.0%");
  });
});
