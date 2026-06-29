import { PlaceholderReportPage } from "@/components/reports/PlaceholderReportPage";
import { getActivePage } from "@/config/navigation";
import { getPlaceholderReports } from "@/config/placeholders";

export default function TbLabPage() {
  const page = getActivePage("/tb/lab");
  return <PlaceholderReportPage reports={getPlaceholderReports("/tb/lab")} subtitle={page.subtitle} title={page.title} />;
}
