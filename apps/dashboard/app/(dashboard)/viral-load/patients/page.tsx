import { PlaceholderReportPage } from "@/components/reports/PlaceholderReportPage";
import { getActivePage } from "@/config/navigation";
import { getPlaceholderReports } from "@/config/placeholders";

export default function ViralLoadPatientsPage() {
  const page = getActivePage("/viral-load/patients");
  return <PlaceholderReportPage reports={getPlaceholderReports("/viral-load/patients")} subtitle={page.subtitle} title={page.title} />;
}
