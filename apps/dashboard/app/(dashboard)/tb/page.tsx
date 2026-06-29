import { PlaceholderReportPage } from "@/components/reports/PlaceholderReportPage";
import { getActivePage } from "@/config/navigation";
import { getPlaceholderReports } from "@/config/placeholders";

export default function TbSummaryPage() {
  const page = getActivePage("/tb");
  return <PlaceholderReportPage reports={getPlaceholderReports("/tb")} subtitle={page.subtitle} title={page.title} />;
}
