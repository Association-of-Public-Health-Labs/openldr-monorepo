"use client"
import { useEffect } from "react";
import { useState } from "react";
import { PatientsAdvancedDataTable } from "@repo/utilities/components/patients-advanced-data-table";
// import { PatientsAdvancedDataTable } from "@repo/design_system";
import { fetchPatientData, TimeInterval } from "./actions";
import { DEFAULTS } from "./constants";
import { useAuth } from "@clerk/nextjs";

export default function PatientsResultsData({ data: defaultData }: { data: any[] }) {
  const { getToken } = useAuth();

  const [data, setData] = useState<any[]>(defaultData);
  const [timeInterval, setTimeInterval] = useState<TimeInterval>(
    DEFAULTS.TIME_INTERVAL
  );

  // useEffect(() => {
  //   const token = getToken();
  //   const fetchData = async () => {
  //     const data = await fetchPatientData(params, token);
  //     setData(data);
  //   };
  // }, []);

  return (
    <div>
      <PatientsAdvancedDataTable 
        data={data}
        rowsPerPage={18}
      />
    </div>
  )
}