"use client"
import { DashboardShell, type ShellNavItem } from "@repo/design_system/layout/DashboardShell"
import { SplashScreen } from "@repo/design_system/layout/SplashScreen"
import { IconlyGrid } from "@repo/design_system/app/atoms/icons/Grid"
import { IconlyLocation } from "@repo/design_system/app/atoms/icons/Location"
import { IconlyPatients } from "@repo/design_system/app/atoms/icons/Patients"
import { useLayoutSettings } from "@repo/design_system/layout/layoutSettings"
import { AIChatProvider } from "@repo/ai/src/context/ai-chat-provider"
import { useUser, useAuth, useClerk } from "@clerk/nextjs"
import { usePathname } from "next/navigation"
import { SuggestionProvider } from "@repo/design_system/app/organisms/cards/suggestion-context"

const pathToLabel: Record<string, string> = {
  "/": "Sumário",
  "/clinic": "Província",
  "/patients": "Resultados de Pacientes",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const { signOut, getToken } = useAuth();
  const { openUserProfile } = useClerk();
  const pathname = usePathname();
  const { settings, setSettings } = useLayoutSettings();

  const nav: ShellNavItem[] = [
    { label: "Sumário", icon: <IconlyGrid style="two-tone" size={18} />, href: "/" },
    { label: "Província", icon: <IconlyLocation style="two-tone" size={19} />, href: "/clinic" },
    { label: "Pacientes", icon: <IconlyPatients style="two-tone" size={19} />, href: "/patients" },
  ].map((option) => ({ ...option, active: option.href === pathname }));

  // Clerk is still starting: the Minimals splash, centred on the page.
  if (!isLoaded) return <SplashScreen />;

  return (
    <SuggestionProvider getToken={getToken} endpointPath={process.env.NEXT_PUBLIC_OPENLDR_SUGGESTION_PATH || "/tb/gx/send-suggestion"}>
      <AIChatProvider
        dashboard="tb"
        panelSizes={{ left: settings.leftPanelWidth, right: settings.rightPanelWidth }}
        onPanelResize={(sizes) => setSettings({ ...settings, leftPanelWidth: sizes.left, rightPanelWidth: sizes.right })}
      >
        <DashboardShell
          dashboard="tb"
          pageTitle={pathToLabel[pathname]}
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
      </AIChatProvider>
    </SuggestionProvider>
  );
}
