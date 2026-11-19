export type NavItem = {
  label: string;
  href: string;
  icon: "grid" | "location" | "history";
  active: boolean;
};

export const PAGE_LABELS: Record<string, string> = {
  "/": "Sumário",
  "/estado": "Estado",
  "/historico": "Histórico",
};

// Pages still being built: listed outside production builds only.
export const UNRELEASED_PAGES: string[] = ["/historico"];

// `next build` (every deployment) is production; `next dev` shows the pages being built.
const IS_PRODUCTION = process.env.NODE_ENV === "production";

const ITEMS: Omit<NavItem, "active">[] = [
  { label: "Sumário", href: "/", icon: "grid" },
  { label: "Estado", href: "/estado", icon: "location" },
  { label: "Histórico", href: "/historico", icon: "history" },
];

export function buildNavItems(pathname: string, production = IS_PRODUCTION): NavItem[] {
  return ITEMS.filter((item) => !production || !UNRELEASED_PAGES.includes(item.href)).map((item) => ({
    ...item,
    active: item.href === pathname,
  }));
}
