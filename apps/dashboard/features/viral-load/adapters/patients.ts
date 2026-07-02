import type {
  ViralLoadPatientRecord,
  ViralLoadPatientsPagination,
  ViralLoadPatientsResult,
  VlPatientRawRecord,
  VlPatientsRawResponse,
} from "../types/patients";

export function adaptViralLoadPatientsResponse(
  response: VlPatientsRawResponse,
  page: number,
  perPage: number
): ViralLoadPatientsResult {
  const rows = Array.isArray(response) ? response : response.data ?? [];
  const pagination: ViralLoadPatientsPagination = {
    page: toNumber(Array.isArray(response) ? page : response.page, page),
    perPage: toNumber(Array.isArray(response) ? perPage : response.per_page, perPage),
    totalCount: toNumber(Array.isArray(response) ? rows.length : response.total_count, rows.length),
    totalPages: toNumber(
      Array.isArray(response) ? Math.ceil(rows.length / perPage) : response.total_pages,
      rows.length ? 1 : 0
    ),
  };

  return {
    data: rows.map((row, index) => adaptViralLoadPatientRecord(row, index)),
    pagination,
  };
}

export function adaptViralLoadPatientRecord(row: VlPatientRawRecord, index: number): ViralLoadPatientRecord {
  const firstName = pickString(row, ["first_name", "FIRSTNAME", "name"]);
  const surname = pickString(row, ["last_name", "surname", "SURNAME"]);
  const patientName = pickString(row, ["patient_name", "patientName"]) || [firstName, surname].filter(Boolean).join(" ");
  const patientIdentifier = pickString(row, [
    "identifier",
    "NationalID",
    "nid",
    "national_id",
    "HealthcareNo",
    "patient_id",
    "healthcare_no",
    "UNIQUEID",
    "unique_id",
    "RequestID",
    "request_id",
    "requestId",
    "sample_id",
  ]);
  const finalViralLoadResult = pickString(row, ["final_viral_load_result", "FinalViralLoadResult", "TypeOfResult", "result"]);
  const viralLoad =
    pickString(row, ["viral_load", "viral_load_result", "final_viral_load_result", "HIVVL_ViralLoadResult"]) ||
    formatMaybeNumber(pickValue(row, ["viralLoad", "value"]));
  const resultType = translateResultType(
    finalViralLoadResult ||
      pickString(row, [
        "result",
        "result_type",
        "viral_load_result_category",
        "interpretation",
        "final_result",
        "final_viral_load_result",
      ])
  );
  const testReason = translateTestReason(pickString(row, ["test_reason", "reason_for_test", "TestReason", "ReasonForTest", "reason"]));
  const status = translateStatus(pickString(row, ["status", "hl7_result_status_code", "HL7ResultStatusCode", "result_status", "state"]));
  const specimenSourceDesc = pickString(row, ["specimen_source_desc", "SpecimenSourceDescription"]);
  const specimenSourceCode = pickString(row, ["specimen_source_code", "SpecimenSourceCode"]);
  const rejectionDesc = pickString(row, ["rejection_desc", "RejectionDesc"]);
  const rejectionCode = pickString(row, ["rejection_code", "RejectionCode"]);

  return {
    ageInYears: pickString(row, ["age_in_years", "AgeInYears"]) || "—",
    artRegimen: pickString(row, ["art_regimen", "ArtRegimen"]) || "—",
    authorisedDatetime: formatDate(pickString(row, ["authorised_datetime", "AuthorisedDateTime"])),
    district: pickString(row, ["district", "Requesting_District_Name", "requesting_district", "requesting_district_name"]),
    facility: pickString(row, [
      "facility",
      "health_facility",
      "requesting_facility_name",
      "requesting_facility",
      "Requesting_Facility_Name",
      "RequestingFacilityName",
      "health_facility_name",
    ]),
    finalViralLoadResult: finalViralLoadResult || "—",
    id: patientIdentifier || pickString(row, ["id", "uuid"]) || `vl-patient-${index}`,
    patientIdentifier,
    patientName: patientName || "Sem nome",
    province: pickString(row, ["province", "Requesting_Province_Name", "requesting_province", "requesting_province_name"]),
    registeredDatetime: formatDate(pickString(row, ["registered_datetime", "RegisteredDateTime"])),
    rejectionCode,
    rejectionDesc,
    resultDate: formatDate(pickString(row, ["result_date", "authorised_datetime", "authorised_date", "analysis_datetime"])),
    resultType,
    sampleDate: formatDate(pickString(row, ["sample_date", "specimen_date", "specimen_datetime", "registered_datetime"])),
    specimenDatetime: formatDate(pickString(row, ["specimen_datetime", "SpecimenDatetime"])),
    specimenSourceCode,
    specimenSourceDesc,
    status,
    testReason,
    testingFacilityName: pickString(row, ["Testing_Facility_Name", "testing_facility_name", "testing_facility", "TestingFacilityName"]) || "—",
    viralLoad: viralLoad || "—",
  };
}

function pickValue(row: VlPatientRawRecord, keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (value !== null && value !== undefined && value !== "") return value;
  }
  return undefined;
}

function pickString(row: VlPatientRawRecord, keys: string[]) {
  const value = pickValue(row, keys);
  return typeof value === "string" ? value.trim() : formatMaybeNumber(value);
}

function toNumber(value: unknown, fallback: number) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function formatMaybeNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "number") return new Intl.NumberFormat("pt-MZ", { maximumFractionDigits: 2 }).format(value);
  return String(value).trim();
}

function formatDate(value: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pt-MZ", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

function translateResultType(value: string) {
  const normalized = value.toLowerCase().replace(/\s+/g, "_");
  const labels: Record<string, string> = {
    rejected: "Rejeitado",
    not_suppressed: "Não suprimido",
    not_suppressed_: "Não suprimido",
    no_result: "Sem resultado",
    suppressed: "Suprimido",
    undetectable: "Indetectável",
  };

  return labels[normalized] ?? (value || "—");
}

function translateTestReason(value: string) {
  const labels: Record<string, string> = {
    "reason not specified": "Não especificado",
    repeat: "Repetição",
    routine: "Rotina",
    "suspected treatment failure": "Suspeita de falha terapêutica",
  };

  return labels[value.toLowerCase()] ?? (value || "—");
}

function translateStatus(value: string) {
  const labels: Record<string, string> = {
    a: "Autorizado",
    authorised: "Autorizado",
    authorized: "Autorizado",
    f: "Final",
    final: "Final",
    p: "Pendente",
    pending: "Pendente",
  };

  return labels[value.toLowerCase()] ?? (value || "—");
}
