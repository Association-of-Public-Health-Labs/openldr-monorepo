import { PlaceholderReportPage } from "@/components/reports/PlaceholderReportPage";
import { getActivePage } from "@/config/navigation";
import { getPlaceholderReports } from "@/config/placeholders";

export default function DpiRoutesPage() {
  const page = getActivePage("/dpi/routes");
  return <PlaceholderReportPage reports={getPlaceholderReports("/dpi/routes")} subtitle={page.subtitle} title={page.title} />;
}
