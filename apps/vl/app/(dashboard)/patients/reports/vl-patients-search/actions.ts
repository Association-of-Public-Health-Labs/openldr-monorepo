import type { Params } from "@/lib/vl/api";
import { intervalParam, type DateRange } from "@/lib/vl/dates";
import type { PatientEndpoint, PatientsPage, ResultType, TestReason } from "@/lib/vl/patients";

export type SearchMode = "name" | "facility" | "result" | "reason";

export type SearchFilters = {
  firstName: string;
  surname: string;
  facility: string;
  province: string;
  district: string;
  resultType: ResultType | "";
  testReason: TestReason | "";
};

export const EMPTY_FILTERS: SearchFilters = {
  firstName: "",
  surname: "",
  facility: "",
  province: "",
  district: "",
  resultType: "",
  testReason: "",
};

type Search = { endpoint: PatientEndpoint; params: Params } | { error: string };

const optionalList = (value: string) => (value.trim() ? [value.trim()] : undefined);

export function buildSearch(mode: SearchMode, f: SearchFilters, range: DateRange): Search {
  const base = { interval_dates: intervalParam(range) };
  switch (mode) {
    case "name":
      if (!f.firstName.trim() && !f.surname.trim()) return { error: "Indique o nome ou o apelido." };
      return {
        endpoint: "by_name",
        params: { ...base, first_name: f.firstName.trim() || undefined, surname: f.surname.trim() || undefined },
      };
    case "facility":
      if (!f.facility.trim()) return { error: "Indique o nome da unidade sanitária." };
      return {
        endpoint: "by_facility",
        params: { ...base, health_facility: f.facility.trim(), province: optionalList(f.province), district: optionalList(f.district) },
      };
    case "result":
      if (!f.resultType) return { error: "Escolha o tipo de resultado." };
      return { endpoint: "by_result_type", params: { ...base, result_type: [f.resultType] } };
    case "reason":
      if (!f.testReason) return { error: "Escolha o motivo de teste." };
      return { endpoint: "by_test_reason", params: { ...base, test_reason: [f.testReason] } };
  }
}

export const pageSummary = (page: PatientsPage | null): string =>
  page ? `${page.total_count} pacientes · página ${page.page} de ${Math.max(page.total_pages, 1)}` : "";
