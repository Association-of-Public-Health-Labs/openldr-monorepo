"use client";

import { CardMessage } from "@repo/design_system/app/organisms/report/card-message";
import { useAdminStatus } from "../../../lib/tb/admin";
import PatientsResultsData from "./reports/patients-results-data";

export default function PatientsPage() {
  const adminStatus = useAdminStatus();
  return (
    <div className="w-full">
      {adminStatus === "user" ? (
        <CardMessage
          tone="error"
          message="Acesso restrito a utilizadores com permissão de acesso a dados de pacientes."
        />
      ) : (
        <PatientsResultsData />
      )}
    </div>
  );
}
