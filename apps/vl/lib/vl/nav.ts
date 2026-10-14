export type NavItem = {
  label: string;
  href: string;
  icon: "grid" | "lab" | "location" | "patients";
  active: boolean;
};

export const PAGE_LABELS: Record<string, string> = {
  "/": "Sumário",
  "/lab": "Laboratório",
  "/clinic": "Província/Distrito/US",
  "/patients": "Pacientes",
};

const ITEMS: Omit<NavItem, "active">[] = [
  { label: "Sumário", href: "/", icon: "grid" },
  { label: "Laboratório", href: "/lab", icon: "lab" },
  { label: "Província/Distrito/US", href: "/clinic", icon: "location" },
  { label: "Pacientes", href: "/patients", icon: "patients" },
];

export function buildNavItems(pathname: string, isAdmin: boolean): NavItem[] {
  return ITEMS.filter((item) => isAdmin || item.href !== "/patients").map((item) => ({
    ...item,
    active: item.href === pathname,
  }));
}
