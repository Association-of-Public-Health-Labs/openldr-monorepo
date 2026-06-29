import { PlaceholderReportPage } from "@/components/reports/PlaceholderReportPage";
import { getActivePage } from "@/config/navigation";
import { getPlaceholderReports } from "@/config/placeholders";

export default function DpiLabPage() {
  const page = getActivePage("/dpi/lab");
  return <PlaceholderReportPage reports={getPlaceholderReports("/dpi/lab")} subtitle={page.subtitle} title={page.title} />;
}
