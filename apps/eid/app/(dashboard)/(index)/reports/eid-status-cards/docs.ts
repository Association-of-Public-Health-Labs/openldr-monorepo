// "Sobre o indicador" in the KPI drawer. Checked against api_openldr_python origin/dev,
// hiv/eid/services/eid_services_summary.py (summary_indicators_service) and eid_common.py (2026-10-28).
const MONTH = "Cada barra é um mês da data de registo; o último dia do período conta por inteiro.";

export const DOCS = {
  total: [
    "Conta todas as amostras de diagnóstico precoce infantil (DPI) registadas no período, em laboratórios convencionais e de PoC.",
    "Mostra o mesmo número que Amostras Registadas, como no painel antigo.",
    MONTH,
  ],
  registered: [
    "Conta as amostras de diagnóstico precoce infantil (DPI) registadas no período, pela data de registo.",
    "Inclui os laboratórios convencionais e os de PoC.",
    MONTH,
  ],
  tested: [
    "Conta as amostras registadas no período que já têm data de análise.",
    "O mês é o do registo, não o da análise: uma amostra registada no fim de um mês e analisada no seguinte conta no mês do registo.",
    "A % das registadas é o total de testadas sobre o total de registadas no período, arredondada à unidade.",
  ],
  rejected: [
    "Conta as amostras registadas no período com código ou descrição de rejeição preenchidos.",
    "O mês é o da data de registo; uma amostra rejeitada que tenha data de análise conta também como testada.",
    "A % das registadas é o total de rejeitadas sobre o total de registadas no período, arredondada à unidade.",
  ],
} as const satisfies Record<"total" | "registered" | "tested" | "rejected", readonly string[]>;

export type TileId = keyof typeof DOCS;
