"use client"

import { PatientsAdvancedDataTableSkeleton } from "../../../components/patients-data-table-skeleton";

export default function Loading() {

  return (
    <div className="w-full">
      <PatientsAdvancedDataTableSkeleton />
    </div>
  );
}