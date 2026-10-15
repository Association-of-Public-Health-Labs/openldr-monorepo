import type { LayoutSettings } from "./layoutSettings";

// Values measured on minimals.cc (2026-10-15); see the sidebar spec §4.
export type SidebarVariant = "expanded" | "compact";
type NavColor = LayoutSettings["color"];

export const SIDEBAR_WIDTHS: Record<SidebarVariant, number> = { expanded: 300, compact: 88 };

const HAIRLINE = "border-[rgba(145,158,171,0.12)]";

// theme.css keeps the --sidebar tokens dark in both modes (the "apparent" look); the light
// sidebar overrides them locally so the switcher (which uses them) stays legible on white.
const INTEGRATE_TOKENS =
  "[--sidebar:#ffffff] [--sidebar-foreground:#1C252E] [--sidebar-accent:rgba(145,158,171,0.08)] [--sidebar-accent-foreground:#1C252E] " +
  "dark:[--sidebar:#1d232a] dark:[--sidebar-foreground:#ffffff] dark:[--sidebar-accent:rgba(145,158,171,0.08)] dark:[--sidebar-accent-foreground:#ffffff]";

export function sidebarContainerClass(color: NavColor): string {
  return color === "apparent"
    ? "bg-[#141A21]"
    : `bg-white dark:bg-[#1d232a] border-r ${HAIRLINE} ${INTEGRATE_TOKENS}`;
}

export function navItemClass({ variant, color, active }: { variant: SidebarVariant; color: NavColor; active: boolean }): string {
  const shape =
    variant === "expanded"
      ? "flex flex-row items-center w-full min-h-[44px] rounded-[8px] pt-1 pr-2 pb-1 pl-3"
      : "flex flex-col items-center justify-center w-[79px] min-h-[56px] rounded-[8px] pt-2 px-1 pb-1.5 text-center";

  const tone = active
    ? color === "apparent"
      ? "bg-primary/8 text-[color-mix(in_srgb,var(--primary)_60%,white)]"
      : "bg-primary/8 text-primary"
    : color === "apparent"
      ? "text-[#919EAB] hover:bg-[rgba(145,158,171,0.08)]"
      : "text-[#637381] dark:text-[#919EAB] hover:bg-[rgba(145,158,171,0.08)]";

  return `${shape} ${tone} transition-colors`;
}

export function navIconClass(variant: SidebarVariant): string {
  return variant === "expanded"
    ? "flex size-6 shrink-0 items-center justify-center mr-3"
    : "flex size-[22px] shrink-0 items-center justify-center mb-1.5";
}

export function navLabelClass({ variant, active }: { variant: SidebarVariant; active: boolean }): string {
  return variant === "expanded"
    ? `min-w-0 flex-1 truncate text-[14px] leading-[22px] ${active ? "font-semibold" : "font-medium"}`
    : "w-full truncate text-[10px] leading-4 font-bold";
}

/**
 * Content and header side padding. From md up, as the old layout: MUI paddingX 16 / 4 = 128px / 32px.
 * Below md, 16px: the old 128px left phones with ~27px of content.
 */
export const CONTENT_PADDING_X: Record<LayoutSettings["compact"], string> = {
  large: "px-4 md:px-32",
  small: "px-4 md:px-8",
};

export const COLLAPSE_BUTTON_CLASS =
  `flex size-[26px] items-center justify-center rounded-full border ${HAIRLINE} bg-white p-1 text-[#637381] hover:bg-[#F4F6F8]`;
