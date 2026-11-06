"use client";

import { CardMessage } from "@repo/design_system/app/organisms/report/card-message";
import { PATIENTS_ACCESS_DENIED } from "@repo/design_system/lib/report/facility";
import { useAdminStatus } from "../../../lib/tb/admin";
import PatientsResultsData from "./reports/patients-results-data";

export default function PatientsPage() {
  const adminStatus = useAdminStatus();
  return (
    <div className="w-full">
      {adminStatus === "user" ? (
        <CardMessage
          tone="error"
          message={PATIENTS_ACCESS_DENIED}
        />
      ) : (
        <PatientsResultsData />
      )}
    </div>
  );
}
