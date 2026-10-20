import { describe, expect, it } from "vitest";
import {
  COLLAPSE_BUTTON_CLASS,
  SIDEBAR_WIDTHS,
  navIconClass,
  navItemClass,
  navLabelClass,
  sidebarContainerClass,
} from "./sidebar-styles";

describe("sidebar-styles", () => {
  it("uses the Minimals widths", () => {
    expect(SIDEBAR_WIDTHS).toEqual({ expanded: 300, compact: 88 });
  });

  it("integrate: paper background with a hairline border; apparent: dark, no border", () => {
    expect(sidebarContainerClass("integrate")).toContain("bg-white");
    expect(sidebarContainerClass("integrate")).toContain("border-[rgba(145,158,171,0.12)]");
    expect(sidebarContainerClass("apparent")).toContain("bg-[#141A21]");
    expect(sidebarContainerClass("apparent")).not.toContain("border-r");
  });

  it("integrate overrides the dark --sidebar tokens so the switcher stays legible on white", () => {
    const c = sidebarContainerClass("integrate");
    for (const token of [
      "[--sidebar:#ffffff]",
      "[--sidebar-foreground:#1C252E]",
      "[--sidebar-accent:rgba(145,158,171,0.08)]",
      "[--sidebar-accent-foreground:#1C252E]",
      "dark:[--sidebar:#1d232a]",
      "dark:[--sidebar-foreground:#ffffff]",
    ]) expect(c).toContain(token);
    // apparent keeps the global dark tokens
    expect(sidebarContainerClass("apparent")).not.toContain("[--sidebar");
  });

  it("expanded items are 44px rows with the measured padding and radius", () => {
    const c = navItemClass({ variant: "expanded", color: "integrate", active: false });
    for (const token of ["min-h-[44px]", "rounded-[8px]", "pt-1", "pr-2", "pb-1", "pl-3", "flex-row"]) expect(c).toContain(token);
  });

  it("compact items are 79px tiles with icon above label", () => {
    const c = navItemClass({ variant: "compact", color: "integrate", active: false });
    for (const token of ["w-[79px]", "min-h-[56px]", "flex-col", "items-center"]) expect(c).toContain(token);
    expect(navIconClass("compact")).toContain("size-[22px]");
    expect(navLabelClass({ variant: "compact", active: false })).toContain("text-[10px]");
  });

  it("inactive colours follow integrate/apparent and dark mode", () => {
    expect(navItemClass({ variant: "expanded", color: "integrate", active: false })).toContain("text-[#637381]");
    expect(navItemClass({ variant: "expanded", color: "integrate", active: false })).toContain("dark:text-[#919EAB]");
    expect(navItemClass({ variant: "expanded", color: "apparent", active: false })).toContain("text-[#919EAB]");
  });

  it("active items use the dashboard colour on an 8% tint", () => {
    const integrate = navItemClass({ variant: "expanded", color: "integrate", active: true });
    expect(integrate).toContain("bg-primary/8");
    expect(integrate).toContain("text-primary");
    const apparent = navItemClass({ variant: "expanded", color: "apparent", active: true });
    expect(apparent).toContain("text-[color-mix(in_srgb,var(--primary)_60%,white)]");
    expect(navLabelClass({ variant: "expanded", active: true })).toContain("font-semibold");
    expect(navLabelClass({ variant: "expanded", active: false })).toContain("font-medium");
  });

  it("inactive items get the grey hover background", () => {
    expect(navItemClass({ variant: "expanded", color: "integrate", active: false })).toContain("hover:bg-[rgba(145,158,171,0.08)]");
  });

  it("the collapse button is a 26px white circle with a hairline border", () => {
    for (const token of ["size-[26px]", "rounded-full", "bg-white", "border-[rgba(145,158,171,0.12)]", "text-[#637381]"]) {
      expect(COLLAPSE_BUTTON_CLASS).toContain(token);
    }
  });
});
