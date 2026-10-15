"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { getDashboard, type DashboardId } from "../dashboards";
import { DashboardLayout } from "../app/templates/DashboardLayout";
import { SidebarProvider } from "../components/ui/sidebar";
import { Sheet, SheetContent, SheetTitle } from "../components/ui/sheet";
import { DashboardSwitcher } from "./DashboardSwitcher";
import { ShellHeader, type ShellUser } from "./ShellHeader";
import { ShellNavList, ShellSidebar } from "./ShellSidebar";
import { applySmallScreenRule, useLayoutSettings, type LayoutSettings } from "./layoutSettings";
import { sidebarContainerClass } from "./sidebar-styles";
import { headerTitle } from "./shell-utils";

export type { ShellUser } from "./ShellHeader";

export interface ShellNavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  active: boolean;
}

export interface DashboardShellProps {
  dashboard: DashboardId;
  nav: ShellNavItem[];
  user: ShellUser;
  onSignOut: () => void;
  pageTitle?: string;
  /** Reserved for the future AI chat; nothing is rendered when undefined. */
  rightPanel?: React.ReactNode;
  children: React.ReactNode;
}

// Content background as the old layout: positive = MUI background.default, negative = background.paper.
const CONTENT_BG: Record<LayoutSettings["contrast"], string> = {
  positive: "bg-[#f4f4f4] dark:bg-[#141a21]",
  negative: "bg-white dark:bg-[#1d232a]",
};
// Content side padding as the old layout: large = 16px, small = 4px.
const CONTENT_PX: Record<LayoutSettings["compact"], string> = { large: "px-4", small: "px-1" };

export function DashboardShell({ dashboard, nav, user, onSignOut, pageTitle, rightPanel, children }: DashboardShellProps) {
  const info = getDashboard(dashboard);
  const { settings, setSettings } = useLayoutSettings();
  const { setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleSettingsChange = React.useCallback(
    (next: LayoutSettings) => {
      if (next.mode !== settings.mode) setTheme(next.mode);
      setSettings(next);
    },
    [settings.mode, setSettings, setTheme],
  );

  // Old rule: below 1280px the content always gets the large padding.
  React.useEffect(() => {
    const onResize = () => {
      const adjusted = applySmallScreenRule(settings, window.innerWidth);
      if (adjusted !== settings) setSettings(adjusted);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [settings, setSettings]);

  if (settings.layout === "stacked") {
    // Today's MUI top layout, unchanged; redesigned later.
    return (
      <DashboardLayout
        portalTitle={info.portalTitle}
        pagename={pageTitle}
        options={nav}
        aiChatIsOpen={false}
        user={{ name: user.name, email: user.email, avatar: user.imageUrl, signOut: onSignOut }}
        settings={settings}
        handleSetAppSettings={handleSettingsChange}
      >
        {children}
      </DashboardLayout>
    );
  }

  const variant = settings.layout === "expanded" ? "expanded" : "compact";
  const toggle = () => handleSettingsChange({ ...settings, layout: variant === "expanded" ? "compact" : "expanded" });

  return (
    // Controlled by the layout setting, so Ctrl/Cmd+B, the round button and the drawer agree.
    <SidebarProvider
      open={variant === "expanded"}
      onOpenChange={(open) => handleSettingsChange({ ...settings, layout: open ? "expanded" : "compact" })}
      className="min-h-svh"
    >
      <ShellSidebar dashboard={dashboard} nav={nav} variant={variant} color={settings.color} onToggle={toggle} />
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className={`w-[300px] p-0 ${sidebarContainerClass(settings.color)}`}>
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <div className="px-4 pt-5 pb-2">
            <DashboardSwitcher dashboard={dashboard} />
          </div>
          <nav className="pb-8">
            <ShellNavList nav={nav} variant="expanded" color={settings.color} />
          </nav>
        </SheetContent>
      </Sheet>
      <main
        data-slot="shell-content"
        className={`h-svh min-w-0 flex-1 overflow-y-auto overflow-x-hidden [container-type:inline-size] ${CONTENT_BG[settings.contrast]}`}
      >
        <ShellHeader
          title={headerTitle(info.portalTitle, pageTitle)}
          user={user}
          onSignOut={onSignOut}
          settings={settings}
          onSettingsChange={handleSettingsChange}
          onOpenMenu={() => setMobileOpen(true)}
        />
        <div data-slot="shell-content-inner" className={`pb-8 ${CONTENT_PX[settings.compact]}`}>
          {children}
        </div>
      </main>
      {rightPanel !== undefined && (
        <aside data-slot="shell-right-panel" className="h-svh shrink-0 border-l">
          {rightPanel}
        </aside>
      )}
    </SidebarProvider>
  );
}
