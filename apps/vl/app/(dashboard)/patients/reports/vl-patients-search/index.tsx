"use client";

import { PatientsSearchCard } from "@repo/design_system/app/organisms/report/patients-search-card";
import { fetchPatients, PATIENT_COLUMNS, PATIENT_HEADERS, patientToRow, type PatientEndpoint } from "@/lib/vl/patients";
import type { Params } from "@/lib/vl/api";
import { CARD_ID, PER_PAGE_OPTIONS, TITLE } from "./constants";
import { SEARCH_MODES } from "./actions";
import Docs from "./docs";

const fetchPage = (endpoint: string, params: Params, page: number, perPage: number, token: string | null) =>
  fetchPatients(endpoint as PatientEndpoint, params, page, perPage, token);

export default function VlPatientsSearch() {
  return (
    <PatientsSearchCard
      cardId={CARD_ID}
      title={TITLE}
      documentation={<Docs />}
      modes={SEARCH_MODES}
      columns={PATIENT_COLUMNS}
      fetchPage={fetchPage}
      toSheetRow={patientToRow}
      sheetHeaders={PATIENT_HEADERS}
      perPageOptions={PER_PAGE_OPTIONS}
    />
  );
}
