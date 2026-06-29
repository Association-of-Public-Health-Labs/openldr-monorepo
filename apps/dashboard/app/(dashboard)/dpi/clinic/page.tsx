import { PlaceholderReportPage } from "@/components/reports/PlaceholderReportPage";
import { getActivePage } from "@/config/navigation";
import { getPlaceholderReports } from "@/config/placeholders";

export default function DpiClinicPage() {
  const page = getActivePage("/dpi/clinic");
  return <PlaceholderReportPage reports={getPlaceholderReports("/dpi/clinic")} subtitle={page.subtitle} title={page.title} />;
}
