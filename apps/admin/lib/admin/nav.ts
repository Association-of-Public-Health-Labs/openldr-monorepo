export type NavItem = {
  label: string;
  href: string;
  icon: "grid" | "patients";
  active: boolean;
};

export const PAGE_LABELS: Record<string, string> = {
  "/": "Utilização",
  "/users": "Utilizadores",
};

const ITEMS: Omit<NavItem, "active">[] = [
  { label: "Utilização", href: "/", icon: "grid" },
  { label: "Utilizadores", href: "/users", icon: "patients" },
];

export function buildNavItems(pathname: string): NavItem[] {
  return ITEMS.map((item) => ({ ...item, active: item.href === pathname }));
}
