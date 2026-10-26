"use client";

import {
  LabReportCard,
  type LabReportCardProps,
} from "@repo/design_system/app/organisms/report/lab-report-card";
import { labCodes } from "@/lib/vl/labs";
import { LabGroupsDialog } from "./lab-groups-dialog";

/** The shared lab card with VL's lab groups and codes filled in. */
export function VlLabReportCard<Row>(props: Omit<LabReportCardProps<Row>, "toCodes" | "labsDialog">) {
  return <LabReportCard {...props} toCodes={labCodes} labsDialog={(s) => <LabGroupsDialog {...s} />} />;
}
