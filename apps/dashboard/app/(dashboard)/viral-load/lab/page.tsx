import { PlaceholderReportPage } from "@/components/reports/PlaceholderReportPage";
import { getActivePage } from "@/config/navigation";
import { getPlaceholderReports } from "@/config/placeholders";

export default function ViralLoadLabPage() {
  const page = getActivePage("/viral-load/lab");
  return <PlaceholderReportPage reports={getPlaceholderReports("/viral-load/lab")} subtitle={page.subtitle} title={page.title} />;
}
