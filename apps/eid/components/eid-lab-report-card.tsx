"use client";

import { useReport } from "@repo/design_system/hooks/report/use-report";
import { LabGroupsDialog } from "@repo/design_system/app/organisms/report/lab-groups-dialog";
import { LabReportCard, type LabReportCardProps } from "@repo/design_system/app/organisms/report/lab-report-card";
import { fetchLabs, labsFor, toLabCodes, type LabKind } from "@/lib/eid/labs";

type Props<Row> = Omit<LabReportCardProps<Row>, "toCodes" | "labsDialog"> & { labKind: LabKind };

/** The shared lab card with EID's lab list (Ruling L3). While the list loads or fails the dialog is empty; the card still loads. */
export function EidLabReportCard<Row>({ labKind, ...props }: Props<Row>) {
  const labs = useReport((token) => fetchLabs(token), []);
  const groups = labsFor(labs.data ?? [], labKind);
  return (
    <LabReportCard
      {...props}
      toCodes={(names) => toLabCodes(groups, names)}
      labsDialog={(s) => (
        <LabGroupsDialog
          {...s}
          groups={groups}
          notice={labs.error ? "Não foi possível carregar a lista de laboratórios." : undefined}
        />
      )}
    />
  );
}
