import { describe, expect, it } from "vitest";
import { createRequestGate } from "./request-gate";

describe("createRequestGate", () => {
  it("only the most recent request is current", () => {
    const gate = createRequestGate();
    const first = gate.next();
    const second = gate.next();
    expect(gate.isCurrent(first)).toBe(false);
    expect(gate.isCurrent(second)).toBe(true);
  });
});
