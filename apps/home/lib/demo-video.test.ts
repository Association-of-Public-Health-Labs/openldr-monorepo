import { describe, expect, it } from "vitest";
import { DEMO_VERSIONS, initialQuality } from "./demo-video";

describe("initialQuality", () => {
  it("defaults to HD when the browser gives no connection hint", () => {
    expect(initialQuality(undefined)).toBe("hd");
    expect(initialQuality({})).toBe("hd");
  });

  it("keeps HD on fast connections", () => {
    expect(initialQuality({ effectiveType: "4g" })).toBe("hd");
  });

  it("starts with the light version on slow connections", () => {
    for (const effectiveType of ["slow-2g", "2g", "3g"]) {
      expect(initialQuality({ effectiveType })).toBe("light");
    }
  });

  it("starts with the light version when data saving is on", () => {
    expect(initialQuality({ effectiveType: "4g", saveData: true })).toBe("light");
  });
});

describe("DEMO_VERSIONS", () => {
  it("serves both files from public/demo", () => {
    expect(DEMO_VERSIONS.hd.src).toBe("/demo/openldr-demo.mp4");
    expect(DEMO_VERSIONS.light.src).toBe("/demo/openldr-demo-720p.mp4");
  });
});
