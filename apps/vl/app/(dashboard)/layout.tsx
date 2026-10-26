"use client"
import { DashboardShell, type ShellNavItem } from "@repo/design_system/layout/DashboardShell"
import { SplashScreen } from "@repo/design_system/layout/SplashScreen"
import { IconlyGrid } from "@repo/design_system/app/atoms/icons/Grid"
import { IconlyLab } from "@repo/design_system/app/atoms/icons/Lab"
import { IconlyLocation } from "@repo/design_system/app/atoms/icons/Location"
import { IconlyPatients } from "@repo/design_system/app/atoms/icons/Patients"
import { IconlyTruck } from "@repo/design_system/app/atoms/icons/Truck"
import { useUser, useAuth, useClerk } from "@clerk/nextjs"
import { usePathname } from "next/navigation"
import { useMemo } from "react"
import { ReportProvider, type ReportServices } from "@repo/design_system/hooks/report/report-context"
import { vlGetList } from "@/lib/vl/api"
import { fetchPatients, MAX_PER_PAGE } from "@/lib/vl/patients"
import { AdminProvider, useAdminStatus, useIsAdmin } from "@/lib/vl/admin"
import { buildNavItems, PAGE_LABELS, type NavItem } from "@/lib/vl/nav"

const ICONS: Record<NavItem["icon"], React.ReactNode> = {
  grid: <IconlyGrid style="two-tone" size={18} />,
  lab: <IconlyLab style="two-tone" size={19} />,
  location: <IconlyLocation style="two-tone" size={19} />,
  patients: <IconlyPatients style="two-tone" size={19} />,
  truck: <IconlyTruck style="two-tone" size={20} />,
};

function Shell({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const { signOut } = useAuth();
  const { openUserProfile } = useClerk();
  const pathname = usePathname();
  const isAdmin = useIsAdmin();

  const nav: ShellNavItem[] = buildNavItems(pathname, isAdmin).map((item) => ({
    label: item.label,
    shortLabel: item.shortLabel,
    href: item.href,
    active: item.active,
    icon: ICONS[item.icon],
  }));

  // Clerk is still starting: the Minimals splash, centred on the page.
  if (!isLoaded) return <SplashScreen />;

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
      onOpenProfile={() => openUserProfile()}
    >
      {children}
    </DashboardShell>
  );
}

function Reports({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();
  const { user } = useUser();
  const adminStatus = useAdminStatus();
  const name = user?.fullName ?? "";
  const email = user?.primaryEmailAddress?.emailAddress ?? "";

  const value = useMemo<ReportServices>(
    () => ({
      getToken: () => getToken(),
      user: { name, email },
      getList: (endpoint, params, token) => vlGetList(endpoint, params, token),
      fetchPatients: async (params, token) => {
        const page = await fetchPatients("by_facility", params, 1, MAX_PER_PAGE, token);
        return { rows: page.data as unknown as Record<string, unknown>[], total: page.total_count };
      },
      adminStatus,
    }),
    [getToken, name, email, adminStatus],
  );

  return <ReportProvider value={value}>{children}</ReportProvider>;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <Reports>
        <Shell>{children}</Shell>
      </Reports>
    </AdminProvider>
  );
}
