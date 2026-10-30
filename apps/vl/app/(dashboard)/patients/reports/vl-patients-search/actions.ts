import type { Params } from "@/lib/vl/api";
import { intervalParam, type DateRange } from "@repo/design_system/lib/report/dates";
import type { FieldValues, SearchMode as KitSearchMode } from "@repo/design_system/lib/report/patients-search";
import { RESULT_TYPE_LABEL, TEST_REASON_LABEL, type PatientEndpoint, type ResultType, type TestReason } from "@/lib/vl/patients";

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

export type SubmittedSearch = { endpoint: PatientEndpoint; params: Params };

type Search = SubmittedSearch | { error: string };

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

// Kit field values (keys = DOM ids "p-<key>") → VL filters.
const toFilters = (v: FieldValues): SearchFilters => ({
  firstName: v.first ?? "",
  surname: v.surname ?? "",
  facility: v.facility ?? "",
  province: v.province ?? "",
  district: v.district ?? "",
  resultType: (v.result ?? "") as ResultType | "",
  testReason: (v.reason ?? "") as TestReason | "",
});

const mode = (id: SearchMode, label: string, fields: KitSearchMode["fields"]): KitSearchMode => ({
  id,
  label,
  fields,
  build: (values, range) => buildSearch(id, toFilters(values), range),
});

/** VL's four search tabs, in order. */
export const SEARCH_MODES: KitSearchMode[] = [
  mode("name", "Por Nome", [
    { kind: "text", key: "first", label: "Nome" },
    { kind: "text", key: "surname", label: "Apelido" },
  ]),
  mode("facility", "Por US", [
    { kind: "text", key: "facility", label: "Unidade Sanitária (nome exacto)" },
    { kind: "text", key: "province", label: "Província (opcional)" },
    { kind: "text", key: "district", label: "Distrito (opcional)" },
  ]),
  mode("result", "Por Resultado", [
    {
      kind: "select",
      key: "result",
      label: "Resultado",
      placeholder: "Escolha…",
      options: (Object.keys(RESULT_TYPE_LABEL) as ResultType[]).map((k) => ({ value: k, label: RESULT_TYPE_LABEL[k] })),
    },
  ]),
  mode("reason", "Por Motivo", [
    {
      kind: "select",
      key: "reason",
      label: "Motivo de teste",
      placeholder: "Escolha…",
      options: (Object.keys(TEST_REASON_LABEL) as TestReason[]).map((k) => ({ value: k, label: TEST_REASON_LABEL[k] })),
    },
  ]),
];
