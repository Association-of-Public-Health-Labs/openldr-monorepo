import type { Meta, StoryObj } from "@storybook/react-vite";
import { LayoutGrid, FlaskConical, MapPin, Users } from "lucide-react";
import { ThemeProvider } from "next-themes";
import { DashboardShell } from "./DashboardShell";

const nav = [
  { label: "Sumário", href: "#", icon: <LayoutGrid />, active: true },
  { label: "Laboratório", href: "#lab", icon: <FlaskConical />, active: false },
  { label: "Província/Distrito/US", href: "#clinic", icon: <MapPin />, active: false },
  { label: "Pacientes", href: "#patients", icon: <Users />, active: false },
];

const meta: Meta<typeof DashboardShell> = {
  title: "Layout/DashboardShell",
  component: DashboardShell,
  parameters: { layout: "fullscreen" },
  // The shell's settings menu reads next-themes; apps get it from PlatformThemeProvider.
  decorators: [(Story) => <ThemeProvider attribute="class"><Story /></ThemeProvider>],
  args: {
    dashboard: "vl",
    nav,
    pageTitle: "Sumário",
    user: { name: "Utilizador Exemplo", email: "utilizador@openldr.org.mz" },
    onSignOut: () => {},
    children: <div className="h-[120vh] rounded-2xl border bg-card p-6">Conteúdo da página</div>,
  },
};
export default meta;

type Story = StoryObj<typeof DashboardShell>;

export const ViralLoad: Story = {};
export const Tuberculosis: Story = { args: { dashboard: "tb", pageTitle: "Província" } };
export const WithRightPanel: Story = { args: { rightPanel: <div className="w-80 p-4">Painel lateral</div> } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: "mobile1" } } };
