"use client";

import type { DashboardId } from "../dashboards";
import { DashboardSwitcher } from "./DashboardSwitcher";
import type { ShellNavItem } from "./DashboardShell";
import type { LayoutSettings } from "./layoutSettings";
import { HeaderActions, MobileMenuButton, headerBackground, type ShellUser } from "./ShellHeader";
import { CONTENT_PADDING_X, INTEGRATE_TOKENS, TOP_NAV_ICON, topNavItemClass } from "./sidebar-styles";

/**
 * Top layout ("stacked"), after the Minimals horizontal layout (measured 2026-10-15):
 * a 64px bar (switcher, title, actions), a dashed divider, and a 64px menu bar of 32px pills.
 */
export function ShellTopNav({
  dashboard,
  nav,
  title,
  user,
  onSignOut,
  onOpenProfile,
  settings,
  onSettingsChange,
  onOpenMenu,
}: {
  dashboard: DashboardId;
  nav: ShellNavItem[];
  title: string;
  user: ShellUser;
  onSignOut: () => void;
  onOpenProfile?: () => void;
  settings: LayoutSettings;
  onSettingsChange: (settings: LayoutSettings) => void;
  onOpenMenu: () => void;
}) {
  const apparent = settings.color === "apparent";
  // "Aparente" makes both rows dark, as the old top layout did.
  // Light: override the (dark) --sidebar tokens so the switcher is legible, as in the light sidebar.
  const surface = apparent
    ? "bg-[#141A21] text-white"
    : `${headerBackground(settings.contrast)} backdrop-blur-[8px] ${INTEGRATE_TOKENS}`;
  const padding = CONTENT_PADDING_X;

  return (
    <div data-slot="shell-topnav" className={`sticky top-0 z-40 w-full ${surface}`}>
      <div data-slot="shell-topnav-bar" className={`flex h-16 items-center justify-between gap-3 ${padding}`}>
        <div className="flex min-w-0 items-center gap-3">
          <MobileMenuButton onOpenMenu={onOpenMenu} />
          <div className="shrink-0">
            <DashboardSwitcher dashboard={dashboard} />
          </div>
          <span aria-hidden className="hidden h-2.5 w-px shrink-0 bg-[rgba(145,158,171,0.2)] sm:block" />
          <div className="min-w-0">
            <h1 className={`truncate text-lg leading-7 font-semibold ${apparent ? "text-white" : "text-[#1C252E] dark:text-white"}`}>
              {title}
            </h1>
            <p className={`truncate text-[13px] leading-[18px] font-semibold ${apparent ? "text-[#919EAB]" : "text-[#637381] dark:text-[#919EAB]"}`}>
              Ministério da Saúde
            </p>
          </div>
        </div>
        <HeaderActions dashboard={dashboard} user={user} onSignOut={onSignOut} onOpenProfile={onOpenProfile} settings={settings} onSettingsChange={onSettingsChange} />
      </div>
      <nav
        data-slot="shell-topnav-menu"
        className={`hidden h-16 items-center gap-1.5 overflow-x-auto border-t border-dashed border-[rgba(145,158,171,0.2)] lg:flex ${padding}`}
      >
        {nav.map((item) => (
          <a
            key={item.href}
            href={item.href}
            aria-current={item.active ? "page" : undefined}
            data-active={item.active}
            className={topNavItemClass({ color: settings.color, active: item.active })}
          >
            {item.icon ? <span className={TOP_NAV_ICON}>{item.icon}</span> : null}
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
