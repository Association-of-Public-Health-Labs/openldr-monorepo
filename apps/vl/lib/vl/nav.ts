export type NavItem = {
  label: string;
  /** Label in the collapsed sidebar, when the full one does not fit. */
  shortLabel?: string;
  href: string;
  icon: "grid" | "lab" | "location" | "patients" | "truck";
  active: boolean;
};

export const PAGE_LABELS: Record<string, string> = {
  "/": "Sumário",
  "/lab": "Laboratório",
  "/clinic": "Província/Distrito/US",
  "/patients": "Pacientes",
  "/transport": "Transporte",
};

// Pages still being built: listed outside production builds only (none at the moment).
export const UNRELEASED_PAGES: string[] = [];

// `next build` (every deployment) is production; `next dev` shows the pages being built.
const IS_PRODUCTION = process.env.NODE_ENV === "production";

const ITEMS: Omit<NavItem, "active">[] = [
  { label: "Sumário", href: "/", icon: "grid" },
  { label: "Laboratório", href: "/lab", icon: "lab" },
  { label: "Província/Distrito/US", shortLabel: "Província", href: "/clinic", icon: "location" },
  { label: "Pacientes", href: "/patients", icon: "patients" },
  { label: "Transporte", href: "/transport", icon: "truck" },
];

export function buildNavItems(pathname: string, isAdmin: boolean, production = IS_PRODUCTION): NavItem[] {
  return ITEMS.filter((item) => isAdmin || item.href !== "/patients")
    .filter((item) => !production || !UNRELEASED_PAGES.includes(item.href))
    .map((item) => ({ ...item, active: item.href === pathname }));
}
