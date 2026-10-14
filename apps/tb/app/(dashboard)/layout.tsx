"use client"
import { DashboardShell, type ShellNavItem } from "@repo/design_system/layout/DashboardShell"
import { IconlyGrid } from "@repo/design_system/app/atoms/icons/Grid"
import { IconlyLocation } from "@repo/design_system/app/atoms/icons/Location"
import { IconlyPatients } from "@repo/design_system/app/atoms/icons/Patients"
import { AIChatProvider } from "@repo/ai/src/context/ai-chat-provider"
import { useUser, useAuth } from "@clerk/nextjs"
import { usePathname } from "next/navigation"

// Same defaults the removed layout-settings store used.
const AI_CHAT_PANEL_SIZES = { left: 75, right: 25 };

const pathToLabel: Record<string, string> = {
  "/": "Sumário",
  "/clinic": "Província",
  "/patients": "Resultados de Pacientes",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const { signOut } = useAuth();
  const pathname = usePathname();

  const nav: ShellNavItem[] = [
    { label: "Sumário", icon: <IconlyGrid style="two-tone" size={18} />, href: "/" },
    { label: "Província", icon: <IconlyLocation style="two-tone" size={19} />, href: "/clinic" },
    { label: "Pacientes", icon: <IconlyPatients style="two-tone" size={19} />, href: "/patients" },
  ].map((option) => ({ ...option, active: option.href === pathname }));

  return (
    <AIChatProvider dashboard="tb" panelSizes={AI_CHAT_PANEL_SIZES} onPanelResize={() => {}}>
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
      >
        {children}
      </DashboardShell>
    </AIChatProvider>
  );
}
