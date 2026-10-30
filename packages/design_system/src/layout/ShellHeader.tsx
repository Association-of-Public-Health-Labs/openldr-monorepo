"use client";

import * as React from "react";
import { Menu } from "lucide-react";
import type { DashboardId } from "../dashboards";
import { AccountDrawer } from "./AccountDrawer";
import type { LayoutSettings } from "./layoutSettings";
import { SettingsDrawer } from "./SettingsDrawer";
import { CONTENT_PADDING_X } from "./sidebar-styles";

export interface ShellUser {
  name: string;
  email: string;
  imageUrl?: string;
}

// Measured on minimals.cc (2026-10-15): 40px round header buttons, grey icons, Minimals popover.
export const HEADER_ICON_BUTTON =
  "flex size-10 items-center justify-center rounded-full text-[#637381] transition-colors hover:bg-[rgba(145,158,171,0.08)] dark:text-[#919EAB]";

/** Content background (by contrast) at 40%, blurred, as the old layout's header. */
export function headerBackground(contrast: LayoutSettings["contrast"]): string {
  return contrast === "negative" ? "bg-white/40 dark:bg-[#1d232a]/40" : "bg-[#f4f4f4]/40 dark:bg-[#141a21]/40";
}

/** Menu button, 40px round as the other header buttons; hidden from lg up, where the sidebar shows (Minimals hides it below 1200px). */
export function MobileMenuButton({ onOpenMenu }: { onOpenMenu: () => void }) {
  return (
    <button type="button" aria-label="Menu" onClick={onOpenMenu} className={`${HEADER_ICON_BUTTON} lg:hidden`}>
      <Menu className="size-6" />
    </button>
  );
}

/** Settings and account buttons, shared by the side and top layouts. */
export function HeaderActions({
  dashboard,
  user,
  onSignOut,
  onOpenProfile,
  settings,
  onSettingsChange,
}: {
  dashboard: DashboardId;
  user: ShellUser;
  onSignOut: () => void;
  onOpenProfile?: () => void;
  settings: LayoutSettings;
  onSettingsChange: (settings: LayoutSettings) => void;
}) {
  // Shared so the account drawer's "Configurações" opens the settings drawer.
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <SettingsDrawer settings={settings} onChange={onSettingsChange} open={settingsOpen} onOpenChange={setSettingsOpen} />
      <AccountDrawer
        user={user}
        dashboard={dashboard}
        onSignOut={onSignOut}
        onOpenProfile={onOpenProfile}
        onOpenSettings={() => setSettingsOpen(true)}
      />
    </div>
  );
}

export function ShellHeader({
  dashboard,
  title,
  user,
  onSignOut,
  onOpenProfile,
  settings,
  onSettingsChange,
  onOpenMenu,
}: {
  dashboard: DashboardId;
  title: string;
  user: ShellUser;
  onSignOut: () => void;
  onOpenProfile?: () => void;
  settings: LayoutSettings;
  onSettingsChange: (settings: LayoutSettings) => void;
  onOpenMenu: () => void;
}) {
  // z-40: above page content, below Radix popups (z-50) and MUI dialogs (z-1300).
  return (
    <header
      className={`sticky top-0 z-40 flex h-16 w-full items-center lg:h-[72px] justify-between gap-2 backdrop-blur-[8px] ${CONTENT_PADDING_X} ${headerBackground(settings.contrast)}`}
    >
      <div className="flex min-w-0 items-center gap-2">
        <MobileMenuButton onOpenMenu={onOpenMenu} />
        <h1 className="truncate text-lg leading-7 font-semibold text-[#1C252E] dark:text-white">{title}</h1>
      </div>
      <HeaderActions dashboard={dashboard} user={user} onSignOut={onSignOut} onOpenProfile={onOpenProfile} settings={settings} onSettingsChange={onSettingsChange} />
    </header>
  );
}
