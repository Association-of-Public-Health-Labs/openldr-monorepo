"use client";

import * as React from "react";
import { getDashboard, type DashboardId } from "../dashboards";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "../components/ui/sidebar";
import { DashboardSwitcher } from "./DashboardSwitcher";
import { ShellHeader, type ShellUser } from "./ShellHeader";
import { SIDEBAR_WIDTH, SIDEBAR_WIDTH_ICON, headerTitle, readSidebarOpen } from "./shell-utils";

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

export function DashboardShell({ dashboard, nav, user, onSignOut, pageTitle, rightPanel, children }: DashboardShellProps) {
  const info = getDashboard(dashboard);
  const [defaultOpen] = React.useState(() =>
    typeof document === "undefined" ? false : readSidebarOpen(document.cookie),
  );

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      style={{ "--sidebar-width": SIDEBAR_WIDTH, "--sidebar-width-icon": SIDEBAR_WIDTH_ICON } as React.CSSProperties}
    >
      <Sidebar collapsible="icon">
        <SidebarHeader className="py-8">
          <DashboardSwitcher dashboard={dashboard} />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu className="gap-2 group-data-[collapsible=icon]:items-center">
              {nav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.active}
                    tooltip={item.label}
                    className="data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground"
                  >
                    <a href={item.href}>
                      {item.icon}
                      <span>{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="h-svh overflow-y-auto overflow-x-hidden bg-transparent [container-type:inline-size]">
        <ShellHeader title={headerTitle(info.portalTitle, pageTitle)} user={user} onSignOut={onSignOut} />
        <div className="px-4 pb-8">{children}</div>
      </SidebarInset>
      {rightPanel !== undefined && (
        <aside data-slot="shell-right-panel" className="h-svh shrink-0 border-l">
          {rightPanel}
        </aside>
      )}
    </SidebarProvider>
  );
}
