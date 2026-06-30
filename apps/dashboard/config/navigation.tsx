import type { ReactNode } from "react";
import {
  Activity,
  Baby,
  FlaskConical,
  Grid2X2,
  MapPinned,
  Search,
  Stethoscope,
  TestTubeDiagonal,
} from "lucide-react";
import { getActivePage, pageTitles } from "./page-titles";

export type NavigationChild = {
  href: string;
  label: string;
  shortLabel?: string;
  title: string;
};

export type NavigationNode = {
  basePath?: string;
  children?: NavigationChild[];
  href?: string;
  icon: ReactNode;
  label: string;
  shortLabel?: string;
  title: string;
};

export const navigationItems: NavigationNode[] = [
  {
    href: "/summary",
    icon: <Grid2X2 size={18} />,
    label: "Sumário Geral",
    shortLabel: "Geral",
    title: "Sumário Geral",
  },
  {
    basePath: "/tb",
    icon: <Activity size={18} />,
    label: "Tuberculose",
    shortLabel: "TB",
    title: "Tuberculose",
    children: [
      {
        href: "/tb",
        label: "Sumário",
        title: "Tuberculose - Sumário",
      },
      {
        href: "/tb/clinic",
        label: "Província",
        shortLabel: "Província",
        title: "Tuberculose - Província",
      },
      {
        href: "/tb/patients",
        label: "Pacientes",
        title: "Tuberculose - Pacientes",
      },
    ],
  },
  {
    basePath: "/viral-load",
    icon: <TestTubeDiagonal size={18} />,
    label: "Carga Viral",
    shortLabel: "CV",
    title: "Carga Viral",
    children: [
      {
        href: "/viral-load",
        label: "Sumário",
        title: "Carga Viral - Sumário",
      },
      {
        href: "/viral-load/lab",
        label: "Laboratório",
        title: "Carga Viral - Laboratório",
      },
      {
        href: "/viral-load/clinic",
        label: "Província",
        shortLabel: "Província",
        title: "Carga Viral - Província",
      },
      {
        href: "/viral-load/patients",
        label: "Pacientes",
        title: "Carga Viral - Pacientes",
      },
    ],
  },
  {
    basePath: "/dpi",
    icon: <Baby size={18} />,
    label: "DPI",
    title: "DPI",
    children: [
      {
        href: "/dpi",
        label: "Sumário",
        title: "DPI - Sumário",
      },
      {
        href: "/dpi/lab",
        label: "Laboratório",
        title: "DPI - Laboratório",
      },
      {
        href: "/dpi/clinic",
        label: "Província",
        shortLabel: "Província",
        title: "DPI - Província",
      },
    ],
  },
];

export const moduleLandingItems = [
  {
    areas: ["Sumário", "Província", "Pacientes"],
    description: "Indicadores nacionais e operacionais de testagem de Tuberculose.",
    href: "/tb",
    icon: <Activity size={20} />,
    name: "Tuberculose",
  },
  {
    areas: ["Sumário", "Laboratório", "Província", "Pacientes"],
    description: "Indicadores de Carga Viral, supressão, TAT e atividade laboratorial.",
    href: "/viral-load",
    icon: <TestTubeDiagonal size={20} />,
    name: "Carga Viral",
  },
  {
    areas: ["Sumário", "Laboratório", "Província"],
    description: "Indicadores de DPI/EID, amostras, equipamentos e TAT.",
    href: "/dpi",
    icon: <Baby size={20} />,
    name: "DPI",
  },
];

export { getActivePage, pageTitles };

export function isNavigationNodeActive(item: NavigationNode, pathname: string) {
  if (item.href) {
    return pathname === item.href;
  }

  return Boolean(item.basePath && (pathname === item.basePath || pathname.startsWith(`${item.basePath}/`)));
}

export function getModuleIcon(label: string) {
  switch (label) {
    case "Tuberculose":
      return <Activity size={18} />;
    case "Carga Viral":
      return <TestTubeDiagonal size={18} />;
    case "DPI":
      return <Baby size={18} />;
    case "Laboratório":
      return <FlaskConical size={18} />;
    case "Província":
      return <MapPinned size={18} />;
    case "Pacientes":
      return <Search size={18} />;
    default:
      return <Stethoscope size={18} />;
  }
}
