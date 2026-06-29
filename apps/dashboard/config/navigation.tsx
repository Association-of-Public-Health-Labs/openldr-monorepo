"use client";

import type { ReactNode } from "react";
import { Activity, Baby, FlaskConical, Grid2X2, MapPinned, Route, Search, Stethoscope, TestTubeDiagonal, Users } from "lucide-react";
import type { OptionsProps } from "@repo/design_system_mui";

export type NavigationItem = {
  href: string;
  icon: ReactNode;
  label: string;
  title: string;
};

export type NavigationGroup = {
  label: string;
  items: NavigationItem[];
};

export const navigationGroups: NavigationGroup[] = [
  {
    label: "Sumário Geral",
    items: [
      {
        href: "/summary",
        icon: <Grid2X2 size={18} />,
        label: "Sumário Geral",
        title: "Sumário Geral",
      },
    ],
  },
  {
    label: "Tuberculose",
    items: [
      {
        href: "/tb",
        icon: <Activity size={18} />,
        label: "TB - Sumário",
        title: "Tuberculose - Sumário",
      },
      {
        href: "/tb/lab",
        icon: <FlaskConical size={18} />,
        label: "TB - Laboratório",
        title: "Tuberculose - Laboratório",
      },
      {
        href: "/tb/clinic",
        icon: <MapPinned size={18} />,
        label: "TB - Província",
        title: "Tuberculose - Província / Distrito / US",
      },
      {
        href: "/tb/patients",
        icon: <Users size={18} />,
        label: "TB - Pacientes",
        title: "Tuberculose - Pacientes",
      },
    ],
  },
  {
    label: "Carga Viral",
    items: [
      {
        href: "/viral-load",
        icon: <TestTubeDiagonal size={18} />,
        label: "CV - Sumário",
        title: "Carga Viral - Sumário",
      },
      {
        href: "/viral-load/lab",
        icon: <FlaskConical size={18} />,
        label: "CV - Laboratório",
        title: "Carga Viral - Laboratório",
      },
      {
        href: "/viral-load/clinic",
        icon: <Stethoscope size={18} />,
        label: "CV - Província",
        title: "Carga Viral - Província / Distrito / US",
      },
      {
        href: "/viral-load/patients",
        icon: <Search size={18} />,
        label: "CV - Pacientes",
        title: "Carga Viral - Pacientes",
      },
    ],
  },
  {
    label: "DPI",
    items: [
      {
        href: "/dpi",
        icon: <Baby size={18} />,
        label: "DPI - Sumário",
        title: "DPI - Sumário",
      },
      {
        href: "/dpi/lab",
        icon: <FlaskConical size={18} />,
        label: "DPI - Laboratório",
        title: "DPI - Laboratório",
      },
      {
        href: "/dpi/clinic",
        icon: <MapPinned size={18} />,
        label: "DPI - Província",
        title: "DPI - Província / Distrito / US",
      },
      {
        href: "/dpi/routes",
        icon: <Route size={18} />,
        label: "Rotas de Amostras",
        title: "DPI - Rotas de Amostras",
      },
    ],
  },
];

export function getDashboardNavigationOptions(pathname: string): OptionsProps[] {
  return navigationGroups.flatMap((group) =>
    group.items.map((item) => ({
      active: pathname === item.href,
      href: item.href,
      icon: item.icon,
      label: item.label,
    })),
  );
}

export function getPageTitle(pathname: string): string {
  const item = navigationGroups
    .flatMap((group) => group.items)
    .find((navigationItem) => navigationItem.href === pathname);

  return item?.title ?? "Dashboard Unificada";
}
