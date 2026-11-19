"use client"
import { useMemo } from "react"
import { History } from "lucide-react"
import { useUser, useAuth, useClerk } from "@clerk/nextjs"
import { usePathname } from "next/navigation"
import { DashboardShell, type ShellNavItem } from "@repo/design_system/layout/DashboardShell"
import { SplashScreen } from "@repo/design_system/layout/SplashScreen"
import { parseAccess } from "@repo/design_system/lib/access"
import { IconlyGrid } from "@repo/design_system/app/atoms/icons/Grid"
import { IconlyLocation } from "@repo/design_system/app/atoms/icons/Location"
import { useUsageBeacon } from "@repo/design_system/hooks/report/use-usage-beacon"
import { ReportProvider, type ReportServices } from "@repo/design_system/hooks/report/report-context"
import { SuggestionProvider } from "@repo/design_system/app/organisms/cards/suggestion-context"
import type { Params } from "@repo/design_system/lib/report/params"
import { monitoringGet } from "@/lib/monitoring/api"
import { buildNavItems, PAGE_LABELS, type NavItem } from "@/lib/monitoring/nav"

const ICONS: Record<NavItem["icon"], React.ReactNode> = {
  grid: <IconlyGrid style="two-tone" size={18} />,
  location: <IconlyLocation style="two-tone" size={19} />,
  history: <History size={19} />,
};

/** Report params as query strings; arrays are joined with commas. */
function toQuery(params: Params): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    out[key] = Array.isArray(value) ? value.join(",") : String(value);
  }
  return out;
}

function Shell({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const { signOut, getToken, isSignedIn } = useAuth();
  const { openUserProfile } = useClerk();
  const pathname = usePathname();
  useUsageBeacon("monitoring", pathname, () => getToken(), isLoaded && !!isSignedIn);

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
      dashboard="monitoring"
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
  const name = user?.fullName ?? "";
  const email = user?.primaryEmailAddress?.emailAddress ?? "";

  // The cards read this app's own route handlers (DisaStatus aggregates), not the analytics API.
  const value = useMemo<ReportServices>(
    () => ({
      getToken: () => getToken(),
      user: { name, email },
      getList: <Row,>(endpoint: string, params: Params) => monitoringGet<Row[]>(endpoint, toQuery(params)),
      adminStatus: "user",
    }),
    [getToken, name, email],
  );

  return (
    // The analytics API needs a /monitoring suggestions module before this path answers.
    <SuggestionProvider getToken={getToken} endpointPath={process.env.NEXT_PUBLIC_OPENLDR_SUGGESTION_PATH || "/monitoring/send-suggestion"}>
      <ReportProvider value={value}>{children}</ReportProvider>
    </SuggestionProvider>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Reports>
      <Shell>{children}</Shell>
    </Reports>
  );
}
