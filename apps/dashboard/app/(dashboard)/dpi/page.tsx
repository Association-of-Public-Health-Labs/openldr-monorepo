import { PlaceholderReportPage } from "@/components/reports/PlaceholderReportPage";
import { getActivePage } from "@/config/navigation";
import { getPlaceholderReports } from "@/config/placeholders";

export default function DpiSummaryPage() {
  const page = getActivePage("/dpi");
  return <PlaceholderReportPage reports={getPlaceholderReports("/dpi")} subtitle={page.subtitle} title={page.title} />;
}
