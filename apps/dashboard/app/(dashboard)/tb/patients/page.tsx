import { PlaceholderReportPage } from "@/components/reports/PlaceholderReportPage";
import { getActivePage } from "@/config/navigation";
import { getPlaceholderReports } from "@/config/placeholders";

export default function TbPatientsPage() {
  const page = getActivePage("/tb/patients");
  return <PlaceholderReportPage reports={getPlaceholderReports("/tb/patients")} subtitle={page.subtitle} title={page.title} />;
}
