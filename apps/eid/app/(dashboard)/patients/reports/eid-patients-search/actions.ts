import { intervalParam, type DateRange } from "@repo/design_system/lib/report/dates";
import type { Field, FieldValues, SearchMode } from "@repo/design_system/lib/report/patients-search";
import type { Params } from "@/lib/eid/api";

export const RESULT_TYPE_LABEL = {
  positive: "Positivo",
  negative: "Negativo",
  indeterminate: "Indeterminado",
  rejected: "Rejeitada",
  pending: "Pendente",
} as const;

type ResultType = keyof typeof RESULT_TYPE_LABEL;

const optionalList = (value: string | undefined) => (value?.trim() ? [value.trim()] : undefined);

// Shared by every mode: the same key means the same value across tabs.
const DATE_BASIS_FIELD: Field = {
  kind: "select",
  key: "date_basis",
  label: "Data de referência",
  defaultValue: "",
  options: [
    { value: "", label: "Registo" },
    { value: "analysis", label: "Análise" },
  ],
};

/** interval_dates, plus date_basis only for Análise (Registo is the API default). */
const baseParams = (v: FieldValues, range: DateRange): Params => ({
  interval_dates: intervalParam(range),
  ...(v.date_basis === "analysis" ? { date_basis: "analysis" } : {}),
});

/** EID's three search tabs, in order. */
export const SEARCH_MODES: SearchMode[] = [
  {
    id: "name",
    label: "Por Nome",
    fields: [{ kind: "text", key: "name", label: "Nome" }, DATE_BASIS_FIELD],
    build: (v, range) => {
      const name = (v.name ?? "").trim();
      if (!name) return { error: "Indique o nome." };
      return { endpoint: "by_name", params: { ...baseParams(v, range), name } };
    },
  },
  {
    id: "facility",
    label: "Por US",
    fields: [
      { kind: "text", key: "facility", label: "Unidade Sanitária (nome exacto)" },
      { kind: "text", key: "province", label: "Província (opcional)" },
      { kind: "text", key: "district", label: "Distrito (opcional)" },
      {
        kind: "select",
        key: "lab_type",
        label: "Tipo de laboratório",
        defaultValue: "",
        options: [
          { value: "", label: "Todos" },
          { value: "conventional", label: "Convencional" },
          { value: "poc", label: "PoC" },
        ],
      },
      DATE_BASIS_FIELD,
    ],
    build: (v, range) => {
      const facility = (v.facility ?? "").trim();
      if (!facility) return { error: "Indique o nome da unidade sanitária." };
      return {
        endpoint: "by_facility",
        params: {
          ...baseParams(v, range),
          health_facility: facility,
          province: optionalList(v.province),
          district: optionalList(v.district),
          ...(v.lab_type ? { lab_type: v.lab_type } : {}),
        },
      };
    },
  },
  {
    id: "result",
    label: "Por Resultado",
    fields: [
      {
        kind: "select",
        key: "result",
        label: "Resultado",
        placeholder: "Escolha…",
        options: (Object.keys(RESULT_TYPE_LABEL) as ResultType[]).map((k) => ({ value: k, label: RESULT_TYPE_LABEL[k] })),
      },
      DATE_BASIS_FIELD,
    ],
    build: (v, range) => {
      if (!v.result) return { error: "Escolha o tipo de resultado." };
      return { endpoint: "by_result_type", params: { ...baseParams(v, range), result_type: [v.result] } };
    },
  },
];
