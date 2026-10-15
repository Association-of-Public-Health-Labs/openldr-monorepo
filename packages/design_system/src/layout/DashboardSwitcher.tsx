"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { getDashboard, getDashboards, type DashboardId } from "../dashboards";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../components/ui/sidebar";
import { EMBLEM_URL, switcherItems } from "./shell-utils";

function ColorMark({ color, className = "size-2.5" }: { color: string; className?: string }) {
  return <span aria-hidden className={`${className} shrink-0 rounded-full`} style={{ backgroundColor: color }} />;
}

export function DashboardSwitcher({ dashboard }: { dashboard: DashboardId }) {
  const current = getDashboard(dashboard);
  const items = switcherItems(dashboard, getDashboards());

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              tooltip={current.name}
              // Collapsed: shadcn shrinks the button to 32px; keep the 40px emblem whole and centred.
              className="data-[state=open]:bg-sidebar-accent group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:mx-auto"
            >
              <span className="relative flex size-10 shrink-0 items-center justify-center">
                <img src={EMBLEM_URL} alt="" className="size-10 object-contain" />
                <ColorMark color={current.primary} className="absolute -right-0.5 -bottom-0.5 size-3 ring-2 ring-sidebar" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col text-left leading-tight">
                <span className="truncate text-xs text-sidebar-foreground/70">OpenLDR</span>
                <span className="truncate font-semibold">{current.name}</span>
              </span>
              <ChevronsUpDown className="ml-auto size-4 shrink-0" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="right" sideOffset={8} className="min-w-56">
            <DropdownMenuLabel className="text-xs text-muted-foreground">Painéis</DropdownMenuLabel>
            {items.map((item) =>
              item.current ? (
                <DropdownMenuItem key={item.id} disabled className="gap-2 opacity-100">
                  <ColorMark color={item.primary} />
                  <span className="flex-1 font-semibold">{item.name}</span>
                  <Check className="size-4" aria-label="Painel atual" />
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem key={item.id} asChild className="gap-2">
                  <a href={item.href}>
                    <ColorMark color={item.primary} />
                    <span className="flex-1">{item.name}</span>
                  </a>
                </DropdownMenuItem>
              ),
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
