"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { getDashboard, type DashboardId } from "../dashboards";
import { SidebarProvider } from "../components/ui/sidebar";
import { Sheet, SheetContent, SheetTitle } from "../components/ui/sheet";
import { DashboardSwitcher } from "./DashboardSwitcher";
import { ShellHeader, type ShellUser } from "./ShellHeader";
import { ShellNavList, ShellSidebar } from "./ShellSidebar";
import { ShellTopNav } from "./ShellTopNav";
import { applySmallScreenRule, useLayoutSettings, type LayoutSettings } from "./layoutSettings";
import { CONTENT_PADDING_X, sidebarContainerClass } from "./sidebar-styles";
import { headerTitle } from "./shell-utils";

export type { ShellUser } from "./ShellHeader";

export interface ShellNavItem {
  label: string;
  /** Shown instead of `label` in the collapsed (compact) sidebar; the full label stays the tooltip and accessible name. */
  shortLabel?: string;
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

export function DashboardShell({ dashboard, nav, user, onSignOut, pageTitle, rightPanel, children }: DashboardShellProps) {
  const info = getDashboard(dashboard);
  const { settings, setSettings } = useLayoutSettings();
  const { setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleSettingsChange = React.useCallback(
    (next: LayoutSettings) => {
      // Unconditional, as the old layouts: next-themes may hold a different mode than the stored settings.
      setTheme(next.mode);
      setSettings(next);
    },
    [setSettings, setTheme],
  );

  const setLayout = (layout: LayoutSettings["layout"]) => handleSettingsChange({ ...settings, layout });

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

  const title = headerTitle(info.portalTitle, pageTitle);
  const openMenu = () => setMobileOpen(true);

  // Phones: the slide-in panel with the switcher and the menu, in every layout.
  const mobileSheet = (
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
  );

  const contentInner = (
    <div data-slot="shell-content-inner" className={`pb-8 ${CONTENT_PADDING_X[settings.compact]}`}>
      {children}
    </div>
  );

  const rightAside =
    rightPanel !== undefined ? (
      <aside data-slot="shell-right-panel" className="h-svh shrink-0 border-l">
        {rightPanel}
      </aside>
    ) : null;

  if (settings.layout === "stacked") {
    // Top layout, after the Minimals horizontal layout. The SidebarProvider only gives the switcher
    // its context here (always "expanded"), so Ctrl/Cmd+B does nothing in this layout.
    return (
      <SidebarProvider open onOpenChange={() => {}} className="min-h-svh">
        {mobileSheet}
        <main
          data-slot="shell-content"
          className={`h-svh min-w-0 flex-1 overflow-y-auto overflow-x-hidden [container-type:inline-size] ${CONTENT_BG[settings.contrast]}`}
        >
          <ShellTopNav
            dashboard={dashboard}
            nav={nav}
            title={title}
            user={user}
            onSignOut={onSignOut}
            settings={settings}
            onSettingsChange={handleSettingsChange}
            onOpenMenu={openMenu}
          />
          <div className="pt-6">{contentInner}</div>
        </main>
        {rightAside}
      </SidebarProvider>
    );
  }

  const variant = settings.layout === "expanded" ? "expanded" : "compact";
  const toggle = () => setLayout(variant === "expanded" ? "compact" : "expanded");

  return (
    // Controlled by the layout setting, so Ctrl/Cmd+B, the round button and the drawer agree.
    <SidebarProvider
      open={variant === "expanded"}
      onOpenChange={(open) => setLayout(open ? "expanded" : "compact")}
      className="min-h-svh"
    >
      <ShellSidebar dashboard={dashboard} nav={nav} variant={variant} color={settings.color} onToggle={toggle} />
      {mobileSheet}
      <main
        data-slot="shell-content"
        className={`h-svh min-w-0 flex-1 overflow-y-auto overflow-x-hidden [container-type:inline-size] ${CONTENT_BG[settings.contrast]}`}
      >
        <ShellHeader
          title={title}
          user={user}
          onSignOut={onSignOut}
          settings={settings}
          onSettingsChange={handleSettingsChange}
          onOpenMenu={openMenu}
        />
        {contentInner}
      </main>
      {rightAside}
    </SidebarProvider>
  );
}
