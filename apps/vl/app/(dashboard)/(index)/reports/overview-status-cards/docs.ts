// "Sobre o indicador" in the KPI drawer. Checked against api_openldr_python origin/dev,
// hiv/vl/services/vl_services_summary.py and vl_common.py (2026-10-28).
export const DOCS = {
  samples: [
    "Conta as amostras de carga viral com data de análise no período, tenham ou não resultado.",
    "Cada barra é um mês da data de análise; o total soma todos os meses do período.",
    "Como no portal antigo, o período compara datas sem hora: do último dia só entram as amostras analisadas à meia-noite.",
  ],
  suppression: [
    "Percentagem de amostras suprimidas entre as amostras com resultado (categoria de carga viral preenchida), por mês da data de análise.",
    "A taxa do período é a média das taxas mensais arredondadas, como no portal antigo, e não é ponderada pelo número de amostras de cada mês.",
    "A variação compara os dois últimos meses completos, em pontos percentuais.",
  ],
  tat: [
    "Tempo da colheita à validação, em dias: soma das médias de quatro etapas (colheita → recepção, recepção → registo, registo → análise, análise → validação).",
    "Entram as amostras com resultado e com recepção no próprio dia da colheita ou depois, por mês da data de análise.",
    "Cada média de etapa é truncada ao dia inteiro, como no portal antigo; a média do período é a média dos valores mensais.",
  ],
  rejected: [
    "Conta as amostras de carga viral registadas no período com um código de rejeição preenchido (rejeição da amostra ou do pedido de carga viral).",
    "Cada barra é um mês da data de registo; o último dia do período conta por inteiro.",
    "Inclui todos os laboratórios; a página Laboratório mostra as rejeições por laboratório e por motivo.",
  ],
} as const satisfies Record<"samples" | "suppression" | "tat" | "rejected", readonly string[]>;
