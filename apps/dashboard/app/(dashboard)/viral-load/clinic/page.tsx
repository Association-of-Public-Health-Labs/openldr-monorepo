import { PlaceholderReportPage } from "@/components/reports/PlaceholderReportPage";
import { getActivePage } from "@/config/navigation";
import { getPlaceholderReports } from "@/config/placeholders";

export default function ViralLoadClinicPage() {
  const page = getActivePage("/viral-load/clinic");
  return <PlaceholderReportPage reports={getPlaceholderReports("/viral-load/clinic")} subtitle={page.subtitle} title={page.title} />;
}
