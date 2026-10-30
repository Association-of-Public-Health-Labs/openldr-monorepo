"use client";

import {
  LabReportCard,
  type LabReportCardProps,
} from "@repo/design_system/app/organisms/report/lab-report-card";
import { LabGroupsDialog } from "@repo/design_system/app/organisms/report/lab-groups-dialog";
import { LAB_GROUPS, labCodes } from "@/lib/vl/labs";

/** The shared lab card with VL's lab groups and codes filled in. */
export function VlLabReportCard<Row>(props: Omit<LabReportCardProps<Row>, "toCodes" | "labsDialog">) {
  return <LabReportCard {...props} toCodes={labCodes} labsDialog={(s) => <LabGroupsDialog {...s} groups={LAB_GROUPS} />} />;
}
