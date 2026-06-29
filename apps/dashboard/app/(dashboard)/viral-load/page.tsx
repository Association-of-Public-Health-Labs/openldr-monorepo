import { PlaceholderReportPage } from "@/components/reports/PlaceholderReportPage";
import { getActivePage } from "@/config/navigation";
import { getPlaceholderReports } from "@/config/placeholders";

export default function ViralLoadSummaryPage() {
  const page = getActivePage("/viral-load");
  return <PlaceholderReportPage reports={getPlaceholderReports("/viral-load")} subtitle={page.subtitle} title={page.title} />;
}
