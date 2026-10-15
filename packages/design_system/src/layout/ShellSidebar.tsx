"use client";

import type { DashboardId } from "../dashboards";
import { Tooltip, TooltipContent, TooltipTrigger } from "../components/ui/tooltip";
import { CollapseButton } from "./CollapseButton";
import { DashboardSwitcher } from "./DashboardSwitcher";
import type { ShellNavItem } from "./DashboardShell";
import type { LayoutSettings } from "./layoutSettings";
import {
  SIDEBAR_WIDTHS,
  navIconClass,
  navItemClass,
  navLabelClass,
  sidebarContainerClass,
  type SidebarVariant,
} from "./sidebar-styles";

type NavColor = LayoutSettings["color"];

export function ShellNavList({ nav, variant, color }: { nav: ShellNavItem[]; variant: SidebarVariant; color: NavColor }) {
  return (
    <ul className={`flex flex-col gap-1 ${variant === "expanded" ? "px-4" : "items-center px-1"}`}>
      {nav.map((item) => {
        const link = (
          <a
            href={item.href}
            aria-current={item.active ? "page" : undefined}
            data-active={item.active}
            className={navItemClass({ variant, color, active: item.active })}
          >
            {item.icon ? <span className={navIconClass(variant)}>{item.icon}</span> : null}
            <span className={navLabelClass({ variant, active: item.active })}>{item.label}</span>
          </a>
        );
        return (
          <li key={item.href}>
            {variant === "compact" ? (
              <Tooltip>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            ) : (
              link
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** Desktop sidebar, fixed at the left (layouts "expanded" and "compact"). */
export function ShellSidebar({
  dashboard,
  nav,
  variant,
  color,
  onToggle,
}: {
  dashboard: DashboardId;
  nav: ShellNavItem[];
  variant: SidebarVariant;
  color: NavColor;
  onToggle: () => void;
}) {
  const width = SIDEBAR_WIDTHS[variant];
  return (
    <aside
      data-slot="shell-sidebar"
      data-variant={variant}
      // The switcher's shadcn classes read these, as they did inside <Sidebar collapsible="icon">.
      data-state={variant === "expanded" ? "expanded" : "collapsed"}
      data-collapsible={variant === "compact" ? "icon" : ""}
      style={{ width }}
      // No `dark` class for "apparent": it would reset --primary (set by data-dashboard on <html>) to the dark-theme grey.
      className={`group peer relative hidden h-svh shrink-0 md:block ${color === "apparent" ? "text-white" : ""}`}
    >
      <div className={`fixed inset-y-0 left-0 z-30 flex flex-col overflow-y-auto ${sidebarContainerClass(color)}`} style={{ width }}>
        <div className={`pt-5 pb-2 ${variant === "expanded" ? "px-4" : "flex justify-center px-1"}`}>
          <DashboardSwitcher dashboard={dashboard} />
        </div>
        <nav className="pb-8">
          <ShellNavList nav={nav} variant={variant} color={color} />
        </nav>
      </div>
      {/* z-[45]: above the header (z-40), below Radix popups (z-50); centre 36px from the top. */}
      <div className="fixed top-[23px] z-[45] -translate-x-1/2" style={{ left: width }}>
        <CollapseButton expanded={variant === "expanded"} onToggle={onToggle} />
      </div>
    </aside>
  );
}
