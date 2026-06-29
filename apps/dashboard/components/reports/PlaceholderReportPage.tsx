import { PageHeader } from "../layout/PageHeader";
import { PlaceholderReportCard } from "./PlaceholderReportCard";
import { ReportGrid } from "./ReportGrid";
import type { PlaceholderReport } from "../../config/placeholders";

type PlaceholderReportPageProps = {
  reports: PlaceholderReport[];
  subtitle: string;
  title: string;
};

export function PlaceholderReportPage({ reports, subtitle, title }: PlaceholderReportPageProps) {
  return (
    <>
      <PageHeader subtitle={subtitle} title={title} />
      <ReportGrid>
        {reports.map((report) => (
          <PlaceholderReportCard
            description={report.description}
            key={report.title}
            subtitle={report.subtitle}
            tags={report.tags}
            title={report.title}
          />
        ))}
      </ReportGrid>
    </>
  );
}
