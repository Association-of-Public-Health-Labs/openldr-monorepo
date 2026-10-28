import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/eid/api", () => ({ eidGetList: vi.fn() }));

import { initialLabDrill, labDrillClickRow } from "@repo/design_system/lib/report/lab-drill";
import { equipmentLabChart, rejectedLabChart } from "./stacked-cards";
import { labelOf, codeOf, labelRows, toTestedChart, toTatChart } from "./lab-cards";
import { labsFor, toLabCodes, type EidLab } from "./labs";
import { uniqueLabLabels } from "./lab-labels";

type R = { n: string; c?: string };
const name = (r: R) => r.n;
const code = (r: R) => r.c;

describe("uniqueLabLabels", () => {
  it("suffixes the code when a name repeats", () => {
    expect(uniqueLabLabels([{ n: "Lab", c: "A" }, { n: "Lab", c: "B" }], name, code)).toEqual(["Lab (A)", "Lab (B)"]);
  });
  it("leaves unique names unchanged", () => {
    expect(uniqueLabLabels([{ n: "Lab", c: "A" }, { n: "Outro", c: "B" }], name, code)).toEqual(["Lab", "Outro"]);
  });
  it("keeps the name when a repeated row has no code", () => {
    expect(uniqueLabLabels([{ n: "Lab" }, { n: "Lab" }], name, code)).toEqual(["Lab", "Lab"]);
  });
});

const seg = { total: 10, positive: 2 };
const rows = [
  { testing_facility: "Lab", testing_facility_code: "A", ...seg },
  { testing_facility: "Lab", testing_facility_code: "B", ...seg },
  { testing_facility: "Unico", testing_facility_code: "C", ...seg },
];

describe("same-name labs in the cards", () => {
  it("charts label the repeated names with the code", () => {
    expect(toTestedChart(rows as never).labels).toEqual(["Lab (A)", "Lab (B)", "Unico"]);
    expect(toTatChart(rows as never).labels).toEqual(["Lab (A)", "Lab (B)", "Unico"]);
    expect(equipmentLabChart(rows as never).labels).toEqual(["Lab (A)", "Lab (B)", "Unico"]);
    const rej = rows.map((r) => ({ receiving_facility: r.testing_facility, receiving_facility_code: r.testing_facility_code, total: 1 }));
    expect(rejectedLabChart(rej as never).labels).toEqual(["Lab (A)", "Lab (B)", "Unico"]);
  });
  it("clicking the second bar drills into the second code", () => {
    const labelled = labelRows(rows as never);
    const next = labDrillClickRow(initialLabDrill("lab"), labelled, "Lab (B)", labelOf, codeOf);
    expect(next?.trail).toEqual([{ level: "lab", name: "Lab (B)", code: "B" }]);
  });
});

describe("labsFor with same-name labs", () => {
  const labs: EidLab[] = [
    { code: "A", name: "Lab", lab_type: "conventional" },
    { code: "B", name: "Lab", lab_type: "conventional" },
    { code: "C", name: "Outro", lab_type: "conventional" },
  ];
  it("gives unique group names that map to the right codes", () => {
    const groups = labsFor(labs, "conventional");
    expect(groups.map((g) => g.name)).toEqual(["Lab (A)", "Lab (B)", "Outro"]);
    expect(toLabCodes(groups, ["Lab (B)"])).toEqual(["B"]);
  });
});
