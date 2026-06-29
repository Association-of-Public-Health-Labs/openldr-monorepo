import { PlaceholderReportPage } from "@/components/reports/PlaceholderReportPage";
import { getActivePage } from "@/config/navigation";
import { getPlaceholderReports } from "@/config/placeholders";

export default function TbClinicPage() {
  const page = getActivePage("/tb/clinic");
  return <PlaceholderReportPage reports={getPlaceholderReports("/tb/clinic")} subtitle={page.subtitle} title={page.title} />;
}
