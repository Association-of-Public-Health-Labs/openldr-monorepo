"use client"
import { DashboardShell, type ShellNavItem } from "@repo/design_system/layout/DashboardShell"
import { IconlyGrid } from "@repo/design_system/app/atoms/icons/Grid"
import { IconlyLab } from "@repo/design_system/app/atoms/icons/Lab"
import { IconlyLocation } from "@repo/design_system/app/atoms/icons/Location"
import { IconlyPatients } from "@repo/design_system/app/atoms/icons/Patients"
import { useUser, useAuth } from "@clerk/nextjs"
import { usePathname } from "next/navigation"
import { AdminProvider, useIsAdmin } from "@/lib/vl/admin"
import { buildNavItems, PAGE_LABELS, type NavItem } from "@/lib/vl/nav"

const ICONS: Record<NavItem["icon"], React.ReactNode> = {
  grid: <IconlyGrid style="two-tone" size={18} />,
  lab: <IconlyLab style="two-tone" size={19} />,
  location: <IconlyLocation style="two-tone" size={19} />,
  patients: <IconlyPatients style="two-tone" size={19} />,
};

function Shell({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const { signOut } = useAuth();
  const pathname = usePathname();
  const isAdmin = useIsAdmin();

  const nav: ShellNavItem[] = buildNavItems(pathname, isAdmin).map((item) => ({
    label: item.label,
    href: item.href,
    active: item.active,
    icon: ICONS[item.icon],
  }));

  return (
    <DashboardShell
      dashboard="vl"
      pageTitle={PAGE_LABELS[pathname]}
      nav={nav}
      user={{
        name: user?.fullName || "",
        email: user?.emailAddresses[0]?.emailAddress || "",
        imageUrl: user?.imageUrl || undefined,
      }}
      onSignOut={() => signOut()}
    >
      {children}
    </DashboardShell>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <Shell>{children}</Shell>
    </AdminProvider>
  );
}
