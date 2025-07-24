// "use client"

import PatientsResultsData from "./reports/patients-results-data";
import { fetchPatientData } from "./reports/patients-results-data/actions";
import { DEFAULTS } from "./reports/patients-results-data/constants";

export default async function PatientsPage() {
  const data = await fetchPatientData({
    interval_dates: `${DEFAULTS.TIME_INTERVAL.startDate},${DEFAULTS.TIME_INTERVAL.endDate}`,
    province: "Zambezia",
    district: "Quelimane",
    health_facility: "HG Quelimane",
    genexpert_result_type: "Ultra 6 Cores",
  });

  return (
    <div className="w-full">
      <PatientsResultsData data={data} />
    </div>
  )
}