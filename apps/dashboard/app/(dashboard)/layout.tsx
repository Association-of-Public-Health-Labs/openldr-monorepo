import { DashboardShellLoader } from "./_components/dashboard-shell-loader";

export default function UnifiedDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShellLoader>{children}</DashboardShellLoader>;
}
