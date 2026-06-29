import { UnifiedDashboardLayout } from "@/components/layout/UnifiedDashboardLayout";

export default function DashboardRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UnifiedDashboardLayout>{children}</UnifiedDashboardLayout>;
}
