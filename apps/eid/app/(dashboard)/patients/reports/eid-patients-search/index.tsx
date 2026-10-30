"use client";

import { PatientsSearchCard } from "@repo/design_system/app/organisms/report/patients-search-card";
import { fetchPage, PATIENT_COLUMNS, PATIENT_HEADERS, toSheetRow } from "@/lib/eid/patients";
import { CARD_ID, PER_PAGE_OPTIONS, TITLE } from "./constants";
import { SEARCH_MODES } from "./actions";
import Docs from "./docs";

export default function EidPatientsSearch() {
  return (
    <PatientsSearchCard
      cardId={CARD_ID}
      title={TITLE}
      documentation={<Docs />}
      modes={SEARCH_MODES}
      columns={PATIENT_COLUMNS}
      fetchPage={fetchPage}
      toSheetRow={toSheetRow}
      sheetHeaders={PATIENT_HEADERS}
      perPageOptions={PER_PAGE_OPTIONS}
    />
  );
}
