"use client"
import { DashboardShell, type ShellNavItem } from "@repo/design_system/layout/DashboardShell"
import { parseAccess } from "@repo/design_system/lib/access"
import { SplashScreen } from "@repo/design_system/layout/SplashScreen"
import { IconlyGrid } from "@repo/design_system/app/atoms/icons/Grid"
import { IconlyPatients } from "@repo/design_system/app/atoms/icons/Patients"
import { useUser, useAuth, useClerk } from "@clerk/nextjs"
import { usePathname } from "next/navigation"
import { useMemo } from "react"
import { ReportProvider, type ReportServices } from "@repo/design_system/hooks/report/report-context"
import { usageGetList } from "@/lib/admin/usage-api"
import { buildNavItems, PAGE_LABELS, type NavItem } from "@/lib/admin/nav"

const ICONS: Record<NavItem["icon"], React.ReactNode> = {
  grid: <IconlyGrid style="two-tone" size={18} />,
  patients: <IconlyPatients style="two-tone" size={19} />,
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const { signOut, getToken } = useAuth();
  const { openUserProfile } = useClerk();
  const pathname = usePathname();
  const name = user?.fullName ?? "";
  const email = user?.primaryEmailAddress?.emailAddress ?? "";

  // The usage cards read through the kit's report hooks; this app only has admin-only endpoints.
  const reports = useMemo<ReportServices>(
    () => ({
      getToken: () => getToken(),
      user: { name, email },
      getList: (endpoint, params, token) => usageGetList(endpoint, params, token),
      adminStatus: "admin",
    }),
    [getToken, name, email],
  );

  const nav: ShellNavItem[] = buildNavItems(pathname).map((item) => ({
    label: item.label,
    href: item.href,
    active: item.active,
    icon: ICONS[item.icon],
  }));

  // Clerk is still starting: the Minimals splash, centred on the page.
  if (!isLoaded) return <SplashScreen />;

  return (
    <DashboardShell
      access={parseAccess(user?.publicMetadata)}
      dashboard="admin"
      pageTitle={PAGE_LABELS[pathname]}
      nav={nav}
      user={{
        name: user?.fullName || "",
        email: user?.emailAddresses[0]?.emailAddress || "",
        imageUrl: user?.imageUrl || undefined,
      }}
      onSignOut={() => signOut()}
      onOpenProfile={() => openUserProfile()}
    >
      <ReportProvider value={reports}>{children}</ReportProvider>
    </DashboardShell>
  );
}
